import bcrypt from "bcryptjs";
import mongoose, { type HydratedDocument, type Model } from "mongoose";

const STARTING_CREDITS = 20;

export interface UserRecord {
  name: string;
  email: string;
  passwordHash: string;
  credits: number;
  emailVerified: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserClient {
  id: string;
  name: string;
  email: string;
  credits: number;
  emailVerified: boolean;
  createdAt?: Date;
}

interface UserMethods {
  toClient(): UserClient;
  verifyPassword(plain: string): Promise<boolean>;
}

interface UserModelType extends Model<UserRecord, {}, UserMethods> {
  hashPassword(plain: string): Promise<string>;
}

export type UserDocument = HydratedDocument<UserRecord, UserMethods>;

const userSchema = new mongoose.Schema<UserRecord, UserModelType, UserMethods>(
  {
    name: { type: String, required: true, trim: true, maxlength: 32 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, required: true },
    credits: { type: Number, default: STARTING_CREDITS, min: 0 },
    emailVerified: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// Returns a safe user object (no password hash) to send to the frontend.
userSchema.methods.toClient = function (this: UserDocument): UserClient {
  return {
    id: this._id.toString(),
    name: this.name,
    email: this.email,
    credits: this.credits,
    emailVerified: Boolean(this.emailVerified),
    createdAt: this.createdAt,
  };
};

// Turns a plain-text password into a secure bcrypt hash for storage.
userSchema.statics.hashPassword = function (plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
};

// Checks whether a plain-text password matches this user's stored hash.
userSchema.methods.verifyPassword = function (
  this: UserDocument,
  plain: string,
): Promise<boolean> {
  return bcrypt.compare(plain, this.passwordHash);
};

const userModel = mongoose.model<UserRecord, UserModelType>("User", userSchema);
export const User = Object.assign(userModel, { STARTING_CREDITS });
