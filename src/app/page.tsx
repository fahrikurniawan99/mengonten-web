"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import type { ApiResponse, SubscriptionPlan } from "@/lib/types";
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
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* ── Navbar ────────────────────────────────────────── */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src={logoIcon} alt="Mengonten" className="h-8 w-auto" priority />
            <span className="text-lg font-bold tracking-tight">Mengonten</span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <button onClick={() => scrollTo("fitur")} className="text-sm text-white/50 transition-colors hover:text-white">
              Fitur
            </button>
            <button onClick={() => scrollTo("harga")} className="text-sm text-white/50 transition-colors hover:text-white">
              Harga
            </button>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            {user ? (
              <>
                <Link
                  href="/profile"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/60 transition-all duration-200 hover:border-white/20 hover:bg-white/10 hover:text-white"
                  title="Pengaturan"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </Link>
                <Link
                  href="/workspace"
                  className="rounded-lg bg-gradient-to-r from-red-600 to-red-700 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-red-600/20 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-red-600/30"
                >
                  Edit Video
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className="rounded-lg px-4 py-2 text-sm text-white/60 transition-colors hover:text-white">
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className="rounded-lg bg-gradient-to-r from-red-600 to-red-700 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-red-600/20 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-red-600/30"
                >
                  Daftar
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-white/60 transition-colors hover:bg-white/5 hover:text-white md:hidden"
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

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="border-t border-white/5 bg-[#0a0a0a]/95 px-6 py-4 backdrop-blur-xl md:hidden">
            <div className="flex flex-col gap-3">
              <button onClick={() => scrollTo("fitur")} className="py-2 text-left text-sm text-white/50 transition-colors hover:text-white">
                Fitur
              </button>
              <button onClick={() => scrollTo("harga")} className="py-2 text-left text-sm text-white/50 transition-colors hover:text-white">
                Harga
              </button>
              <div className="my-2 border-t border-white/5" />
              {user ? (
                <>
                  <Link href="/workspace" className="rounded-lg bg-gradient-to-r from-red-600 to-red-700 px-4 py-2.5 text-center text-sm font-medium text-white">
                    Edit Video
                  </Link>
                  <Link href="/profile" className="flex items-center justify-center gap-2 py-2 text-center text-sm text-white/60 transition-colors hover:text-white">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Pengaturan
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login" className="py-2 text-center text-sm text-white/60 transition-colors hover:text-white">
                    Masuk
                  </Link>
                  <Link href="/register" className="rounded-lg bg-gradient-to-r from-red-600 to-red-700 px-4 py-2.5 text-center text-sm font-medium text-white">
                    Daftar
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="relative flex min-h-screen items-center overflow-hidden">
        {/* Mesh gradient bg */}
        <div className="absolute inset-0">
          <div className="animate-mesh-1 absolute -left-40 top-1/4 h-[600px] w-[600px] rounded-full bg-red-600/15 blur-[150px]" />
          <div className="animate-mesh-2 absolute bottom-1/4 right-1/4 h-[500px] w-[500px] rounded-full bg-red-500/10 blur-[120px]" />
          <div className="animate-mesh-3 absolute right-0 top-0 h-[400px] w-[400px] rounded-full bg-red-700/8 blur-[100px]" />
        </div>

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative z-10 mx-auto max-w-6xl px-6 py-32 md:py-40">
          <div className="max-w-3xl">
            <h1 className="animate-fade-in-up animate-delay-100 text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Buat konten{" "}
              <span className="bg-gradient-to-r from-red-400 via-red-500 to-red-600 bg-clip-text text-transparent">
                viral
              </span>{" "}
              dalam hitungan detik
            </h1>

            <p className="animate-fade-in-up animate-delay-200 mt-6 max-w-xl text-lg leading-relaxed text-white/40">
              Download, auto-clip, dan distribusikan video YouTube secara otomatis. Fokus pada kreativitas, biarkan AI mengerjakan sisanya.
            </p>

            <div className="animate-fade-in-up animate-delay-300 mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/register"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-red-600/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-red-600/35"
              >
                Mulai Gratis
                <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <button
                onClick={() => scrollTo("harga")}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-7 py-3.5 text-sm font-medium text-white/70 transition-all duration-300 hover:border-white/20 hover:bg-white/10 hover:text-white"
              >
                Lihat Harga
              </button>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
          <div className="flex flex-col items-center gap-2 text-white/20">
            <span className="text-xs tracking-widest uppercase">Scroll</span>
            <svg className="h-4 w-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
            </svg>
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────── */}
      <section id="fitur" className="relative border-t border-white/5">
        <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
          <div className="mb-16 max-w-2xl">
            <span className="mb-4 block text-xs font-semibold tracking-widest uppercase text-red-500">
              Fitur
            </span>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Semua yang Anda butuhkan
              <br />
              dalam satu platform
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <FeatureCard
              icon={
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0112 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.125c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M13.125 12h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125M20.625 12c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5M12 14.625v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 14.625c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m0 0v.375" />
                </svg>
              }
              title="Auto-clip AI"
              description="Submit URL YouTube, biarkan AI menganalisis dan memotong video menjadi klip-klip viral secara otomatis."
            />
            <FeatureCard
              icon={
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                </svg>
              }
              title="Clip & Edit"
              description="Setiap klip bisa di-preview, download, atau hapus langsung dari dashboard Anda tanpa ribet."
            />
            <FeatureCard
              icon={
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
              }
              title="Analytics"
              description="Pantau performa setiap video dan klip. Ketahui konten mana yang paling banyak ditonton."
            />
          </div>
        </div>
      </section>

      {/* ── Pricing ───────────────────────────────────────── */}
      <section id="harga" className="relative border-t border-white/5">
        <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
          <div className="mb-16 text-center">
            <span className="mb-4 block text-xs font-semibold tracking-widest uppercase text-red-500">
              Harga
            </span>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Pilih paket yang tepat untuk Anda
            </h2>
            <p className="mx-auto mt-4 max-w-md text-white/40">
              Mulai gratis, upgrade kapan saja. Semua paket termasuk fitur inti.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {plans.length === 0
              ? Array.from({ length: 3 }).map((_, i) => <PlanCardSkeleton key={i} />)
              : plans.map((plan) => (
                  <PlanCard key={plan.id} plan={plan} isPopular={plan.type === "populer"} />
                ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────── */}
      <section className="relative border-t border-white/5">
        <div className="absolute inset-0">
          <div className="animate-mesh-1 absolute left-1/4 top-0 h-[400px] w-[400px] rounded-full bg-red-600/10 blur-[120px]" />
          <div className="animate-mesh-2 absolute bottom-0 right-1/4 h-[300px] w-[300px] rounded-full bg-red-500/8 blur-[100px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-6 py-24 text-center md:py-32">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Siap membuat konten{" "}
            <span className="bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
              pertama
            </span>
            ?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-white/40">
            Bergabung dengan ribuan kreator yang sudah menggunakan Mengonten.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/register"
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-red-600/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-red-600/35"
            >
              Daftar Sekarang
              <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────── */}
      <footer className="border-t border-white/5">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <Link href="/" className="flex items-center gap-2.5">
              <Image src={logoIcon} alt="Mengonten" className="h-7 w-auto" />
              <span className="text-sm font-bold tracking-tight">Mengonten</span>
            </Link>

            <p className="text-xs text-white/30">&copy; 2026 Mengonten. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ── Sub-components ──────────────────────────────────────── */

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="group rounded-2xl border border-white/5 bg-white/[0.02] p-6 transition-all duration-300 hover:border-white/10 hover:bg-white/[0.04]">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-red-400 transition-colors group-hover:bg-red-500/10 group-hover:text-red-400">
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-white">{title}</h3>
      <p className="text-sm leading-relaxed text-white/40">{description}</p>
    </div>
  );
}

function PlanCard({ plan, isPopular }: { plan: SubscriptionPlan; isPopular: boolean }) {
  const hasDiscount = plan.discount_percent > 0;
  const originalPrice = hasDiscount ? plan.price / (1 - plan.discount_percent / 100) : null;

  return (
    <div
      className={`relative flex flex-col rounded-2xl border p-6 transition-all duration-300 ${
        isPopular
          ? "border-red-500/40 bg-white/[0.03] shadow-xl shadow-red-500/10"
          : "border-white/5 bg-white/[0.02] hover:border-white/10"
      }`}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="rounded-full bg-gradient-to-r from-red-600 to-red-700 px-4 py-1 text-xs font-semibold text-white shadow-lg shadow-red-600/30">
            Populer
          </span>
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
        {plan.description && <p className="mt-1 text-sm text-white/40">{plan.description}</p>}
      </div>

      <div className="mb-6">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-white">{formatPrice(plan.price)}</span>
          {plan.duration_days && (
            <span className="text-sm text-white/30">/ {plan.duration_days} hari</span>
          )}
        </div>
        {hasDiscount && originalPrice && (
          <div className="mt-1 flex items-center gap-2">
            <span className="text-sm text-white/20 line-through">{formatPrice(originalPrice)}</span>
            <span className="rounded-md bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-400">
              -{plan.discount_percent}%
            </span>
          </div>
        )}
      </div>

      {plan.benefits && (
        <div className="mb-8 flex-1">
          <ul className="space-y-3">
            {(Array.isArray(plan.benefits) ? plan.benefits : plan.benefits.split(",")).map((benefit, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-white/50">
                <svg className="mt-0.5 h-4 w-4 shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                {typeof benefit === "string" ? benefit.trim() : String(benefit)}
              </li>
            ))}
          </ul>
        </div>
      )}

      <Link
        href="/register"
        className={`mt-auto inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-300 ${
          isPopular
            ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-600/25 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-red-600/35"
            : "border border-white/10 bg-white/5 text-white/70 hover:border-white/20 hover:bg-white/10 hover:text-white"
        }`}
      >
        Mulai Sekarang
      </Link>
    </div>
  );
}

function PlanCardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
      <div className="mb-6 h-5 w-24 animate-pulse rounded bg-white/5" />
      <div className="mb-6 h-10 w-32 animate-pulse rounded bg-white/5" />
      <div className="mb-8 space-y-3">
        <div className="h-4 w-full animate-pulse rounded bg-white/5" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-white/5" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-white/5" />
      </div>
      <div className="h-12 w-full animate-pulse rounded-xl bg-white/5" />
    </div>
  );
}
