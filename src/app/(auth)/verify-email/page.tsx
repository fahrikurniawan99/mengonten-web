"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import type { ApiResponse } from "@/lib/types";
import { useToast } from "@/lib/toast-context";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { showToast } = useToast();

  const [status, setStatus] = useState<"verifying" | "success" | "error" | "resend">(
    token ? "verifying" : "resend"
  );
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (!token) return;

    api
      .post<ApiResponse<null>>("/api/auth/verify-email", { token })
      .then((res) => {
        if (res.status) {
          setStatus("success");
          const msg = res.message || "Email berhasil diverifikasi!";
          setMessage(msg);
          showToast(msg, "success");
        } else {
          setStatus("error");
          const msg = res.message || "Token tidak valid atau sudah kedaluwarsa.";
          setMessage(msg);
          showToast(msg, "error");
        }
      })
      .catch((err) => {
        setStatus("error");
        if (err instanceof ApiError) {
          setMessage(err.message);
          showToast(err.message, "error");
        } else {
          setMessage("Gagal memverifikasi email.");
          showToast("Gagal memverifikasi email.", "error");
        }
      });
  }, [token, showToast]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cooldown > 0 || !email) return;

    setIsSubmitting(true);

    try {
      const res = await api.post<ApiResponse<null>>("/api/auth/resend-verification", { email });
      if (res.status) {
        const msg = res.message || "Email verifikasi telah dikirim! Cek inbox Anda.";
        setMessage(msg);
        showToast(msg, "success");
        setCooldown(300);
      } else {
        const msg = res.message || "Gagal mengirim email verifikasi.";
        setMessage(msg);
        showToast(msg, "error");
      }
    } catch (err) {
      if (err instanceof ApiError) {
        showToast(err.message, "error");
        if (err.status === 429) {
          setCooldown(300);
        }
      } else {
        showToast("Terjadi kesalahan, coba lagi.", "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Verifikasi Email
        </h1>
        <p className="text-sm text-white/40">
          {token
            ? "Sedang memverifikasi email Anda..."
            : "Masukkan email Anda untuk mengirim ulang link verifikasi."}
        </p>
      </div>

      {/* Verifying state */}
      {status === "verifying" && (
        <div className="flex flex-col items-center justify-center py-12">
          <svg className="h-10 w-10 animate-spin text-red-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="mt-4 text-sm text-white/40">Memverifikasi...</p>
        </div>
      )}

      {/* Success state */}
      {status === "success" && (
        <div className="space-y-6">
          <div className="flex flex-col items-center py-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
              <svg className="h-8 w-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <p className="mt-4 text-center text-sm text-white/60">{message}</p>
          </div>
          <Link
            href="/login"
            className="block w-full rounded-xl bg-gradient-to-r from-red-600 to-red-700 px-4 py-3.5 text-center text-sm font-semibold text-white shadow-lg shadow-red-600/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-red-600/30"
          >
            Masuk
          </Link>
        </div>
      )}

      {/* Error state */}
      {status === "error" && (
        <div className="space-y-6">
          <div className="flex flex-col items-center py-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
              <svg className="h-8 w-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <p className="mt-4 text-center text-sm text-white/60">{message}</p>
          </div>
          <button
            onClick={() => setStatus("resend")}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm font-medium text-white/70 transition-all duration-300 hover:border-white/20 hover:bg-white/10 hover:text-white"
          >
            Kirim Ulang Verifikasi
          </button>
        </div>
      )}

      {/* Resend form */}
      {status === "resend" && (
        <form onSubmit={handleResend} className="space-y-5">
          <div>
            <label htmlFor="email" className="auth-label">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              className="auth-input"
              autoComplete="email"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || cooldown > 0}
            className="w-full rounded-xl bg-gradient-to-r from-red-600 to-red-700 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-red-600/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-red-600/30 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {cooldown > 0
              ? `Tunggu ${Math.floor(cooldown / 60)}:${String(cooldown % 60).padStart(2, "0")}`
              : isSubmitting
                ? "Mengirim..."
                : "Kirim Ulang"}
          </button>
        </form>
      )}

      <p className="text-center text-sm text-white/30">
        <Link
          href="/login"
          className="font-medium text-red-400 transition-colors duration-200 hover:text-red-300"
        >
          Kembali ke login
        </Link>
      </p>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <svg className="h-8 w-8 animate-spin text-red-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
