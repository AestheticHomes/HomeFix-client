"use client";

import Image from "next/image";
import Link from "next/link";

import { track } from "@/lib/track";

export default function Hero() {
  return (
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
              Turnkey interiors by AestheticHomes
            </span>

            <h1
              className="text-3xl md:text-5xl font-semibold tracking-tight leading-tight text-slate-900"
              style={{ textShadow: "0 1px 4px rgba(15,23,42,0.45)" }}
            >
              Your dream home, designed and delivered.{" "}
              <span className="text-[var(--accent-primary)]">Guaranteed.</span>
            </h1>

            <p
              className="text-sm md:text-base text-slate-700 max-w-2xl"
              style={{ textShadow: "0 1px 3px rgba(15,23,42,0.35)" }}
            >
              Book full home interiors in Chennai with transparent, itemised BOQ and zero hidden costs. Backed by AestheticHomes, our projects include a 10-year warranty on core interior work — so you get a designer home without surprise overruns.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/consultation"
                className="
                inline-flex items-center justify-center gap-2
                rounded-full px-6 md:px-7 py-2.5 md:py-3
                bg-[var(--accent-primary)]
                text-primary-foreground text-sm font-semibold
                shadow-[0_16px_40px_rgba(15,23,42,0.35)]
                hover:brightness-110 transition
              "
                onClick={() => track("cta_click", { location: "hero_primary" })}
              >
                <span className="inline-block h-2 w-2 rounded-full bg-white/80" aria-hidden="true" />
                Book Free Consultation
              </Link>

              <Link
                href="/instant-quote"
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
                  track("cta_click", { location: "hero_secondary" })
                }
              >
                Get Price Estimate
              </Link>
            </div>

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
  );
}
