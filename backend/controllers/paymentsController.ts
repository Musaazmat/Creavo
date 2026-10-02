import type { NextFunction, Request, Response } from "express";
import { Payment } from "../models/Payment.ts";
import type {
  CreateCheckoutBody,
  VerifyCheckoutBody,
} from "../types/api.ts";
import type { AuthenticatedRequest } from "../types/requests.ts";
import {
  createCheckoutSession,
  isStripeConfigured,
  retrieveSession,
} from "../utils/services.ts";

interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  amount: number;
  currency: string;
  perCredit: string;
  tagline: string;
  highlighted?: boolean;
}

// Credit packages — `amount` is in the smallest currency unit (cents for USD).
export const PACKAGES: CreditPackage[] = [
  {
    id: "starter",
    name: "Starter",
    credits: 50,
    amount: 499,
    currency: "usd",
    perCredit: "$0.10",
    tagline: "Try a few new projects",
  },
  {
    id: "popular",
    name: "Popular",
    credits: 200,
    amount: 1499,
    currency: "usd",
    perCredit: "$0.075",
    tagline: "Best for active creators",
    highlighted: true,
  },
  {
    id: "pro",
    name: "Pro",
    credits: 500,
    amount: 2999,
    currency: "usd",
    perCredit: "$0.06",
    tagline: "For agencies and power users",
  },
];

// Returns the list of credit packages and whether Stripe is set up.
export function listPackages(_req: Request, res: Response) {
  res.json({
    packages: PACKAGES,
    configured: isStripeConfigured(),
  });
}

// Starts a Stripe checkout for the chosen package and saves a pending payment.
export async function createSession(
  req: AuthenticatedRequest<Record<string, string>, CreateCheckoutBody>,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!isStripeConfigured()) {
      res.status(503).json({
        error: "Payments aren't configured. Add STRIPE_SECRET_KEY to backend/.env.",
      });
      return;
    }
    const packageId = req.body.packageId;
    if (!packageId)
      return res.status(400).json({ error: "packageId is required" });
    const pkg = PACKAGES.find((p) => p.id === packageId);
    if (!pkg) return res.status(400).json({ error: "Unknown package" });
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: "Missing token" });
      return;
    }

    // Redirect back to whatever localhost port the frontend is on.
    const origin = req.headers.origin || "http://localhost:5173";
    const { id, url } = await createCheckoutSession({
      pkg,
      user,
      successUrl: `${origin}/pricing?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${origin}/pricing?cancelled=1`,
    });

    await Payment.create({
      user: user._id,
      packageId: pkg.id,
      creditsPurchased: pkg.credits,
      amount: pkg.amount,
      currency: pkg.currency,
      stripeSessionId: id,
      status: "created",
    });

    res.json({ url, sessionId: id });
  } catch (err) {
    next(err);
  }
}

// Idempotent: client calls this on the success-return URL. We verify the
// session with Stripe and credit the user (only once).
export async function verifySession(
  req: AuthenticatedRequest<Record<string, string>, VerifyCheckoutBody>,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!isStripeConfigured()) {
      res.status(503).json({ error: "Payments aren't configured." });
      return;
    }
    const sessionId = req.body.sessionId;
    if (!sessionId || sessionId.length < 5)
      return res.status(400).json({ error: "sessionId is required" });
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: "Missing token" });
      return;
    }
    const payment = await Payment.findOne({
      stripeSessionId: sessionId,
      user: user._id,
    });
    if (!payment) return res.status(404).json({ error: "Session not found" });
    if (payment.status === "paid") {
      return res.json({
        ok: true,
        alreadyCredited: true,
        user: user.toClient(),
      });
    }
    const session = await retrieveSession(sessionId);
    if (session.payment_status !== "paid") {
      return res.status(400).json({ error: "Payment not completed yet" });
    }
    payment.stripePaymentIntentId = session.payment_intent;
    payment.status = "paid";
    await payment.save();
    const creditsToAdd = Number(payment.creditsPurchased);
    if (!Number.isFinite(creditsToAdd) || creditsToAdd <= 0) {
      return res.status(500).json({ error: "Invalid creditsPurchased value on payment record." });
    }
    user.credits += creditsToAdd;
    await user.save();
    res.json({
      ok: true,
      creditsAdded: payment.creditsPurchased,
      user: user.toClient(),
    });
  } catch (err) {
    next(err);
  }
}

// Returns the user's 50 most recent successful (paid) payments.
export async function listHistory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: "Missing token" });
      return;
    }
    const list = await Payment.find({ user: user._id, status: "paid" })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ payments: list.map((p) => p.toClient()) });
  } catch (err) {
    next(err);
  }
}
