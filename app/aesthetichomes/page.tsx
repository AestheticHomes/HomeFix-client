"use client";

import Image from "next/image";
import Link from "next/link";

import ProjectsShowcase from "@/components/home/ProjectsShowcase";
import RenovationServices from "@/components/home/RenovationServices";
import { HomeProcessTimeline } from "@/components/home/HomeProcessTimeline";
import { PARENT_ORG_NAME } from "@/lib/seoConfig";
import { track } from "@/lib/track";

export default function AestheticHomesPage() {
  return (
    <main className="w-full max-w-[1200px] 2xl:max-w-[1360px] mx-auto px-3 sm:px-4 lg:px-8 xl:px-12 pb-20 space-y-8">
      <div className="pt-6">
        <Link
          href="/"
          className="text-sm font-semibold text-[var(--accent-primary)] hover:text-[color-mix(in_srgb,var(--accent-primary)85%,white)]"
        >
          ← Back to HomeFix Store
        </Link>
      </div>

      {/*
      <section className="relative">
        <div className="mx-auto max-w-6xl px-4 py-10 lg:py-16">
          <div className="rounded-[32px] backdrop-blur-2xl bg-[var(--surface-base)]/70 border border-[var(--border-soft)] shadow-xl px-6 py-8 lg:px-10 lg:py-10 lg:flex lg:items-center lg:gap-10">
            // LEFT: text + CTAs
            <div className="flex-1 space-y-5">
              <div className="inline-flex items-center rounded-full border border-[var(--border-soft)] px-3 py-1 text-xs font-medium opacity-90">
                <span className="h-2 w-2 rounded-full bg-[var(--accent-primary)] mr-2" />
                Modular furniture by Aesthetic Homes
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold leading-tight">
                Modular Furniture, Flat-Packed.
                <br />
                <span className="text-[var(--accent-primary)]">
                  Installed FREE in Chennai.
                </span>
              </h1>

              <p className="text-sm sm:text-base text-[var(--text-muted)] max-w-xl">
                Order kitchens, wardrobes and TV units online. Delivered in 3–5
                days, installed by our carpenters at no extra cost.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link href="/store/kitchens" className="btn-primary">
                  Browse Kitchens
                </Link>
                <Link href="/store/wardrobes" className="btn-soft">
                  Browse Wardrobes
                </Link>
                <Link href="/estimator" className="btn-ghost">
                  Try 3D Estimator
                </Link>
              </div>

              // subtle link + trust
              <div className="flex flex-wrap items-center gap-3 pt-4 text-xs sm:text-sm opacity-80">
                <Link
                  href="/aesthetic-homes"
                  className="hover:underline underline-offset-2"
                >
                  Turnkey interiors by Aesthetic Homes →
                </Link>
                <div className="flex items-center gap-1">
                  ★ 4.9
                  <span className="opacity-70">from 50+ Google reviews</span>
                </div>
              </div>
            </div>

            // RIGHT: sample product card
            <div className="mt-8 lg:mt-0 lg:w-[40%]">
              <div className="rounded-3xl border border-[var(--border-soft)] bg-[var(--surface-elevated)] shadow-lg p-4 sm:p-5 space-y-3">
                <div className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
                  Compact L-shaped kitchen
                </div>

                <div className="text-2xl font-semibold">
                  ₹85,000 – ₹1,25,000
                </div>

                <p className="text-xs sm:text-sm text-[var(--text-muted)]">
                  Flat-pack modules for a 6ft × 8ft kitchen. Includes hardware,
                  delivery and FREE installation in Chennai.
                </p>

                <div className="flex flex-wrap gap-2 pt-2 text-[11px] sm:text-xs">
                  <span className="chip-soft">Dispatch 3–5 days</span>
                  <span className="chip-soft">Free installation</span>
                  <span className="chip-soft">2-year warranty</span>
                </div>

                <div className="mt-3 rounded-2xl bg-[var(--surface-soft)] px-3 py-2 text-[11px] sm:text-xs flex items-center justify-between">
                  <span>Typical install time</span>
                  <span className="font-semibold text-[var(--accent-primary)]">
                    6–8 hours
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      */}

      <section className="relative overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <Image
            src="/images/hero-kitchen-8k.png"
            alt="Modern modular kitchen interior rendered for HomeFix customers"
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />

          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: `
          radial-gradient(circle at 10% 35%, rgba(0,0,0,0.30) 0%, transparent 55%),
          linear-gradient(to bottom, rgba(129,140,248,0.12), rgba(253,251,247,0.02))
        `,
            }}
          />
        </div>

        {/* Foreground content */}
        <div className="relative z-10 px-4 md:px-8 lg:px-12 py-16 md:py-20 lg:py-24">
          <div
            className="
            relative
            max-w-[900px] md:max-w-[780px]
            rounded-[2.25rem]
            border border-white/18
            bg-white/8
            backdrop-blur-xl
            shadow-[0_10px_40px_rgba(15,23,42,0.45)]
            p-6 md:p-10
          "
            style={{
              WebkitBackdropFilter: "blur(20px)",
              backdropFilter: "blur(20px)",
            }}
          >
            <div
              className="pointer-events-none absolute inset-0 rounded-[2.25rem]"
              style={{
                background:
                  "radial-gradient(circle at 25% 30%, rgba(255,255,255,0.70) 0%, rgba(255,255,255,0.52) 30%, rgba(255,255,255,0.30) 55%, rgba(255,255,255,0.12) 78%, transparent 100%)",
              }}
            />

            <div className="relative z-10 flex flex-col gap-5">
              <span className="inline-flex items-center gap-2 text-[11px] font-medium rounded-full px-3 py-1 bg-white/85 border border-white/60 text-slate-800 w-fit">
                <span className="w-2 h-2 rounded-full bg-[var(--accent-primary)] shadow-[0_0_10px_color-mix(in_srgb,var(--accent-primary)80%,transparent)]" />
                Modular furniture by {PARENT_ORG_NAME}
              </span>

              <h1
                className="text-3xl md:text-5xl font-semibold tracking-tight leading-tight text-slate-900"
                style={{ textShadow: "0 1px 4px rgba(15,23,42,0.45)" }}
              >
                Buy Modular Furniture |{" "}
                <span className="text-[var(--accent-primary)]">
                  Free Installation in Chennai
                </span>
              </h1>

              <p
                className="text-sm md:text-base text-slate-700 max-w-2xl"
                style={{ textShadow: "0 1px 3px rgba(15,23,42,0.35)" }}
              >
                Flat-pack delivery, factory finished, 3–5 day delivery, installed FREE.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/store/kitchens"
                  className="
                inline-flex items-center justify-center gap-2
                rounded-full px-6 md:px-7 py-2.5 md:py-3
                bg-[var(--accent-primary)]
                text-primary-foreground text-sm font-semibold
                shadow-[0_16px_40px_rgba(15,23,42,0.35)]
                hover:brightness-110 transition
              "
                  onClick={() =>
                    track("cta_click", { location: "hero_browse_kitchens" })
                  }
                >
                  <span className="inline-block h-2 w-2 rounded-full bg-white/80" aria-hidden="true" />
                  Browse Kitchens
                </Link>

                <Link
                  href="/store/wardrobes"
                  className="
                inline-flex items-center justify-center
                rounded-full px-5 md:px-6 py-2.5 md:py-3
                border border-[var(--accent-primary)]
                bg-[var(--surface-card)]/90
                text-[var(--accent-primary)] text-sm font-semibold
                shadow-sm
                hover:bg-white/90
                transition
              "
                  onClick={() =>
                    track("cta_click", { location: "hero_browse_wardrobes" })
                  }
                >
                  Browse Wardrobes
                </Link>

                <Link
                  href="/instant-quote"
                  className="
                inline-flex items-center justify-center
                rounded-full px-5 md:px-6 py-2.5 md:py-3
                border border-[color-mix(in_srgb,white_18%,var(--accent-primary))]
                bg-[var(--surface-card)]/85
                text-[var(--text-primary)] text-sm font-semibold
                shadow-sm
                hover:bg-white/90
                transition
              "
                  onClick={() =>
                    track("cta_click", { location: "hero_try_estimator" })
                  }
                >
                  Try 3D Estimator
                </Link>
              </div>

              <Link
                href="/aesthetic-homes"
                className="text-sm opacity-60"
              >
                Turnkey interiors by Aesthetic Homes →
              </Link>

              <div
                className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs sm:text-[13px] text-[var(--text-secondary)]"
                aria-label="Rated 4.9 out of 5 from over 50 Google reviews."
              >
                <span
                  className="flex items-center gap-2 tracking-[0.08em] text-[var(--accent-secondary)] text-lg sm:text-xl"
                  aria-hidden="true"
                >
                  ★★★★★
                </span>
                <span>
                  <span className="font-semibold">4.9 out of 5</span> from 50+ Google reviews
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <HomeProcessTimeline />
      <RenovationServices />
      <ProjectsShowcase />
    </main>
  );
}
