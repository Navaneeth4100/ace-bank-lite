import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getTransactionHistory } from "@/lib/bankService";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const transactions = await getTransactionHistory(session.accountNumber);

  // Build CSV headers and rows
  const headers = ["ID", "Date", "Type", "Reference", "Amount (INR)", "Status"];
  const rows = transactions.map((tx) => {
    let reference = tx.remark || "";
    if (tx.txType === "TRANSFER") {
      reference =
        tx.senderAccount === session.accountNumber
          ? `To Account ${tx.receiverAccount}`
          : `From Account ${tx.senderAccount}`;
    }

    const sign = tx.senderAccount === session.accountNumber ? "-" : "+";
    const formattedAmount = `${sign}${tx.amount.toFixed(2)}`;

    return [
      tx.id,
      `"${new Date(tx.createdAt).toLocaleString()}"`,
      tx.txType,
      `"${reference.replace(/"/g, '""')}"`,
      formattedAmount,
      "COMPLETED",
    ].join(",");
  });

  const csvContent = [headers.join(","), ...rows].join("\n");

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="acebank_statement_${session.accountNumber}.csv"`,
    },
  });
}
