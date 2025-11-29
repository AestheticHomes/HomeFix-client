// components/turnkey/TurnkeyProcessSection.tsx
"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { TurnkeyCosmicBackground } from "./TurnkeyCosmicBackground";
import { TurnkeyStepNode } from "./TurnkeyStepNode";
import { TURNKEY_STEPS } from "./turnkeyStepsConfig";

/**
 * TurnkeyProcessSection
 *
 * Visualises the HomeFix turnkey project lifecycle as a horizontal beam
 * with animated nodes on desktop, and a vertical timeline on mobile.
 *
 * - All copy comes from TURNKEY_STEPS config.
 * - Safe to reuse on `/turnkey`, service detail pages, or marketing pages.
 */

export function TurnkeyProcessSection() {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { margin: "-20% 0px -20% 0px" });
  const steps = [...TURNKEY_STEPS].sort((a, b) => a.order - b.order);

  return (
    <section
      ref={ref}
      aria-label="HomeFix turnkey interiors process"
      className="relative overflow-hidden py-10 md:py-16"
    >
      <TurnkeyCosmicBackground />

      <div className="relative mx-auto max-w-6xl px-4 md:px-6">
        <header className="mb-6 md:mb-8 text-center">
          <p className="hf-kicker text-[0.7rem] uppercase tracking-[0.2em]">
            Turnkey interiors · Process
          </p>
          <h2 className="hf-section-heading mt-2 text-2xl md:text-3xl font-semibold">
            How a HomeFix turnkey project moves from{" "}
            <span className="hf-section-accent">first measurement</span> to{" "}
            <span className="hf-section-accent">final handover</span>.
          </h2>
          <p className="hf-section-body mt-3 text-sm md:text-base max-w-3xl mx-auto">
            Each stage is measured, documented, and quality-checked so you know
            exactly where your project stands.
          </p>
        </header>

        {/* Desktop beam line */}
        <motion.div
          className="relative mx-auto mt-4 mb-10 hidden h-px max-w-4xl bg-gradient-to-r from-indigo-400 via-sky-400 to-fuchsia-400 md:block"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={
            inView ? { scaleX: 1, opacity: 1 } : { scaleX: 0, opacity: 0 }
          }
          transition={{ duration: 0.9, ease: "easeOut" }}
          style={{ transformOrigin: "left center" }}
        />

        {/* Desktop nodes / Mobile timeline */}
        <div className="relative mx-auto max-w-5xl">
          {/* mobile vertical line */}
          <div className="absolute left-4 top-1 bottom-0 w-px bg-slate-200 md:hidden" />
          <div className="relative flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
            {steps.map((step, index) => (
              <TurnkeyStepNode
                key={step.id}
                step={step}
                index={index}
                total={steps.length}
                inView={inView}
              />
            ))}
          </div>
        </div>

        {/* reassurance pills */}
        <div className="mt-6 grid gap-3 text-xs md:text-sm md:grid-cols-3">
          <ReassurancePill label="Free consultation and free designer site visit" />
          <ReassurancePill label="Factory-built modules and transparent BOQ" />
          <ReassurancePill label="Single point of contact and formal handover" />
        </div>
      </div>
    </section>
  );
}

function ReassurancePill({ label }: { label: string }) {
  return (
    <div className="hf-pill flex items-center gap-2 rounded-full px-3 py-2 backdrop-blur-sm">
      <span className="hf-pill-dot h-2 w-2 rounded-full" />
      <span className="hf-pill-label text-xs md:text-sm">{label}</span>
    </div>
  );
}
