import Link from "next/link";
import Navbar from "@/components/Navbar";
import { ShieldCheck, Zap, ArrowRight, Wallet, ArrowUpRight, Lock } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 flex flex-col items-center justify-center">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-6 fade-in-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
            <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse"></span>
            Trusted by 2M+ Users
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
            Banking Made <span className="text-blue-600 dark:text-blue-400">Easy</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Join over 40,000 people who open an Ace Bank account every week. Manage,
            spend, and save your money with confidence and zero friction.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/sign-up"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02]"
            >
              <span>Open Account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition"
            >
              <span>Login to Account</span>
            </Link>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 sm:mt-24 w-full">
          <div className="bank-card p-6 flex flex-col gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold">Instant Fund Transfers</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Send money to any Ace Bank account seamlessly with real-time balance updates and zero fees.
            </p>
          </div>

          <div className="bank-card p-6 flex flex-col gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold">Bank-Grade Security</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              BCrypt-hashed passwords, 12-digit Aadhaar verification, and atomic ACID database guarantees.
            </p>
          </div>

          <div className="bank-card p-6 flex flex-col gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Wallet className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold">Smart Account Limits</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Built-in daily withdrawal guards and complete audit statement export in CSV format.
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        © 2026 AceBank Inc. All rights reserved. Built for high performance on Vercel.
      </footer>
    </div>
  );
}
