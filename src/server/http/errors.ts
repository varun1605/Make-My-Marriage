import "server-only";

export type ErrorCode = "VALIDATION_ERROR" | "UNAUTHENTICATED" | "FORBIDDEN" |
  "EMAIL_ALREADY_EXISTS" | "RATE_LIMITED" | "INTERNAL_ERROR" | "EXTERNAL_SERVICE_ERROR";

export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly details?: Record<string, string>,
    public readonly retryAfter?: number,
  ) { super(message); }
}
