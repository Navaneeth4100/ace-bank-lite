import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: "DATABASE_URL is not configured." },
        { status: 500 }
      );
    }

    const [users, accounts, transactions] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          aadhaarNo: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.account.findMany({
        orderBy: { accountNo: "asc" },
      }),
      prisma.transaction.findMany({
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const totalReserves = accounts.reduce(
      (sum, acc) => sum + Number(acc.balance),
      0
    );

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers: users.length,
        totalAccounts: accounts.length,
        totalTransactions: transactions.length,
        totalReserves,
      },
      users,
      accounts: accounts.map((a) => ({
        ...a,
        balance: Number(a.balance),
      })),
      transactions: transactions.map((t) => ({
        ...t,
        amount: Number(t.amount),
      })),
    });
  } catch (error: any) {
    console.error("Admin overview error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to retrieve database overview." },
      { status: 500 }
    );
  }
}
