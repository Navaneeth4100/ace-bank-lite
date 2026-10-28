import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  ShieldCheck,
  Zap,
  ArrowRight,
  Wallet,
  Lock,
  Building2,
  TrendingUp,
  Percent,
  CheckCircle2,
  PhoneCall,
  Clock,
  BadgeCheck,
  CreditCard,
  Database,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />

      {/* Live Market Interest Rates Ticker */}
      <div className="bg-blue-600 text-white text-xs font-semibold py-2 px-4 overflow-x-auto whitespace-nowrap border-b border-blue-700">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Savings A/C: <strong>6.50% p.a.</strong></span>
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:flex items-center gap-1.5">
              <Percent className="w-3.5 h-3.5" />
              <span>Fixed Deposits: <strong>7.25% p.a.</strong></span>
            </span>
            <span className="hidden md:inline">•</span>
            <span className="hidden md:flex items-center gap-1.5">
              <span>Personal Loans from: <strong>10.50%</strong></span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-[11px] font-mono">LIVE RATES • DICGC INSURED UP TO ₹5,00,000</span>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-20">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-6 fade-in-up">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
            <BadgeCheck className="w-4 h-4 text-blue-600" />
            <span>Regulated Digital Banking • Trusted by 2M+ Account Holders</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-950 dark:text-white">
            Next-Generation <span className="text-blue-600 dark:text-blue-400">Digital Banking</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Experience real-time transfers, high-yield digital savings, virtual platinum debit cards,
            and instant statements with zero hidden charges.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/sign-up"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02]"
            >
              <span>Open Savings Account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition"
            >
              <span>Internet Banking Login</span>
            </Link>
          </div>

          <div className="pt-4 flex items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Instant 8-Digit Account</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Zero Account Opening Fee</span>
            </span>
            <span className="hidden sm:flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>256-Bit SSL Encrypted</span>
            </span>
          </div>
        </div>

        {/* Banking Products Grid */}
        <div className="space-y-6">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold">Complete Banking Solutions</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Engineered with safety, speed, and transparency at the core
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            <div className="bank-card p-6 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Wallet className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold">High-Yield Savings</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Earn up to 6.50% annual interest on your balance with daily calculation and quarterly payouts directly into your account.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800 text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center justify-between">
                <span>Zero Minimum Balance</span>
                <span className="font-mono">6.50% p.a.</span>
              </div>
            </div>

            <div className="bank-card p-6 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <CreditCard className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold">Platinum Virtual Card</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Instant virtual debit card issuance with custom limits, dynamic CVV, and 1-click temporary freeze protection for safe online transactions.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
                <span>Free Virtual Card</span>
                <span>Chip & PIN</span>
              </div>
            </div>

            <div className="bank-card p-6 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold">Atomic 24x7 IMPS Transfers</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Instant fund transfers with ACID transactional guarantees. No delay, zero charge, and real-time ledger statement reflection.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800 text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center justify-between">
                <span>Instant Settlement</span>
                <span>24/7 Available</span>
              </div>
            </div>
          </div>
        </div>

        {/* Security & Regulatory Compliance Banner */}
        <div className="bank-card p-8 bg-gradient-to-r from-blue-900 to-slate-900 text-white border-none shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-2 space-y-3">
              <span className="text-[10px] uppercase font-bold tracking-widest text-blue-300">
                Institutional Grade Security
              </span>
              <h3 className="text-2xl font-bold">Your deposits are protected with bank-grade encryption</h3>
              <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
                Every transaction is backed by 256-bit cryptographic hashing, automated daily withdrawal safeguards,
                and FDIC/DICGC insurance parity for complete peace of mind.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col gap-3 justify-end">
              <Link
                href="/admin/database"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white text-slate-900 font-bold text-xs hover:bg-slate-100 transition shadow"
              >
                <Database className="w-4 h-4 text-blue-600" />
                <span>Inspect Database Records</span>
              </Link>
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-500 transition"
              >
                <span>Get Started in 2 Minutes</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Commercial Corporate Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-12 text-xs text-slate-500 dark:text-slate-400 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                Banking Products
              </h4>
              <ul className="space-y-2">
                <li><Link href="/sign-up" className="hover:underline">Savings Account</Link></li>
                <li><Link href="/sign-up" className="hover:underline">Fixed Deposit (FD)</Link></li>
                <li><Link href="/login" className="hover:underline">Platinum Debit Card</Link></li>
                <li><Link href="/login" className="hover:underline">Personal Loan</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                Digital Services
              </h4>
              <ul className="space-y-2">
                <li><Link href="/login" className="hover:underline">Internet Banking</Link></li>
                <li><Link href="/dashboard/statement" className="hover:underline">Account Statements</Link></li>
                <li><Link href="/admin/database" className="hover:underline">Database Management</Link></li>
                <li><Link href="/forgot-password" className="hover:underline">Forgot Account ID</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                Security & Trust
              </h4>
              <ul className="space-y-2">
                <li><span>256-Bit SSL Enforced</span></li>
                <li><span>BCrypt Salt-12 Storage</span></li>
                <li><span>DICGC Insured Member</span></li>
                <li><span>Audit Trail CSV Ledger</span></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                Headquarters
              </h4>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                Ace Digital Banking Corp.<br />
                Plot 42, Cybercity Financial District, BKC, Mumbai - 400051<br />
                Toll Free: 1800-425-BANK
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
            <p>© 2026 AceBank Corporation Ltd. All rights reserved. Deployed for high performance on Vercel.</p>
            <p>Member DICGC. Deposits insured up to ₹5,00,000 per depositor.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
