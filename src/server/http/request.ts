import "server-only";
import { z } from "zod";
import { getServerConfig } from "@/server/config/env";
import { AppError } from "./errors";

export function requireSameOrigin(request: Request) {
  const origin = getServerConfig().APP_ORIGIN;
  if (request.headers.get("origin") !== origin || request.headers.get("host") !== new URL(origin).host ||
      request.headers.get("sec-fetch-site") === "cross-site") {
    throw new AppError("FORBIDDEN", "Please submit this request from the application.");
  }
}

export async function readJson<T>(request: Request, schema: z.ZodType<T>): Promise<T> {
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
    throw new AppError("VALIDATION_ERROR", "Send a JSON request.");
  }
  const reader = request.body?.getReader();
  if (!reader) throw new AppError("VALIDATION_ERROR", "Enter the required information.");
  const decoder = new TextDecoder();
  let length = 0;
  let text = "";
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      length += chunk.value.byteLength;
      if (length > 16 * 1024) {
        await reader.cancel();
        throw new AppError("VALIDATION_ERROR", "The request is too large.");
      }
      text += decoder.decode(chunk.value, { stream: true });
    }
    text += decoder.decode();
  } finally { reader.releaseLock(); }
  let value: unknown;
  try { value = JSON.parse(text); }
  catch { throw new AppError("VALIDATION_ERROR", "Send valid JSON."); }
  const parsed = schema.safeParse(value);
  if (!parsed.success) {
    const details: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = String(issue.path[0] ?? "form");
      // Do not reflect attacker-supplied unknown field names or input values.
      if (["name", "email", "password"].includes(field)) details[field] ??= issue.message;
    }
    throw new AppError("VALIDATION_ERROR", "Please check the information you entered.", details);
  }
  return parsed.data;
}
