"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  Database,
  Download,
  Users,
  CreditCard,
  Receipt,
  Search,
  RefreshCw,
  ArrowLeft,
  CheckCircle2,
  HardDrive,
  Shield,
  FileJson,
  FileSpreadsheet,
} from "lucide-react";

interface DatabaseOverview {
  stats: {
    totalUsers: number;
    totalAccounts: number;
    totalTransactions: number;
    totalReserves: number;
  };
  users: Array<{
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    aadhaarNo: string;
    createdAt: string;
  }>;
  accounts: Array<{
    accountNo: number;
    userId: number;
    accountType: string;
    balance: number;
    status: string;
  }>;
  transactions: Array<{
    id: number;
    senderAccount: number | null;
    receiverAccount: number | null;
    amount: number;
    txType: string;
    remark: string | null;
    createdAt: string;
  }>;
}

export default function AdminDatabasePage() {
  const [data, setData] = useState<DatabaseOverview | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"users" | "accounts" | "transactions">("users");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");

  const fetchData = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/admin/database/overview");
      const json = await res.json();
      if (!res.ok || json.error) {
        setErrorMsg(json.error || "Failed to load database overview.");
      } else {
        setData(json);
      }
    } catch {
      setErrorMsg("Network error connecting to database overview endpoint.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredUsers =
    data?.users.filter(
      (u) =>
        u.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.aadhaarNo.includes(searchTerm)
    ) || [];

  const filteredAccounts =
    data?.accounts.filter(
      (a) =>
        String(a.accountNo).includes(searchTerm) ||
        String(a.userId).includes(searchTerm) ||
        a.accountType.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const filteredTransactions =
    data?.transactions.filter(
      (t) =>
        String(t.senderAccount).includes(searchTerm) ||
        String(t.receiverAccount).includes(searchTerm) ||
        (t.remark || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.txType.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header & Back Link */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 mb-2 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold flex items-center gap-2.5">
              <Database className="w-7 h-7 text-blue-600 dark:text-blue-400" />
              <span>Database Management Portal</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Live database inspection, records ledger, and on-demand JSON/CSV data backup
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={fetchData}
              disabled={loading}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>

            <a
              href="/api/admin/database/export?format=json"
              download
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition"
            >
              <FileJson className="w-4 h-4" />
              <span>Export Full JSON</span>
            </a>

            <a
              href="/api/admin/database/export?format=csv"
              download
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export CSV</span>
            </a>
          </div>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/50 text-sm">
            {errorMsg}
          </div>
        )}

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bank-card p-4">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] uppercase tracking-wider font-semibold">
                Total Customers
              </span>
              <Users className="w-4 h-4 text-blue-500" />
            </div>
            <span className="text-2xl font-black">{data?.stats.totalUsers ?? 0}</span>
          </div>

          <div className="bank-card p-4">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] uppercase tracking-wider font-semibold">
                Bank Accounts
              </span>
              <CreditCard className="w-4 h-4 text-emerald-500" />
            </div>
            <span className="text-2xl font-black">{data?.stats.totalAccounts ?? 0}</span>
          </div>

          <div className="bank-card p-4">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] uppercase tracking-wider font-semibold">
                Transactions Logged
              </span>
              <Receipt className="w-4 h-4 text-indigo-500" />
            </div>
            <span className="text-2xl font-black">{data?.stats.totalTransactions ?? 0}</span>
          </div>

          <div className="bank-card p-4">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] uppercase tracking-wider font-semibold">
                Total Bank Reserves
              </span>
              <HardDrive className="w-4 h-4 text-purple-500" />
            </div>
            <span className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400">
              ₹{(data?.stats.totalReserves ?? 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>

        {/* Tabs & Search Filter */}
        <div className="bank-card p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setActiveTab("users")}
                className={`px-4 py-1.5 rounded-lg transition ${
                  activeTab === "users"
                    ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-sm"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                Customers ({data?.users.length ?? 0})
              </button>
              <button
                onClick={() => setActiveTab("accounts")}
                className={`px-4 py-1.5 rounded-lg transition ${
                  activeTab === "accounts"
                    ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-sm"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                Accounts ({data?.accounts.length ?? 0})
              </button>
              <button
                onClick={() => setActiveTab("transactions")}
                className={`px-4 py-1.5 rounded-lg transition ${
                  activeTab === "transactions"
                    ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-sm"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                Transactions Ledger ({data?.transactions.length ?? 0})
              </button>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search records..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            {activeTab === "users" && (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider">
                    <th className="py-2.5 px-3">User ID</th>
                    <th className="py-2.5 px-3">Full Name</th>
                    <th className="py-2.5 px-3">Email Address</th>
                    <th className="py-2.5 px-3">Aadhaar (UIDAI)</th>
                    <th className="py-2.5 px-3 text-right">Registered At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 font-sans">
                        No customers found matching search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 font-bold text-blue-600 dark:text-blue-400">
                          #{u.id}
                        </td>
                        <td className="py-2.5 px-3 font-sans font-semibold text-slate-800 dark:text-slate-200">
                          {u.firstName} {u.lastName}
                        </td>
                        <td className="py-2.5 px-3 font-sans text-slate-600 dark:text-slate-300">
                          {u.email}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500">{u.aadhaarNo}</td>
                        <td className="py-2.5 px-3 text-right text-slate-400 font-sans text-[11px]">
                          {new Date(u.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {activeTab === "accounts" && (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider">
                    <th className="py-2.5 px-3">Account Number</th>
                    <th className="py-2.5 px-3">User ID</th>
                    <th className="py-2.5 px-3">Account Type</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Live Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                  {filteredAccounts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 font-sans">
                        No accounts found.
                      </td>
                    </tr>
                  ) : (
                    filteredAccounts.map((a) => (
                      <tr key={a.accountNo} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 font-bold text-blue-600 dark:text-blue-400">
                          #{a.accountNo}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500">User #{a.userId}</td>
                        <td className="py-2.5 px-3 font-sans font-semibold">{a.accountType}</td>
                        <td className="py-2.5 px-3 font-sans">
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                            {a.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-white text-sm">
                          ₹{a.balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {activeTab === "transactions" && (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider">
                    <th className="py-2.5 px-3">Tx ID</th>
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Sender</th>
                    <th className="py-2.5 px-3">Receiver</th>
                    <th className="py-2.5 px-3">Remark</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 font-sans">
                        No transactions found.
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 text-slate-500 font-bold">#{t.id}</td>
                        <td className="py-2.5 px-3 font-sans text-slate-400 text-[11px]">
                          {new Date(t.createdAt).toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="py-2.5 px-3 font-sans font-semibold">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              t.txType === "DEPOSIT"
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                                : t.txType === "WITHDRAWAL"
                                ? "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                                : "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
                            }`}
                          >
                            {t.txType}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                          {t.senderAccount ? `#${t.senderAccount}` : "EXTERNAL"}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                          {t.receiverAccount ? `#${t.receiverAccount}` : "CASH/ATM"}
                        </td>
                        <td className="py-2.5 px-3 font-sans text-slate-500">{t.remark || "—"}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-white">
                          ₹{t.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
