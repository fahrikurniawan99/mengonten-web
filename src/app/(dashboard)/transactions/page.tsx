"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import type { ApiResponse, Transaction } from "@/lib/types";

function formatPrice(price: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateStr));
}

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: "Menunggu", color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
  paid: { label: "Lunas", color: "bg-green-500/10 text-green-400 border-green-500/20" },
  expired: { label: "Kadaluarsa", color: "bg-white/5 text-white/40 border-white/10" },
  cancelled: { label: "Dibatalkan", color: "bg-red-500/10 text-red-400 border-red-500/20" },
};

export default function TransactionsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    api
      .get<ApiResponse<Transaction[]>>("/api/transactions")
      .then((res) => {
        if (res.status && res.data) {
          setTransactions(res.data);
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
        <h1 className="text-2xl font-bold tracking-tight text-white">Transaksi</h1>
        <p className="mt-1 text-sm text-white/40">Riwayat transaksi langganan Anda</p>
      </div>

      {transactions.length === 0 ? (
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] py-16 text-center">
          <svg className="mx-auto h-12 w-12 text-white/10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
          </svg>
          <p className="mt-4 text-sm text-white/30">Belum ada transaksi</p>
        </div>
      ) : (
        <div className="space-y-4">
          {transactions.map((tx) => {
            const st = statusConfig[tx.status] || statusConfig.pending;
            return (
              <div
                key={tx.id}
                className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 transition-all duration-200 hover:border-white/10"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="truncate text-sm font-semibold text-white">
                        {tx.plan?.name || "Langganan"}
                      </h3>
                      <span className={`shrink-0 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${st.color}`}>
                        {st.label}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-white/30">{formatDate(tx.created_at)}</p>
                    {tx.bank_account && (
                      <p className="mt-2 text-xs text-white/40">
                        {tx.bank_account.bank_name} — {tx.bank_account.account_name} ({tx.bank_account.account_number})
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-white">{formatPrice(tx.amount)}</p>
                    {tx.plan?.duration_days && (
                      <p className="text-xs text-white/30">{tx.plan.duration_days} hari</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
