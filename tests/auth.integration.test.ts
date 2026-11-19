import { randomBytes } from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "node:path";
import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST as signup } from "@/app/api/auth/signup/route";
import { POST as login } from "@/app/api/auth/login/route";
import { POST as logout } from "@/app/api/auth/logout/route";
import { GET as me } from "@/app/api/auth/me/route";
import { prepareAuthStore } from "@/modules/auth/repository";
import { Session, User } from "@/modules/auth/models";
import { consumeRateLimit, requestSource } from "@/server/auth/rate-limit";
import { hashSecret, SESSION_COOKIE } from "@/server/auth/session";

let database: MongoMemoryReplSet;
const password = "A long test passphrase 2026";
const input = { name: "  Priya Shah  ", email: " Priya@Example.com ", password };

function request(path: string, body?: unknown, cookie?: string, extra: Record<string, string> = {}) {
  const origin = process.env.APP_ORIGIN!;
  return new NextRequest(`${origin}/api/auth/${path}`, {
    method: path === "me" ? "GET" : "POST",
    headers: { host: new URL(origin).host, origin, "content-type": "application/json", ...(cookie ? { cookie } : {}), ...extra },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}
const cookieFrom = (response: Response) => response.headers.get("set-cookie")!.split(";")[0];
async function register() {
  const response = await signup(request("signup", input));
  expect(response.status).toBe(201);
  return { response, cookie: cookieFrom(response), body: await response.json() };
}

beforeAll(async () => {
  // Never load .env.local or reuse a developer's database; own the entire lifecycle.
  database = await MongoMemoryReplSet.create({
    binary: { downloadDir: join(tmpdir(), "mmm-mongodb-test-binaries") },
    replSet: { count: 1, storageEngine: "wiredTiger", ip: "127.0.0.1" },
  });
  process.env.MONGODB_URI = database.getUri();
  process.env.MONGODB_DB_NAME = "mmm_auth_integration";
  process.env.SESSION_SECRET = randomBytes(32).toString("hex");
  process.env.APP_ORIGIN = "http://localhost:3000";
  await prepareAuthStore();
});
beforeEach(async () => {
  vi.restoreAllMocks(); vi.unstubAllEnvs();
  process.env.APP_ORIGIN = "http://localhost:3000";
  for (const name of ["users", "sessions", "auth_rate_limits", "wedding_memberships", "weddings"]) {
    await mongoose.connection.collection(name).deleteMany({});
  }
});
afterAll(async () => { await mongoose.disconnect(); await database?.stop(); });

describe("authentication contracts with MongoDB", () => {
  it("creates an account and opaque session; stores hashes and returns only public fields", async () => {
    const { response, cookie, body } = await register();
    expect(body).toEqual({ data: { user: { id: expect.any(String), name: "Priya Shah", email: "Priya@Example.com" }, hasWedding: false } });
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("set-cookie")).toContain("HttpOnly");
    expect(response.headers.get("set-cookie")).toContain("SameSite=lax");
    expect(response.headers.get("set-cookie")).toContain("Max-Age=604800");
    const user = await User.findOne().select("+passwordHash +emailNormalized").lean();
    expect(user?.emailNormalized).toBe("priya@example.com");
    expect(user?.passwordHash).toMatch(/^\$argon2id\$/);
    expect(user?.passwordHash).not.toContain(password);
    const token = cookie.split("=")[1];
    const session = await Session.findOne().select("+tokenHash").lean();
    expect(session?.tokenHash).toBe(hashSecret(token, "session"));
    expect(session?.tokenHash).not.toBe(token);
    const current = await me(request("me", undefined, cookie));
    expect(await current.json()).toEqual({ data: { user: body.data.user, membership: null, wedding: null } });
  });

  it("enforces normalized email uniqueness during simultaneous signups", async () => {
    const responses = await Promise.all([
      signup(request("signup", input)),
      signup(request("signup", { ...input, email: "priya@example.com" })),
    ]);
    expect(responses.map(r => r.status).sort()).toEqual([201, 409]);
    const conflict = responses.find(r => r.status === 409)!;
    expect((await conflict.json()).error.code).toBe("EMAIL_ALREADY_EXISTS");
    expect(await User.countDocuments()).toBe(1);
    expect(await Session.countDocuments()).toBe(1);
  });

  it("rolls back a new account if session persistence fails", async () => {
    vi.spyOn(Session, "create").mockRejectedValueOnce(new Error("simulated secret database failure"));
    const response = await signup(request("signup", input));
    expect(response.status).toBe(500);
    expect(await response.text()).not.toContain("secret database failure");
    expect(await User.countDocuments()).toBe(0);
    expect(await Session.countDocuments()).toBe(0);
  });

  it("logs in with normalized email, rotates the current session, and invalidates logout", async () => {
    const initial = await register();
    const response = await login(request("login", { email: " PRIYA@example.com ", password }, initial.cookie));
    expect(response.status).toBe(200);
    const cookie = cookieFrom(response);
    expect(cookie).not.toBe(initial.cookie);
    expect((await me(request("me", undefined, initial.cookie))).status).toBe(401);
    const out = await logout(request("logout", undefined, cookie));
    expect(out.status).toBe(200);
    expect(await out.json()).toEqual({ success: true });
    expect(out.headers.get("set-cookie")).toContain("Max-Age=0");
    expect(await Session.countDocuments()).toBe(0);
    expect((await me(request("me", undefined, cookie))).status).toBe(401);
  });

  it("returns identical generic errors for unknown email and wrong password", async () => {
    await register();
    const wrong = await login(request("login", { email: "priya@example.com", password: "not the correct password" }));
    const missing = await login(request("login", { email: "missing@example.com", password }));
    expect(wrong.status).toBe(401); expect(missing.status).toBe(401);
    expect(await wrong.json()).toEqual(await missing.json());
    expect(wrong.headers.get("set-cookie")).toBeNull();
  });

  it("rejects expired, malformed, and deleted-user sessions without waiting for TTL cleanup", async () => {
    const { cookie } = await register();
    await Session.updateMany({}, { expiresAt: new Date(Date.now() - 1000) });
    expect((await me(request("me", undefined, cookie))).status).toBe(401);
    await Session.updateMany({}, { expiresAt: new Date(Date.now() + 60000) });
    await User.deleteMany({});
    expect((await me(request("me", undefined, cookie))).status).toBe(401);
    expect((await me(request("me", undefined, `${SESSION_COOKIE}=bad`))).status).toBe(401);
    expect((await logout(request("logout"))).status).toBe(401);
  });

  it("rejects invalid input, extra ownership fields, oversized and malformed JSON", async () => {
    const response = await signup(request("signup", { ...input, password: "short", weddingId: "untrusted" }));
    expect(response.status).toBe(400);
    expect((await response.json()).error.details.password).toBeTruthy();
    expect((await signup(request("signup", { ...input, name: "x".repeat(18000) }))).status).toBe(400);
    const malformed = new NextRequest("http://localhost:3000/api/auth/signup", {
      method: "POST", headers: { host: "localhost:3000", origin: "http://localhost:3000", "content-type": "application/json" }, body: "{",
    });
    expect((await signup(malformed)).status).toBe(400);
    expect(await User.countDocuments()).toBe(0);
  });

  it("rejects foreign/missing origins and mismatched hosts before changing state", async () => {
    const invalidHeaders: Record<string, string>[] = [{ origin: "https://evil.example" }, { origin: "null" }, { host: "evil.example" }];
    for (const headers of invalidHeaders) {
      expect((await signup(request("signup", input, undefined, headers))).status).toBe(403);
    }
    const { cookie } = await register();
    expect((await logout(request("logout", undefined, cookie, { origin: "https://evil.example" }))).status).toBe(403);
    expect((await me(request("me", undefined, cookie))).status).toBe(200);
  });

  it("uses current membership and a minimal wedding projection; removal takes effect immediately", async () => {
    const { cookie, body } = await register();
    const userId = new mongoose.Types.ObjectId(body.data.user.id);
    const weddingId = new mongoose.Types.ObjectId();
    await mongoose.connection.collection("weddings").insertOne({ _id: weddingId, brideName: "Priya", groomName: "Arjun", weddingDate: "2027-02-14", gallery: { tokenHash: "private" } });
    await mongoose.connection.collection("wedding_memberships").insertOne({ userId, weddingId, role: "MANAGER" });
    const response = await me(request("me", undefined, cookie));
    expect((await response.json()).data).toEqual({ user: body.data.user, membership: { role: "MANAGER" }, wedding: { id: weddingId.toString(), brideName: "Priya", groomName: "Arjun", weddingDate: "2027-02-14" } });
    const loggedIn = await login(request("login", { email: "priya@example.com", password }));
    expect((await loggedIn.json()).data.hasWedding).toBe(true);
    await mongoose.connection.collection("wedding_memberships").deleteMany({ userId });
    expect((await (await me(request("me", undefined, cookie))).json()).data.membership).toBeNull();
  });

  it("rate limits login attempts and returns a retry time without storing raw email", async () => {
    for (let i = 0; i < 10; i++) {
      expect((await login(request("login", { email: "absent@example.com", password }))).status).toBe(401);
    }
    const limited = await login(request("login", { email: "absent@example.com", password }));
    expect(limited.status).toBe(429);
    expect(Number(limited.headers.get("retry-after"))).toBeGreaterThan(0);
    expect(JSON.stringify(await mongoose.connection.collection("auth_rate_limits").find().toArray())).not.toContain("absent@example.com");
  });

  it("counts concurrent rate requests atomically and does not trust local forwarding headers", async () => {
    const results = await Promise.allSettled(Array.from({ length: 12 }, () => consumeRateLimit("race", 3, 60)));
    expect(results.filter(r => r.status === "fulfilled")).toHaveLength(3);
    vi.stubEnv("VERCEL", "");
    expect(requestSource(new Headers({ "x-forwarded-for": "1.2.3.4" }))).toBe("shared-source");
  });

  it("sets Secure cookies in production and refuses missing server configuration", async () => {
    vi.stubEnv("NODE_ENV", "production");
    process.env.APP_ORIGIN = "https://app.example.com";
    const { response } = await register();
    expect(response.headers.get("set-cookie")).toContain("Secure");
    vi.stubEnv("SESSION_SECRET", "");
    const unavailable = await login(request("login", { email: "priya@example.com", password }));
    expect(unavailable.status).toBe(503);
    expect(await unavailable.text()).not.toContain("SESSION_SECRET");
  });
});
