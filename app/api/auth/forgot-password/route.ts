import { NextRequest, NextResponse } from "next/server";
import { recoverAccount } from "@/lib/bankService";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const result = await recoverAccount(email);
    return NextResponse.json({ success: true, message: result.message });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process recovery request." },
      { status: 500 }
    );
  }
}
