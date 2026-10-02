// External service integrations used by the controllers: AI site generation, OTP email, Stripe payments, and Vercel deploy.

import { Octokit } from "@octokit/rest";
import Stripe from "stripe";
import type { ProjectMessage } from "../models/Project.ts";
import type { UserDocument } from "../models/User.ts";
import {
  getErrorField,
  getErrorMessage,
  getErrorProviderName,
  getErrorStatus,
} from "./errors.ts";
import {
  ENHANCE_SYSTEM,
  buildGenerateSystem,
  callLLM,
  isLLMConfigured,
  isQuotaError,
  postProcess,
  resolveImages,
  type LlmMessage,
} from "./llm.ts";
import { generateMockSite, mockEnhancePrompt } from "./mockGenerator.ts";

// ═══════════ AI GENERATION ═══════════

export { postProcess }; // re-export so existing callers keep working

// Conservative token estimate: ~4 chars/token. We size INPUT so it fits the
// strictest provider (Groq, 12K TPM). For OUTPUT, we ask for the IDEAL budget
// — llm.js caps per-provider so Gemini gets the rich budget (~15K) while
// Groq automatically clamps to ~7K (its own TPM ceiling). Both providers stay
// happy with one set of numbers in the caller.
//
// Per-call math:
//   Groq:   input ≤ 5K, output ≤ 7K → total ≤ 12K (fits TPM exactly)
//   Gemini: input ≤ 5K, output ≤ 15K → richer multi-page sites
const APPROX_CHARS_PER_TOKEN = 4;
// Gemini is the primary provider and has a huge context window, so we let it see
// the WHOLE previous site on an edit (a ~55KB site ≈ 14K tokens). That's what
// makes "change the theme" / "add a section" edits keep everything else intact
// instead of rebuilding from a tiny slice. First builds send almost no input so
// they still fit the Groq fallback; only a large EDIT that fell all the way down
// to Groq would be too big — and by then all Gemini rungs are exhausted, which
// effectively never happens.
const INPUT_BUDGET_TOKENS = 30000;
// Raised so full multi-page sites finish (a rich site can be ~50KB ≈ 14K+
// tokens — at 14000 the footer was getting cut off mid-tag). Gemini 2.5 Flash
// allows up to 65K output; llm.js clamps Groq down to its own 6800 ceiling.
const IDEAL_OUTPUT_TOKENS = 30000;
// Rough token count for a string (about 4 characters per token).
function approxTokens(s: string): number {
  return Math.ceil((s || "").length / APPROX_CHARS_PER_TOKEN);
}

// Remove our OWN injected runtime (link interceptor + fix CSS) from saved HTML
// before sending it back to the model. Otherwise the AI re-emits ~10KB of our
// plumbing every iteration — wasting the output budget (→ truncation) and
// sometimes mangling it into visible text. postProcess re-adds clean copies.
function stripInjectedRuntime(html: string): string {
  if (!html) return html;
  return html
    .replace(/<script id="__Creova_link_interceptor__"[\s\S]*?<\/script>/gi, "")
    .replace(/<style id="__Creova_fix__"[\s\S]*?<\/style>/gi, "");
}

// Pull the canonical "brand" identity out of previous HTML so we can lock it
// in the prompt. The AI can't be trusted to read it from the HTML reliably —
// vague iteration prompts ("add a footer", "regenerate") tend to make it
// regenerate from scratch with a brand-new topic. We extract <title> + first
// <h1> + first <h2> so the prompt has explicit "DON'T CHANGE THESE" text.
interface BrandIdentity {
  title?: string;
  h1?: string;
  h2?: string;
  brandLink?: string;
}

