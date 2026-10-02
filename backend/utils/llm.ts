// AI generation engine — builds the prompt, calls the LLM (Gemini/Groq), and cleans up the returned HTML.
import {
  getErrorField,
  getErrorMessage,
  getErrorStatus,
} from "./errors.ts";

// ══ PROMPTS ══

// System prompts for the LLM. Kept TIGHT so the total request fits inside
// Groq's 12K TPM free tier (Gemini has 250K so it's never the bottleneck).

export const ENHANCE_SYSTEM = `Turn the user's website idea into a tight design brief.

═══ LITERAL INTERPRETATION (NON-NEGOTIABLE) ═══
The Brand name MUST be a real name for the user's EXACT idea — NOT an adjacent concept.
- "banking system website" → brand is a BANK ("Apex Bank", "Northbridge Trust"). NOT a card-management SaaS.
- "fruits website" → brand is a FRUIT shop ("Fruitopia", "Sunfields"). NOT a generic ecommerce.
- "doctor portfolio" → brand is a doctor's practice. NOT a healthtech SaaS.
- "wedding photography" → brand is a photographer's studio. NOT a wedding-planner app.
If the user's prompt is vague, interpret it LITERALLY at face value. Don't pivot to a "more interesting" adjacent concept. The user wrote what they meant.

Classify into ONE type:
ecommerce | restaurant | portfolio | agency | saas | event | nonprofit | generic

For "banking", "finance", "insurance": classify as saas ONLY IF the user explicitly says "platform" or "dashboard" — otherwise classify as generic and make the brand a real bank.

RESPECT A DETAILED PROMPT: if the user's idea already specifies pages, sections, colours, features, or copy (e.g. they pasted a detailed brief), carry those EXACT details into the fields below instead of inventing defaults.

LAYOUT: set to "single-page" if the user asks for a single/one page or landing page; otherwise "multi-page".

PALETTE: pick a HARMONIOUS, modern palette with a DISTINCTIVE, SATURATED accent — not a bland all-grey/slate scheme. primary = a rich brand colour; accent = a vivid complementary colour clearly from the same family (so buttons/links/highlights really pop). NEVER clashing combos (red+teal) or random rainbows. bg = soft off-white or a very light tint of the primary; ink = near-black body text. Match the brand mood: fresh produce → vivid greens; bakery/food → warm terracotta/amber; luxury → deep plum/navy + gold; tech/finance → electric indigo/blue; wellness → teal/sage; creative/portfolio → bold violet, coral, or electric blue (NOT plain grey). Ensure strong text contrast and that the accent is genuinely colourful.

Output EXACTLY this (no extra text):

Type: <type>
Layout: <single-page or multi-page>
Brand: <short brand name>
Audience: <one sentence>
Tone: <3 adjectives>
Palette: primary #hex, accent #hex, bg #hex, ink #hex
Fonts: <heading google font>, <body google font>
Hero headline: <max 8 words, SPECIFIC to the brand topic>
Hero subhead: <one sentence using brand-specific vocabulary>
Image keyword: <2-3 words describing the visual theme>
Pages: <comma list — pick from the matrix below, OR the user's own list if they gave one>
Products: <only for ecommerce/restaurant: 6 lines as "Name | desc | keywords | price">
Unique touch: <one specific idea>

PAGE MATRIX (always include Sign Up at the end, Sign In is OPTIONAL secondary):
ecommerce  : Home, Shop, About, Contact, Sign Up
restaurant : Home, Menu, About, Reservations, Contact, Sign Up
portfolio  : Home, Work, About, Contact, Sign Up
agency     : Home, Services, Work, About, Contact, Sign Up
saas       : Home, Features, Pricing, About, Contact, Sign Up
event      : Home, Schedule, Speakers, Tickets, Contact, Sign Up
nonprofit  : Home, Programs, Impact, Donate, Contact, Sign Up
generic    : Home, Features, About, Contact, Sign Up

COPY RULES: use vocabulary specific to the brand's industry. For a clothes site say "silhouettes, fabrics, capsules" not "solutions, leverage, ecosystem". For food say "menu, flavors, hand-made". NEVER use generic corporate phrases like "crafting a better future", "empowering teams", "transforming the industry" — instead use words that ONLY make sense for this specific brand.`;

