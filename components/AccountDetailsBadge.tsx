"use client";

import { useState } from "react";
import { Building2, Copy, Check, Shield, Award } from "lucide-react";

interface AccountDetailsBadgeProps {
  accountNumber: number;
}

export default function AccountDetailsBadge({ accountNumber }: AccountDetailsBadgeProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="bank-card p-5 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-sm font-bold tracking-tight">Branch & Account Information</h3>
        </div>
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
          <Shield className="w-3 h-3" />
          <span>KYC Verified</span>
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div>
          <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-0.5">
            IFSC Code
          </span>
          <div className="flex items-center gap-1 font-mono font-bold text-slate-800 dark:text-slate-200">
            <span>ACEB0001001</span>
            <button
              onClick={() => copyToClipboard("ACEB0001001", "ifsc")}
              type="button"
              className="text-slate-400 hover:text-blue-600 transition"
              title="Copy IFSC"
            >
              {copiedField === "ifsc" ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
        </div>

        <div>
          <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-0.5">
            MICR Code
          </span>
          <span className="font-mono font-bold text-slate-800 dark:text-slate-200">400240001</span>
        </div>

        <div>
          <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-0.5">
            Branch Name
          </span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            Mumbai Cybercity
          </span>
        </div>

        <div>
          <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-0.5">
            Account Scheme
          </span>
          <span className="font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
            <Award className="w-3.5 h-3.5" />
            <span>Tier-1 Advantage</span>
          </span>
        </div>
      </div>
    </div>
  );
}
