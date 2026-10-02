import type { NextFunction, Request, Response } from "express";
import { Router } from "express";
import type { ParamsDictionary } from "express-serve-static-core";
import { User } from "../models/User.ts";
import type { EmailBody, EmailCodeBody } from "../types/api.ts";
import {
  generateOtp,
  peekOtp,
  saveOtp,
  sendOtpEmail,
  verifyOtp,
} from "../utils/services.ts";

const router = Router();
type BodyRequest<Body> = Request<ParamsDictionary, unknown, Body>;

// Step 1 — look up the account and email them a one-time code to start reset.
router.post("/request", async (req: BodyRequest<EmailBody>, res: Response, next: NextFunction) => {
  try {
    const email =
      typeof req.body.email === "string"
        ? req.body.email.trim().toLowerCase()
        : "";
    if (!email) return res.status(400).json({ error: "Email is required." });

    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(404)
        .json({ error: "No account found with that email." });

    const code = generateOtp();
    saveOtp(email, code);
    await sendOtpEmail({ to: user.email, name: user.name, code });

    res.json({ ok: true, email: user.email });
  } catch (err) {
    next(err);
  }
});

// Step 2 — check the code is correct (without burning it) so the UI can move
// to the "set a new password" step.
router.post("/verify-code", async (req: BodyRequest<EmailCodeBody>, res: Response, next: NextFunction) => {
  try {
    const {email, code} = req.body;
    if (typeof email !== "string" || typeof code !== "string")
      return res.status(400).json({ error: "Email and code are required." });

    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(404)
        .json({ error: "No account found with that email." });

    const result = peekOtp(email, code);
    if (!result.ok) return res.status(400).json({ error: result.reason });

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// Step 3 — set the new password (burns the code). No auto-login: the user
// signs in again with the new password.
router.post("/reset", async (req: BodyRequest<EmailCodeBody & { newPassword?: string }>, res: Response, next: NextFunction) => {
  try {
    const {email, code, newPassword} = req.body;
    if (typeof email !== "string" || typeof code !== "string")
      return res.status(400).json({ error: "Email and code are required." });

    if (typeof newPassword !== "string" || newPassword.length < 6)
      return res
        .status(400)
        .json({ error: "New password must be at least 6 characters." });

    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(404)
        .json({ error: "No account found with that email." });

    const result = verifyOtp(email, code);
    if (!result.ok) return res.status(400).json({ error: result.reason });

    user.passwordHash = await User.hashPassword(newPassword);
    if (!user.emailVerified) user.emailVerified = true;
    await user.save();

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