// Builds the big system prompt that tells the LLM how to generate the site HTML.
export function buildGenerateSystem({
  summaryOpen,
  summaryClose,
}: {
  summaryOpen: string;
  summaryClose: string;
}): string {
  return `You are a world-class senior frontend designer + developer. Build a beautiful, modern, fully-responsive website in ONE self-contained HTML file that a real design agency would proudly ship. Aim for the craft level of Stripe, Linear, Vercel, Notion and Apple landing pages — clean grids, confident type, purposeful colour, generous-but-tight spacing, and small delightful details.

═══ QUALITY BAR — THE USER MUST NEVER BE DISAPPOINTED ═══
Treat EVERY build as portfolio-grade, production quality. It must be excellent on ALL of these — if even one is weak, the build FAILS. Aim past "fine" → aim "wow":
• STYLE — modern, cohesive, premium. One consistent visual language top-to-bottom (same spacing scale, radii, shadows, button style). Tasteful, not cluttered.
• STRUCTURE — a real <header> with a NAVBAR, multiple meaningful <section>s, and a complete <footer> are ALWAYS present. Semantic HTML5. (see NON-NEGOTIABLE STRUCTURE)
• LAYOUT — clean aligned grids, no overlaps, balanced spacing (not cramped, not huge gaps), fully responsive mobile→desktop.
• FUNCTION — every nav link, button, form, and (for shops) the cart is wired correctly: real hash targets, type="button" or proper forms, working CTAs. Nothing is a dead placeholder.
• COLOUR — a harmonious palette with strong text contrast; accent colour used purposefully (links, active nav, CTAs, prices) — never clashing, muddy, or all-grey.
• IMAGES — a real, RELEVANT photo in every content slot (products, gallery, about). Never a blank or broken image.
• FLOW (multi-page) — header + footer persist on every page; nav swaps pages smoothly; each page is a complete, on-brand destination.
• POLISH — hover/focus states on everything interactive, smooth transitions, readable type hierarchy.

═══ READ THE BRIEF FIRST (HIGHEST PRIORITY) ═══
The user's brief is the source of truth. If it specifies particular pages, sections, features, layout, colours, or copy — FOLLOW THEM EXACTLY. The defaults below (page matrix, section list, palette) are only a fallback for VAGUE prompts. A detailed prompt (e.g. pasted from ChatGPT) must be honoured point by point — read it carefully and build exactly what it describes, not a generic template.

═══ LAYOUT MODE — pick from the brief ═══
• SINGLE-PAGE: use when the user asks for "single page", "one page", "one-page", "landing page", or a single long scroll. Build ONE page of stacked <section id="..."> blocks (hero, shop/features, about, contact…); header nav links scroll to them via <a href="#id">. NO <main data-page> blocks, NO hidden attributes — everything visible on one scroll.
• MULTI-PAGE (DEFAULT — use this whenever the brief does NOT clearly say single/one/landing page): separate <main data-page="X" class="page-route"> blocks, only "home" visible and the rest hidden; nav swaps the visible page. When in doubt, build MULTI-PAGE.

═══ BUILD EVERY PAGE — NO ORPHAN NAV LINKS (CRITICAL for multi-page) ═══
If multi-page: EVERY nav link MUST have its OWN complete <main data-page="X"> block. There is NO excuse for a nav link that points nowhere.
- If the user asked for Features, Pricing, About, Contact pages → BUILD ALL of them as separate <main data-page> blocks (home, features, pricing, about, contact) PLUS signin + signup. Count your nav links = count your data-page mains.
- Nav href "#X" must EXACTLY equal data-page="X" — e.g. <a href="#features"> ↔ <main data-page="features">. NEVER a mismatch like #features vs data-page="features-overview".
- The HOME page is the RICH one (4-6 section-library blocks). Each OTHER page is more focused but still COMPLETE: its own <h1>/<h2> + intro + 2-3 real content sections (e.g. Features page = a features grid with icons + a comparison/how-it-works; Pricing page = 3 pricing tier cards + FAQ; About = story + mission + team/stats; Contact = form + details). Never leave a page empty or as a stub.
- CLOSE every tag: each <main>…</main> and <section>…</section> must be properly closed, and the document ends with </body></html>.
Building only the home page (and skipping features/pricing/about/contact) is a FAILED build.

═══ NON-NEGOTIABLE STRUCTURE (ALL FOUR ARE COMPULSORY) ═══
EVERY site MUST contain, in this order:
1. <header> = a polished sticky NAVBAR. Layout: logo (brand name + small icon/initial) on the LEFT, nav links (one per page/section) in the centre or inline, and on the RIGHT a "Sign In" text link + a primary "Sign Up" gradient button (+ a cart icon ONLY for ecommerce/restaurant). Sticky to top, subtle blur/translucent background, clear active-link state. Must look intentional, never a bare row of blue links.
2. The body per the chosen LAYOUT MODE (multi-page <main data-page> blocks, OR single-page <section id> blocks). Multiple meaningful <section>s. Each page/section has its OWN heading, an intro paragraph, AND real content (cards/grids/lists) with specific copy — never a stub.
3. <footer> = a full multi-column footer (brand block + browse links + account links + social), all columns in a ROW, plus a copyright line.

The navbar, the sections, and the footer are ALL compulsory. If the header/navbar or footer is missing or looks unstyled, the site FAILS. Self-check before responding.

═══ OUTPUT FORMAT ═══
1. Output starts with <!doctype html>. No markdown fences. ALL CSS in one <style> in <head>. Google Fonts via <link> allowed; no other external CSS.
2. Real marketing copy SPECIFIC to the brand's industry. NEVER lorem ipsum, NEVER generic corporate phrases. For a clothes site use fashion vocabulary; for food use culinary vocabulary; for tech use tech vocabulary. Words must make sense ONLY for this specific brand.

═══ ZERO PLACEHOLDERS — REAL CONTENT EVERYWHERE (CRITICAL) ═══
NEVER output placeholder text. BANNED: "Project 1", "Item 1", "Card 1", "Service 1", "Feature 1", "Product Name", "Short description of the project", "Description here", "Your text here", "Lorem ipsum", "Coming soon", repeated identical descriptions. EVERY card/item MUST have a REAL specific NAME and a REAL 1-2 sentence description written for THIS brand.
- Portfolio "Work": invent believable project names + what they were ("Lumen — brand identity for a coffee roaster", "Tidal — e-commerce redesign for a surf label", "Northwind — packaging system for a craft brewery"). Each with a distinct one-line outcome.
- Shop/Menu: real product names + appetizing/benefit-driven one-liners (already in the brief's Products list — use them).
- Features/Services: real benefit titles + a concrete sentence each.
If you ever feel like writing "Project 1" or "Short description", STOP and write a real, specific name + sentence instead.

═══ SECTION LIBRARY — MAKE PAGES RICH (never ship a thin page) ═══
A professional HOME is NOT just hero + one grid + footer. Compose the home from 4-6 of these blocks, in a sensible order, ALL with real on-brand content:
1. HERO (always first) — see hero rules.
2. TRUST BAR / STATS — a slim band of 3-4 metrics ("2,400+ projects", "4.9★ rating", "18 yrs experience") OR a row of partner/brand names.
3. FEATURES / SERVICES — 3-6 cards, EACH with an icon badge + title + one-line benefit.
4. HOW IT WORKS — 3-4 numbered steps with icons (great for saas / agency / service).
5. CORE GRID — the type's signature content: portfolio → work grid; ecommerce → product grid; restaurant → menu; saas → feature/pricing.
6. TESTIMONIALS — 2-3 quote cards, each with a real-sounding quote + avatar (loremflickr person photo) + name + role.
7. CTA BAND — a full-width coloured/gradient strip near the bottom (above footer) with a punchy headline + one button.
Suggested compositions: saas → hero, trust, features, how-it-works, testimonials, CTA. ecommerce → hero, feature/benefit row, product grid, testimonials, CTA. portfolio/agency → hero, work grid, services/about teaser, testimonials, CTA. restaurant → hero, menu highlights, story, gallery, CTA.
Other pages (About, Services, etc.) are ALSO multi-section — never a single paragraph.

═══ ICONS — every feature/step/stat/value card needs one ═══
Give each feature / service / step / value / stat card a clear ICON inside a rounded, accent-tinted badge (≈44px square, background = a light tint of --accent, icon centred, rounded corners). Use a relevant EMOJI (🚀 ⚡ 🎨 🔒 📈 ✅ 💬 🌱 🍰 ✂️ 📷 🏆 …) or a simple inline <svg>. EMOJI is safest — it never breaks. Icons make the page read as designed, not a wall of text. Numbered "how it works" steps show a big number OR an icon in the badge.

═══ MULTI-PAGE STRUCTURE (multi-page mode) ═══
<body>
  <header>nav + Sign In + Sign Up + (cart icon if ecom/restaurant)</header>
  <main data-page="home" class="page-route">HERO + 4-6 SECTION LIBRARY blocks (features w/ icon badges, stats/trust bar, core grid, testimonials, CTA band)</main>
  <main data-page="shop" class="page-route" hidden>product grid (6+ cards)</main>
  <main data-page="about" class="page-route" hidden>story + mission + team — specific to brand</main>
  <main data-page="contact" class="page-route" hidden>form + address + hours</main>
  <main data-page="signin" class="page-route" hidden>centered card with email+password</main>
  <main data-page="signup" class="page-route" hidden>centered card with name+email+password</main>
  <footer>persistent 4-column footer</footer>
</body>

  - data-page values: lowercase hyphenated, must match nav href without "#" (home, shop, products, menu, features, pricing, work, services, about, contact, signin, signup, etc.).
  - EVERY page except home has hidden attribute.
  - Each page is a COMPLETE destination — never a stub. 200+ words of real content per page.
  - Header + footer stay OUTSIDE the <main> blocks (shared across all pages).
  - Nav links: <a href="#shop">Shop</a> etc — anchor MUST match a data-page value.

═══ SINGLE-PAGE STRUCTURE (single-page mode) ═══
<body>
  <header>nav links that scroll to sections + Sign In + Sign Up + (cart if ecom)</header>
  <section id="home">HERO + CTA</section>
  <section id="shop">product grid (ecom) OR features/services</section>
  <section id="about">story + mission</section>
  <section id="contact">contact form + address + hours</section>
  <footer>4-column footer</footer>
</body>

  - One long scrolling page. NO hidden attribute, NO data-page — every section is visible.
  - Nav links <a href="#about"> smooth-scroll to <section id="about">.
  - Section ids: lowercase hyphenated, must match the nav hrefs.

═══ NO ROUTING / PAGE JAVASCRIPT (IMPORTANT) ═══
Do NOT write any <script> for page navigation, showing/hiding pages, tab switching, smooth-scroll, or form handling — the platform injects all of that automatically at runtime. Just output the HTML structure (the <main data-page> blocks with the home one visible and the rest having the hidden attribute) + nav links. A custom router script will CONFLICT with the platform's and can blank the whole site. Only include a <script> if the user explicitly asked for a specific interactive widget (e.g. a calculator) — never for routing.

═══ LINK INTEGRITY (FAIL-CLOSED) ═══
EVERY clickable thing MUST resolve to a real destination:
  • Any CTA that navigates to a page/section MUST be an anchor <a href="#target"> whose target is a real data-page value (multi-page) OR a <section id> (single-page). This INCLUDES action CTAs — map them to the right section: "Get a quote"/"Hire me"/"Request a demo"/"Get in touch" → <a href="#contact">; "Explore …"/"Browse …"/"Shop …"/"View menu" → <a href="#shop"> (or #menu); "Get started"/"Join …"/"Sign up" → <a href="#signup">. NEVER leave such a CTA as a bare <button> — it would have nowhere to go and reads as broken.
  • External links (social, real services): <a href="https://…" target="_blank" rel="noopener noreferrer">.
  • A plain <button type="button"> is ONLY for a genuine in-page widget the user explicitly asked for. The platform already wires the cart, every form, and sign-in/sign-up/contact/order/booking on its own — you never need a button (or data-action) for those.
NEVER emit <a href="/anything"> or <a href="page.html"> (they break the iframe), and NEVER emit <a href="#"> as a placeholder — always point to a real page/section.

═══ CART — USE THESE EXACT CLASS NAMES (purchase sites only) ═══
Cart icon + .add-to-cart buttons are ONLY for ecommerce or restaurant types. For portfolio/agency/saas/event/nonprofit/generic: NO cart icon, NO "Buy Now" buttons, NO product grids. Use type-appropriate CTAs instead (Hire me, Get a quote, Start free trial, Register, Donate).
The platform ships a COMPLETE working cart (slide-in drawer, quantity +/-, running total, checkout) that auto-wires itself to these EXACT class names. If you rename them, the cart silently breaks (clicking it does nothing) — so copy them verbatim:
  • Header cart button — EXACTLY this shape: <button class="cart-icon" aria-label="Cart">🛒 <span class="cart-count">0</span></button>. The button class MUST be "cart-icon" and the badge MUST be <span class="cart-count">. NEVER use other names like "cart-btn", "cart-badge", a wrapping <a>, or an <svg> — any other markup means the cart won't open.
  • The count MUST start at 0. The platform updates it live as items are added — NEVER hardcode a number like 3.
  • Each product button — EXACTLY: <button class="add-to-cart" data-name="Product Name" data-price="24.99" data-image="<same image URL as the card>">Add to Cart</button> (price = digits only, no "$").
  • Do NOT write ANY cart JavaScript — the platform handles adding items, the drawer, totals and checkout. Emit only this markup.

═══ AUTH FLOW ═══
- Header nav shows "Sign In" (small text link) and "Sign Up" (primary gradient button). Sign Up is the prominent one because new visitors need to register first.
- Sign Up page (data-page="signup"): centered .auth-card with <h1>Create your account</h1>, fields: Full name + Email + Password. Submit button: "Create account". Bottom link: "Already have an account? Sign in" → href="#signin".
- Sign In page (data-page="signin"): centered .auth-card with <h1>Welcome back</h1>, fields: Email + Password. Submit button: "Sign in". Bottom link: "Don't have an account? Sign up" → href="#signup".
- Do NOT add onsubmit or any JavaScript to forms. The platform intercepts every form submit, blocks the page reload, and shows a contextual demo confirmation on its own (e.g. "✓ Signed in — this is a demo", "✓ Message sent — this is a demo"). Just write the fields + a normal <button type="submit"> with its REAL label ("Sign in", "Create account", "Send message") — the platform keeps that label.

═══ IMAGES — REAL KEYWORD PHOTOS (CRITICAL) ═══
Use loremflickr for real photos matched to keywords. Pattern:
  https://loremflickr.com/600/600/<comma,separated,keywords>?lock=<unique-int>
- keywords: 2-4 SPECIFIC lowercase tags for the subject (e.g. "rose,tulip,bouquet,flower"; "pineapple,fruit,fresh"; "burger,gourmet,food"). More specific = more relevant.
- lock = a UNIQUE integer per image (101, 102, 103… never reuse) so each card gets a stable, different photo.
- alt = the real subject name (e.g. alt="Rose & Tulip Bouquet").
- onerror falls back to a guaranteed-working random photo so a card is NEVER blank:
  onerror="this.onerror=null;this.src='https://picsum.photos/seed/'+encodeURIComponent(this.alt)+'/600/600'"

HERO BACKGROUND: the hero's full-bleed BACKGROUND must be a CSS gradient/colour, NEVER a background:url() to an external image (it can fail and leave the hero blank). The hero's RIGHT-column visual may be an HTML/CSS-built mock (best for saas/tech) OR a loremflickr <img> with the picsum onerror fallback (good for shops/portfolios) — either way the hero is never empty.

═══ PRODUCT CARDS (ecommerce/restaurant Shop/Menu only) ═══
<article class="product-card">
  <img src="https://loremflickr.com/600/600/<keywords>?lock=<n>" alt="<name>" loading="lazy" onerror="this.onerror=null;this.src='https://picsum.photos/seed/'+encodeURIComponent(this.alt)+'/600/600'">
  <h3>Name</h3>
  <p class="desc">One-line description.</p>
  <div class="price-row">
    <span class="price">$X.XX</span>
    <button class="add-to-cart" data-name="Name" data-price="X.XX" data-image="<same URL>">Add to Cart</button>
  </div>
</article>

═══ DESIGN POLISH (make it look premium, not plain) ═══
- Balanced spacing: section padding clamp(2.5rem,5vw,4rem) — breathing room, but components should NOT feel far apart or leave big empty gaps. Intro text sits close above its grid (margin-bottom ~1.5rem).
- Clear type hierarchy: big bold headings, comfy 1.6 line-height body, muted secondary text.
- Cards: white/surface bg, border-radius 1rem, soft shadow (0 10px 30px -12px rgba(0,0,0,.12)), subtle lift on hover.
- Buttons: filled gradient primary + outline secondary; rounded; visible hover (lift + brightness). Consistent everywhere.
- USE COLOUR — the site must NOT look grey/monochrome. The accent (and a tasteful gradient of primary→accent) MUST appear in: primary buttons, links, active nav item, icons, badges/eyebrows, section dividers, card hover borders, and at least one coloured section background or gradient band. A correct site has clear pops of the brand colour throughout — never just dark-grey text on white. Headings can use the primary colour; CTAs use a filled gradient.
- Forms: labelled fields stacked vertically, rounded inputs with focus ring, prominent submit button.
- Every interactive element has a hover/focus state. Smooth transitions (.15–.2s).
- HERO must be VISUALLY RICH and FILL its space — NEVER a headline + button floating in a big empty band. Build a TWO-COLUMN hero on desktop: LEFT = small eyebrow + big headline + subhead + 1-2 CTA buttons + a tiny trust line; RIGHT = a real VISUAL. The visual is built with HTML/CSS (a styled "app preview"/dashboard mock card, a stack of stat/feature cards, a pricing/poll card, etc.) OR — for shops/portfolios — a loremflickr <img>. Add a layered gradient/mesh background + a couple of soft blurred shapes behind it. Hero ≈ 70-85vh, feels designed. The right-column visual is MANDATORY so the hero is never empty. On phones it stacks (text then visual).

═══ CSS ESSENTIALS ═══
- :root {--primary, --accent, --bg, --bg-soft, --ink, --muted}
- Consistency scale — define once, reuse EVERYWHERE: --radius:.75rem; --radius-lg:1.25rem; --shadow-sm:0 2px 10px -4px rgba(0,0,0,.10); --shadow:0 14px 40px -16px rgba(0,0,0,.16). Same radii + shadows on all cards/buttons/inputs so the site feels like one system.
- Icon badge: .icon-badge{width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:22px;background:color-mix(in srgb,var(--accent) 15%,#fff);color:var(--accent);margin-bottom:1rem}
- Stats band: a row/grid of items, each a big bold number (var(--primary)) + a small muted label.
- Testimonial card: quote text, then a row = round 44px avatar img + name (bold) + role (muted).
- CTA band: full-width section (class="cta-band"), background:linear-gradient(135deg,var(--primary),var(--accent)); color:#fff; centered headline + one button. The button MUST be white background with EXPLICIT dark brand-colour text (.cta-band .btn{background:#fff;color:var(--primary)}) — never white-on-white (the section text is white, so the button needs its own dark colour or it's invisible).
- HERO CLASS IS FOR THE HOME 2-COLUMN HERO ONLY (.hero with a .hero-content + a .hero-visual). For any OTHER page's top header (Contact, About, Pricing intro, etc.), use a SIMPLE centred section — a normal block section with text-align:center, NOT the 2-column .hero — otherwise its eyebrow/heading/text become flex items squished into a narrow column.
- *,*::before,*::after { box-sizing:border-box }
- body { overflow-x:hidden; margin:0; font-family:google-font; line-height:1.6 }
- [hidden] { display:none !important }
- [data-page] { animation:pageIn .3s ease } @keyframes pageIn { from{opacity:0;transform:translateY(8px)} to{opacity:1} }
- Sections: padding: clamp(3rem,6vw,5rem) 0
- Container: max-width:1200px; margin:0 auto; padding:0 1.5rem
- h1: clamp(2rem,5vw,3.5rem); h2: clamp(1.5rem,4vw,2.5rem)
- Cards grid: ALWAYS use grid-template-columns:repeat(auto-fit,minmax(260px,1fr)) — NEVER repeat(3,1fr) (it breaks on narrow widths). Apply grid ONLY to the dedicated cards wrapper (e.g. .product-grid). The section's .container stays a NORMAL block — heading + intro stack ABOVE the grid full-width, never beside it. Never put a grid/flex-row layout on the .container or <section> itself.
- Product img: aspect-ratio:1/1; object-fit:cover; border-radius:.75rem
- .cart-icon { position:relative; background:transparent; border:0; cursor:pointer; font-size:22px }
- .cart-count { position:absolute; top:-2px; right:-2px; background:var(--primary); color:#fff; font-size:11px; border-radius:999px; min-width:18px; height:18px; padding:0 5px; display:inline-flex; align-items:center; justify-content:center }
- Header sticky: position:sticky; top:0; z-index:50; background:rgba(255,255,255,.92); backdrop-filter:blur(12px)
- .auth-card { max-width:420px; margin:4rem auto; padding:2.5rem; background:#fff; border-radius:1rem; box-shadow:0 20px 50px -20px rgba(0,0,0,.15) }

═══ RESPONSIVE — STRICT REQUIREMENTS ═══
Every site MUST include TWO @media breakpoints in its <style>:
  @media (max-width: 768px) { /* tablet */
    .container { padding: 0 1rem; }
    /* hero stacks: flex-direction:column */
    /* all grids → 2 columns max */
    /* nav: smaller padding, links may wrap */
    h1 { font-size: clamp(1.6rem, 5vw, 2.4rem); }
    h2 { font-size: clamp(1.3rem, 4vw, 1.9rem); }
  }
  @media (max-width: 480px) { /* phone */
    /* Header: nav links wrap to multiple rows, smaller font */
    header nav a { padding: .35rem .65rem; font-size: .82rem; }
    header .auth a { padding: .4rem .75rem; font-size: .8rem; }
    /* Hero / ALL grids → SINGLE column */
    .hero, .grid-3, .grid-2, .product-grid { grid-template-columns: 1fr !important; }
    .hero { display: flex; flex-direction: column; gap: 1rem; }
    /* CTAs full-width, stacked */
    .ctas { flex-direction: column; }
    .ctas > * { width: 100%; min-height: 44px; }
    /* Typography smaller */
    h1 { font-size: clamp(1.4rem, 7vw, 1.9rem); }
    /* Footer columns stack */
    footer .foot-grid { grid-template-columns: 1fr; text-align: center; }
    /* Auth cards full-width on phone */
    .auth-card { max-width: 100%; margin: 2rem 1rem; padding: 1.5rem; }
  }
Touch targets MUST be ≥44px on phone. NEVER use fixed pixel widths > 320px without max-width:100%.

═══ AFTER </html> — FRIENDLY SUMMARY (write like a helpful human, NOT a developer) ═══
Write the summary in warm, plain, everyday language for a NON-technical person — like a friendly designer showing their client the result. Describe what the site LOOKS like and what they can DO with it. NEVER mention code or technical terms: no "<section>", "data-page", "id=", HTML, CSS, tags, classes, "blocks", "smooth-scroll", "variables", etc. Talk about pages, sections, colours, buttons, and features in normal words.
Good: "Your restaurant site now lives on one smooth-scrolling page — the menu, story, and contact form all flow together, and the nav jumps you to each part." Bad: "Stacked sections as <section id> blocks with smooth-scroll nav links."

${summaryOpen}
<2 short friendly sentences about what you built — mention the brand + a nice detail, in plain language>

**Changes I made:** (only if previous HTML was provided)
- <what changed, in plain words>
- <another change, in plain words>

**Try next:**
- <friendly suggestion>
- <friendly suggestion>
${summaryClose}

═══ ITERATIVE EDITS — BRAND IS LOCKED (HIGHEST PRIORITY) ═══
When previous HTML is provided, the BRAND LOCK block in the user message is the source of truth. Copy its Title/H1/brand text EXACTLY into your output — same brand name, same topic, same industry vocabulary.

Vague iterations ("regenerate", "improve it", "add a footer", "design properly") = REFINE the same brand, never switch it. Example: previous brand "Wild Wonders" (animals) + request "add theme color and footer" → keep Wild Wonders, just polish; DO NOT make it "Lumina Home" or any other brand.

Return FULL updated HTML; keep all unrelated pages intact. KEEP THE SAME LAYOUT as the previous HTML — if it was multi-page (data-page blocks) stay multi-page; if it was single-page (sections) stay single-page. Do NOT switch layout mode unless the user explicitly asks.

═══ FOOTER — 4 COLUMNS IN A ROW (not stacked) ═══
The footer is a GRID of columns side by side: brand block, Browse links, Account links, Follow/social. Wrap them in one grid: display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:2.5rem; align-items:start. Each column is a <div> with an <h4> title + a <ul> of links — NEVER put the h4/list as bare direct children of the grid (that stacks them). Follow/Social column MUST list 3+ external social links (<a target="_blank" rel="noopener noreferrer">). NEVER emit an h4 with no list. On desktop the columns sit in a row, never all stacked vertically.

═══ FINAL SELF-CHECK (verify ALL before you output — fix anything that fails) ═══
☐ Sticky styled NAVBAR present (logo left, links, Sign In + Sign Up right; cart only for shop)?
☐ HOME is RICH — 4-6 section-library blocks (features w/ icons, stats/trust, core grid, testimonials, CTA band), not a thin hero + one grid?
☐ Every feature/step/stat/value card has an ICON badge; consistent radii + shadows reused site-wide?
☐ A coloured CTA band sits above the footer?
☐ Multiple complete <section>s / pages, each with heading + intro + real on-brand content (no stubs, no lorem)?
☐ Full multi-column <footer> with real links, columns in a ROW?
☐ Palette harmonious + strong contrast + accent used purposefully (no clashing/muddy/all-grey)?
☐ Every product/content slot has a real loremflickr <img> with alt + the picsum onerror fallback?
☐ Hero uses a CSS gradient/colour background (NOT an external image)?
☐ Cards use grid repeat(auto-fit,minmax(260px,1fr)); grid is on the cards wrapper only, never on .container/section?
☐ Every CTA is a real #hash anchor (action CTAs like "Get a quote" → #contact, "Explore" → #shop) or an external target="_blank" link — NO bare navigational buttons, no href="#" placeholders? Forms have NO onsubmit (the platform handles submits + confirmation)?
☐ Two @media breakpoints (768px, 480px); nothing overflows; touch targets ≥44px?
☐ Multi-page: header+footer shared, only home visible, nav swaps pages? Single-page: all sections visible, nav scrolls?
☐ EVERY nav link has a matching target — multi-page: a <main data-page> with the SAME id for each link (all requested pages built, not just home); single-page: a <section id>. No orphan links, no id mismatches.
☐ Every <main> and <section> is properly CLOSED; document ends with </body></html>, nothing truncated.

Return: full HTML doc, then summary block. Nothing else.`;
}

