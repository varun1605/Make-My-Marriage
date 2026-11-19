import "server-only";
import { type Types } from "mongoose";
import { connectDatabase } from "@/server/db/connection";

type MembershipSummary = { userId: Types.ObjectId; weddingId: Types.ObjectId; role: "ADMIN" | "MANAGER" };

// Read-only projection for auth/me. The owning domain will add its full model
// with membership writes; no membership is created or cached by authentication.
export async function findMembershipForUser(userId: Types.ObjectId) {
  const connection = await connectDatabase();
  return connection.collection<MembershipSummary>("wedding_memberships").findOne(
    { userId }, { projection: { _id: 0, weddingId: 1, role: 1 } },
  );
}
