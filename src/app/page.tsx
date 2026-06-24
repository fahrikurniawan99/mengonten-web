"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import type { ApiResponse, SubscriptionPlan, UserResponse } from "@/lib/types";
import logoIcon from "@/assets/images/logo.png";

function formatPrice(price: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export default function Home() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const stopVideo = () => {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    video.currentTime = 0;
    setIsPlaying(false);
  };

  useEffect(() => {
    api
      .get<ApiResponse<SubscriptionPlan[]>>("/api/subscription-plans")
      .then((res) => {
        if (res.status && res.data) {
          setPlans(res.data.filter((p) => p.is_active).sort((a, b) => a.sort_order - b.sort_order));
        }
      })
      .catch(() => {});
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* ── Navbar ────────────────────────────────────────── */}
      <nav className="fixed top-0 z-50 w-full border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src={logoIcon} alt="Mengonten" className="h-7 w-auto" priority />
            <span className="text-base font-semibold tracking-tight">Mengonten</span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <button onClick={() => scrollTo("fitur")} className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-900">
              Fitur
            </button>
            <button onClick={() => scrollTo("harga")} className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-900">
              Harga
            </button>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            {user ? (
              <>
                <Link href="/profile" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900">
                  Profile
                </Link>
                <Link href="/workspace" className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-red-700">
                  Edit Video
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900">
                  Masuk
                </Link>
                <Link href="/register" className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-red-700">
                  Daftar
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 transition-colors hover:text-slate-600 md:hidden"
          >
            {mobileMenuOpen ? (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            )}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-slate-200 bg-white px-6 py-4 md:hidden">
            <div className="flex flex-col gap-1">
              <button onClick={() => scrollTo("fitur")} className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900">
                Fitur
              </button>
              <button onClick={() => scrollTo("harga")} className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900">
                Harga
              </button>
              <div className="my-2 border-t border-slate-100" />
              {user ? (
                <Link href="/workspace" className="rounded-lg bg-red-600 px-4 py-2.5 text-center text-sm font-semibold text-white">
                  Edit Video
                </Link>
              ) : (
                <>
                  <Link href="/login" className="rounded-lg px-4 py-2.5 text-center text-sm font-medium text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900">
                    Masuk
                  </Link>
                  <Link href="/register" className="rounded-lg bg-red-600 px-4 py-2.5 text-center text-sm font-semibold text-white">
                    Daftar
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
        <div className="absolute -right-40 top-1/4 h-[500px] w-[500px] rounded-full bg-red-500/5 blur-[150px]" />
        <div className="absolute inset-0 hero-grid" />

        <div className="relative z-10 mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl md:text-6xl lg:text-[68px]">
              Buat konten viral{" "}
              <br className="hidden sm:block" />
              dalam hitungan{" "}
              <span className="text-red-500">detik</span>
            </h1>

            <p className="mx-auto mt-6 max-w-lg text-lg leading-relaxed text-slate-500">
              Download, auto-clip, dan distribusikan video YouTube secara otomatis. Fokus pada kreativitas, biarkan AI mengerjakan sisanya.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-red-700 hover:shadow-lg hover:shadow-red-600/20"
              >
                Mulai Gratis
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <button
                onClick={() => scrollTo("fitur")}
                className="inline-flex items-center justify-center rounded-xl bg-slate-100 px-6 py-3 text-sm font-medium text-slate-700 transition-all duration-200 hover:bg-slate-200"
              >
                Pelajari Lebih Lanjut
              </button>
            </div>
          </div>

          <div className="relative mx-auto mt-20 max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-black group">
            <video
              ref={videoRef}
              src="https://cdn-mengonten.tiroe.io/assets/6804661-uhd_4096_2160_25fps.mp4"
              className="w-full aspect-video object-cover"
              loop
              playsInline
              onClick={togglePlay}
            />

            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity">
                <button onClick={togglePlay} className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 shadow-xl transition-transform hover:scale-110">
                  <svg className="ml-1 h-8 w-8 text-slate-900" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>
              </div>
            )}

            {isPlaying && (
              <button onClick={stopVideo} className="absolute bottom-4 right-4 rounded-full bg-white/80 px-3 py-1.5 text-xs font-medium text-slate-700 shadow backdrop-blur-sm transition-colors hover:bg-white">
                Stop
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────── */}
      <section id="fitur" className="relative border-t border-slate-200">
        <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Semua yang Anda butuhkan
            </h2>
            <p className="mt-4 text-lg text-slate-500">
              Fitur lengkap untuk content creator modern.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <FeatureCard number="01" title="Auto-clip AI" description="Submit URL YouTube, biarkan AI menganalisis dan memotong video menjadi klip-klip viral secara otomatis." />
            <FeatureCard number="02" title="Clip & Edit" description="Setiap klip bisa di-preview, download, atau hapus langsung dari dashboard Anda tanpa ribet." />
            <FeatureCard number="03" title="Analytics" description="Pantau performa setiap video dan klip. Ketahui konten mana yang paling banyak ditonton." />
          </div>
        </div>
      </section>

      {/* ── Pricing ───────────────────────────────────────── */}
      <section id="harga" className="relative border-t border-slate-200">
        <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Harga sederhana
            </h2>
            <p className="mt-4 text-lg text-slate-500">
              Pilih paket yang sesuai kebutuhan Anda.
            </p>
          </div>

          <div className="mx-auto flex max-w-5xl gap-5 overflow-x-auto snap-x snap-mandatory scrollbar-hide px-4 pb-4 md:grid md:grid-cols-2 md:overflow-visible md:px-0 md:pb-0">
            {plans.length === 0
              ? Array.from({ length: 2 }).map((_, i) => <PlanCardSkeleton key={i} />)
              : plans.map((plan) => (
                  <PlanCard key={plan.id} plan={plan} isPopular={plan.type === "populer"} user={user} />
                ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────── */}
      <section className="border-t border-slate-200 bg-slate-50/50">
        <div className="mx-auto max-w-4xl px-6 py-24 text-center md:py-32">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Siap membuat konten pertama?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-slate-500">
            Bergabung dengan ribuan kreator yang sudah menggunakan Mengonten.
          </p>
          <div className="mt-8">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-8 py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-red-700 hover:shadow-lg hover:shadow-red-600/20"
            >
              Daftar Sekarang
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────── */}
      <footer className="border-t border-slate-200">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2.5">
              <Image src={logoIcon} alt="Mengonten" className="h-6 w-auto" />
              <span className="text-sm font-semibold tracking-tight">Mengonten</span>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/login" className="text-xs text-slate-400 transition-colors hover:text-slate-600">
                Masuk
              </Link>
              <Link href="/register" className="text-xs text-slate-400 transition-colors hover:text-slate-600">
                Daftar
              </Link>
            </div>
            <p className="text-xs text-slate-400">&copy; 2026 Mengonten</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ── Sub-components ──────────────────────────────────────── */

function FeatureCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:border-slate-300 hover:shadow-sm">
      <span className="mb-4 block text-xs font-medium text-slate-300">{number}</span>
      <h3 className="mb-2 text-lg font-semibold tracking-tight text-slate-900">{title}</h3>
      <p className="text-sm leading-relaxed text-slate-500">{description}</p>
    </div>
  );
}

function PlanCard({ plan, isPopular, user }: { plan: SubscriptionPlan; isPopular: boolean; user: UserResponse | null }) {
  const hasDiscount = plan.final_price < plan.price;

  return (
    <div
      className={`relative flex min-w-[280px] flex-col rounded-2xl border p-8 transition-all duration-300 snap-start ${
        isPopular
          ? "border-red-200 bg-gradient-to-b from-red-50/60 to-white shadow-lg shadow-red-500/5"
          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md"
      }`}
    >
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-900">{plan.name}</h3>
        {plan.description && <p className="mt-1 text-sm text-slate-500">{plan.description}</p>}
      </div>

      {isPopular && (
        <div className="mb-4">
          <span className="inline-flex items-center gap-1 rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white">
            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.811.71 1.45 1.438 1.016L10 15.591l4.095 2.481c.728.434 1.632-.205 1.438-1.016l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" />
            </svg>
            Paling Populer
          </span>
        </div>
      )}

      <div className="mb-6">
        <div className="flex items-baseline gap-1.5">
          <span className="text-4xl font-bold tracking-tight text-slate-900">{formatPrice(plan.final_price)}</span>
          {plan.duration_days > 0 && (
            <span className="text-sm text-slate-400">/ {plan.duration_days} hari</span>
          )}
        </div>
        {hasDiscount && (
          <div className="mt-1.5 flex items-center gap-2">
            <span className="text-sm text-slate-400 line-through">{formatPrice(plan.price)}</span>
            {plan.discount_percent > 0 && (
              <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600">
                Hemat {plan.discount_percent}%
              </span>
            )}
          </div>
        )}
      </div>

      {plan.benefits && (
        <div className="mb-8 flex-1">
          <ul className="space-y-3">
            {(Array.isArray(plan.benefits) ? plan.benefits : plan.benefits.split(",")).map((benefit, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                <svg className="mt-0.5 h-4 w-4 shrink-0 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                {typeof benefit === "string" ? benefit.trim() : String(benefit)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {plan.final_price > 0 && (
      <Link
        href={user ? `/checkout?plan_id=${plan.id}` : "/register"}
        className={`mt-auto inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-200 ${
          isPopular
            ? "bg-red-600 text-white shadow-sm hover:bg-red-700 hover:shadow-md"
            : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
        }`}
      >
        {user ? "Coba Sekarang" : "Mulai Sekarang"}
      </Link>
      )}
    </div>
  );
}

function PlanCardSkeleton() {
  return (
    <div className="min-w-[280px] rounded-2xl border border-slate-200 bg-white p-8 snap-start">
      <div className="mb-4 h-5 w-20 animate-pulse rounded bg-slate-100" />
      <div className="mb-2 h-5 w-32 animate-pulse rounded bg-slate-100" />
      <div className="mb-6 h-9 w-28 animate-pulse rounded bg-slate-100" />
      <div className="mb-6 space-y-2.5">
        <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-slate-100" />
      </div>
      <div className="h-11 w-full animate-pulse rounded-xl bg-slate-100" />
    </div>
  );
}