function extractBrandIdentity(html: string): BrandIdentity | null {
  if (!html) return null;
  // Run a regex, strip tags, and return the cleaned inner text (or null).
  const grab = (re: RegExp): string | null => {
    const m = html.match(re);
    if (!m) return null;
    return m[1]
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  };
  const title = grab(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const h1 = grab(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  const h2 = grab(/<h2\b[^>]*>([\s\S]*?)<\/h2>/i);
  // First <a> inside the header is usually the brand/logo. Search WITHIN the
  // header markup (not the whole doc) so we get the real brand link.
  const headerMatch = html.match(/<header[\s\S]*?<\/header>/i);
  let brandLink = null;
  if (headerMatch) {
    const m = headerMatch[0].match(/<a\b[^>]*>([\s\S]*?)<\/a>/i);
    if (m) brandLink = m[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  }
  if (!title && !h1 && !brandLink) return null;
  return {
    title: title?.slice(0, 80),
    h1: h1?.slice(0, 80),
    h2: h2?.slice(0, 120),
    brandLink: brandLink?.slice(0, 80),
  };
}
// Shrink previous HTML to fit the token budget by keeping the head and a slice of the body.
function truncatePreviousHtml(html: string, budgetTokens: number): string {
  if (!html) return html;
  const budgetChars = budgetTokens * APPROX_CHARS_PER_TOKEN;
  if (html.length <= budgetChars) return html;
  // Keep the head + a slice of body so the model still sees the structure
  const headEnd = html.search(/<\/head>/i);
  const head = headEnd > 0 ? html.slice(0, headEnd + 7) : "";
  const bodyStart = html.search(/<body[^>]*>/i);
  const bodyOpen =
    bodyStart > 0
      ? html.slice(bodyStart, html.indexOf(">", bodyStart) + 1)
      : "<body>";
  const remaining = Math.max(800, budgetChars - head.length - 200);
  const tail = html.slice(
    bodyStart + bodyOpen.length,
    bodyStart + bodyOpen.length + remaining,
  );
  return `${head}\n${bodyOpen}\n<!-- TRUNCATED FOR TOKEN BUDGET: full original ~${html.length} chars -->\n${tail}\n<!-- ...truncated... -->\n</body></html>`;
}

// ─── Parsing + post-processing ────────────────────────────────────────────

const SUMMARY_OPEN = "<<<Creova_SUMMARY>>>";
const SUMMARY_CLOSE = "<<<END>>>";
const GENERATE_SYSTEM = buildGenerateSystem({
  summaryOpen: SUMMARY_OPEN,
  summaryClose: SUMMARY_CLOSE,
});

// Pull a clean HTML document out of the raw model text (strips code fences, trims to <html>).
function extractHtml(raw: string): string {
  if (!raw) return "";
  const fenced = raw.match(/```(?:html)?\s*([\s\S]*?)```/i);
  let candidate = (fenced ? fenced[1] : raw).trim();
  const doctypeIdx = candidate.search(/<!doctype/i);
  const htmlIdx = candidate.search(/<html[\s>]/i);
  const start = doctypeIdx !== -1 ? doctypeIdx : htmlIdx !== -1 ? htmlIdx : -1;
  if (start === -1) {
    return `<!doctype html><html><head><meta charset="utf-8"><title>Generated site</title></head><body>${candidate}</body></html>`;
  }
  if (start > 0) candidate = candidate.slice(start);
  const closeMatch = candidate.match(/<\/html\s*>/i);
  if (closeMatch) {
    const end = candidate.indexOf(closeMatch[0]) + closeMatch[0].length;
    candidate = candidate.slice(0, end);
  }
  return candidate.trim();
}

// Split the model's raw output into the HTML document and the summary block.
function parseModelOutput(raw: string): { html: string; summary: string } {
  if (!raw) return { html: "", summary: "" };
  const summaryIdx = raw.indexOf(SUMMARY_OPEN);
  if (summaryIdx !== -1) {
    const htmlChunk = raw.slice(0, summaryIdx);
    const tail = raw.slice(summaryIdx + SUMMARY_OPEN.length);
    const endIdx = tail.indexOf(SUMMARY_CLOSE);
    const summary = (endIdx >= 0 ? tail.slice(0, endIdx) : tail).trim();
    const html = extractHtml(htmlChunk);
    if (html.length > 200) return { html, summary };
  }
  const closeMatch = raw.match(/<\/html\s*>/i);
  if (closeMatch) {
    const closeEnd = raw.indexOf(closeMatch[0]) + closeMatch[0].length;
    const htmlChunk = raw.slice(0, closeEnd);
    const tail = raw.slice(closeEnd);
    let summary = "";
    const sumIdx = tail.indexOf(SUMMARY_OPEN);
    if (sumIdx !== -1) {
      const inner = tail.slice(sumIdx + SUMMARY_OPEN.length);
      const endIdx = inner.indexOf(SUMMARY_CLOSE);
      summary = (endIdx >= 0 ? inner.slice(0, endIdx) : inner).trim();
    } else {
      summary = tail.trim();
    }
    return { html: extractHtml(htmlChunk), summary };
  }
  return { html: extractHtml(raw), summary: "" };
}

// ─── Public API ───────────────────────────────────────────────────────────

// Turn a short user idea into a fuller design brief using the LLM (falls back to a template).
export async function enhancePrompt(prompt: string) {
  if (!isLLMConfigured()) {
    return { text: mockEnhancePrompt(prompt), source: "mock-no-key" };
  }
  try {
    console.log("\n[ai] Refining your idea into a design brief...");
    const out = await callLLM(
      [
        { role: "system", content: ENHANCE_SYSTEM },
        { role: "user", content: prompt },
      ],
      { temperature: 0.4, maxTokens: 500 },
    );
    return { text: out.trim(), source: "llm" };
  } catch (err: unknown) {
    console.log("[ai] Could not refine the prompt, using a quick template brief.");
    return {
      text: mockEnhancePrompt(prompt),
      source: "mock-error",
      error: getErrorMessage(err),
    };
  }
}

// Build or edit a website from the brief, returning the final HTML and a summary.
interface GenerateSiteOptions {
  previousHtml?: string;
  history?: ProjectMessage[];
  originalPrompt?: string;
}

export async function generateSite(
  prompt: string,
  {
    previousHtml = "",
    history = [],
    originalPrompt = "",
  }: GenerateSiteOptions = {},
) {
  // Strip our injected runtime so the model sees only its own clean HTML.
  previousHtml = stripInjectedRuntime(previousHtml);
  // `prompt` here is the enhanced brief — too markdown-y for the mock title.
  // Use the original short user prompt when falling back to the template.
  const mockSeed = originalPrompt || prompt;
  if (!isLLMConfigured()) {
    return {
      html: postProcess(generateMockSite(mockSeed)),
      summary: "",
      source: "mock-no-key",
    };
  }
  try {
    // Give the model as much of the previous site as the budget allows (see
    // INPUT_BUDGET_TOKENS) so edits preserve everything that isn't being changed.
    const historySlice = history.slice(-2);
    const sysTokens = approxTokens(GENERATE_SYSTEM);
    const histTokens = historySlice.reduce(
      (n, m) => n + approxTokens(m.text),
      0,
    );
    const promptTokens = approxTokens(prompt);
    // Reserve for wrapper text + message-format overhead.
    const prevBudget = Math.max(
      500,
      INPUT_BUDGET_TOKENS - sysTokens - histTokens - promptTokens - 250,
    );
    const trimmedHtml = truncatePreviousHtml(previousHtml, prevBudget);

    const messages: LlmMessage[] = [
      { role: "system", content: GENERATE_SYSTEM },
    ];
    for (const m of historySlice) {
      messages.push({ role: m.role, content: m.text });
    }
    if (trimmedHtml) {
      // Pull brand identity from the FULL previous HTML (not the truncated
      // copy) so we can explicitly LOCK it in the prompt. Without this, the AI
      // often pivots to a brand-new topic on vague iteration prompts like
      // "add a footer" or "improve design".
      const brand = extractBrandIdentity(previousHtml);
      const brandLock = brand
        ? `\n\n═══ BRAND LOCK — DO NOT VIOLATE ═══\nThe existing brand on this project is FIXED. You MUST preserve it exactly:\n  • Title: "${brand.title || "(none)"}"\n  • H1: "${brand.h1 || "(none)"}"\n  • Brand link: "${brand.brandLink || "(none)"}"\n  • Hero subtitle (h2/subhead): "${brand.h2 || "(none)"}"\nDo NOT change the brand name. Do NOT change the topic / industry. Do NOT invent a new company. The user's request is a TWEAK to the EXISTING site, not a new site. If the change request seems to imply a different brand (e.g. user says "add a footer" for an animal site — don't turn it into a home-decor site), keep the original brand.\n`
        : "";
      messages.push({
        role: "user",
        content: `Current site HTML (source of truth — keep what works, change only what's requested):\n\n\`\`\`html\n${trimmedHtml}\n\`\`\`${brandLock}\nChange request: ${prompt}\n\nReturn the FULL updated HTML document followed by the ${SUMMARY_OPEN}...${SUMMARY_CLOSE} block.`,
      });
    } else {
      messages.push({
        role: "user",
        content: `Build a complete, production-quality website based on this creative brief:\n\n${prompt}\n\nReturn the raw HTML document followed by the ${SUMMARY_OPEN}...${SUMMARY_CLOSE} block.`,
      });
    }

    // Iterations (previous HTML present) use a LOW temperature so "regenerate"
    // / "improve it" refines the SAME site instead of inventing a new one.
    // First builds use a bit more creativity.
    const isIteration = Boolean(trimmedHtml);
    console.log(`\n[ai] ${isIteration ? "Updating" : "Building"} your website...`);
    const raw = await callLLM(messages, {
      temperature: isIteration ? 0.3 : 0.6,
      maxTokens: IDEAL_OUTPUT_TOKENS,
    });
    const { html, summary } = parseModelOutput(raw);
    // Detect a cut-off response (hit the output token cap mid-document) BEFORE
    // postProcess force-closes the tags. A document that reached </html> is
    // complete — </body> is optional in HTML5 and some models omit it, so we do
    // NOT require it (requiring it flagged good sites as "incomplete").
    const truncated = !/<\/html\s*>/i.test(html);
    // Swap loremflickr keyword URLs for real, relevant Unsplash photos (no-op
    // if UNSPLASH_ACCESS_KEY isn't set — loremflickr stays as the fallback).
    const finalHtml = await resolveImages(postProcess(html));
    console.log("[ai] Website ready.\n");
    return { html: finalHtml, summary, source: "llm", truncated };
  } catch (err) {
    console.log(
      `[ai] Every AI model is busy right now, returned a starter template instead. ${friendlyError(err)}\n`,
    );
    return {
      html: postProcess(generateMockSite(mockSeed)),
      summary: "",
      source: "mock-error",
      error: friendlyError(err),
    };
  }
}

// Turn raw LLM errors into something the user can actually act on.
function friendlyError(err: unknown): string {
  const status = getErrorStatus(err);
  const message = getErrorMessage(err, "");
  if (isQuotaError(err)) {
    return "Every AI model hit its free-tier limit for the moment (Groq and Gemini both). The limits reset within a minute or a day — wait a little and try again.";
  }
  if (
    status === 413 ||
    /too large|request too large/i.test(message)
  ) {
    return "AI request was too large for the current model's per-minute token limit. Try a shorter follow-up, or switch to Gemini (250K TPM) by adding GEMINI_API_KEY.";
  }
  if (status === 401 || status === 403) {
    const providerName = getErrorProviderName(err) || "AI";
    return `${providerName} rejected the API key. Check your ${providerName.toUpperCase()}_API_KEY in server/.env.`;
  }
  if (status === 503 || status === 502 || status === 504) {
    return "The AI provider is overloaded right now. We retried 3 times and used a polished template instead — please try again in a minute.";
  }
  // Default: surface a trimmed version of the raw error
  const msg = (message || String(err)).slice(0, 240);
  return `AI generation failed: ${msg}`;
}

// ═══════════ EMAIL (OTP) ═══════════

// Email service — uses the Brevo (formerly Sendinblue) transactional API.
// Free tier: 300 emails/day. https://www.brevo.com/
//
// Env vars when you want real emails:
//   BREVO_API_KEY        — key from Brevo dashboard → SMTP & API → API Keys (v3)
//   BREVO_SENDER_EMAIL   — a verified sender on your Brevo account
//   BREVO_SENDER_NAME    — display name (optional, defaults to "Creova")
//
// If anything is missing or Brevo rejects the request, OTPs are logged to the
// console and (in development) returned in the API response so the flow keeps
// working while you sort out the email provider config.

const BREVO_ENDPOINT = "https://api.brevo.com/v3/smtp/email";

interface SendOtpEmailOptions {
  to: string;
  name?: string;
  code: string;
  purpose?: "signup" | "login" | "reset";
}

// True when Brevo email credentials are present in the environment.
export function isEmailConfigured(): boolean {
  return Boolean(process.env.BREVO_API_KEY && process.env.BREVO_SENDER_EMAIL);
}

// Log an OTP to the console when real email can't be sent.
function consoleFallback(to: string, code: string, reason: string): void {
  console.log(
    `\n[email:dev-fallback] OTP for ${to} → ${code}   (${reason})\n`,
  );
}

// Turn a Brevo error response into a readable, actionable message.
function parseBrevoError(status: number, body: string): string {
  try {
    const parsed = JSON.parse(body);
    const message = parsed.message || JSON.stringify(parsed);
    if (status === 401) {
      if (/sender/i.test(message)) {
        return `Brevo 401: ${message}. Verify the sender email in Brevo → Senders, Domains & Dedicated IPs → Senders.`;
      }
      return `Brevo 401: ${message}. Check BREVO_API_KEY is a valid v3 key.`;
    }
    return `Brevo ${status}: ${message}`;
  } catch {
    return `Brevo ${status}: ${body.slice(0, 200)}`;
  }
}

// Send a one-time code by email via Brevo; falls back to console logging on failure.
export async function sendOtpEmail({
  to,
  name,
  code,
  purpose,
}: SendOtpEmailOptions) {
  // Subject + intro varies by purpose so users know what the email is for
  // (signup verification, login OTP, password recovery, etc.).
  const isSignup = purpose === "signup";
  const subject = isSignup
    ? `Verify your Creova account — code: ${code}`
    : `Your Creova code: ${code}`;
  const intro = isSignup
    ? "Welcome to Creova! Use this code to verify your email and finish signing up."
    : "Enter this code to sign in. It expires in 10 minutes.";
  const textContent = `Hi ${name || "there"},\n\n${intro}\n\nYour code: ${code}\n\nThis code expires in 10 minutes.\nIf you didn't request this, you can safely ignore this email.\n\n— Creova`;
  const htmlContent = renderEmailHtml({ name, code, intro });

  if (!isEmailConfigured()) {
    consoleFallback(to, code, "BREVO_API_KEY not set");
    return { sent: false, fallback: true, reason: "not_configured" };
  }

  const payload = {
    sender: {
      name: process.env.BREVO_SENDER_NAME || "Creova",
      email: process.env.BREVO_SENDER_EMAIL,
    },
    to: [{ email: to, name: name || to }],
    subject,
    htmlContent,
    textContent,
  };

  try {
    const r = await fetch(BREVO_ENDPOINT, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "api-key": process.env.BREVO_API_KEY!,
      },
      body: JSON.stringify(payload),
    });

    if (r.ok) return { sent: true, fallback: false };

    const body = await r.text();
    const message = parseBrevoError(r.status, body);
    console.error("[brevo]", message);
    consoleFallback(to, code, `provider error ${r.status}`);
    return {
      sent: false,
      fallback: true,
      reason: "provider_error",
      status: r.status,
      providerError: message,
    };
  } catch (err: unknown) {
    const message = getErrorMessage(err);
    console.error("[brevo] network error:", message);
    consoleFallback(to, code, `network error: ${message}`);
    return {
      sent: false,
      fallback: true,
      reason: "network_error",
      providerError: message,
    };
  }
}

// Escape HTML-special characters so user text is safe inside the email markup.
function escape(s: string): string {
  const entities: Record<string, string> = {
    "<": "&lt;",
    ">": "&gt;",
    "&": "&amp;",
    '"': "&quot;",
    "'": "&#39;",
  };
  return String(s).replace(
    /[<>&"']/g,
    (character) => entities[character]!,
  );
}

// Build the HTML body of the OTP email.
function renderEmailHtml({
  name,
  code,
  intro,
}: {
  name?: string;
  code: string;
  intro: string;
}): string {
  const lead =
    intro || "Enter this code to sign in. It expires in 10 minutes.";
  return `<!doctype html><html><body style="font-family:Inter,system-ui,sans-serif;background:#f4f4f5;padding:24px;color:#0f172a;margin:0">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:14px;padding:32px;border:1px solid #e2e8f0">
    <h1 style="margin:0 0 12px;font-size:20px">Your Creova code</h1>
    <p style="margin:0 0 20px;color:#475569;font-size:14px">Hi ${escape(name || "there")}, ${escape(lead)}</p>
    <div style="font-size:34px;font-weight:700;letter-spacing:8px;text-align:center;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:18px 0;margin:0 0 20px;color:#0f172a">${code}</div>
    <p style="margin:0;color:#94a3b8;font-size:12px">If you didn't request this, you can safely ignore this email.</p>
  </div>
</body></html>`;
}

// ═══════════ OTP STORE (in-memory) ═══════════

// Simple in-memory OTP store. Codes are 6-digit, plain, and expire in 10 min.
// Kept deliberately simple (no crypto / no DB fields) — codes live in a Map
// keyed by email. Good enough for this project; restart clears pending codes.

interface OtpRecord {
  code: string;
  expiresAt: number;
}

type OtpVerification =
  | { ok: true }
  | { ok: false; reason: string };

const otpStore = new Map<string, OtpRecord>();
const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes

// Generate a random 6-digit OTP string.
export const generateOtp = () =>
  String(Math.floor(100000 + Math.random() * 900000));

// Save a code for an email (overwrites any previous one).
export function saveOtp(email: string, code: string): void {
  otpStore.set(email, { code, expiresAt: Date.now() + OTP_TTL_MS });
}

// Verify a code. On success the code is burned so it can't be reused.
export function verifyOtp(email: string, code: string): OtpVerification {
  const record = otpStore.get(email);
  if (!record) {
    return { ok: false, reason: "No code requested. Request a new one." };
  }
  if (Date.now() > record.expiresAt) {
    otpStore.delete(email);
    return { ok: false, reason: "Code expired. Request a new one." };
  }
  if (record.code !== String(code).trim()) {
    return { ok: false, reason: "Incorrect code." };
  }
  otpStore.delete(email);
  return { ok: true };
}

// Check a code WITHOUT burning it — used to gate the "set a new password" step
// so the same code can still be used by the final reset call.
export function peekOtp(email: string, code: string): OtpVerification {
  const record = otpStore.get(email);
  if (!record)
    return { ok: false, reason: "No code requested. Request a new one." };
  if (Date.now() > record.expiresAt) {
    otpStore.delete(email);
    return { ok: false, reason: "Code expired. Request a new one." };
  }
  if (record.code !== String(code).trim())
    return { ok: false, reason: "Incorrect code." };
  return { ok: true };
}

// ═══════════ STRIPE PAYMENTS ═══════════

// Stripe SDK wrapper. Reads STRIPE_SECRET_KEY from env. Keeps just what we
// need: a Checkout Session to take a payment, and a session lookup to confirm
// it. (No webhook / publishable key — the success-return page confirms the
// payment itself.)

let _client: Stripe | null = null;

// Return a cached Stripe client, or null if no secret key is configured.
function getStripe(): Stripe | null {
  if (_client) return _client;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  _client = new Stripe(key, {
    apiVersion: "2024-12-18.acacia" as Stripe.LatestApiVersion,
  });
  return _client;
}

// True when a Stripe secret key is set in the environment.
export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

// Create a Checkout Session for one credit pack. Returns { id, url } that
// the frontend redirects to. Stripe handles the payment UI.
interface CheckoutPackage {
  id: string;
  name: string;
  credits: number;
  amount: number;
  currency: string;
  tagline: string;
}

interface CheckoutSessionOptions {
  pkg: CheckoutPackage;
  user: UserDocument;
  successUrl: string;
  cancelUrl: string;
}

export async function createCheckoutSession({
  pkg,
  user,
  successUrl,
  cancelUrl,
}: CheckoutSessionOptions) {
  const stripe = getStripe();
  if (!stripe) throw new Error("Stripe not configured");
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: pkg.currency,
          product_data: {
            name: `${pkg.name} pack — ${pkg.credits} Creova credits`,
            description: pkg.tagline,
          },
          unit_amount: pkg.amount,
        },
        quantity: 1,
      },
    ],
    customer_email: user.email,
    client_reference_id: user._id.toString(),
    metadata: {
      userId: user._id.toString(),
      packageId: pkg.id,
      credits: String(pkg.credits),
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
  });
  return { id: session.id, url: session.url };
}

