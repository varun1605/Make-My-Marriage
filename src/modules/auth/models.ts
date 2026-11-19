import "server-only";
import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const userSchema = new Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  email: { type: String, required: true, trim: true, maxlength: 254 },
  emailNormalized: { type: String, required: true, select: false },
  passwordHash: { type: String, required: true, select: false },
}, { timestamps: true, collection: "users", bufferCommands: false, autoIndex: false });
userSchema.index({ emailNormalized: 1 }, { unique: true });

const sessionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, required: true },
  tokenHash: { type: String, required: true, select: false },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, required: true, default: Date.now },
  lastUsedAt: { type: Date },
}, { collection: "sessions", bufferCommands: false, autoIndex: false });
sessionSchema.index({ tokenHash: 1 }, { unique: true });
sessionSchema.index({ userId: 1 });
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type UserRecord = InferSchemaType<typeof userSchema>;
export type SessionRecord = InferSchemaType<typeof sessionSchema>;
export const User: Model<UserRecord> = (models.User as Model<UserRecord> | undefined) ?? model<UserRecord>("User", userSchema);
export const Session: Model<SessionRecord> = (models.Session as Model<SessionRecord> | undefined) ?? model<SessionRecord>("Session", sessionSchema);
