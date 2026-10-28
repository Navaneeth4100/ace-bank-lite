import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  getBalance,
  getTransactionHistory,
  getDailyWithdrawalTotal,
  DAILY_LIMIT,
} from "@/lib/bankService";

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const balance = await getBalance(session.accountNumber);
    const transactions = await getTransactionHistory(session.accountNumber);
    const todayWithdrawn = await getDailyWithdrawalTotal(session.accountNumber);
    const dailyRemaining = Math.max(0, DAILY_LIMIT - todayWithdrawn);

    return NextResponse.json({
      success: true,
      accountNumber: session.accountNumber,
      firstName: session.firstName,
      lastName: session.lastName,
      email: session.email,
      balance,
      dailyLimit: DAILY_LIMIT,
      todayWithdrawn,
      dailyRemaining,
      transactions,
    });
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json(
      { error: "Could not load dashboard data." },
      { status: 500 }
    );
  }
}