// Inspect a session by id — used by the polling-verify fallback flow on
// success-return URL (in case webhook hasn't fired yet by the time the
// user lands back on the app).
export async function retrieveSession(sessionId: string) {
  const stripe = getStripe();
  if (!stripe) throw new Error("Stripe not configured");
  return await stripe.checkout.sessions.retrieve(sessionId);
}

// ═══════════ VERCEL DEPLOY ═══════════

const VERCEL_API = "https://api.vercel.com";

// Turn a project name into a safe, lowercase URL slug for Vercel.
function toProjectSlug(name: string): string {
  return (
    (name || "Creova-project")
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 50) || "Creova-project"
  );
}

// Make an authenticated JSON request to the Vercel API and throw on error responses.
interface VercelRequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
}

interface VercelDeploymentResponse {
  url?: string;
  alias?: string[];
  id: string;
  readyState?: string;
  status?: string;
}

async function vercelRequest<T>(
  token: string,
  path: string,
  init: VercelRequestOptions = {},
): Promise<T> {
  const r = await fetch(VERCEL_API + path, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  const text = await r.text();
  let body: unknown = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = { raw: text };
  }
  if (!r.ok) {
    const providerError = getErrorField(body, "error");
    const providerMessage = getErrorField(providerError, "message");
    throw Object.assign(
      new Error(
        typeof providerMessage === "string"
          ? providerMessage
          : `Vercel ${r.status}`,
      ),
      {
        status: r.status,
        code: getErrorField(providerError, "code"),
        providerName: "vercel",
      },
    );
  }
  return body as T;
}

