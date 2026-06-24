"use client";

import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { useToast } from "@/lib/toast-context";
import type { ApiResponse, SubscriptionPlan, BankAccount, TransactionPreview, Transaction } from "@/lib/types";

function formatPrice(price: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

type Step = "select" | "upload" | "done";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const planId = searchParams.get("plan_id");

  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);

  const [step, setStep] = useState<Step>("select");
  const [selectedBank, setSelectedBank] = useState<string>("");
  const [preview, setPreview] = useState<TransactionPreview | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);

  const [accountName, setAccountName] = useState("");
  const [sourceBank, setSourceBank] = useState("");
  const [sourceAccountNumber, setSourceAccountNumber] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [photoDescriptions, setPhotoDescriptions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    if (!planId) {
      showToast("Plan ID tidak ditemukan", "error");
      router.push("/");
      return;
    }

    Promise.all([
      api.get<ApiResponse<SubscriptionPlan[]>>("/api/subscription-plans"),
      api.get<ApiResponse<BankAccount[]>>("/api/bank-accounts"),
    ])
      .then(([plansRes, banksRes]) => {
        if (plansRes.status && plansRes.data) {
          const found = plansRes.data.find((p) => p.id === planId);
          if (found) {
            setPlan(found);
            setPhotoDescriptions([""]);
          } else {
            showToast("Paket tidak ditemukan", "error");
            router.push("/");
          }
        }
        if (banksRes.status && banksRes.data) {
          const activeBanks = banksRes.data.filter((b) => b.is_active);
          setBankAccounts(activeBanks);
          if (activeBanks.length > 0) {
            setSelectedBank(activeBanks[0].id);
          }
        }
      })
      .catch(() => {
        showToast("Gagal memuat data", "error");
      })
      .finally(() => setLoading(false));
  }, [planId]);

  // Countdown timer
  useEffect(() => {
    if (!preview) return;

    const expiresAt = new Date(preview.expires_at).getTime();
    const tick = () => {
      const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0) {
        showToast("Kode pembayaran kadaluarsa, silakan pilih ulang", "error");
        setStep("select");
        setPreview(null);
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [preview]);

  const handleGeneratePreview = async () => {
    if (!plan || !selectedBank) return;

    setIsSubmitting(true);
    try {
      const res = await api.post<ApiResponse<TransactionPreview>>("/api/transactions/preview", {
        subscription_plan_id: plan.id,
        bank_account_id: selectedBank,
      });

      if (res.status && res.data) {
        setPreview(res.data);
        setStep("upload");
      } else {
        showToast(res.message || "Gagal generate kode pembayaran", "error");
      }
    } catch (err) {
      if (err instanceof ApiError) {
        showToast(err.message, "error");
      } else {
        showToast("Terjadi kesalahan", "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + photos.length > 5) {
      showToast("Maksimal 5 foto", "error");
      return;
    }

    const newPhotos = [...photos, ...files].slice(0, 5);
    setPhotos(newPhotos);

    const newPreviews = newPhotos.map((f) => URL.createObjectURL(f));
    setPhotoPreviews(newPreviews);

    while (photoDescriptions.length < newPhotos.length) {
      setPhotoDescriptions((prev) => [...prev, ""]);
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    setPhotos(newPhotos);
    setPhotoDescriptions((prev) => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(photoPreviews[index]);
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast("Nomor rekening disalin", "success");
    } catch {
      showToast("Gagal menyalin", "error");
    }
  };

  const handleConfirm = async () => {
    if (!preview || photos.length === 0 || !accountName || !sourceBank) {
      showToast("Lengkapi semua data", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const confirmRes = await api.post<ApiResponse<Transaction>>("/api/transactions/confirm", {
        reference_id: preview.reference_id,
      });

      if (!confirmRes.status || !confirmRes.data) {
        showToast(confirmRes.message || "Gagal konfirmasi transaksi", "error");
        return;
      }

      const transactionId = confirmRes.data.id;

      const formData = new FormData();
      formData.append("account_name", accountName);
      formData.append("source_bank", sourceBank);
      if (sourceAccountNumber) {
        formData.append("source_account_number", sourceAccountNumber);
      }
      photos.forEach((photo) => formData.append("photos", photo));
      formData.append("descriptions", photoDescriptions.join(","));

      const proofRes = await api.postMultipart<ApiResponse<null>>(
        `/api/transactions/${transactionId}/payment-proof`,
        formData
      );

      if (proofRes.status) {
        showToast("Pembayaran berhasil dikonfirmasi!", "success");
        setStep("done");
        setTimeout(() => router.push("/transactions"), 2000);
      } else {
        showToast(proofRes.message || "Gagal upload bukti transfer", "error");
      }
    } catch (err) {
      if (err instanceof ApiError) {
        showToast(err.message, "error");
      } else {
        showToast("Terjadi kesalahan", "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <svg className="h-8 w-8 animate-spin text-red-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  if (!plan) return null;

  const selectedBankData = bankAccounts.find((b) => b.id === selectedBank);

  return (
    <div className="space-y-8">
      <div>
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-500 transition-colors hover:text-slate-900">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Kembali
        </Link>
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
          Checkout{preview ? <span className="ml-2">#{preview.reference_id}</span> : ""}
        </h1>
        <p className="mt-1 text-sm text-slate-500">Selesaikan pembayaran langganan Anda</p>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center gap-3">
        {[
          { key: "select", label: "Pilih Bank" },
          { key: "upload", label: "Upload Bukti" },
        ].map((s, i) => {
          const isActive = (step === "select" && i === 0) || (step === "upload" && i <= 1) || step === "done";
          const isCurrent = (step === "select" && i === 0) || (step === "upload" && i === 1) || (step === "done" && i === 1);
          return (
            <div key={s.key} className="flex items-center gap-3">
              {i > 0 && <div className={`h-px w-8 ${isActive ? "bg-red-500" : "bg-slate-200"}`} />}
              <div className="flex items-center gap-2">
                <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                  isCurrent ? "bg-red-500 text-white" : isActive ? "bg-red-50 text-red-500" : "bg-slate-50 text-slate-400"
                }`}>
                  {i + 1}
                </div>
                <span className={`text-xs font-medium ${isCurrent ? "text-slate-900" : isActive ? "text-slate-600" : "text-slate-400"}`}>
                  {s.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {step === "done" ? (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg className="h-8 w-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Transaksi Berhasil!</h2>
          <p className="mt-2 text-sm text-slate-500">Mengalihkan ke halaman transaksi...</p>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* Left side */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="mb-4 text-sm font-semibold text-slate-500">Detail Pesanan</h2>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{plan.name}</h3>
                  {plan.description && <p className="mt-1 text-sm text-slate-500">{plan.description}</p>}
                  <p className="mt-1 text-xs text-slate-400">{plan.duration_days} hari</p>
                </div>
                <p className="text-xl font-bold text-slate-900">{formatPrice(plan.final_price)}</p>
              </div>
            </div>

            {step === "select" && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              {bankAccounts.length === 0 ? (
                <p className="text-sm text-slate-400">Tidak ada rekening tersedia</p>
              ) : (
                <div className="space-y-3">
                  {bankAccounts.map((bank) => (
                    <label
                      key={bank.id}
                      className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-all ${
                        selectedBank === bank.id
                          ? "border-red-500 bg-red-50"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="bank"
                        value={bank.id}
                        checked={selectedBank === bank.id}
                        onChange={() => setSelectedBank(bank.id)}
                        className="sr-only"
                      />
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                        {bank.icon ? (
                          <Image src={bank.icon} alt={bank.bank_name} width={40} height={40} className="rounded-lg object-contain" />
                        ) : (
                          <span className="text-sm font-bold text-slate-500">{bank.bank_name.charAt(0)}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">{bank.bank_name}</p>
                      </div>
                      <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                        selectedBank === bank.id ? "border-red-500" : "border-slate-300"
                      }`}>
                        {selectedBank === bank.id && <div className="h-2.5 w-2.5 rounded-full bg-red-500" />}
                      </div>
                    </label>
                  ))}
                </div>
              )}

              <button
                onClick={handleGeneratePreview}
                disabled={isSubmitting || !selectedBank}
                className="mt-6 w-full rounded-xl bg-red-600 px-4 py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Generating...
                  </span>
                ) : (
                  "Lanjutkan"
                )}
              </button>
            </div>
            )}

            {/* Upload Proof (step 2) */}
            {step === "upload" && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <h2 className="mb-4 text-sm font-semibold text-slate-500">Bukti Transfer</h2>

                {selectedBankData && (
                  <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-3 flex items-center gap-3">
                      {selectedBankData.icon && (
                        <Image src={selectedBankData.icon} alt={selectedBankData.bank_name} width={32} height={32} className="rounded object-contain" />
                      )}
                      <span className="text-sm font-semibold text-slate-900">{selectedBankData.bank_name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-500">No. Rekening</p>
                        <p className="font-mono text-sm font-bold text-slate-900">{selectedBankData.account_number}</p>
                      </div>
                      <button onClick={() => copyToClipboard(selectedBankData.account_number)} className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100">
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                        </svg>
                        Salin
                      </button>
                    </div>
                    <div className="mt-2">
                      <p className="text-xs text-slate-500">Atas Nama</p>
                      <p className="text-sm font-medium text-slate-900">{selectedBankData.account_name}</p>
                    </div>
                    <button onClick={() => setShowInstructions(true)} className="mt-3 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100">
                      Lihat Instruksi Pembayaran
                    </button>
                    <button onClick={() => { setStep("select"); setPreview(null); }} className="mt-2 w-full rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-100">
                      Ubah Metode Pembayaran
                    </button>
                  </div>
                )}

                {showInstructions && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowInstructions(false)}>
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-slate-900">Instruksi Pembayaran</h3>
                        <button onClick={() => setShowInstructions(false)} className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600">
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <div className="space-y-3 text-sm text-slate-600">
                        <p>1. Transfer ke rekening tujuan sesuai nominal yang tertera.</p>
                        <p>2. Pastikan total transfer termasuk kode unik.</p>
                        <p>3. Upload bukti transfer pada form di bawah.</p>
                        <p>4. Tim kami akan memverifikasi pembayaran dalam 1x24 jam.</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="auth-label">Atas Nama Rekening</label>
                      <input
                        type="text"
                        required
                        value={accountName}
                        onChange={(e) => setAccountName(e.target.value)}
                        placeholder="Nama di rekening pengirim"
                        className="auth-input"
                      />
                    </div>
                    <div>
                      <label className="auth-label">Bank Pengirim</label>
                      <input
                        type="text"
                        required
                        value={sourceBank}
                        onChange={(e) => setSourceBank(e.target.value)}
                        placeholder="BCA, Mandiri, dll"
                        className="auth-input"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="auth-label">Nomor Rekening Pengirim</label>
                    <input
                      type="text"
                      value={sourceAccountNumber}
                      onChange={(e) => setSourceAccountNumber(e.target.value)}
                      placeholder="Opsional"
                      className="auth-input"
                    />
                  </div>

                  <div>
                    <label className="auth-label">Foto Bukti Transfer</label>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="flex cursor-pointer items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-200 bg-white py-8 transition-all hover:border-slate-300 hover:bg-slate-50"
                    >
                      <svg className="h-8 w-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                      </svg>
                      <div>
                        <p className="text-sm text-slate-500">Klik untuk upload (max 5 foto)</p>
                        <p className="mt-0.5 text-xs text-slate-400">JPG, PNG, max 5MB per foto</p>
                      </div>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handlePhotoChange}
                    />

                    {photoPreviews.length > 0 && (
                      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {photoPreviews.map((preview, i) => (
                          <div key={i} className="group relative">
                            <img src={preview} alt={`Bukti ${i + 1}`} className="aspect-square w-full rounded-xl object-cover" />
                            <button
                              type="button"
                              onClick={() => removePhoto(i)}
                              className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                            >
                              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                            <input
                              type="text"
                              value={photoDescriptions[i] || ""}
                              onChange={(e) => {
                                const newDesc = [...photoDescriptions];
                                newDesc[i] = e.target.value;
                                setPhotoDescriptions(newDesc);
                              }}
                              placeholder="Deskripsi (opsional)"
                              className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:border-red-500 focus:outline-none"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Sticky summary */}
          {step !== "select" && (
            <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="mb-4 text-sm font-semibold text-slate-500">Ringkasan</h2>

              <div className="space-y-3 border-b border-slate-200 pb-4">
                {preview && (
                  <>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Harga</span>
                      <span className="text-slate-900">{formatPrice(plan.final_price)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Kode Unik</span>
                      <span className="font-mono text-amber-600">+{formatPrice(preview.unique_code)}</span>
                    </div>
                  </>
                )}
              </div>

              <div className="flex items-center justify-between py-4">
                <span className="text-sm font-medium text-slate-600">Total Bayar</span>
                <span className="text-2xl font-bold text-slate-900">
                  {formatPrice(preview ? preview.total_amount : plan.final_price)}
                </span>
              </div>

              {step === "upload" && (
                <button
                  onClick={handleConfirm}
                  disabled={isSubmitting || photos.length === 0 || !accountName || !sourceBank}
                  className="w-full rounded-xl bg-red-600 px-4 py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Memproses...
                    </span>
                  ) : (
                    "Konfirmasi Pembayaran"
                  )}
                </button>
              )}

            </div>
          </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function CheckoutPage() {
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
      <CheckoutContent />
    </Suspense>
  );
}
