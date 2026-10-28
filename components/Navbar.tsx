"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, KeyRound } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

interface NavbarProps {
  user?: {
    firstName: string;
    accountNumber: number;
  } | null;
}

export default function Navbar({ user }: NavbarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login?msg=logged_out");
      router.refresh();
    } catch (err) {
      console.error("Logout failed:", err);
      router.push("/login");
    }
  };

  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href={user ? "/dashboard" : "/"} className="logo-text text-slate-900 dark:text-white">
          Ace<span>Bank</span>
        </Link>

        <nav className="flex items-center gap-3 sm:gap-4">
          <ThemeToggle />

          {user ? (
            <>
              <Link
                href="/dashboard/change-password"
                className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
              >
                <KeyRound className="w-4 h-4" />
                <span>Reset Password</span>
              </Link>

              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 px-3 py-1.5 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition px-3 py-1.5"
              >
                Login
              </Link>
              <Link
                href="/sign-up"
                className="text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition shadow-sm"
              >
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
