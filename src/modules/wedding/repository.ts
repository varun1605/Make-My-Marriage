import "server-only";
import { type Types } from "mongoose";
import { connectDatabase } from "@/server/db/connection";

type WeddingSummary = { brideName: string; groomName: string; weddingDate: string };

// Only call with a wedding ID resolved from the authenticated user's membership.
// Read-only projection until the wedding-creation increment adds the full model.
export async function findAuthorizedWeddingSummary(weddingId: Types.ObjectId) {
  const connection = await connectDatabase();
  return connection.collection<WeddingSummary>("weddings").findOne(
    { _id: weddingId }, { projection: { brideName: 1, groomName: 1, weddingDate: 1 } },
  );
}
