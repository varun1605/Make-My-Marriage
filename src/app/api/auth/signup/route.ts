import { NextRequest, NextResponse } from "next/server";
import { signup } from "@/modules/auth/service";
import { signupSchema } from "@/modules/auth/schemas";
import { limitAuthSource } from "@/server/auth/rate-limit";
import { SESSION_COOKIE, sessionCookieOptions } from "@/server/auth/session";
import { requireSameOrigin, readJson } from "@/server/http/request";
import { apiResponse } from "@/server/http/response";

export const runtime = "nodejs";
export function POST(request: NextRequest) {
  return apiResponse(async () => {
    requireSameOrigin(request);
    await limitAuthSource("signup", request.headers);
    const input = await readJson(request, signupSchema);
    const result = await signup(input, request.cookies.get(SESSION_COOKIE)?.value);
    const response = NextResponse.json({ data: result.data }, { status: 201 });
    response.cookies.set(SESSION_COOKIE, result.credential.token, { ...sessionCookieOptions(), expires: result.credential.expiresAt });
    return response;
  });
}
