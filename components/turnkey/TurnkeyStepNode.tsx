// components/turnkey/TurnkeyStepNode.tsx
"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { TurnkeyIcon } from "./TurnkeyIcon";
import type { TurnkeyStep } from "./turnkeyStepsConfig";

interface Props {
  step: TurnkeyStep;
  index: number;
  total: number;
  inView: boolean;
}

export function TurnkeyStepNode({ step, index, total, inView }: Props) {
  const [hovered, setHovered] = useState(false);
  const delay = 0.15 + index * 0.08;

  return (
    <motion.article
      className="relative flex-1 min-w-[140px]"
      initial={{ opacity: 0, y: 18 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
      transition={{ duration: 0.45, delay }}
      aria-label={step.title}
    >
      {/* DESKTOP ORB + LABEL */}
      <div className="hidden md:flex md:flex-col md:items-start">
        <button
          type="button"
          className="group relative mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card shadow-[0_0_24px_color-mix(in_srgb,var(--accent-primary)35%,transparent)] backdrop-blur-sm outline-none"
          onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
      >
        <span
          className="absolute inset-[-6px] rounded-full blur-md opacity-0 group-hover:opacity-80 transition-opacity"
          style={{
            background:
              "linear-gradient(135deg, color-mix(in srgb, var(--accent-primary) 55%, transparent), color-mix(in srgb, var(--accent-secondary) 45%, transparent))",
          }}
        />
          <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--surface-dark)85%,transparent)] text-[0.7rem] text-[var(--text-hero)]">
            <TurnkeyIcon name={step.iconName} className="h-4 w-4" />
          </span>
        </button>

        <p className="hf-step-kicker text-[0.7rem] font-medium uppercase tracking-wide">
          Step {index + 1}
        </p>
        <h3 className="hf-step-title mt-1 text-sm font-semibold">
          {step.title}
        </h3>
      </div>
      {/* DESKTOP HOVER CARD (collapses when not hovered) */}
      {hovered && (
        <motion.div
          className="mt-3 hidden md:block"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="max-w-xs rounded-2xl border border-border bg-card p-3 text-left text-xs shadow-lg shadow-[0_0_18px_color-mix(in_srgb,var(--text-primary)12%,transparent)] backdrop-blur-md">
            <p className="hf-step-title mb-2 text-[0.78rem] font-medium">
              {step.description}
            </p>
            <ul className="space-y-1">
              {step.reassurance.slice(0, 3).map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-[var(--accent-primary)]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}

      {/* MOBILE TIMELINE CARD */}
      <div className="relative flex gap-3 md:hidden">
        {/* timeline dot + line */}
        <div className="flex flex-col items-center">
          <div className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-card shadow-sm">
            <TurnkeyIcon
              name={step.iconName}
              className="h-3.5 w-3.5 text-[var(--text-primary)]"
            />
          </div>
          {index < total - 1 && (
            <div className="mt-1 h-full w-px bg-border" aria-hidden="true" />
          )}
        </div>

        <div className="flex-1 rounded-2xl border border-border bg-card p-3 text-xs shadow-sm backdrop-blur">
          <p className="hf-step-kicker text-[0.68rem] font-semibold uppercase tracking-wide">
            Step {index + 1} · {step.shortLabel}
          </p>
          <h3 className="hf-step-title mt-1 text-sm font-semibold">
            {step.title}
          </h3>
          <p className="hf-step-muted mt-1 text-[0.78rem]">
            {step.description}
          </p>
          <ul className="mt-2 space-y-1">
            {step.reassurance.slice(0, 2).map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-[var(--accent-primary)]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.article>
  );
}
