"use client";

import UniversalPreview from "@/components/preview/UniversalPreview";
import { track } from "@/lib/track";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

function HeroParallaxLayer() {
  const reduceMotion = useReducedMotion();
  const nebulaA = reduceMotion ? { x: 0, y: 0 } : { x: 10, y: -10 };
  const nebulaB = reduceMotion ? { x: 0, y: 0 } : { x: -16, y: 12 };
  const transitionA = reduceMotion
    ? { duration: 0 }
    : { duration: 32, repeat: Infinity, repeatType: "reverse" };
  const transitionB = reduceMotion
    ? { duration: 0 }
    : { duration: 36, repeat: Infinity, repeatType: "reverse" };

  return (
    <div className="absolute inset-0 overflow-hidden rounded-[32px] pointer-events-none">
      <motion.div
        className="absolute -top-24 -left-20 w-[420px] h-[420px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb,var(--aura-light)70%,transparent) 0%, transparent 65%)",
          opacity: 0.9,
        }}
        initial={{ x: -20, y: 10 }}
        animate={nebulaA}
        transition={transitionA}
      />
      <motion.div
        className="absolute -bottom-24 -right-10 w-[380px] h-[380px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb,var(--aura-dark)65%,transparent) 0%, transparent 70%)",
          opacity: 0.85,
        }}
        initial={{ x: 16, y: -8 }}
        animate={nebulaB}
        transition={transitionB}
      />
    </div>
  );
}

export default function Hero() {
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="w-full px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
      <div className="mx-auto w-full max-w-[1360px]">
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-stretch">
          {/* Left column: copy & CTA */}
          <div className="flex flex-col justify-center gap-5 lg:pr-4">
            <span className="inline-flex items-center gap-2 text-[11px] font-medium rounded-full px-3 py-1 bg-[color-mix(in_srgb,var(--surface-panel)80%,transparent)] border border-[var(--border-soft)] text-[var(--text-muted-soft)] w-fit">
              <span className="w-2 h-2 rounded-full bg-[var(--accent-primary)] shadow-[0_0_10px_color-mix(in_srgb,var(--accent-primary)80%,transparent)]" />
              Turnkey interiors by AestheticHomes
            </span>

            <h1 className="text-3xl sm:text-4xl lg:text-[40px] max-[399px]:text-[26px] font-semibold leading-tight text-[var(--text-primary)]">
              Full home interiors,{" "}
              <span className="text-[var(--accent-primary)]">
                from measurement to handover.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-[var(--text-muted-soft)] max-w-xl">
              We handle everything: on-site measurement, layouts, 3D renders,
              factory-made modules and site execution. Edith keeps your entire
              project transparent from first visit to final handover. HomeFix is
              a digital-first interiors platform built by the team behind
              AestheticHomes, a Chennai based home improvement brand.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/consultation"
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-full text-sm font-semibold text-white bg-[var(--accent-primary)] hover:bg-[color-mix(in_srgb,var(--accent-primary)85%,black)] shadow-[0_14px_35px_rgba(15,23,42,0.45)] transition-transform hover:-translate-y-0.5"
                onClick={() => track("start_turnkey_project")}
              >
                Start a turnkey project
              </Link>
              <Link
                href="/estimator"
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-full text-sm font-semibold border border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--surface-panel)80%,transparent)] text-[var(--text-primary)] hover:border-[var(--accent-primary)] transition-colors"
                onClick={() => track("explore_3d_studio")}
              >
                Explore 2D / 3D studio (beta)
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap gap-3 max-md:overflow-x-auto max-md:whitespace-nowrap">
              {[
                "On-site measurement",
                "Initial layout plan",
                "3D renders & revisions",
                "Factory build & site execution",
                "Final handover",
              ].map((step) => (
                <button
                  key={step}
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-3 py-1 text-[11px] md:text-sm text-[var(--text-muted-soft)] backdrop-blur transition hover:border-[var(--accent-primary)]"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-primary)]" />
                  <span>{step}</span>
                  <span>→</span>
                </button>
              ))}
            </div>
          </div>

          {/* Right column: 3D hero card */}
          <div className="w-full flex lg:justify-end">
            <div className="relative w-full max-w-[520px] min-h-[260px] lg:min-h-[300px] rounded-[32px] border border-[var(--border-muted)] bg-[color-mix(in_srgb,var(--surface-panel)92%,transparent)] shadow-[0_26px_70px_rgba(15,23,42,0.65)] overflow-hidden lg:ml-auto">
              <HeroParallaxLayer />

              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex items-center justify-between px-5 pt-4 pb-2 text-[11px] text-[var(--text-muted-soft)]">
                  <span className="inline-flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[var(--accent-primary)]" />
                    2D · 3D interactive modules
                  </span>
                  <button
                    onClick={() => setExpanded(true)}
                    className="rounded-full border border-[color-mix(in_srgb,var(--border-soft)80%,transparent)] px-3 py-1 hover:border-[var(--accent-primary)] transition-colors"
                  >
                    Expand
                  </button>
                </div>

                <div className="flex-1 px-5 pb-4 flex items-center justify-center w-full h-full">
                  <div className="relative w-full h-full rounded-[24px] overflow-hidden">
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
                </div>

                <div className="flex items-center justify-between px-5 pb-4 text-[11px]">
                  <span className="text-[var(--text-muted-soft)]">
                    Drag, preview, refine in Edith Studio.
                  </span>
                  <Link
                    href="/estimator"
                    className="inline-flex items-center justify-center px-3 py-1.5 rounded-full text-[11px] font-semibold text-white bg-[var(--accent-primary)] hover:bg-[color-mix(in_srgb,var(--accent-primary)85%,black)]"
                  >
                    Try Online Estimator →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <button
            className="absolute inset-0 w-full h-full cursor-zoom-out"
            onClick={() => setExpanded(false)}
            aria-label="Close 3D preview"
          />

          <div className="relative z-50 w-full max-w-[960px] h-[520px] sm:h-[560px] lg:h-[620px] rounded-[32px] border border-[var(--border-muted)] bg-[color-mix(in_srgb,var(--surface-panel)96%,transparent)] shadow-[0_32px_90px_rgba(0,0,0,0.7)] overflow-hidden">
            <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
              <span className="rounded-full bg-black/50 text-[10px] px-3 py-1 text-white/80">
                Click units to inspect · double-click to focus
              </span>
              <button
                onClick={() => setExpanded(false)}
                className="h-8 px-3 rounded-full bg-black/70 text-xs text-white hover:bg-black/90"
              >
                Close
              </button>
            </div>

            <div className="w-full h-full">
              <UniversalPreview
                glbUrl="/models/l-shape-kitchen.glb"
                imageUrl={null}
                mode="hero-fullscreen"
                enableSelectionOverlay
                showFullscreenToggle={false}
                fillContainer
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
