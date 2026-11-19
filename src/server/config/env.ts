import "server-only";
import { z } from "zod";
import { AppError } from "@/server/http/errors";

const schema = z.object({
  MONGODB_URI: z.string().regex(/^mongodb(?:\+srv)?:\/\//),
  MONGODB_DB_NAME: z.string().regex(/^[a-zA-Z0-9_-]{1,63}$/),
  APP_ORIGIN: z.url().refine(value => {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) && url.origin === value;
  }),
  SESSION_SECRET: z.string().regex(/^[a-fA-F0-9]{64}$/),
});

// Lazy validation keeps static pages/builds independent of database credentials.
export function getServerConfig() {
  const parsed = schema.safeParse(process.env);
  if (!parsed.success || (process.env.NODE_ENV === "production" &&
      !parsed.data.APP_ORIGIN.startsWith("https://"))) {
    // Never include environment values or validation input in errors/logs.
    throw new AppError("EXTERNAL_SERVICE_ERROR", "Account access is temporarily unavailable. Please try again later.");
  }
  return parsed.data;
}
