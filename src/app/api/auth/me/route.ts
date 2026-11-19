import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@/modules/auth/service";
import { SESSION_COOKIE } from "@/server/auth/session";
import { apiResponse } from "@/server/http/response";

export const runtime = "nodejs";
export function GET(request: NextRequest) {
  return apiResponse(async () => NextResponse.json({ data: await currentUser(request.cookies.get(SESSION_COOKIE)?.value) }));
}
