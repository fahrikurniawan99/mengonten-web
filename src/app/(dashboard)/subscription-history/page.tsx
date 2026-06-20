"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import type { ApiResponse, SubscriptionHistory, SubscriptionCheck } from "@/lib/types";

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(dateStr));
}

function daysRemaining(endDate: string): number {
  const end = new Date(endDate);
  const now = new Date();
  const diff = end.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default function SubscriptionHistoryPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [history, setHistory] = useState<SubscriptionHistory[]>([]);
  const [activeSub, setActiveSub] = useState<SubscriptionCheck | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;

    Promise.all([
      api.get<ApiResponse<SubscriptionCheck>>("/api/subscription/check"),
      api.get<ApiResponse<SubscriptionHistory[]>>("/api/subscription/history"),
    ])
      .then(([checkRes, histRes]) => {
        if (checkRes.status && checkRes.data) {
          setActiveSub(checkRes.data);
        }
        if (histRes.status && histRes.data) {
          setHistory(histRes.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <svg className="h-8 w-8 animate-spin text-red-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Riwayat Langganan</h1>
        <p className="mt-1 text-sm text-white/40">Status dan riwayat langganan Anda</p>
      </div>

      {/* Active subscription banner */}
      {activeSub?.has_active && activeSub.subscription && (
        <div className="relative overflow-hidden rounded-2xl border border-green-500/20 bg-green-500/5 p-6">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-green-500/10 blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-semibold tracking-wider uppercase text-green-400">Langganan Aktif</span>
            </div>
            <h3 className="text-xl font-bold text-white">
              {activeSub.subscription.plan?.name || "Langganan"}
            </h3>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-white/50">
              <span className="flex items-center gap-1.5">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
                {formatDate(activeSub.subscription.start_date)} — {formatDate(activeSub.subscription.end_date)}
              </span>
              <span className="flex items-center gap-1.5 text-green-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {daysRemaining(activeSub.subscription.end_date)} hari tersisa
              </span>
            </div>
          </div>
        </div>
      )}

      {!activeSub?.has_active && (
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 text-center">
          <p className="text-sm text-white/40">Anda belum memiliki langganan aktif.</p>
        </div>
      )}

      {/* History list */}
      <div>
        <h2 className="mb-4 text-sm font-semibold tracking-wider uppercase text-white/50">Semua Langganan</h2>
        {history.length === 0 ? (
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] py-12 text-center">
            <svg className="mx-auto h-12 w-12 text-white/10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="mt-4 text-sm text-white/30">Belum ada riwayat langganan</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((sub) => {
              const isActive = sub.status === "active";
              const remaining = daysRemaining(sub.end_date);
              return (
                <div
                  key={sub.id}
                  className={`rounded-2xl border p-5 transition-all duration-200 ${
                    isActive
                      ? "border-green-500/20 bg-green-500/[0.03]"
                      : "border-white/5 bg-white/[0.02] hover:border-white/10"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="truncate text-sm font-semibold text-white">
                          {sub.plan?.name || "Langganan"}
                        </h3>
                        {isActive ? (
                          <span className="shrink-0 inline-flex items-center gap-1 rounded-full border border-green-500/20 bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                            Aktif
                          </span>
                        ) : (
                          <span className="shrink-0 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs font-medium text-white/30">
                            Selesai
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-xs text-white/40">
                        {formatDate(sub.start_date)} — {formatDate(sub.end_date)}
                      </p>
                    </div>
                    {isActive && (
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-400">{remaining}</p>
                        <p className="text-xs text-white/30">hari</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
