"use client";

import UniversalPreview from "@/components/preview/UniversalPreview";
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
          opacity: 0.55,
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
          opacity: 0.5,
        }}
        initial={{ x: 16, y: -8 }}
        animate={nebulaB}
        transition={transitionB}
      />
    </div>
  );
}

export default function OldHeroPreview() {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <div className="relative w-full max-w-[520px] min-h-[260px] lg:min-h-[300px] rounded-[32px] border border-[var(--border-muted)] bg-[color-mix(in_srgb,var(--surface-panel)92%,transparent)] shadow-[0_26px_70px_rgba(15,23,42,0.65)] overflow-hidden">
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
              href="/instant-quote"
              className="inline-flex items-center justify-center px-3 py-1.5 rounded-full text-[11px] font-semibold text-[var(--text-hero)] bg-[var(--accent-primary)] hover:bg-[color-mix(in_srgb,var(--accent-primary)85%,black)]"
            >
              Try Online Estimator →
            </Link>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[var(--overlay-cta)] backdrop-blur-sm">
          <button
            className="absolute inset-0 w-full h-full cursor-zoom-out"
            onClick={() => setExpanded(false)}
            aria-label="Close 3D preview"
          />

          <div className="relative z-50 w-full max-w-[960px] h-[520px] sm:h-[560px] lg:h-[620px] rounded-[32px] border border-[var(--border-muted)] bg-[color-mix(in_srgb,var(--surface-panel)96%,transparent)] shadow-[0_32px_90px_rgba(0,0,0,0.7)] overflow-hidden">
            <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
              <span className="rounded-full bg-[color-mix(in_srgb,var(--surface-dark)60%,transparent)] text-[10px] px-3 py-1 text-[var(--text-hero)]">
                Click units to inspect · double-click to focus
              </span>
              <button
                onClick={() => setExpanded(false)}
                className="h-8 px-3 rounded-full bg-[color-mix(in_srgb,var(--surface-dark)75%,transparent)] text-xs text-[var(--text-hero)] hover:bg-[color-mix(in_srgb,var(--surface-dark)82%,transparent)]"
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
    </>
  );
}
