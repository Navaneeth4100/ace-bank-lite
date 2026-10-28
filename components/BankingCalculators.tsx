"use client";

import { useState } from "react";
import { Calculator, Percent, PiggyBank, BadgePercent } from "lucide-react";

export default function BankingCalculators() {
  const [activeTab, setActiveTab] = useState<"fd" | "emi">("fd");

  // FD States
  const [fdAmount, setFdAmount] = useState<number>(50000);
  const [fdMonths, setFdMonths] = useState<number>(12);
  const fdRate = 7.25; // 7.25% p.a.
  const fdInterest = (fdAmount * fdRate * (fdMonths / 12)) / 100;
  const fdMaturity = fdAmount + fdInterest;

  // EMI States
  const [loanAmount, setLoanAmount] = useState<number>(200000);
  const [loanYears, setLoanYears] = useState<number>(3);
  const loanRate = 10.5; // 10.5% p.a.
  const monthlyRate = loanRate / 12 / 100;
  const totalMonths = loanYears * 12;
  const emi =
    (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
    (Math.pow(1 + monthlyRate, totalMonths) - 1);
  const totalPayment = emi * totalMonths;
  const totalInterest = totalPayment - loanAmount;

  return (
    <div className="bank-card p-6">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-base font-bold">Banking Tools & Calculators</h3>
        </div>

        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs font-semibold">
          <button
            onClick={() => setActiveTab("fd")}
            className={`px-3 py-1 rounded-md transition ${
              activeTab === "fd"
                ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-sm"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            Fixed Deposit
          </button>
          <button
            onClick={() => setActiveTab("emi")}
            className={`px-3 py-1 rounded-md transition ${
              activeTab === "emi"
                ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-sm"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            Loan EMI
          </button>
        </div>
      </div>

      {activeTab === "fd" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-500">Deposit Amount</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  ₹{fdAmount.toLocaleString("en-IN")}
                </span>
              </div>
              <input
                type="range"
                min={10000}
                max={1000000}
                step={10000}
                value={fdAmount}
                onChange={(e) => setFdAmount(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-500">Tenure (Months)</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {fdMonths} Months
                </span>
              </div>
              <input
                type="range"
                min={3}
                max={60}
                step={3}
                value={fdMonths}
                onChange={(e) => setFdMonths(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>

            <div className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              <BadgePercent className="w-4 h-4" />
              <span>Interest Rate: {fdRate}% p.a. Compounded Annually</span>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200 dark:border-slate-700 flex flex-col justify-between h-full">
            <div>
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                Est. Maturity Value
              </span>
              <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">
                ₹{Math.round(fdMaturity).toLocaleString("en-IN")}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 text-xs">
              <div>
                <span className="text-slate-400 block">Total Interest</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  + ₹{Math.round(fdInterest).toLocaleString("en-IN")}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Invested Principal</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  ₹{fdAmount.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-500">Loan Amount</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  ₹{loanAmount.toLocaleString("en-IN")}
                </span>
              </div>
              <input
                type="range"
                min={50000}
                max={2500000}
                step={25000}
                value={loanAmount}
                onChange={(e) => setLoanAmount(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-500">Tenure (Years)</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {loanYears} Years ({totalMonths} Months)
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={15}
                step={1}
                value={loanYears}
                onChange={(e) => setLoanYears(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>

            <div className="inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-semibold">
              <Percent className="w-4 h-4" />
              <span>Personal Loan Rate: {loanRate}% p.a. Fixed</span>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200 dark:border-slate-700 flex flex-col justify-between h-full">
            <div>
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                Monthly Repayment (EMI)
              </span>
              <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">
                ₹{Math.round(emi).toLocaleString("en-IN")}{" "}
                <span className="text-xs text-slate-400 font-normal">/month</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 text-xs">
              <div>
                <span className="text-slate-400 block">Total Interest</span>
                <span className="font-bold text-rose-500">
                  ₹{Math.round(totalInterest).toLocaleString("en-IN")}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Total Payable</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  ₹{Math.round(totalPayment).toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