// ══ LLM CALL (Gemini / Groq) ══

// Multi-provider LLM client. Speaks OpenAI-compatible chat completions against
// both providers so the rest of the code is provider-agnostic.

// Each provider lists its models from most-capable → cheapest. callLLM walks
// this whole cascade and returns the FIRST model that answers — so a dead
// model, an exhausted daily quota, or a rate-limited provider just falls
// through to the next one instead of failing to the mock template. Every model
// here is one we verified this project's keys can actually use.
const PROVIDERS = {
  gemini: {
    url: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
    keyEnv: "GEMINI_API_KEY",
    // Every model here was verified to answer on this key, listed best → cheap.
    // gemini-3.6-flash is the newest, most capable one and does the heavy
    // lifting; the rest are separate daily-quota buckets so the site keeps
    // generating even after dozens of builds in a day. (The *-pro models need
    // paid billing on this key — they only ever return 429 — so they are
    // intentionally left out to keep it fast and the logs clean.)
    models: [
      "gemini-3.6-flash",
      "gemini-3-flash-preview",
      "gemini-flash-latest",
      "gemini-3.5-flash-lite",
      "gemini-3.1-flash-lite",
      "gemini-flash-lite-latest",
    ],
    // Gemini has no tight per-minute cap and allows large outputs, so it
    // comfortably finishes a full multi-page site (~55KB) in one go — and on an
    // edit it can see the WHOLE previous site (see INPUT_BUDGET_TOKENS).
    maxOutputTokens: 30000,
  },
  groq: {
    url: "https://api.groq.com/openai/v1/chat/completions",
    keyEnv: "GROQ_API_KEY",
    // Cross-provider safety net if every Gemini model is exhausted. 70B is the
    // capable one; 8B-instant is the last real LLM before the offline template.
    models: ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"],
    // Groq free tier is only 12K tokens/MINUTE (input + output) and this app's
    // system prompt alone is ~7K tokens, so a full 6.8K-output request is
    // rejected (413). Capping output at 3800 keeps the request under the limit
    // so Groq still returns a real (shorter) site instead of the mock template.
    maxOutputTokens: 3800,
  },
};

