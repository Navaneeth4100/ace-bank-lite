import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { processWithdraw, getBalance } from "@/lib/bankService";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const amount = parseFloat(String(body.amount));

    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid amount greater than 0." },
        { status: 400 }
      );
    }

    const result = await processWithdraw(session.accountNumber, amount);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.message },
        { status: 400 }
      );
    }

    const newBalance = await getBalance(session.accountNumber);

    return NextResponse.json({
      success: true,
      message: result.message,
      newBalance,
    });
  } catch (error) {
    console.error("Withdrawal API Error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred during withdrawal." },
      { status: 500 }
    );
  }
}
