import "server-only";
import { createHmac, randomBytes } from "node:crypto";
import { getServerConfig } from "@/server/config/env";

export const SESSION_COOKIE = "mmm_session";
export const SESSION_SECONDS = 7 * 24 * 60 * 60;
export const isSessionToken = (value: string | undefined): value is string => /^[a-f0-9]{64}$/.test(value ?? "");
export function hashSecret(value: string, purpose: "session" | "rate") {
  return createHmac("sha256", Buffer.from(getServerConfig().SESSION_SECRET, "hex"))
    .update(`${purpose}:${value}`).digest("hex");
}
export function createSessionCredential() {
  const token = randomBytes(32).toString("hex");
  return { token, tokenHash: hashSecret(token, "session"), expiresAt: new Date(Date.now() + SESSION_SECONDS * 1000) };
}
export const sessionCookieOptions = () => ({
  httpOnly: true, secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const, path: "/", maxAge: SESSION_SECONDS,
});
