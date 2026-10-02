import type { Request } from "express";
import type { UserDocument } from "../models/User.ts";

export type AuthenticatedRequest<
  Params = Record<string, string>,
  Body = unknown,
> = Request<Params, unknown, Body> & { user: UserDocument };

export type OptionalAuthRequest<
  Params = Record<string, string>,
  Body = unknown,
> = Request<Params, unknown, Body> & { user?: UserDocument };
