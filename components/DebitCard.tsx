"use client";

import { useState } from "react";
import { CreditCard, Eye, EyeOff, ShieldCheck, Snowflake, Check, Copy } from "lucide-react";

interface DebitCardProps {
  firstName: string;
  lastName: string;
  accountNumber: number;
}

export default function DebitCard({ firstName, lastName, accountNumber }: DebitCardProps) {
  const [showCvv, setShowCvv] = useState<boolean>(false);
  const [isFrozen, setIsFrozen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Derive a deterministic 16-digit card number from the 8-digit account number
  const paddedAcc = String(accountNumber).padStart(8, "0");
  const cardNumber = `4532 8901 ${paddedAcc.slice(0, 4)} ${paddedAcc.slice(4, 8)}`;
  const cvv = String(Math.abs((accountNumber * 31) % 900) + 100);

  const copyCardNumber = () => {
    navigator.clipboard.writeText(cardNumber.replace(/\s+/g, ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* 3D Realistic Debit Card */}
      <div
        className={`relative w-full aspect-[1.586/1] rounded-2xl p-5 sm:p-6 text-white shadow-2xl transition-all duration-300 overflow-hidden ${
          isFrozen
            ? "bg-gradient-to-tr from-slate-700 via-slate-800 to-slate-900 filter grayscale"
            : "bg-gradient-to-tr from-slate-900 via-blue-950 to-indigo-900 border border-blue-500/20"
        }`}
      >
        {/* Holographic Sheen Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-400/10 via-transparent to-transparent pointer-events-none" />

        {/* Frozen Overlay Badge */}
        {isFrozen && (
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center gap-1.5">
            <Snowflake className="w-8 h-8 text-cyan-400 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-200">
              Card Temporarily Frozen
            </span>
          </div>
        )}

        <div className="relative z-10 flex flex-col justify-between h-full">
          {/* Card Top: Bank Name & Chip */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-lg sm:text-xl font-extrabold tracking-tight">
                Ace<span className="text-blue-400">Bank</span>
              </span>
              <span className="block text-[9px] font-semibold tracking-widest text-slate-400 uppercase">
                Platinum Debit
              </span>
            </div>

            {/* Contactless Icon */}
            <div className="flex items-center gap-1 text-slate-300">
              <svg className="w-5 h-5 fill-current opacity-80" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" opacity=".2"/>
                <path d="M8.5 12c0-1.93 1.57-3.5 3.5-3.5s3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5-3.5-1.57-3.5-3.5zm7-7c-3.87 0-7 3.13-7 7s3.13 7 7 7 7-3.13 7-7-3.13-7-7-7z" opacity=".4"/>
              </svg>
            </div>
          </div>

          {/* EMV Chip */}
          <div className="w-10 h-7 rounded bg-gradient-to-r from-amber-200 to-amber-400 border border-amber-500/50 flex flex-col justify-between p-1 my-1 shadow-sm">
            <div className="w-full h-[1px] bg-amber-600/60" />
            <div className="w-full h-[1px] bg-amber-600/60" />
            <div className="w-full h-[1px] bg-amber-600/60" />
          </div>

          {/* 16-Digit Card Number */}
          <div className="flex items-center justify-between group">
            <span className="font-mono text-base sm:text-lg tracking-wider text-slate-100 font-bold select-all">
              {cardNumber}
            </span>
            <button
              onClick={copyCardNumber}
              type="button"
              title="Copy card number"
              className="text-slate-400 hover:text-white transition p-1 rounded"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Card Bottom: Cardholder, Expiry, CVV & Brand Logo */}
          <div className="flex items-end justify-between pt-1">
            <div>
              <span className="block text-[8px] font-semibold uppercase tracking-widest text-slate-400">
                Cardholder
              </span>
              <span className="font-semibold text-xs sm:text-sm tracking-wide uppercase">
                {firstName} {lastName}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div>
                <span className="block text-[8px] font-semibold uppercase tracking-widest text-slate-400">
                  Valid Thru
                </span>
                <span className="font-mono text-xs sm:text-sm font-semibold">10/29</span>
              </div>

              <div>
                <span className="block text-[8px] font-semibold uppercase tracking-widest text-slate-400">
                  CVV
                </span>
                <span className="font-mono text-xs sm:text-sm font-semibold flex items-center gap-1">
                  {showCvv ? cvv : "•••"}
                  <button
                    onClick={() => setShowCvv(!showCvv)}
                    type="button"
                    className="text-slate-400 hover:text-white"
                  >
                    {showCvv ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </button>
                </span>
              </div>

              {/* Visa / RuPay badge */}
              <div className="font-extrabold italic text-base sm:text-lg text-blue-300 tracking-tighter">
                VISA
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card Controls */}
      <div className="flex items-center justify-between px-1 text-xs">
        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>256-bit Chip & PIN Protected</span>
        </div>

        <button
          onClick={() => setIsFrozen(!isFrozen)}
          type="button"
          className={`px-3 py-1 rounded-full font-semibold transition flex items-center gap-1 ${
            isFrozen
              ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
              : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-300"
          }`}
        >
          <Snowflake className="w-3 h-3" />
          <span>{isFrozen ? "Unfreeze Card" : "Freeze Card"}</span>
        </button>
      </div>
    </div>
  );
}
