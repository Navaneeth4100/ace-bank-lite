"use client";

import { useEffect, useState, useCallback } from "react";
import Navbar from "@/components/Navbar";
import BalanceCounter from "@/components/BalanceCounter";
import AlertBanner from "@/components/AlertBanner";
import {
  Wallet,
  ArrowDownCircle,
  Send,
  CreditCard,
  Download,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

interface Transaction {
  id: number;
  senderAccount: number | null;
  receiverAccount: number | null;
  amount: number;
  txType: "TRANSFER" | "DEPOSIT" | "WITHDRAWAL";
  remark: string | null;
  createdAt: string;
}

interface DashboardData {
  accountNumber: number;
  firstName: string;
  lastName: string;
  email: string;
  balance: number;
  dailyLimit: number;
  todayWithdrawn: number;
  dailyRemaining: number;
  transactions: Transaction[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Form states
  const [depositAmount, setDepositAmount] = useState<string>("");
  const [transferAccount, setTransferAccount] = useState<string>("");
  const [transferAmount, setTransferAmount] = useState<string>("");
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");

  // Submitting states
  const [isDepositing, setIsDepositing] = useState<boolean>(false);
  const [isTransferring, setIsTransferring] = useState<boolean>(false);
  const [isWithdrawing, setIsWithdrawing] = useState<boolean>(false);

  // Feedback alerts
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch("/api/account/dashboard");
      if (!res.ok) {
        window.location.href = "/login?error=unauthorized";
        return;
      }
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Handle Deposit
  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);
    setIsDepositing(true);

    try {
      const res = await fetch("/api/account/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: depositAmount }),
      });
      const result = await res.json();

      if (!res.ok || !result.success) {
        setAlert({ type: "error", message: result.error || "Deposit failed." });
      } else {
        setAlert({ type: "success", message: result.message });
        setDepositAmount("");
        fetchDashboard();
      }
    } catch {
      setAlert({ type: "error", message: "Network error during deposit." });
    } finally {
      setIsDepositing(false);
    }
  };

  // Handle Transfer
  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);
    setIsTransferring(true);

    try {
      const res = await fetch("/api/account/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toAccount: transferAccount,
          amount: transferAmount,
        }),
      });
      const result = await res.json();

      if (!res.ok || !result.success) {
        setAlert({ type: "error", message: result.error || "Transfer failed." });
      } else {
        setAlert({ type: "success", message: result.message });
        setTransferAccount("");
        setTransferAmount("");
        fetchDashboard();
      }
    } catch {
      setAlert({ type: "error", message: "Network error during transfer." });
    } finally {
      setIsTransferring(false);
    }
  };

  // Handle Withdraw
  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);
    setIsWithdrawing(true);

    try {
      const res = await fetch("/api/account/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: withdrawAmount }),
      });
      const result = await res.json();

      if (!res.ok || !result.success) {
        setAlert({ type: "error", message: result.error || "Withdrawal failed." });
      } else {
        setAlert({ type: "success", message: result.message });
        setWithdrawAmount("");
        fetchDashboard();
      }
    } catch {
      setAlert({ type: "error", message: "Network error during withdrawal." });
    } finally {
      setIsWithdrawing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 transition-colors">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-sm font-medium text-slate-500">Loading secure dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar user={{ firstName: data.firstName, accountNumber: data.accountNumber }} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 fade-in-up">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Hello, {data.firstName}!
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Account: <span className="acc-badge">#{data.accountNumber}</span>
            </p>
          </div>

          <div className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            <Clock className="w-3.5 h-3.5" />
            <span>Active Session • Savings Account</span>
          </div>
        </div>

        {/* Action Feedback Banner */}
        {alert && (
          <AlertBanner
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        )}

        {/* 4-Card Banking Grid (Exact replica of Home.jsp) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Balance Card */}
          <div className="bank-card flex flex-col justify-between border-blue-500/20 dark:border-blue-900/40">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Total Balance
              </h3>
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                <Wallet className="w-5 h-5" />
              </div>
            </div>

            <div className="my-4">
              <div className="text-3xl sm:text-4xl font-extrabold text-blue-600 dark:text-blue-400 flex items-center">
                <span>₹</span>
                <span className="ml-1">
                  <BalanceCounter value={data.balance} />
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Available for withdrawal
              </p>
            </div>

            <div className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Real-Time Balance Synced</span>
            </div>
          </div>

          {/* Card 2: Quick Deposit */}
          <div className="bank-card flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Quick Deposit
              </h3>
              <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <ArrowDownCircle className="w-5 h-5" />
              </div>
            </div>

            <form onSubmit={handleDeposit} className="space-y-3">
              <div>
                <input
                  type="text"
                  inputMode="decimal"
                  pattern="[0-9]*\.?[0-9]+"
                  placeholder="Amount to Add (₹)"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={isDepositing}
                className="w-full py-2.5 px-3 rounded-lg text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white flex items-center justify-center gap-1.5 transition"
              >
                {isDepositing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>Add to Balance</span>
                )}
              </button>
            </form>

            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2">
              Instant credit to your savings account
            </p>
          </div>

          {/* Card 3: Send Money / Transfer */}
          <div className="bank-card flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Send Money
              </h3>
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                <Send className="w-5 h-5" />
              </div>
            </div>

            <form onSubmit={handleTransfer} className="space-y-3">
              <input
                type="text"
                placeholder="Recipient Account No"
                value={transferAccount}
                onChange={(e) => setTransferAccount(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <input
                type="text"
                inputMode="decimal"
                pattern="[0-9]*\.?[0-9]+"
                placeholder="Amount (₹)"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <button
                type="submit"
                disabled={isTransferring}
                className="w-full py-2.5 px-3 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white flex items-center justify-center gap-1.5 transition"
              >
                {isTransferring ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>Transfer Now</span>
                )}
              </button>
            </form>
          </div>

          {/* Card 4: Withdraw Money */}
          <div className="bank-card flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Withdraw Money
              </h3>
              <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                <CreditCard className="w-5 h-5" />
              </div>
            </div>

            <form onSubmit={handleWithdraw} className="space-y-3">
              <input
                type="text"
                inputMode="decimal"
                pattern="[0-9]*\.?[0-9]+"
                placeholder="Amount to Withdraw (₹)"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />

              <button
                type="submit"
                disabled={isWithdrawing}
                className="w-full py-2.5 px-3 rounded-lg text-sm font-semibold bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white flex items-center justify-center gap-1.5 transition"
              >
                {isWithdrawing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>Withdraw Now</span>
                )}
              </button>
            </form>

            <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 flex items-center justify-between">
              <span>Daily Limit: ₹{data.dailyLimit}</span>
              <span className="font-semibold text-rose-500">
                Rem: ₹{data.dailyRemaining.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Transactions Table Section (Exact replica of Home.jsp) */}
        <section className="bank-card p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-bold">Recent Transactions</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                All inward and outward banking movements
              </p>
            </div>

            <a
              href="/api/account/statement/csv"
              download
              className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
            >
              <Download className="w-4 h-4" />
              <span>Download CSV</span>
            </a>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Reference</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {data.transactions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">
                      No transactions recorded yet. Perform a quick deposit to get started!
                    </td>
                  </tr>
                ) : (
                  data.transactions.map((tx) => {
                    const isDebit = tx.senderAccount === data.accountNumber;
                    const isTransfer = tx.txType === "TRANSFER";

                    let refText = tx.remark || "";
                    if (isTransfer) {
                      refText = isDebit
                        ? `To Account #${tx.receiverAccount}`
                        : `From Account #${tx.senderAccount}`;
                    }

                    return (
                      <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                        <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 text-xs">
                          {new Date(tx.createdAt).toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              tx.txType === "DEPOSIT"
                                ? "badge-deposit"
                                : tx.txType === "WITHDRAWAL"
                                ? "badge-withdrawal"
                                : "badge-transfer"
                            }`}
                          >
                            {tx.txType}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-700 dark:text-slate-300">
                          {refText}
                        </td>
                        <td
                          className={`py-3.5 px-4 text-right font-bold text-sm tabular-nums ${
                            isDebit ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"
                          }`}
                        >
                          <span className="inline-flex items-center gap-1">
                            {isDebit ? (
                              <TrendingDown className="w-3.5 h-3.5" />
                            ) : (
                              <TrendingUp className="w-3.5 h-3.5" />
                            )}
                            <span>
                              {isDebit ? "-" : "+"} ₹
                              {tx.amount.toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </span>
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
