import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User.ts";

// Creates a signed JWT for the given user id, valid for 30 days by default.
export function signToken(userId: string): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  return jwt.sign({ sub: userId }, secret, {
    expiresIn: (process.env.JWT_EXPIRES_IN || "30d") as SignOptions["expiresIn"],
  });
}

// Blocks the request unless a valid token is sent; attaches the user to req.user.
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) {
      res.status(401).json({ error: "Missing token" });
      return;
    }
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      res.status(500).json({ error: "JWT_SECRET is not configured" });
      return;
    }
    const payload = jwt.verify(token, secret);
    if (typeof payload === "string" || typeof payload.sub !== "string") {
      res.status(401).json({ error: "Invalid or expired token" });
      return;
    }
    const user = await User.findById(payload.sub);
    if (!user) {
      res.status(401).json({ error: "User not found" });
      return;
    }
    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

// Like requireAuth but never blocks — attaches req.user if a valid token is
// present, otherwise just continues as an anonymous request.
export async function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (token &&  process.env.JWT_SECRET) {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(payload.sub);
      if (user) req.user = user;
    }
  } catch {
    // Invalid token — treat as unauthenticated, keep going
  }
  next();
}
