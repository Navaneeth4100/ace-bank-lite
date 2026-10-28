import Link from "next/link";
import Navbar from "@/components/Navbar";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="bank-card max-w-md w-full text-center p-8 shadow-xl fade-in-up">
          <p className="text-7xl font-extrabold text-rose-500 mb-2">404</p>
          <h2 className="text-2xl font-bold mb-3">Page Not Found</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
            The resource or URL you requested could not be located on our banking server.
          </p>

          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Secure Dashboard</span>
          </Link>
        </div>
      </main>
    </div>
  );
}
