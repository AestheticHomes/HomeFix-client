/**
 * Hero.tsx — HomeFix Store Hero (Refactored)
 * --------------------------------------------------
 * This hero is purpose-built for the HomeFix STORE positioning:
 * - Shorter on mobile
 * - Live 3D Preview instead of static "featured" card
 * - Small pills always fit in 1 row (even on phones)
 * - Desktop layout preserved, mobile NOT a big poster anymore
 *
 * IMPORTANT: This ONLY replaces the hero component.
 * No other sections/pages are removed or impacted.
 */

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import UniversalPreview from "@/components/preview/UniversalPreview";


// -------------------------------------------------------------
// Animation for subtle fade-up only (no crazy motion)
// -------------------------------------------------------------
const fade = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};


export default function Hero() {
  return (
    <section className="relative overflow-hidden">

      {/** 
       * OUTER CONTAINER
       * NOTE: Smaller padding on mobile makes the hero appear much shorter
       */}
      <div className="mx-auto max-w-6xl px-3 pt-4 pb-5 sm:px-4 sm:pt-6 sm:pb-7 lg:pt-10 lg:pb-10">

        <motion.div
          variants={fade}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="
            w-full rounded-3xl
            backdrop-blur-2xl bg-[var(--surface-base)]/80
            border border-[var(--border-soft)]
            shadow-xl

            px-4 py-5 sm:px-6 sm:py-7 lg:px-10 lg:py-9

            flex flex-col lg:flex-row
            gap-6 lg:gap-10
          "
        >

          {/** -----------------------------------------------
           * LEFT SIDE: text, pills, CTAs
           * ----------------------------------------------- */}
          <div className="flex-1 space-y-4">

            {/** TOP PILL: VERY SMALL */}
            <div className="inline-flex items-center rounded-full border border-[var(--border-soft)] px-3 py-1 text-[10px] sm:text-[11px] opacity-90">
              <span className="h-2 w-2 rounded-full bg-[var(--accent-primary)] mr-2" />
              Chennai’s flat-pack modular furniture store
            </div>

            {/** 
             * RESPONSIVE HEADLINE
             * Mobile gets short version (to avoid 4-line heading)
             */}
            <h1 className="font-semibold leading-tight text-xl sm:text-3xl lg:text-5xl">
              {/* Mobile only */}
              <span className="sm:hidden">
                Shop Modular Furniture
              </span>

              {/* Desktop */}
              <span className="hidden sm:inline">
                Shop Modular Kitchens, Wardrobes &amp; TV Units
              </span>
            </h1>

            {/** SUBTEXT — short mobile version */}
            <p className="text-xs sm:text-sm lg:text-base text-[var(--text-muted)] max-w-xl leading-snug">
              <span className="sm:hidden">
                Flat-pack furniture, delivered fast, installed FREE in Chennai.
              </span>
              <span className="hidden sm:inline">
                Flat-pack delivery, factory finished, 3–5 day dispatch and FREE installation in Chennai.
              </span>
            </p>


            {/** ---------------------------------------
             * CATEGORY PILLS (always 3 per row)
             * Small font, tight padding and no wrapping
             * --------------------------------------- */}
            <div className="mt-2 grid grid-cols-3 gap-1 sm:gap-3 text-[10px] sm:text-[13px]">

              <Link
                href="/store/kitchens"
                className="inline-flex flex-col justify-center rounded-lg sm:rounded-xl border border-[var(--border-soft)] bg-[var(--surface-soft)] px-2 py-1 sm:px-3 sm:py-2"
              >
                <span className="font-medium">Kitchens</span>
                <span className="opacity-75">From ₹85k</span>
              </Link>

              <Link
                href="/store/wardrobes"
                className="inline-flex flex-col justify-center rounded-lg sm:rounded-xl border border-[var(--border-soft)] bg-[var(--surface-soft)] px-2 py-1 sm:px-3 sm:py-2"
              >
                <span className="font-medium">Wardrobes</span>
                <span className="opacity-75">From ₹45k</span>
              </Link>

              <Link
                href="/store/tv-units"
                className="inline-flex flex-col justify-center rounded-lg sm:rounded-xl border border-[var(--border-soft)] bg-[var(--surface-soft)] px-2 py-1 sm:px-3 sm:py-2"
              >
                <span className="font-medium">TV Units</span>
                <span className="opacity-75">From ₹18k</span>
              </Link>
            </div>


            {/** CTAS — very lightweight */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-2 text-sm sm:text-base">
              <Link href="/store/kitchens" className="btn-primary">
                Browse Kitchens
              </Link>
              <Link href="/store/wardrobes" className="btn-soft">
                Browse Wardrobes
              </Link>
              <Link href="/estimator" className="btn-ghost">
                Design in 3D
              </Link>
            </div>


            {/** link to AestheticHomes + rating line */}
            <div className="flex flex-wrap items-center gap-3 text-[10px] sm:text-xs pt-2">
              <Link href="/aesthetic-homes" className="hover:underline underline-offset-2 opacity-80">
                Turnkey interiors by Aesthetic Homes →
              </Link>
              <div className="flex items-center gap-1 opacity-80">
                <span>★ 4.9</span>
                <span className="opacity-70">from 50+ Google reviews</span>
              </div>
            </div>
          </div>


          {/** -----------------------------------------------
           * RIGHT SIDE — UNIVERSAL 3D PREVIEW
           * replaces older “featured card image”
           * keeps desktop geometry
           * ----------------------------------------------- */}
          <div className="lg:w-[38%] flex items-stretch">

            <div className="w-full rounded-3xl border border-[var(--border-soft)] bg-[var(--surface-elevated)] shadow-lg p-3 sm:p-4 lg:p-5 flex flex-col gap-3">

              {/* Title row */}
              <div className="flex items-center justify-between gap-2 text-[10px] uppercase tracking-wide text-[var(--text-muted)]">
                <span>Kitchen preview</span>
                <span className="rounded-full bg-[var(--surface-soft)] px-2 py-[2px]">
                  L-shape
                </span>
              </div>

              {/* 3D inside fixed aspect ratio — avoids tall hero */}
              <div className="relative w-full aspect-[4/3] rounded-[20px] overflow-hidden border border-[var(--border-muted)] bg-[color-mix(in_srgb,var(--surface-panel)94%,transparent)]">
                <UniversalPreview
                  glbUrl="/models/l-shape-kitchen.glb"
                  imageUrl={null}
                  mode="hero-inline"
                  enableSelectionOverlay
                  showFullscreenToggle={false}
                  fillContainer
                  showInteractionHint
                />
              </div>

              {/* Pricing summary */}
              <div className="space-y-1 text-[11px] sm:text-xs">
                <div className="font-medium text-[var(--text-primary)]">
                  Compact L-shaped kitchen
                </div>
                <div className="font-semibold text-xs sm:text-sm">
                  ₹85,000 – ₹1,25,000
                </div>
                <div className="opacity-75">
                  Dispatch in 3–5 days · FREE install
                </div>
              </div>

              {/* CTA */}
              <div className="flex justify-end">
                <Link href="/store/kitchens" className="btn-soft text-xs sm:text-sm">
                  View kitchen bundles →
                </Link>
              </div>
            </div>
          </div>

        </motion.div>
      </div>
    </section>
  );
}
