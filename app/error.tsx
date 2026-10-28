"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("System Runtime Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0b0f19] px-4 py-16 text-slate-900 dark:text-slate-100 transition-colors">
      <div className="bank-card max-w-md w-full text-center p-8 shadow-xl fade-in-up">
        <div className="w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <p className="text-5xl font-extrabold text-rose-500 mb-2">500</p>
        <h2 className="text-2xl font-bold mb-2">Internal Server Error</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Our banking systems are experiencing a temporary hiccup. Our engineers have been notified.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try Again</span>
          </button>

          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl font-semibold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition text-sm"
          >
            <span>Return to Secure Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
