"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <svg className="h-8 w-8 animate-spin text-red-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  if (!user) return null;

  const statusColors: Record<string, string> = {
    active: "bg-green-50 text-green-600 border-green-200",
    suspended: "bg-yellow-50 text-yellow-600 border-yellow-200",
    deactivated: "bg-red-50 text-red-600 border-red-200",
  };

  const statusLabels: Record<string, string> = {
    active: "Aktif",
    suspended: "Ditangguhkan",
    deactivated: "Nonaktif",
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Profile</h1>
        <p className="mt-1 text-sm text-slate-500">Informasi akun Anda</p>
      </div>

      {/* Avatar & Name Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-4 sm:gap-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-red-700 text-xl font-bold text-white shadow-lg shadow-red-500/5 sm:h-20 sm:w-20 sm:text-2xl">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">{user.username}</h2>
            <p className="text-sm text-slate-500">{user.email}</p>
            <div className="mt-2 flex items-center gap-2">
              <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusColors[user.account_status] || statusColors.active}`}>
                {statusLabels[user.account_status] || user.account_status}
              </span>
              {user.is_verified ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-600">
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  Terverifikasi
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full border border-yellow-200 bg-yellow-50 px-2.5 py-0.5 text-xs font-medium text-yellow-600">
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                  Belum Verifikasi
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Warning message */}
      {user.warning_message && (
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
          <div className="flex items-start gap-3">
            <svg className="mt-0.5 h-5 w-5 shrink-0 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-yellow-600">Peringatan</p>
              <p className="mt-1 text-sm text-yellow-600/70">{user.warning_message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Detail Info */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="mb-5 text-sm font-semibold text-slate-500">Detail Akun</h3>
        <div className="space-y-4">
          <InfoRow label="Username" value={user.username} />
          <InfoRow label="Email" value={user.email} />
          <InfoRow label="Status" value={statusLabels[user.account_status] || user.account_status} />
          <InfoRow label="Email Verified" value={user.is_verified ? "Ya" : "Tidak"} />
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-200 last:border-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className={`text-sm text-slate-600 ${mono ? "font-mono text-xs" : ""}`}>{value}</span>
    </div>
  );
}
