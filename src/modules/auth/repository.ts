import "server-only";
import { type Types } from "mongoose";
import { connectDatabase } from "@/server/db/connection";
import { Session, User } from "./models";

// Ensure unique/TTL indexes exist before accepting authentication writes.
let initialized: Promise<void> | undefined;
export async function prepareAuthStore() {
  const connection = await connectDatabase();
  initialized ??= Promise.all([User.createIndexes(), Session.createIndexes()]).then(() => undefined)
    .catch(error => { initialized = undefined; throw error; });
  await initialized;
  return connection;
}

export async function findUserByEmail(emailNormalized: string) {
  await prepareAuthStore();
  return User.findOne({ emailNormalized }).select("+passwordHash").lean();
}

export async function createAccountAndSession(
  input: { name: string; email: string; emailNormalized: string; passwordHash: string },
  credential: { tokenHash: string; expiresAt: Date },
  previousTokenHash?: string,
) {
  const connection = await prepareAuthStore();
  return connection.transaction(async transaction => {
    const [user] = await User.create([input], { session: transaction });
    await Session.create([{ userId: user._id, tokenHash: credential.tokenHash, expiresAt: credential.expiresAt }], { session: transaction });
    if (previousTokenHash) await Session.deleteOne({ tokenHash: previousTokenHash }, { session: transaction });
    return user;
  });
}

export async function createLoginSession(userId: Types.ObjectId, credential: { tokenHash: string; expiresAt: Date }, previousTokenHash?: string) {
  const connection = await prepareAuthStore();
  await connection.transaction(async transaction => {
    await Session.create([{ userId, tokenHash: credential.tokenHash, expiresAt: credential.expiresAt }], { session: transaction });
    if (previousTokenHash) await Session.deleteOne({ tokenHash: previousTokenHash }, { session: transaction });
  });
}

export async function findSessionUser(tokenHash: string) {
  await prepareAuthStore();
  // TTL cleanup is asynchronous, so authorization must check expiry itself.
  const session = await Session.findOne({ tokenHash, expiresAt: { $gt: new Date() } }).lean();
  if (!session) return null;
  return User.findById(session.userId).lean();
}

export async function deleteSession(tokenHash: string) {
  await prepareAuthStore();
  await Session.deleteOne({ tokenHash });
}
