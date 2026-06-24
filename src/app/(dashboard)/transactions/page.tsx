"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import type { ApiResponse, Transaction, TransactionDetailResponse, TransactionPhotoDetail } from "@/lib/types";

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

function formatDateShort(dateStr: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(dateStr));
}

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  pending: { label: "Menunggu", color: "bg-yellow-50 text-yellow-600 border-yellow-200", dot: "bg-yellow-500" },
  paid: { label: "Lunas", color: "bg-green-50 text-green-600 border-green-200", dot: "bg-green-500" },
  expired: { label: "Kadaluarsa", color: "bg-slate-50 text-slate-500 border-slate-200", dot: "bg-slate-400" },
  cancelled: { label: "Dibatalkan", color: "bg-red-50 text-red-600 border-red-200", dot: "bg-red-500" },
};

const proofStatusConfig: Record<string, { label: string; color: string }> = {
  confirmed: { label: "Terverifikasi", color: "text-green-600" },
  pending: { label: "Menunggu Verifikasi", color: "text-yellow-600" },
  rejected: { label: "Ditolak", color: "text-red-600" },
};

export default function TransactionsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<TransactionDetailResponse | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

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

  const openDetail = async (id: string) => {
    setSelectedId(id);
    setDetail(null);
    setDetailLoading(true);
    try {
      const res = await api.get<ApiResponse<TransactionDetailResponse>>(`/api/transactions/${id}`);
      if (res.status && res.data) {
        setDetail(res.data);
      }
    } catch {
      // silent
    } finally {
      setDetailLoading(false);
    }
  };

  const backToList = () => {
    setSelectedId(null);
    setDetail(null);
  };

  const totalSpent = transactions
    .filter((tx) => tx.status === "paid")
    .reduce((sum, tx) => sum + tx.amount, 0);

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

  // List view (default)
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Transaksi</h1>
        <p className="mt-1 text-sm text-slate-500">Riwayat transaksi langganan Anda</p>
      </div>

      {/* Stats */}
      {transactions.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs text-slate-400">Total Transaksi</p>
            <p className="mt-1 text-xl font-bold text-slate-900">{transactions.length}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs text-slate-400">Lunas</p>
            <p className="mt-1 text-xl font-bold text-green-600">{transactions.filter((tx) => tx.status === "paid").length}</p>
          </div>
          <div className="col-span-2 rounded-xl border border-slate-200 bg-white p-4 sm:col-span-1">
            <p className="text-xs text-slate-400">Total Pembayaran</p>
            <p className="mt-1 text-xl font-bold text-slate-900">{formatPrice(totalSpent)}</p>
          </div>
        </div>
      )}

      {transactions.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center">
          <svg className="mx-auto h-12 w-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
          </svg>
          <p className="mt-4 text-sm text-slate-400">Belum ada transaksi</p>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((tx) => {
            const st = statusConfig[tx.status] || statusConfig.pending;
            return (
              <button
                key={tx.id}
                onClick={() => openDetail(tx.id)}
                className="w-full rounded-xl border border-slate-200 bg-white p-4 text-left transition-colors hover:border-slate-300"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5">
                      <h3 className="truncate text-sm font-semibold text-slate-900">
                        {tx.plan?.name || "Langganan"}
                      </h3>
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${st.color}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
                        {st.label}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-400">{formatDateShort(tx.created_at)}</p>
                    {tx.bank_account && (
                      <p className="mt-1.5 text-xs text-slate-500">
                        {tx.bank_account.bank_name} — {tx.bank_account.account_name}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-base font-bold text-slate-900">{formatPrice(tx.amount)}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selectedId && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-4 pt-10 sm:pt-16" onClick={backToList}>
          <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" onClick={(e) => e.stopPropagation()}>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Detail Transaksi</h2>
              <button onClick={backToList} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {detailLoading ? (
              <div className="flex items-center justify-center py-16">
                <svg className="h-8 w-8 animate-spin text-red-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
            ) : detail ? (
              <div className="space-y-6">
                <div className="rounded-xl border border-slate-200 bg-white">
                  <div className="flex items-center justify-between border-b border-slate-100 p-4">
                    <div>
                      <p className="text-xs text-slate-400">Referensi</p>
                      <p className="mt-0.5 font-mono text-sm text-slate-900">{detail.transaction.reference_id}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${statusConfig[detail.transaction.status]?.color || statusConfig.pending.color}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${statusConfig[detail.transaction.status]?.dot || statusConfig.pending.dot}`} />
                      {statusConfig[detail.transaction.status]?.label || detail.transaction.status}
                    </span>
                  </div>

                  <div className="grid gap-4 p-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-slate-400">Nominal</p>
                      <p className="mt-0.5 text-lg font-bold text-slate-900">{formatPrice(detail.transaction.amount)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Total Bayar</p>
                      <p className="mt-0.5 text-lg font-bold text-slate-900">{formatPrice(detail.transaction.total_amount)}</p>
                    </div>
                    {detail.transaction.subscription_plan?.name && (
                      <div>
                        <p className="text-xs text-slate-400">Paket</p>
                        <p className="mt-0.5 text-sm font-medium text-slate-900">{detail.transaction.subscription_plan.name}</p>
                      </div>
                    )}
                    {detail.transaction.subscription_plan?.duration_days && (
                      <div>
                        <p className="text-xs text-slate-400">Durasi</p>
                        <p className="mt-0.5 text-sm text-slate-900">{detail.transaction.subscription_plan.duration_days} hari</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-slate-400">Tanggal</p>
                      <p className="mt-0.5 text-sm text-slate-900">{formatDate(detail.transaction.created_at)}</p>
                    </div>
                    {detail.transaction.paid_at && (
                      <div>
                        <p className="text-xs text-slate-400">Dibayar</p>
                        <p className="mt-0.5 text-sm text-slate-900">{formatDate(detail.transaction.paid_at)}</p>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-slate-100 p-4">
                    <p className="mb-2 text-xs text-slate-400">Pembayaran ke</p>
                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                      <p className="text-sm font-medium text-slate-900">{detail.transaction.bank_name}</p>
                      <p className="mt-0.5 font-mono text-sm text-slate-600">{detail.transaction.bank_account_number}</p>
                      <p className="text-xs text-slate-500">{detail.transaction.bank_account_name}</p>
                    </div>
                  </div>
                </div>

                {detail.payment_proof && (
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-4">
                      <h3 className="text-sm font-semibold text-slate-900">Bukti Pembayaran</h3>
                      {detail.payment_proof.status && (
                        <span className={`text-xs font-medium ${proofStatusConfig[detail.payment_proof.status]?.color || "text-slate-500"}`}>
                          {proofStatusConfig[detail.payment_proof.status]?.label || detail.payment_proof.status}
                        </span>
                      )}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-xs text-slate-400">Atas Nama</p>
                        <p className="mt-0.5 text-sm font-medium text-slate-900">{detail.payment_proof.account_name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Bank Pengirim</p>
                        <p className="mt-0.5 text-sm text-slate-900">{detail.payment_proof.source_bank}</p>
                      </div>
                    </div>

                    {detail.payment_proof.photos.length > 0 && (
                      <div className="mt-4">
                        <p className="mb-3 text-xs text-slate-400">Foto Bukti</p>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                          {detail.payment_proof.photos.map((photo: TransactionPhotoDetail, i: number) => (
                            <div key={i} className="group relative">
                              <img src={photo.photo_url} alt={`Bukti ${i + 1}`} className="aspect-square w-full rounded-xl border border-slate-200 object-cover" />
                              {photo.description && (
                                <p className="mt-1.5 text-xs text-slate-500">{photo.description}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {!detail.payment_proof && detail.transaction.status === "pending" && (
                  <div className="rounded-xl border border-slate-200 bg-yellow-50 p-4 text-center">
                    <p className="text-sm text-yellow-700">Menunggu pembayaran. Silakan transfer sesuai nominal dan unggah bukti pembayaran.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
                <p className="text-sm text-slate-400">Gagal memuat detail transaksi</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