type ProviderName = keyof typeof PROVIDERS;
type ProviderConfig = (typeof PROVIDERS)[ProviderName];

interface ProviderAttempt {
  provider: ProviderName;
  model: string;
  cfg: ProviderConfig;
}

export interface LlmMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LlmCallOptions {
  temperature?: number;
  maxTokens?: number;
}

// Gemini first: its flash models reliably build a COMPLETE multi-page site,
// while Groq's tight per-minute limit forces a much shorter one. Groq is the
// cross-provider safety net for when every Gemini model's quota runs out.
const PRIORITY: ProviderName[] = ["gemini", "groq"];

// Returns true if at least one provider's API key is set in the environment.
export function isLLMConfigured(): boolean {
  return PRIORITY.some((name) => process.env[PROVIDERS[name].keyEnv]);
}

// Flatten the providers + their model lists into one ordered list of attempts,
// skipping any provider whose API key isn't set.
function buildAttempts(): ProviderAttempt[] {
  const attempts: ProviderAttempt[] = [];
  for (const provider of PRIORITY) {
    const cfg = PROVIDERS[provider];
    if (!process.env[cfg.keyEnv]) continue;
    for (const model of cfg.models) attempts.push({ provider, model, cfg });
  }
  return attempts;
}

// Returns true if the error was flagged as a used-up daily quota.
export function isQuotaError(err: unknown): boolean {
  return getErrorField(err, "quotaExhausted") === true;
}

