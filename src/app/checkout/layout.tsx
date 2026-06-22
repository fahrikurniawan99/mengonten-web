"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import logoIcon from "@/assets/images/logo.png";

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <svg className="h-8 w-8 animate-spin text-red-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src={logoIcon} alt="Mengonten" className="h-8 w-auto" priority />
            <span className="text-lg font-bold tracking-tight text-slate-900">Mengonten</span>
          </Link>
          {user && (
            <div className="flex items-center gap-3">
              <Link href="/workspace" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900">
                Workspace
              </Link>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-700 text-xs font-bold text-white">
                {user.username.charAt(0).toUpperCase()}
              </div>
            </div>
          )}
        </div>
      </nav>
      <main className="mx-auto max-w-5xl px-6 py-10">
        {children}
      </main>
    </div>
  );
}
