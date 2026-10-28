"use client";

import { CheckCircle2, AlertCircle, X } from "lucide-react";

interface AlertBannerProps {
  type: "success" | "error";
  message: string;
  onClose?: () => void;
}

export default function AlertBanner({ type, message, onClose }: AlertBannerProps) {
  if (!message) return null;

  const isSuccess = type === "success";

  return (
    <div
      className={`p-4 rounded-xl flex items-start justify-between gap-3 text-sm font-medium transition-all ${
        isSuccess
          ? "bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50"
          : "bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/50"
      }`}
    >
      <div className="flex items-center gap-2.5">
        {isSuccess ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
        ) : (
          <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
        )}
        <span>{message}</span>
      </div>

      {onClose && (
        <button
          onClick={onClose}
          type="button"
          aria-label="Close alert"
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
