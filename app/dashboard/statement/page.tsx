"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Printer, Download, ShieldCheck, Building, Clock } from "lucide-react";

interface Transaction {
  id: number;
  senderAccount: number | null;
  receiverAccount: number | null;
  amount: number;
  txType: "TRANSFER" | "DEPOSIT" | "WITHDRAWAL";
  remark: string | null;
  createdAt: string;
}

interface StatementData {
  accountNumber: number;
  firstName: string;
  lastName: string;
  email: string;
  balance: number;
  transactions: Transaction[];
}

export default function StatementPage() {
  const [data, setData] = useState<StatementData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch("/api/account/dashboard")
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((json) => setData(json))
      .catch(() => {
        window.location.href = "/login?error=unauthorized";
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 text-slate-800">
        <p className="text-sm font-semibold">Generating Official Bank Statement...</p>
      </div>
    );
  }

  if (!data) return null;

  // Calculate totals
  const totalDeposits = data.transactions
    .filter((tx) => tx.receiverAccount === data.accountNumber)
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalWithdrawals = data.transactions
    .filter((tx) => tx.senderAccount === data.accountNumber && tx.txType !== "DEPOSIT")
    .reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 print:p-0 print:bg-white text-slate-900">
      {/* Top Action Bar (Hidden when Printing) */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>

        <div className="flex items-center gap-3">
          <a
            href="/api/account/statement/csv"
            download
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 transition text-slate-700 shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Download CSV</span>
          </a>

          <button
            onClick={() => window.print()}
            type="button"
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Official Bank Statement Document */}
      <div className="max-w-4xl mx-auto bg-white border border-slate-300 rounded-xl shadow-lg p-8 sm:p-12 print:shadow-none print:border-none print:p-0 print:m-0 font-sans">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-slate-900 pb-6 mb-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-950">
              Ace<span className="text-blue-600">Bank</span>
            </h1>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mt-0.5">
              Ace Digital Banking Corporation Ltd.
            </p>
            <p className="text-xs text-slate-600 mt-2">
              Plot 42, Cybercity Financial District, BKC, Mumbai - 400051
              <br />
              Helpline: 1800-425-BANK | Email: support@acebank.com
            </p>
          </div>

          <div className="text-left sm:text-right mt-4 sm:mt-0">
            <span className="inline-block bg-slate-900 text-white text-[11px] font-bold px-3 py-1 uppercase tracking-wider rounded">
              Official Account Statement
            </span>
            <p className="text-xs text-slate-500 mt-2">
              Date Generated: {new Date().toLocaleDateString("en-IN", { dateStyle: "long" })}
            </p>
            <p className="text-xs text-slate-500">
              Reference: STMT-{data.accountNumber}-{Date.now().toString().slice(-6)}
            </p>
          </div>
        </div>

        {/* Customer & Branch Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6 text-xs">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Customer Details
            </span>
            <p className="font-bold text-sm text-slate-950">
              {data.firstName} {data.lastName}
            </p>
            <p className="text-slate-600">Email: {data.email}</p>
            <p className="text-slate-600">Account Type: Regular Savings Account</p>
            <p className="text-slate-600">KYC Status: Fully Verified (Tier 1)</p>
          </div>

          <div className="space-y-1 sm:text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Banking Credentials
            </span>
            <p className="font-mono font-bold text-sm text-blue-600">
              Account No: #{data.accountNumber}
            </p>
            <p className="text-slate-600">IFSC Code: ACEB0001001</p>
            <p className="text-slate-600">MICR Code: 400240001</p>
            <p className="text-slate-600">Branch: Mumbai Cybercity Digital Branch</p>
          </div>
        </div>

        {/* Summary Card */}
        <div className="grid grid-cols-3 gap-4 border border-slate-200 rounded-lg p-4 mb-6 text-center text-xs">
          <div>
            <span className="text-slate-400 uppercase tracking-wider block font-semibold">
              Total Deposits
            </span>
            <span className="text-sm font-bold text-emerald-600">
              + ₹{totalDeposits.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div>
            <span className="text-slate-400 uppercase tracking-wider block font-semibold">
              Total Debits / Withdrawals
            </span>
            <span className="text-sm font-bold text-rose-600">
              - ₹{totalWithdrawals.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div>
            <span className="text-slate-400 uppercase tracking-wider block font-semibold">
              Current Available Balance
            </span>
            <span className="text-sm font-extrabold text-blue-600">
              ₹{data.balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Transaction Table */}
        <div className="mb-8">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
            Detailed Transaction Ledger
          </h3>
          <table className="w-full text-left text-xs border border-slate-200">
            <thead className="bg-slate-100 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Date & Time</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Particulars / Reference</th>
                <th className="py-2.5 px-3 text-right">Debit (₹)</th>
                <th className="py-2.5 px-3 text-right">Credit (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {data.transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400">
                    No transactions recorded for this account.
                  </td>
                </tr>
              ) : (
                data.transactions.map((tx) => {
                  const isDebit = tx.senderAccount === data.accountNumber && tx.txType !== "DEPOSIT";
                  let particulars = tx.remark || "Transaction";
                  if (tx.txType === "TRANSFER") {
                    particulars = isDebit
                      ? `Fund Transfer to A/C #${tx.receiverAccount}`
                      : `Fund Transfer received from A/C #${tx.senderAccount}`;
                  }

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/50">
                      <td className="py-2 px-3 text-slate-500 font-mono text-[11px]">
                        {new Date(tx.createdAt).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-2 px-3 font-semibold text-slate-800">
                        {tx.txType}
                      </td>
                      <td className="py-2 px-3 text-slate-700">{particulars}</td>
                      <td className="py-2 px-3 text-right font-mono text-rose-600 font-bold">
                        {isDebit ? tx.amount.toFixed(2) : "-"}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-emerald-600 font-bold">
                        {!isDebit ? tx.amount.toFixed(2) : "-"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Seal & Regulatory Notice */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-500 gap-4">
          <div className="space-y-1">
            <p>This is a computer-generated account statement and does not require a physical signature.</p>
            <p>AceBank is regulated by digital banking security standards. Member DICGC.</p>
          </div>

          <div className="border border-emerald-500 text-emerald-700 px-3 py-1 rounded bg-emerald-50 flex items-center gap-1.5 font-bold uppercase tracking-wider text-[9px]">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Cryptographically Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
}
