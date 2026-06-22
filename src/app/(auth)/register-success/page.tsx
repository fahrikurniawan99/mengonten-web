"use client";

import Link from "next/link";

export default function RegisterSuccessPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-50">
          <svg className="h-10 w-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Pendaftaran Berhasil!</h1>
        <p className="mt-3 max-w-xs text-sm text-slate-500">
          Kami telah mengirimkan email verifikasi ke alamat email Anda. Silakan cek inbox atau folder spam.
        </p>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
        <div className="flex items-start gap-3">
          <svg className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <div className="text-sm text-slate-600">
            <p className="font-medium text-slate-700">Verifikasi diperlukan</p>
            <p className="mt-1">Buka email Anda dan klik link verifikasi untuk mengaktifkan akun. Link ini berlaku selama 24 jam.</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Link href="/login" className="block w-full rounded-xl bg-red-600 px-4 py-3.5 text-center text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-red-700 hover:shadow-md">
          Masuk
        </Link>
        <Link href="/verify-email" className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-center text-sm font-medium text-slate-700 transition-all duration-200 hover:bg-slate-50">
          Kirim Ulang Verifikasi
        </Link>
      </div>

      <p className="text-center text-sm text-slate-400">
        <Link href="/" className="font-medium text-red-600 transition-colors hover:text-red-700">
          Kembali ke beranda
        </Link>
      </p>
    </div>
  );
}
