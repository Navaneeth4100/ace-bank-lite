import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "json";

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
      }),
      prisma.account.findMany(),
      prisma.transaction.findMany({ orderBy: { createdAt: "desc" } }),
    ]);

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

    if (format === "csv") {
      // Export all users and their balances as CSV
      const headers = ["UserID", "FirstName", "LastName", "Email", "Aadhaar", "AccountNo", "Balance", "AccountType", "Status", "RegisteredAt"];
      const rows = users.map((u) => {
        const acc = accounts.find((a) => a.userId === u.id);
        return [
          u.id,
          `"${u.firstName}"`,
          `"${u.lastName}"`,
          `"${u.email}"`,
          `"${u.aadhaarNo}"`,
          acc ? acc.accountNo : "N/A",
          acc ? Number(acc.balance).toFixed(2) : "0.00",
          acc ? acc.accountType : "N/A",
          acc ? acc.status : "N/A",
          `"${new Date(u.createdAt).toISOString()}"`,
        ].join(",");
      });

      const csvContent = [headers.join(","), ...rows].join("\n");

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="acebank_database_export_${timestamp}.csv"`,
        },
      });
    }

    // Default: JSON Export (Complete snapshot)
    const exportData = {
      bankName: "AceBank Lite",
      exportedAt: new Date().toISOString(),
      counts: {
        users: users.length,
        accounts: accounts.length,
        transactions: transactions.length,
      },
      data: {
        users,
        accounts: accounts.map((a) => ({ ...a, balance: Number(a.balance) })),
        transactions: transactions.map((t) => ({ ...t, amount: Number(t.amount) })),
      },
    };

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="acebank_full_backup_${timestamp}.json"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to export database." },
      { status: 500 }
    );
  }
}
