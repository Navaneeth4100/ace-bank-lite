import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { changePassword } from "@/lib/bankService";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { oldPassword, newPassword, confirmPassword } = await request.json();

    if (!oldPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: "Old and new password are required." },
        { status: 400 }
      );
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: "New password and confirmation do not match." },
        { status: 400 }
      );
    }

    const result = await changePassword(session.accountNumber, oldPassword, newPassword);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: result.message });
  } catch (error) {
    console.error("Change Password Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update password." },
      { status: 500 }
    );
  }
}
