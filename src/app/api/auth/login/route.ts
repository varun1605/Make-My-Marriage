import { NextRequest, NextResponse } from "next/server";
import { login } from "@/modules/auth/service";
import { loginSchema } from "@/modules/auth/schemas";
import { limitAuthSource, limitLoginEmail } from "@/server/auth/rate-limit";
import { SESSION_COOKIE, sessionCookieOptions } from "@/server/auth/session";
import { requireSameOrigin, readJson } from "@/server/http/request";
import { apiResponse } from "@/server/http/response";

export const runtime = "nodejs";
export function POST(request: NextRequest) {
  return apiResponse(async () => {
    requireSameOrigin(request);
    await limitAuthSource("login", request.headers);
    const input = await readJson(request, loginSchema);
    await limitLoginEmail(input.email);
    const result = await login(input, request.cookies.get(SESSION_COOKIE)?.value);
    const response = NextResponse.json({ data: result.data });
    response.cookies.set(SESSION_COOKIE, result.credential.token, { ...sessionCookieOptions(), expires: result.credential.expiresAt });
    return response;
  });
}
