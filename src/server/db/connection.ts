import "server-only";
import mongoose from "mongoose";
import { getServerConfig } from "@/server/config/env";
import { AppError } from "@/server/http/errors";

const state = globalThis as typeof globalThis & { mmmMongo?: Promise<typeof mongoose> };

export async function connectDatabase() {
  const config = getServerConfig();
  if (!state.mmmMongo) {
    state.mmmMongo = mongoose.connect(config.MONGODB_URI, {
      dbName: config.MONGODB_DB_NAME,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      bufferCommands: false,
      autoIndex: false,
    }).catch(() => {
      state.mmmMongo = undefined;
      throw new AppError("EXTERNAL_SERVICE_ERROR", "Account access is temporarily unavailable. Please try again later.");
    });
  }
  return (await state.mmmMongo).connection;
}