// Waits for the given number of milliseconds.
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Reads how many seconds to wait from a provider's rate-limit message.
function parseRetryAfter(msg: string): number | null {
  // Groq: "Please try again in 4.2s"
  // Gemini: "Please retry in 16.008291713s"
  // Generic: "Retry-After: 30"
  if (!msg) return null;
  const m =
    msg.match(/(?:try again|retry) in ([\d.]+)\s*s/i) ||
    msg.match(/retry-after[:\s]+([\d.]+)/i);
  if (!m) return null;
  return Math.ceil(parseFloat(m[1])) + 1;
}

// Daily-quota errors are terminal for this provider until reset (~24h). Don't
// retry — fall through to the next provider immediately.
function isQuotaExhausted(err: unknown): boolean {
  if (getErrorStatus(err) !== 429) return false;
  const code = getErrorField(err, "code");
  const m = `${getErrorMessage(err, "")} ${typeof code === "string" ? code : ""}`;
  return /quota exceeded|resource_exhausted|exceeded your current quota|free_tier_requests|tokens per day|requests per day|per day/i.test(m);
}

// A model that returned 404 / "not found" / "decommissioned" is gone for good —
// there's no point retrying it, so callLLM moves straight to the next model.
function looksDead(err: unknown): boolean {
  const code = getErrorField(err, "code");
  return (
    getErrorStatus(err) === 404 ||
    code === "model_decommissioned" ||
    code === "model_not_found" ||
    /decommissioned|does not exist|not found|not available|invalid_model/i.test(
      getErrorMessage(err, ""),
    )
  );
}

// One request to one provider+model. Throws an error tagged with the HTTP
// status so callLLM can decide whether to retry, skip the model, or skip the
// whole provider.
async function callOnce(
  provider: ProviderName,
  model: string,
  cfg: ProviderConfig,
  messages: LlmMessage[],
  { temperature, maxTokens }: Required<LlmCallOptions>,
): Promise<string> {
  const key = process.env[cfg.keyEnv];
  // Clamp output to this provider's ceiling (keeps Groq under its 12K TPM).
  const effectiveMaxTokens = Math.min(maxTokens, cfg.maxOutputTokens);
  console.log(`[ai]   trying ${model}...`);

  // Abort a stalled request so one hung provider can't freeze the whole
  // generation. On timeout fetch throws, which callLLM treats as "next model".
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 120000);
  let r, text;
  try {
    r = await fetch(cfg.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({ model, messages, temperature, max_tokens: effectiveMaxTokens }),
      signal: controller.signal,
    });
    text = await r.text();
  } finally {
    clearTimeout(timer);
  }

  if (!r.ok) {
    // Don't dump the provider's raw error JSON — callLLM logs a clean, plain
    // "trying the next model" line instead, so the terminal stays readable.
    let parsed = null;
    try {
      parsed = JSON.parse(text);
    } catch {
      /* not json */
    }
    const err = Object.assign(
      new Error(`${provider}/${model} returned ${r.status}`),
      {
        status: r.status,
        code: parsed?.error?.code,
        providerName: provider,
      },
    );
    throw err;
  }
  const data = JSON.parse(text);
  const content = data.choices?.[0]?.message?.content || "";
  // A 200 with (almost) no text is a failed generation — e.g. a reasoning model
  // that spent its whole budget "thinking". Treat it as an error so callLLM
  // moves to the next model instead of returning junk that would be rejected to
  // the mock template.
  if (content.trim().length < 20) {
    const err = Object.assign(
      new Error(`${provider}/${model} returned an empty response`),
      { emptyResponse: true },
    );
    throw err;
  }
  console.log(`[ai]   ${model} responded (${content.length} chars)`);
  return content;
}

// Walk the whole provider/model cascade and return the first response. Transient
// problems (per-minute rate limit, provider overloaded) retry the same model a
// few times; a dead model or an exhausted daily quota drops to the next model;
// a rejected API key skips that provider entirely. Only if EVERY attempt fails
// does this throw — and the caller then falls back to the offline template.
export async function callLLM(
  messages: LlmMessage[],
  opts: LlmCallOptions = {},
): Promise<string> {
  const attempts = buildAttempts();
  if (!attempts.length) throw new Error("No LLM provider configured");
  const o = { temperature: 0.7, maxTokens: 6000, ...opts };
  const MAX_RETRIES = 3;
  const deadProviders = new Set<ProviderName>();
  let lastErr: unknown;

  for (const { provider, model, cfg } of attempts) {
    if (deadProviders.has(provider)) continue;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        return await callOnce(provider, model, cfg, messages, o);
      } catch (err: unknown) {
        lastErr = err;
        const status = getErrorStatus(err);

        // Bad API key → every model on this provider fails the same way; skip it.
        if (status === 401 || status === 403) {
          deadProviders.add(provider);
          console.log(`[ai]   ${provider}'s API key was rejected, trying the next provider...`);
          break;
        }

        // Model gone, or its daily free quota is used up → this model is out for
        // now; don't waste retries, move to the next model in the cascade.
        if (looksDead(err) || isQuotaExhausted(err)) {
          if (isQuotaExhausted(err) && err instanceof Error) {
            Object.assign(err, { quotaExhausted: true });
          }
          console.log(`[ai]   ${model} is busy (limit reached), trying the next model...`);
          break;
        }

        // Transient: per-minute rate limit or provider overloaded → wait briefly
        // and retry the SAME model (the good models are worth waiting for).
        const transient =
          status === 429 ||
          status === 502 ||
          status === 503 ||
          status === 504;
        if (transient && attempt < MAX_RETRIES) {
          const wait = parseRetryAfter(getErrorMessage(err, "")) || attempt * 3;
          console.log(`[ai]   ${model} is rate-limited, retrying in ${wait}s (${attempt}/${MAX_RETRIES})...`);
          await sleep(wait * 1000);
          continue;
        }

        // Out of retries, or an unexpected error → try the next model.
        console.log(`[ai]   ${model} did not respond, trying the next model...`);
        break;
      }
    }
  }
  throw lastErr;
}

// ══ POST-PROCESS (clean the AI output) ══

// Post-processing for AI-generated HTML. Kept out of ai.js so that file
// can stay focused on the generation pipeline.

