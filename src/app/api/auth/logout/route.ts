import { NextRequest, NextResponse } from "next/server";
import { logout } from "@/modules/auth/service";
import { SESSION_COOKIE, sessionCookieOptions } from "@/server/auth/session";
import { requireSameOrigin } from "@/server/http/request";
import { apiResponse } from "@/server/http/response";

export const runtime = "nodejs";
export function POST(request: NextRequest) {
  return apiResponse(async () => {
    requireSameOrigin(request);
    await logout(request.cookies.get(SESSION_COOKIE)?.value);
    const response = NextResponse.json({ success: true });
    response.cookies.set(SESSION_COOKIE, "", { ...sessionCookieOptions(), maxAge: 0, expires: new Date(0) });
    return response;
  });
}
