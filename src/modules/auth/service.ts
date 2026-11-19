import "server-only";
import { type Types } from "mongoose";
import { hashPassword, verifyPassword } from "@/server/auth/password";
import { createSessionCredential, hashSecret, isSessionToken } from "@/server/auth/session";
import { AppError } from "@/server/http/errors";
import { findMembershipForUser } from "@/modules/wedding-members/repository";
import { findAuthorizedWeddingSummary } from "@/modules/wedding/repository";
import * as repository from "./repository";
import type { LoginInput, SignupInput } from "./schemas";
import type { CurrentUser, PublicUser } from "./types";

const publicUser = (user: { _id: Types.ObjectId; name: string; email: string }): PublicUser =>
  ({ id: user._id.toString(), name: user.name, email: user.email });
const previousHash = (token?: string) => isSessionToken(token) ? hashSecret(token, "session") : undefined;

export async function signup(input: SignupInput, previousToken?: string) {
  const credential = createSessionCredential();
  const passwordHash = await hashPassword(input.password);
  try {
    const user = await repository.createAccountAndSession({
      name: input.name, email: input.email, emailNormalized: input.email.toLowerCase(), passwordHash,
    }, credential, previousHash(previousToken));
    return { data: { user: publicUser(user), hasWedding: false }, credential };
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === 11000 &&
        "keyPattern" in error && typeof error.keyPattern === "object" && error.keyPattern !== null &&
        "emailNormalized" in error.keyPattern) {
      throw new AppError("EMAIL_ALREADY_EXISTS", "An account with this email already exists. Please log in.");
    }
    throw error;
  }
}

export async function login(input: LoginInput, previousToken?: string) {
  const user = await repository.findUserByEmail(input.email.toLowerCase());
  if (!await verifyPassword(input.password, user?.passwordHash)) {
    throw new AppError("UNAUTHENTICATED", "Invalid email or password.");
  }
  if (!user) throw new AppError("UNAUTHENTICATED", "Invalid email or password.");
  const membership = await findMembershipForUser(user._id);
  const credential = createSessionCredential();
  await repository.createLoginSession(user._id, credential, previousHash(previousToken));
  return { data: { user: publicUser(user), hasWedding: Boolean(membership) }, credential };
}

export async function requireSessionUser(token?: string) {
  if (!isSessionToken(token)) throw new AppError("UNAUTHENTICATED", "Please log in to continue.");
  const user = await repository.findSessionUser(hashSecret(token, "session"));
  if (!user) throw new AppError("UNAUTHENTICATED", "Please log in to continue.");
  return user;
}

export async function currentUser(token?: string): Promise<CurrentUser> {
  const user = await requireSessionUser(token);
  const membership = await findMembershipForUser(user._id);
  const wedding = membership ? await findAuthorizedWeddingSummary(membership.weddingId) : null;
  if (membership && !wedding) throw new AppError("INTERNAL_ERROR", "We couldn’t load your wedding information. Please try again later.");
  return {
    user: publicUser(user),
    membership: membership ? { role: membership.role } : null,
    wedding: wedding ? { id: wedding._id.toString(), brideName: wedding.brideName, groomName: wedding.groomName, weddingDate: wedding.weddingDate } : null,
  };
}

export async function logout(token?: string) {
  await requireSessionUser(token);
  await repository.deleteSession(hashSecret(token!, "session"));
}
