"use client";

import Link from "next/link";

export default function RegisterSuccessPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10">
          <svg className="h-10 w-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-white">
          Pendaftaran Berhasil!
        </h1>

        <p className="mt-3 max-w-xs text-sm text-white/40">
          Kami telah mengirimkan email verifikasi ke alamat email Anda. Silakan cek inbox atau folder spam.
        </p>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <div className="flex items-start gap-3">
          <svg className="mt-0.5 h-5 w-5 shrink-0 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <div className="text-sm text-white/50">
            <p className="font-medium text-white/70">Verifikasi diperlukan</p>
            <p className="mt-1">
              Buka email Anda dan klik link verifikasi untuk mengaktifkan akun. Link ini berlaku selama 24 jam.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Link
          href="/login"
          className="block w-full rounded-xl bg-gradient-to-r from-red-600 to-red-700 px-4 py-3.5 text-center text-sm font-semibold text-white shadow-lg shadow-red-600/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-red-600/30"
        >
          Masuk
        </Link>
        <Link
          href="/verify-email"
          className="block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-center text-sm font-medium text-white/70 transition-all duration-300 hover:border-white/20 hover:bg-white/10 hover:text-white"
        >
          Kirim Ulang Verifikasi
        </Link>
      </div>

      <p className="text-center text-sm text-white/30">
        <Link
          href="/"
          className="font-medium text-red-400 transition-colors duration-200 hover:text-red-300"
        >
          Kembali ke beranda
        </Link>
      </p>
    </div>
  );
}