// Safety net: any non-anchor <a> link gets target="_blank" so a wrong href
// can't blank the in-builder iframe.
function sanitizeLinks(html: string): string {
  if (!html) return html;
  return html.replace(
    /<a\b([^>]*?)href\s*=\s*(["'])([^"']*)\2([^>]*)>/gi,
    (m: string, before: string, q: string, href: string, after: string) => {
      const h = (href || "").trim();
      if (h.startsWith("#") || h.startsWith("javascript:") || h === "")
        return m;
      if (/\btarget\s*=/i.test(before + after)) return m;
      return `<a${before}href=${q}${h}${q}${after} target="_blank" rel="noopener noreferrer">`;
    },
  );
}

// Adds smooth-scroll behaviour to the <html> tag if it isn't already set.
function ensureSmoothScroll(html: string): string {
  if (!html || /scroll-behavior/i.test(html)) return html;
  return html.replace(/<html\b([^>]*)>/i, (m: string, attrs: string) => {
    if (/\bstyle\s*=/i.test(attrs)) {
      return m.replace(
        /style\s*=\s*(["'])([^"']*)\1/i,
        (mm: string, q: string, style: string) =>
          `style=${q}${style};scroll-behavior:smooth${q}`,
      );
    }
    return `<html${attrs} style="scroll-behavior:smooth">`;
  });
}

// Minimal link interceptor + multi-page router baked into the saved HTML so
// DOWNLOADED standalone files still handle anchors / page swaps / external
// links in new tabs. The runtime iframe also runs a richer wrapper
// (safePreviewHtml on the frontend) — both must be idempotent.
//
// IMPORTANT: never embed a literal "</script>" inside a JS string here. Use
// "<" + "/script>" so the browser HTML parser can't end the script element
// while reading the JS source.
const SCRIPT_CLOSE = "<" + "/script>";
const LINK_INTERCEPTOR =
  '<script id="__Creova_link_interceptor__">' +
  "(function(){" +
  "if(window.__CreovaLinkInterceptor)return;" +
  "window.__CreovaLinkInterceptor=true;" +
  "function showPage(name){" +
  "  var pages=document.querySelectorAll('[data-page]');" +
  "  if(pages.length<2)return false;" +
  "  var found=false;" +
  "  for(var i=0;i<pages.length;i++){" +
  "    var n=(pages[i].getAttribute('data-page')||'').toLowerCase();" +
  "    if(n===name){pages[i].hidden=false;pages[i].style.display='';found=true}" +
  "    else pages[i].hidden=true;" +
  "  }" +
  "  if(found)window.scrollTo({top:0,behavior:'smooth'});" +
  "  return found;" +
  "}" +
  "document.addEventListener('click',function(e){" +
  "  var a=e.target.closest&&e.target.closest('a');" +
  "  if(!a)return;" +
  "  var href=(a.getAttribute('href')||'').trim();" +
  "  if(href.charAt(0)==='#'&&href.length>1){" +
  "    e.preventDefault();" +
  "    var id=href.slice(1).toLowerCase();" +
  "    if(showPage(id))return;" +
  "    var el=document.getElementById(id);" +
  "    if(el){el.scrollIntoView({behavior:'smooth',block:'start'})}" +
  "  } else if(href&&href!=='#'&&href.indexOf('javascript:')!==0){" +
  "    e.preventDefault();" +
  "    try{window.open(href,'_blank','noopener,noreferrer')}catch(_){}" +
  "  }" +
  "},true);" +
  "})();" +
  SCRIPT_CLOSE;

// Bakes the small link/router script into the saved HTML so downloaded files still work.
function injectLinkInterceptor(html: string): string {
  if (!html || /__Creova_link_interceptor__/.test(html)) return html;
  // Ensure the document is properly closed FIRST. Truncated AI output (missing
  // </body>/</html>) would otherwise let the injected <script> leak into the
  // page as visible text inside a dangling tag.
  let out = html;
  if (!/<\/html>/i.test(out)) {
    if (!/<\/body>/i.test(out)) out += "\n</body>";
    out += "\n</html>";
  }
  if (/<\/body>/i.test(out))
    return out.replace(/<\/body>/i, LINK_INTERCEPTOR + "\n</body>");
  return out.replace(/<\/html>/i, LINK_INTERCEPTOR + "\n</html>");
}

const OVERLAP_FIX_CSS = `
/* ── Creova auto-fix: prevent overlapping + force responsiveness ── */
*, *::before, *::after { box-sizing:border-box; }
html, body { max-width:100% !important; overflow-x:hidden !important; margin:0 !important; padding-left:0 !important; padding-right:0 !important; }
body { position:relative; }
h1, h2, h3, h4, p, a, span, button, label { overflow-wrap:break-word !important; word-break:break-word; max-width:100%; }
img, svg, video, iframe { max-width:100% !important; height:auto; display:block; }

/* ── Defensive default-styles override — kicks in when the AI (especially
   Groq's llama-3.3-70b) skips styling links and buttons. Keeps every site
   looking polished even when the AI's CSS is thin. ── */

/* Links: no default blue/underline anywhere. The AI almost never overrides
   this for footer/secondary links, so it leaks browser defaults. */
a { color:inherit !important; text-decoration:none !important; }
a:hover { text-decoration:none; }

/* Footer column links: ensure they're light-on-dark, no underline, soft hover. */
footer a, [class*="footer"] a { color:rgba(255,255,255,.78) !important; transition:color .15s; }
footer a:hover, [class*="footer"] a:hover { color:#fff !important; }

/* Footer headings (column titles like "Browse" "Account" "Follow"): uppercase
   eyebrow style so they don't look like raw h4s. */
footer h3, footer h4, footer h5, [class*="footer"] h3, [class*="footer"] h4 {
  font-size:.78rem !important; letter-spacing:.08em !important; text-transform:uppercase !important;
  color:rgba(255,255,255,.55) !important; font-weight:600 !important; margin-bottom:1rem !important;
}
/* Footer list items: no bullet, tight spacing. */
footer ul, [class*="footer"] ul { list-style:none !important; padding-left:0 !important; margin:0 !important; }
footer ul li, [class*="footer"] ul li { padding:.3rem 0 !important; }

/* Buttons: never the chrome-default look. Round + cursor + smooth transition.
   Specific .add-to-cart styling lives below this. */
button:not(.cart-icon):not(.__ms-hamburger):not(.__ms-x):not(.__ms-cart-checkout) {
  cursor:pointer; border-radius:.5rem; font-family:inherit; transition:transform .15s, box-shadow .15s, background .15s;
}

/* .add-to-cart — primary CTA on product cards. AI usually forgets the
   gradient + padding even when we ask for it. Force a baseline. */
.add-to-cart, [data-add-to-cart] {
  display:inline-flex !important; align-items:center !important; gap:.4rem !important;
  padding:.6rem 1.1rem !important;
  border-radius:.55rem !important;
  background:linear-gradient(135deg, var(--primary, #1d4ed8), color-mix(in srgb, var(--primary, #1d4ed8) 72%, #000)) !important;
  color:#fff !important; font-weight:600 !important; font-size:.88rem !important;
  border:0 !important; cursor:pointer !important;
  box-shadow:0 6px 18px -6px rgba(0,0,0,.25) !important;
  transition:transform .15s, box-shadow .15s, filter .15s !important;
}
.add-to-cart:hover, [data-add-to-cart]:hover {
  transform:translateY(-1px) !important; filter:brightness(1.08) !important;
  box-shadow:0 10px 26px -6px rgba(0,0,0,.35) !important;
}

/* Product price tag — bold, accent color (not raw body text). */
.price, .product-card .price, [class*="price-row"] .price {
  font-size:1.1rem !important; font-weight:700 !important;
  color:var(--primary, #1d4ed8) !important;
}

/* ── Form fields — the AI very often leaves inputs/textareas browser-default
   (no border radius, labels inline). Give every form a clean baseline so
   contact / sign-in / sign-up forms always look intentional. ── */
form input:not([type="checkbox"]):not([type="radio"]):not([type="submit"]):not([type="button"]),
form textarea, form select {
  display:block !important; width:100% !important; box-sizing:border-box !important;
  padding:.7rem .9rem !important; margin-top:.35rem !important;
  border:1px solid rgba(15,23,42,.16) !important; border-radius:.6rem !important;
  background:#fff !important; color:#0f172a !important;
  font-size:.95rem !important; font-family:inherit !important; line-height:1.4 !important;
  transition:border-color .15s, box-shadow .15s !important;
}
form input::placeholder, form textarea::placeholder { color:#94a3b8 !important; }
form input:focus, form textarea:focus, form select:focus {
  outline:none !important; border-color:var(--primary,#6366f1) !important;
  box-shadow:0 0 0 3px rgba(99,102,241,.18) !important;
}
form textarea { min-height:120px !important; resize:vertical !important; }
form label {
  display:block !important; margin-top:.9rem !important; margin-bottom:.1rem !important;
  font-size:.85rem !important; font-weight:600 !important; color:#334155 !important;
}
/* Submit buttons inside forms get the primary look if the AI under-styled them. */
form button[type="submit"], form .btn-primary {
  display:inline-flex !important; align-items:center !important; justify-content:center !important;
  gap:.4rem !important; margin-top:1.1rem !important;
  padding:.75rem 1.4rem !important; border:0 !important; border-radius:.6rem !important;
  background:linear-gradient(135deg, var(--primary,#1d4ed8), color-mix(in srgb, var(--primary,#1d4ed8) 72%, #000)) !important;
  color:#fff !important; font-weight:600 !important; font-size:.95rem !important; cursor:pointer !important;
}

/* Generic primary/ghost buttons + nav links the AI may have under-styled. */
.btn-primary, [class*="btn-primary"] {
  background:linear-gradient(135deg, var(--primary, #1d4ed8), color-mix(in srgb, var(--primary, #1d4ed8) 72%, #000)) !important;
  color:#fff !important; padding:.7rem 1.4rem !important;
  border-radius:.6rem !important; border:0 !important; font-weight:600 !important;
}

/* Lists rendered by the AI in the body should not be bullet-defaulted blue. */
main ul:not([role]):not([class]), main ol:not([role]):not([class]) {
  list-style:none !important; padding-left:0 !important;
}
.blob, [class*="blob"], [class*="gradient-orb"], [class*="bg-blur"] {
  position:fixed !important; z-index:0 !important; opacity:.15 !important;
  pointer-events:none !important; max-width:500px !important; max-height:500px !important;
}
section, main, .hero, [id="home"], [id="features"], [id="pricing"],
[id="testimonials"], [id="faq"], [id="contact"], [id="about"],
[id="cta"], [id="how-it-works"], article, .container {
  position:relative; z-index:1; max-width:100%;
}
header, nav.nav, .navbar, [class*="header"], [class*="navbar"] {
  position:sticky !important; top:0 !important; z-index:50 !important;
  background:rgba(255,255,255,.92) !important; backdrop-filter:blur(12px) !important;
  -webkit-backdrop-filter:blur(12px) !important;
}
.hero-card, [class*="hero-card"], [class*="hero-image"], [class*="hero-visual"] {
  max-width:100% !important; overflow:hidden;
}
[class*="grid"] { max-width:100%; }

/* ── Bulletproof card grids: never collapse so narrow that text wraps one
   letter per line. auto-fit + minmax keeps each card >=240px and wraps to
   fewer columns instead of squishing. Overrides brittle repeat(3,1fr). ── */
.product-grid, [class*="product-grid"], .grid-2, .grid-3, .grid-4,
[class*="grid-2"], [class*="grid-3"], [class*="grid-4"] {
  display:grid !important;
  grid-template-columns:repeat(auto-fit, minmax(min(100%, 240px), 1fr)) !important;
  gap:1.5rem !important; align-items:stretch !important;
}
/* If a grid lands on a SECTION's container by mistake, force heading, intro AND
   the card grid to span the full row so cards lay out properly. Scoped to
   sections only — footers use .container too and must keep their columns. */
section > h1, section > h2, section > h3, section > p, section > .product-grid,
section .container > h1, section .container > h2, section .container > h3,
section .container > p, section .container > .product-grid {
  grid-column:1 / -1 !important;
}
/* Price + Add to Cart never break to one-letter-per-line. */
.price, .add-to-cart, [data-add-to-cart] { white-space:nowrap !important; }

/* Keep section padding sane — huge AI padding (6-8rem) leaves big empty gaps
   between components. Hero keeps its own padding. */
section:not(.hero):not([class*="hero"]):not([id="home"]):not([id="hero"]) {
  padding-top:clamp(2.5rem, 5vw, 4rem) !important;
  padding-bottom:clamp(2.5rem, 5vw, 4rem) !important;
}

/* Non-home page headers reuse .hero (a 2-column flex) → their heading/text
   children squish into a narrow column. Let them wrap + span full row. */
.hero > .container, .hero-content, .hero .container { flex-wrap:wrap; }
.hero > .container > h1, .hero > .container > h2, .hero > .container > h3,
.hero > .container > p, .hero > .container > span, .hero > .container > .eyebrow,
.hero > .container > .btn, .hero > .container > .ctas, .hero > .container > a {
  flex-basis:100% !important; max-width:100% !important;
}
/* CTA-band button stays readable (white pill + brand-colour text). */
.cta-band .btn, .cta-band a.btn, .cta-band button,
.cta-section .btn, .cta-section a.btn {
  background:#fff !important; color:var(--primary, #1d4ed8) !important; border-color:#fff !important;
}

/* Auth cards: tighter margin, sensible heading size (the AI's big clamp wraps
   "Create Your account" one word per line), and no tall forced min-height. */
.auth-card, [class*="auth-card"] { margin:1.5rem auto !important; }
.auth-card h1, .auth-card h2, [class*="auth-card"] h1, [class*="auth-card"] h2 {
  font-size:clamp(1.4rem, 3.5vw, 2rem) !important; line-height:1.2 !important;
}
[id="signin"], [id="signup"], [id="login"],
[data-page="signin"], [data-page="signup"] { min-height:auto !important; }
footer, [class*="footer"] { position:relative !important; z-index:1; max-width:100%; }

/* ── TABLET (≤768px): grids→1col, hero stacks, slightly smaller type ── */
@media(max-width:768px) {
  .container, [class*="container"] { padding-left:1rem !important; padding-right:1rem !important; }
  .hero, [class*="hero-grid"], [id="home"] > div, [id="home"] > .container > div {
    display:flex !important; flex-direction:column !important; gap:1.5rem !important;
  }
  .hero-card, [class*="hero-card"], [class*="hero-image"], [class*="hero-visual"] {
    max-width:100% !important; margin:0 auto !important; width:100% !important;
  }
  [class*="grid-3"], [class*="grid-4"], .grid-3, .grid-4, .grid-2, [class*="grid-2"] {
    grid-template-columns:1fr 1fr !important; gap:1rem !important;
  }
  h1 { font-size:clamp(1.6rem,5vw,2.4rem) !important; line-height:1.15 !important; }
  h2 { font-size:clamp(1.3rem,4vw,1.9rem) !important; line-height:1.2 !important; }
  h3 { font-size:1rem !important; }
  p, .lead { font-size:.95rem !important; }
  section { padding-top:2.5rem !important; padding-bottom:2.5rem !important; }
  .auth-card, [class*="auth-card"] { max-width:100% !important; margin:2rem 1rem !important; padding:1.5rem !important; }
}

/* ── PHONE (≤480px): everything stacks single column, type shrinks more ── */
@media(max-width:480px) {
  .container, [class*="container"] { padding-left:.85rem !important; padding-right:.85rem !important; }
  /* Header: stack logo + nav vertically, smaller logo, hamburger pattern */
  header > div, header > nav, .nav > .inner, [class*="header"] > div {
    flex-wrap:wrap !important; gap:.5rem !important; padding-top:.5rem !important; padding-bottom:.5rem !important;
    height:auto !important; min-height:56px !important;
  }
  header nav, header .links, [class*="header"] nav, [class*="nav-links"] {
    display:flex !important; flex-wrap:wrap !important; gap:.25rem !important; width:100%; justify-content:center;
  }
  header nav a, header .links a, [class*="nav-links"] a {
    padding:.35rem .65rem !important; font-size:.82rem !important;
  }
  header .auth, [class*="auth-buttons"], [class*="header-auth"] {
    margin-left:0 !important; gap:.3rem !important;
  }
  header .auth a, [class*="auth-buttons"] a {
    padding:.4rem .75rem !important; font-size:.8rem !important;
  }
  .logo { font-size:.95rem !important; }
  .cart-icon { padding:6px !important; font-size:18px !important; }
  /* Hero: stack and shrink */
  .hero, [class*="hero-grid"] { gap:1rem !important; padding-top:1.5rem !important; }
  h1 { font-size:clamp(1.4rem,7vw,1.9rem) !important; }
  h2 { font-size:clamp(1.15rem,5vw,1.5rem) !important; }
  /* All grids collapse to single column */
  [class*="grid-3"], [class*="grid-4"], .grid-3, .grid-4, .grid-2, [class*="grid-2"],
  .product-grid, [class*="product-grid"] {
    grid-template-columns:1fr !important; gap:1rem !important;
  }
  /* Buttons: full-width-ish, touch-friendly */
  .btn-primary, .btn-ghost, button[type="submit"], .ctas a, .ctas button {
    width:auto !important; min-height:44px !important; padding:.75rem 1.25rem !important; font-size:.9rem !important;
  }
  .ctas { flex-direction:column !important; gap:.6rem !important; width:100%; }
  .ctas > * { width:100% !important; text-align:center; }
  /* Product/feature cards tighter */
  .product-card, .card, article {
    padding:1rem !important;
  }
  .product-card img, .card img { aspect-ratio:1/1 !important; }
  /* Footer: stack columns */
  footer, [class*="footer"] {
    text-align:center; padding-top:2rem !important; padding-bottom:1.5rem !important;
  }
  footer .foot-grid, footer [class*="foot-grid"], footer .columns {
    grid-template-columns:1fr !important; gap:1.5rem !important;
  }
  footer .brand-block, footer [class*="brand-block"] {
    margin:0 auto; max-width:280px;
  }
  /* Section padding shrinks more on phones */
  section { padding-top:2rem !important; padding-bottom:2rem !important; }
  /* Tables (if any) become scrollable */
  table { display:block; overflow-x:auto; white-space:nowrap; }
}

/* ── Hard safety net: any element that's wider than viewport gets wrapped ── */
@media(max-width:768px) {
  body > * { max-width:100vw !important; }
  pre, code { white-space:pre-wrap !important; word-break:break-word !important; }
}
`;

// Injects the auto-fix stylesheet before </head> to keep the AI's HTML tidy and responsive.
function fixOverlappingCSS(html: string): string {
  if (!html) return html;
  // Marked + deduped so it can be stripped before re-feeding to the model and
  // never injected twice. Placed just before </head> so it comes after the
  // AI's own <style> (its !important rules win regardless).
  if (/__Creova_fix__/.test(html)) return html;
  const block = `<style id="__Creova_fix__">${OVERLAP_FIX_CSS}</style>`;
  if (/<\/head>/i.test(html)) {
    return html.replace(/<\/head>/i, block + "\n</head>");
  }
  if (/<head[^>]*>/i.test(html)) {
    return html.replace(/<head([^>]*)>/i, `<head$1>${block}`);
  }
  return block + html;
}

// Remove AI-written page-router scripts. The platform handles multi-page
// routing; the AI's own version frequently matches pages on element .id while
// the pages use data-page — so its showPage() hides EVERY page, leaving the
// site blank. We keep all other AI scripts (real interactivity).
function stripAiPageRouterScripts(html: string): string {
  if (!html) return html;
  return html.replace(
    /<script\b[^>]*>([\s\S]*?)<\/script>/gi,
    (full: string, body: string) => {
    if (/__Creova/.test(full)) return full; // never touch our own
    if (/(data-page|page-route)/.test(body) && /hidden/.test(body)) return "";
    return full;
    },
  );
}

// Runs the AI HTML through all the clean-up steps and returns the fixed HTML.
export function postProcess(html: string): string {
  return fixOverlappingCSS(
    injectLinkInterceptor(
      ensureSmoothScroll(sanitizeLinks(stripAiPageRouterScripts(html))),
    ),
  );
}

// ══ IMAGE RESOLUTION (Unsplash) ══

// Unsplash image resolver. The AI emits <img> tags with loremflickr URLs whose
// path IS the keyword (e.g. .../book,novel,reading?lock=101). After generation
// we look each keyword up on Unsplash and swap in a real, RELEVANT, curated
// photo. If no key is set (or a call fails) the loremflickr URL is left as-is,
// so the app still works without Unsplash.
//
// Get a free key at https://unsplash.com/developers → put it in backend/.env
// as UNSPLASH_ACCESS_KEY=...

const SEARCH_URL = "https://api.unsplash.com/search/photos";

// Cache search results for the lifetime of the process so repeated keywords
// (and re-generations) don't burn the hourly rate limit.
const cache = new Map();
// Unsplash's free demo tier is 50 requests/hour. Once it rate-limits us, stop
// calling it for a while and just use the loremflickr fallback — no point
// hammering it with requests that will 403, and it keeps generation fast.
let unsplashPausedUntil = 0;

// Returns true if an Unsplash API key is set.
export function isUnsplashConfigured() {
  return Boolean(process.env.UNSPLASH_ACCESS_KEY);
}

// Looks up a keyword on Unsplash and returns matching photo URLs (cached, with fallbacks).
interface UnsplashSearchResponse {
  results?: { urls?: { raw?: string } }[];
}

async function search(keyword: string): Promise<string[]> {
  if (cache.has(keyword)) return cache.get(keyword);
  if (Date.now() < unsplashPausedUntil) return []; // rate-limited recently — skip
  const key = process.env.UNSPLASH_ACCESS_KEY;
  // Images are a nice-to-have — never let a slow/hung Unsplash call stall the
  // generation. On timeout or any error we return [] and the loremflickr URL
  // the AI emitted stays as the fallback.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const url = `${SEARCH_URL}?query=${encodeURIComponent(keyword)}&per_page=10&content_filter=high&client_id=${key}`;
    const r = await fetch(url, { signal: controller.signal });
    if (!r.ok) {
      if (r.status === 403 || r.status === 429) {
        unsplashPausedUntil = Date.now() + 10 * 60 * 1000; // back off 10 min
        console.warn(
          `[unsplash] rate-limited (HTTP ${r.status}), using loremflickr for the next 10 min`,
        );
      } else {
        console.warn(`[unsplash] "${keyword}" → HTTP ${r.status}`);
      }
      cache.set(keyword, []);
      return [];
    }
    const data = (await r.json()) as UnsplashSearchResponse;
    const results = (data.results || [])
      .map((p) => p?.urls?.raw)
      .filter((url): url is string => typeof url === "string");
    cache.set(keyword, results);
    return results;
  } catch (err: unknown) {
    console.warn(`[unsplash] "${keyword}" failed:`, getErrorMessage(err));
    cache.set(keyword, []);
    return [];
  } finally {
    clearTimeout(timer);
  }
}

// Turns a loremflickr URL path (comma/plus separated) into a plain search keyword.
function toKeyword(pathPart: string): string {
  return decodeURIComponent(pathPart).replace(/[,+_-]+/g, " ").trim();
}

// Sized, cropped, quality-tuned Unsplash URL for a card/hero image.
function sized(raw: string): string {
  const sep = raw.includes("?") ? "&" : "?";
  return `${raw}${sep}w=800&h=600&fit=crop&q=80`;
}

// Replace every loremflickr <img> src with a relevant Unsplash photo. Each
// distinct keyword cycles through its result set so sibling cards get DIFFERENT
// photos instead of the same one repeated.
export async function resolveImages(html: string): Promise<string> {
  if (!html || !isUnsplashConfigured()) return html;

  const urlRe = /https:\/\/loremflickr\.com\/\d+\/\d+\/([^"'\s?]+)(?:\?[^"'\s]*)?/gi;
  const uniqueUrls = [...new Set([...html.matchAll(urlRe)].map((m) => m[0]))];
  if (!uniqueUrls.length) return html;

  const usedPerKeyword: Record<string, number> = {};
  const replacements: [string, string][] = [];
  for (const oldUrl of uniqueUrls) {
    const keywordMatch = oldUrl.match(/loremflickr\.com\/\d+\/\d+\/([^?]+)/);
    if (!keywordMatch?.[1]) continue;
    const keyword = toKeyword(keywordMatch[1]);
    const results = await search(keyword);
    if (!results.length) continue;
    const i = (usedPerKeyword[keyword] = (usedPerKeyword[keyword] ?? -1) + 1);
    const raw = results[i % results.length];
    replacements.push([oldUrl, sized(raw)]);
  }

  let out: string = html;
  for (const [oldUrl, newUrl] of replacements) {
    out = out.split(oldUrl).join(newUrl); // fixes both src + data-image
  }
  return out;
}
