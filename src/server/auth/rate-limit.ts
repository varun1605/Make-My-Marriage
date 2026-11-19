import "server-only";
import { isIP } from "node:net";
import { Schema, model, models, type Model } from "mongoose";
import { connectDatabase } from "@/server/db/connection";
import { AppError } from "@/server/http/errors";
import { hashSecret } from "./session";

type Counter = { _id: string; count: number; expiresAt: Date };
const schema = new Schema<Counter>({
  _id: { type: String, required: true },
  count: { type: Number, required: true },
  expiresAt: { type: Date, required: true },
}, { collection: "auth_rate_limits", bufferCommands: false, autoIndex: false });
schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
const CounterModel: Model<Counter> = (models.AuthRateLimit as Model<Counter> | undefined) ?? model<Counter>("AuthRateLimit", schema);
let initialized: Promise<unknown> | undefined;

export const AUTH_LIMITS = {
  signup: { limit: 5, seconds: 3600 },
  login: { limit: 30, seconds: 900 },
  loginEmail: { limit: 10, seconds: 900 },
} as const;

export function requestSource(headers: Headers) {
  // Only trust the header replaced by our deployment platform. On local/self-hosted
  // servers, use a shared bucket instead of trusting spoofable forwarding headers.
  if (process.env.VERCEL === "1") {
    const value = headers.get("x-forwarded-for")?.trim() ?? "";
    if (isIP(value)) return value;
  }
  return "shared-source";
}

export async function consumeRateLimit(key: string, limit: number, seconds: number) {
  await connectDatabase();
  initialized ??= CounterModel.createIndexes().catch(error => { initialized = undefined; throw error; });
  await initialized;
  const window = Math.floor(Date.now() / (seconds * 1000));
  const expiresAt = new Date((window + 1) * seconds * 1000);
  const id = hashSecret(`${key}:${window}`, "rate");
  const update = { $inc: { count: 1 }, $setOnInsert: { expiresAt } };
  let result;
  try {
    result = await CounterModel.findOneAndUpdate({ _id: id }, update, { upsert: true, returnDocument: "after" }).lean();
  } catch (error) {
    // Concurrent initial upserts can race on the unique _id. Increment the winner.
    if (typeof error !== "object" || error === null || !("code" in error) || error.code !== 11000) throw error;
    result = await CounterModel.findOneAndUpdate({ _id: id }, { $inc: { count: 1 } }, { returnDocument: "after" }).lean();
  }
  if (!result) throw new AppError("INTERNAL_ERROR", "Please try again later.");
  if (result.count > limit) {
    throw new AppError("RATE_LIMITED", "Too many attempts. Please try again later.", undefined,
      Math.max(1, Math.ceil((expiresAt.getTime() - Date.now()) / 1000)));
  }
}

export async function limitAuthSource(action: "signup" | "login", headers: Headers) {
  // Global cap also bounds distributed password-hashing work and counter creation.
  await consumeRateLimit(`global:${action}`, 100, 60);
  const { limit, seconds } = AUTH_LIMITS[action];
  await consumeRateLimit(`${action}:source:${requestSource(headers)}`, limit, seconds);
}
export async function limitLoginEmail(email: string) {
  const { limit, seconds } = AUTH_LIMITS.loginEmail;
  await consumeRateLimit(`login:email:${email.toLowerCase()}`, limit, seconds);
}
