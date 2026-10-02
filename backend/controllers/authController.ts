// Auth controller — register/login/profile/contributions.
// Forgot-password subflow lives in routes/authForgot.

import type { NextFunction, Request, Response } from "express";
import type { ParamsDictionary } from "express-serve-static-core";
import { signToken } from "../middleware/auth.ts";
import { Project } from "../models/Project.ts";
import { User } from "../models/User.ts";
import type {
  ChangePasswordBody,
  EmailBody,
  EmailCodeBody,
  LoginBody,
  RegisterBody,
  UpdateProfileBody,
} from "../types/api.ts";
import type { AuthenticatedRequest } from "../types/requests.ts";
import {
  generateOtp,
  saveOtp,
  sendOtpEmail,
  verifyOtp,
} from "../utils/services.ts";

type BodyRequest<Body> = Request<ParamsDictionary, unknown, Body>;
type AuthBodyRequest<Body> = AuthenticatedRequest<ParamsDictionary, Body>;

// Issue an OTP for an email and send it. Returns the standard payload.
async function issueAndSend(
  email: string,
  name: string,
  purpose: "signup" | "login" | "reset",
  res: Response,
  code = 201,
) {
  const otp = generateOtp();
  saveOtp(email, otp);
  await sendOtpEmail({ to: email, name, code: otp, purpose });
  return res.status(code).json({ ok: true, email });
}

function authenticatedUser(req: Request, res: Response) {
  if (req.user) return req.user;
  res.status(401).json({ error: "Missing token" });
  return null;
}

// Sign up a new user, or re-send OTP if the email exists but is unverified.
export async function register(req: BodyRequest<RegisterBody>, res: Response, next: NextFunction) {
  try {
    const { name, email, password } = req.body;
    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(404).json({
        message: "All fields are required"
      })
    }
    if (name.length < 2)
      return res.status(400).json({ error: "Name must be at least 2 characters." });
    if (password.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters." });


    const existing = await User.findOne({ email });
    if (existing) {
      // Existing + verified → email already in use. Unverified → re-issue OTP.
      if (existing.emailVerified)
        return res.status(409).json({ error: "Email already in use" });
      return issueAndSend(email, existing.name, "signup", res, 200);
    }

    const user = await User.create({
      name,
      email,
      passwordHash: await User.hashPassword(password),
      emailVerified: false,
    });
    return issueAndSend(user.email, user.name, "signup", res, 201);
  } catch (err) {
    next(err);
  }
}

// Check the signup OTP and mark the user's email as verified if it matches.
export async function verifyRegister(req: BodyRequest<EmailCodeBody>, res: Response, next: NextFunction) {
  try {
    const {email, code} = req.body;
    if (typeof email !== "string" || typeof code !== "string")
      return res.status(400).json({ error: "Email and code are required." });

    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(404)
        .json({ error: "No account found with that email." });
    if (user.emailVerified)
      return res.json({ ok: true, alreadyVerified: true });

    const result = verifyOtp(email, code);
    if (!result.ok) return res.status(400).json({ error: result.reason });

    user.emailVerified = true;
    await user.save();
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

// Send a fresh signup OTP to a user who has not verified their email yet.
export async function resendRegister(req: BodyRequest<EmailBody>, res: Response, next: NextFunction) {
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
    if (user.emailVerified)
      return res
        .status(400)
        .json({ error: "This email is already verified — just sign in." });

    return issueAndSend(user.email, user.name, "signup", res, 200);
  } catch (err) {
    next(err);
  }
}

// Check email and password, then return a login token if the email is verified.
export async function login(req: BodyRequest<LoginBody>, res: Response, next: NextFunction) {
  try {
    const {email, password} = req.body;
    if (typeof email !== "string" || typeof password !== "string")
      return res
        .status(400)
        .json({ error: "Email and password are required." });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await user.verifyPassword(password);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    if (!user.emailVerified) {
      return res.status(403).json({
        error:
          "Please verify your email first. Check your inbox for the 6-digit code.",
        needsVerification: true,
        email: user.email,
      });
    }
    const token = signToken(user._id.toString());
    res.json({ token, user: user.toClient() });
  } catch (err) {
    next(err);
  }
}

// Return the currently logged-in user's profile.
export function me(req: AuthenticatedRequest, res: Response) {
  const user = authenticatedUser(req, res);
  if (!user) return;
  res.json({ user: user.toClient() });
}

// Activity heatmap: count each user message (initial prompt + iterations)
// as exactly one contribution. Mirrors GitHub's commit graph shape.
export async function contributions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const user = authenticatedUser(req, res);
    if (!user) return;
    const oneYearAgo = new Date();
    oneYearAgo.setUTCHours(0, 0, 0, 0);
    oneYearAgo.setUTCDate(oneYearAgo.getUTCDate() - 364);

    const projects = await Project.find({
      user: user._id,
      "messages.createdAt": { $gte: oneYearAgo },
    }).select("messages");

    const counts: Record<string, number> = {};
    const key = (date: Date | string): string =>
      new Date(date).toISOString().slice(0, 10);
    for (const p of projects) {
      for (const m of p.messages || []) {
        if (m.role === "user" && m.createdAt && m.createdAt >= oneYearAgo) {
          const k = key(m.createdAt);
          counts[k] = (counts[k] || 0) + 1;
        }
      }
    }

    const days: { date: string; count: number }[] = Object.entries(counts)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
    const total = days.reduce((s, d) => s + d.count, 0);
    res.json({ days, total, from: key(oneYearAgo), to: key(new Date()) });
  } catch (err) {
    next(err);
  }
}

// Update the logged-in user's display name.
export async function updateProfile(req: AuthBodyRequest<UpdateProfileBody>, res: Response, next: NextFunction) {
  try {
    const user = authenticatedUser(req, res);
    if (!user) return;
    // Email is fixed after signup — only the name can be changed here.
    const name =
      req.body.name !== undefined ? String(req.body.name).trim() : undefined;
    if (name === undefined)
      return res.status(400).json({ error: "Nothing to update" });
    if (name.length < 2 || name.length > 32)
      return res.status(400).json({ error: "Name must be 2–32 characters." });

    user.name = name;
    await user.save();
    res.json({ user: user.toClient() });
  } catch (err) {
    next(err);
  }
}

// Verify the current password, then set a new one for the logged-in user.
export async function changePassword(req: AuthBodyRequest<ChangePasswordBody>, res: Response, next: NextFunction) {
  try {
    const user = authenticatedUser(req, res);
    if (!user) return;
    const {current, nextPw} = req.body;
    if (
      typeof current !== "string" ||
      typeof nextPw !== "string" ||
      nextPw.length < 6
    )
      return res
        .status(400)
        .json({ error: "New password must be at least 6 characters." });

    const ok = await user.verifyPassword(current);
    if (!ok)
      return res.status(400).json({ error: "Current password is incorrect" });
    user.passwordHash = await User.hashPassword(nextPw);
    await user.save();
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

// Delete the logged-in user's account along with all of their projects.
export async function deleteAccount(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const user = authenticatedUser(req, res);
    if (!user) return;
    await Project.deleteMany({ user: user._id });
    await user.deleteOne();
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}
