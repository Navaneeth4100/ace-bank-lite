import { NextResponse } from "next/server";
import { initDatabaseSchema } from "@/lib/bankService";
import prisma from "@/lib/prisma";

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      {
        status: "error",
        databaseConnected: false,
        message:
          "DATABASE_URL is missing in your Vercel Environment Variables. Please add your Neon / Supabase PostgreSQL connection string to Vercel Settings > Environment Variables.",
      },
      { status: 500 }
    );
  }

  try {
    // 1. Run schema auto-initialization
    const initResult = await initDatabaseSchema();

    // 2. Query counts
    let userCount = 0;
    let accountCount = 0;
    try {
      userCount = await prisma.user.count();
      accountCount = await prisma.account.count();
    } catch {
      // Ignored if counting fails
    }

    return NextResponse.json({
      status: "success",
      databaseConnected: true,
      message: "Database tables (USERS, ACCOUNTS, TRANSACTIONS) are verified and ready for signups!",
      schemaInit: initResult,
      stats: {
        totalUsers: userCount,
        totalAccounts: accountCount,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        status: "error",
        databaseConnected: false,
        error: err?.message || "Failed to connect to database.",
        hint: "Please verify that your database credentials and connection string in DATABASE_URL are correct.",
      },
      { status: 500 }
    );
  }
}