// Create a deployment containing index.html + a minimal README. Returns the
// public deployment URL (vercel.app or custom alias).
export async function deployToVercel({
  token,
  projectName,
  html,
  prompt,
}: {
  token: string;
  projectName: string;
  html: string;
  prompt?: string;
}) {
  if (!token || !token.trim()) throw new Error("Vercel token is required");
  if (!html || html.length < 100)
    throw new Error("Project has no HTML to deploy");
  const slug = toProjectSlug(projectName);

  const readme = `# ${projectName || slug}\n\nDeployed via [Creova](https://Creova.app).\n\nOriginal prompt:\n> ${prompt || "(none)"}\n`;

  // Inline files for the v13 deployments endpoint
  const files = [
    { file: "index.html", data: html, encoding: "utf-8" },
    { file: "README.md", data: readme, encoding: "utf-8" },
    {
      file: "vercel.json",
      data: JSON.stringify(
        {
          cleanUrls: true,
          // Static site — no build step needed
        },
        null,
        2,
      ),
      encoding: "utf-8",
    },
  ];

  const payload = {
    name: slug,
    files,
    target: "production",
    projectSettings: {
      framework: null, // static
    },
  };

  // First-time deployment may need to create the project. The deployments
  // endpoint auto-creates a project if `name` doesn't exist on the team yet.
  const result = await vercelRequest<VercelDeploymentResponse>(
    token,
    "/v13/deployments",
    {
    method: "POST",
    body: JSON.stringify(payload),
    },
  );

  const fallback = result?.url ? `https://${result.url}` : null;
  const aliasUrl =
    Array.isArray(result?.alias) && result.alias[0]
      ? `https://${result.alias[0]}`
      : null;
  const productionUrl = aliasUrl || fallback;
  if (!productionUrl) throw new Error("Vercel returned no URL");

  return {
    url: productionUrl,
    deploymentId: result.id,
    readyState: result.readyState || result.status || "QUEUED",
    fallbackUrl: fallback,
  };
}

