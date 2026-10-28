import { NextRequest, NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({ success: true, message: "Logged out successfully" });
  clearSessionCookie(response);
  return response;
}

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/?msg=logged_out", request.url));
  clearSessionCookie(response);
  return response;
}
