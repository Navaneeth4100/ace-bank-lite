import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({ success: true, message: "Logged out successfully" });
  clearSessionCookie(response);
  return response;
}

export async function GET() {
  const response = NextResponse.redirect(new URL("/?msg=logged_out", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
  clearSessionCookie(response);
  return response;
}