// ═══════════ GITHUB DEPLOY ═══════════

// Upload a project's HTML to a GitHub repo. Creates the repo if missing,
// commits/updates index.html + README.md, optionally enables GitHub Pages.
//
// Token must be a GitHub Personal Access Token (classic or fine-grained)
// with `repo` and (for Pages) `pages` scopes.
export async function publishToGitHub({
  token,
  repoName,
  html,
  projectName,
  prompt,
  isPrivate = false,
  enablePages = true,
}: {
  token: string;
  repoName: string;
  html: string;
  projectName?: string;
  prompt?: string;
  isPrivate?: boolean;
  enablePages?: boolean;
}) {
  if (!token) throw new Error("GitHub token is required");
  if (!repoName) throw new Error("Repo name is required");
  if (!html) throw new Error("Project has no generated HTML yet");

  const octokit = new Octokit({ auth: token });

  // 1. Who am I?
  let me;
  try {
    me = (await octokit.rest.users.getAuthenticated()).data;
  } catch (err: unknown) {
    if (getErrorStatus(err) === 401) {
      throw new Error("GitHub token is invalid or expired");
    }
    throw err;
  }
  const owner = me.login;

  // 2. Create the repo if it doesn't exist.
  let repo;
  let alreadyExisted = false;
  try {
    repo = (
      await octokit.rest.repos.get({ owner, repo: repoName })
    ).data;
    alreadyExisted = true;
  } catch (err: unknown) {
    if (getErrorStatus(err) !== 404) throw err;
    repo = (
      await octokit.rest.repos.createForAuthenticatedUser({
        name: repoName,
        private: isPrivate,
        auto_init: true,
        description: `Built with Creova — ${projectName || "AI-generated website"}`,
      })
    ).data;
  }

  const branch = repo.default_branch || "main";

  // 3. Commit index.html + README.md
  await commitFile({
    octokit,
    owner,
    repo: repoName,
    branch,
    path: "index.html",
    content: html,
    message: alreadyExisted
      ? "chore: update site via Creova"
      : "feat: initial site from Creova",
  });

  const readme = renderReadme({ projectName, prompt, owner, repoName });
  await commitFile({
    octokit,
    owner,
    repo: repoName,
    branch,
    path: "README.md",
    content: readme,
    message: "docs: add README",
  });

  // 4. Enable GitHub Pages (best-effort — needs `pages` scope on PAT).
  let pagesUrl = null;
  if (enablePages) {
    try {
      await octokit.request("POST /repos/{owner}/{repo}/pages", {
        owner,
        repo: repoName,
        source: { branch, path: "/" },
      });
    } catch (err: unknown) {
      // 409 = Pages already configured. 403 = scope missing. Both non-fatal.
      const status = getErrorStatus(err);
      if (status !== 409) {
        console.warn(
          `[github] could not enable Pages (status ${status ?? "unknown"}):`,
          getErrorMessage(err),
        );
      }
    }
    try {
      const pages = await octokit.request("GET /repos/{owner}/{repo}/pages", {
        owner,
        repo: repoName,
      });
      pagesUrl = pages.data?.html_url || null;
    } catch {
      pagesUrl = `https://${owner}.github.io/${repoName}/`;
    }
  }

  return {
    owner,
    repoName,
    repoUrl: repo.html_url,
    pagesUrl,
    alreadyExisted,
  };
}

