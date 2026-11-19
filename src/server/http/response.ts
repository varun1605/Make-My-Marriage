import "server-only";
import { NextResponse } from "next/server";
import { AppError, type ErrorCode } from "./errors";

const status: Record<ErrorCode, number> = {
  VALIDATION_ERROR: 400, UNAUTHENTICATED: 401, FORBIDDEN: 403,
  EMAIL_ALREADY_EXISTS: 409, RATE_LIMITED: 429, INTERNAL_ERROR: 500, EXTERNAL_SERVICE_ERROR: 503,
};
export async function apiResponse(action: () => Promise<NextResponse>) {
  let response: NextResponse;
  try { response = await action(); }
  catch (error) {
    const known = error instanceof AppError;
    response = NextResponse.json({ error: {
      code: known ? error.code : "INTERNAL_ERROR",
      message: known ? error.message : "Something went wrong. Please try again later.",
      ...(known && error.details ? { details: error.details } : {}),
    } }, { status: known ? status[error.code] : 500 });
    if (known && error.retryAfter) response.headers.set("Retry-After", String(error.retryAfter));
    // Do not log raw exceptions: driver/validation errors may contain credentials.
  }
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("X-Content-Type-Options", "nosniff");
  return response;
}