// Create or update a single file in a GitHub repo (looks up the SHA to allow updates).
interface CommitFileOptions {
  octokit: InstanceType<typeof Octokit>;
  owner: string;
  repo: string;
  branch: string;
  path: string;
  content: string;
  message: string;
}

async function commitFile({
  octokit,
  owner,
  repo,
  branch,
  path,
  content,
  message,
}: CommitFileOptions): Promise<void> {
  // Look up existing file SHA so we can update instead of failing.
  let sha;
  try {
    const existing = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
      ref: branch,
    });
    if (!Array.isArray(existing.data)) sha = existing.data.sha;
  } catch (err: unknown) {
    if (getErrorStatus(err) !== 404) throw err;
  }

  await octokit.rest.repos.createOrUpdateFileContents({
    owner,
    repo,
    path,
    message,
    branch,
    content: Buffer.from(content, "utf-8").toString("base64"),
    sha,
  });
}

// Build the README.md text for a published GitHub repo.
function renderReadme({
  projectName,
  prompt,
  owner,
  repoName,
}: {
  projectName?: string;
  prompt?: string;
  owner: string;
  repoName: string;
}): string {
  const title = projectName || "AI-generated site";
  return `# ${title}

Generated with [Creova](https://github.com/) — turn a prompt into a website.

## Original prompt

> ${(prompt || "—").replace(/\n/g, "\n> ")}

## Run locally

Open \`index.html\` in your browser. The site is fully self-contained with
inline CSS — no build step required.

## Deploy

This repo is set up for **GitHub Pages**. Once Pages is enabled in the repo
settings, your site will be live at \`https://${owner}.github.io/${repoName}/\`.

---
_Edit the prompt in Creova to regenerate, then upload again to push the changes here._
`;
}
