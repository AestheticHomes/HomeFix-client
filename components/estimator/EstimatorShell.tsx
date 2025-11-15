"use client";
/**
 * File: components/estimator/EstimatorShell.tsx
 * Version: v4.0 — Edith Stable Build 🌗
 */

import React from "react";
import dynamic from "next/dynamic";
import useEstimator, {
  type EstimatorStep,
} from "@/components/estimator/store/estimatorStore";
import KitchenRender from "@/components/estimator/KitchenRender";
import WardrobeRender from "@/components/estimator/WardrobeRender";
import {
  KitchenForm,
  WardrobeForm,
} from "@/components/estimator/EstimatorForm";

const SummaryPanel = dynamic(
  () => import("@/components/estimator/SummaryPanel"),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-3xl border border-dashed border-[var(--border-soft)] px-6 py-16 text-center text-sm text-[var(--text-secondary)]">
        Generating estimate…
      </div>
    ),
  }
);

const CARD_CLASS =
  "rounded-3xl border border-[var(--border-soft)] bg-[var(--surface-panel)] dark:bg-[var(--surface-panel-dark)] backdrop-blur-xl transition-colors duration-500 text-[var(--text-primary)] dark:text-[var(--text-primary-dark)]";
const CARD_ELEVATION = {
  boxShadow:
    "0 25px 80px color-mix(in srgb, var(--text-primary) 8%, transparent)",
  background: "color-mix(in srgb, var(--surface-panel) 96%, transparent)",
};

interface PanelProps {
  children: React.ReactNode;
  className?: string;
}

const Panel = ({ children, className = "" }: PanelProps) => (
  <div className={`${CARD_CLASS} ${className}`} style={CARD_ELEVATION}>
    {children}
  </div>
);

const STAGE_DESCRIPTION: Record<EstimatorStep, string> = {
  kitchen: "Define the kitchen layout, finishes, and wall runs.",
  wardrobe: "Size your wardrobes and loft extensions to continue.",
  summary: "Review the combined estimate and export a shareable snapshot.",
};

export default function EstimatorShell(): React.ReactElement {
  const {
    step,
    kitchen,
    wardrobe,
    setStep,
    setKitchenShape,
    setKitchenFinish,
    setKitchenLength,
    setWardrobeWidth,
    setWardrobeFinish,
  } = useEstimator();

  const stageBadge =
    step === "kitchen"
      ? "STEP 1 · KITCHEN"
      : step === "wardrobe"
      ? "STEP 2 · WARDROBE"
      : "STEP 3 · SUMMARY";

  const hero = (
    <header className="max-w-4xl mx-auto text-center space-y-3">
      <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">
        {stageBadge}
      </p>
      <h1 className="text-3xl font-semibold text-[var(--text-primary-light)] dark:text-[var(--text-primary-dark)]">
        Interior Budget Estimator
      </h1>
      <p className="text-sm text-[var(--text-secondary)]">
        {STAGE_DESCRIPTION[step]}
      </p>
    </header>
  );

  /* 🟣 Summary Mode */
  if (step === "summary") {
    return (
      <section className="w-full space-y-8">
        {hero}
        <div className="w-full max-w-5xl mx-auto">
          <SummaryPanel />
        </div>
        <div className="flex justify-end gap-3 max-w-5xl mx-auto">
          <button
            onClick={() => setStep("wardrobe")}
            className="px-4 py-2 rounded-xl border border-[var(--border-soft)] text-sm font-medium text-[var(--accent-primary)] hover:bg-[var(--surface-hover)] transition"
          >
            ← Back to wardrobe specs
          </button>
        </div>
      </section>
    );
  }

  /* 🟦 Normal Flow (Kitchen / Wardrobe) */
  return (
    <section className="relative w-full space-y-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-40"
        style={{
          background:
            "radial-gradient(circle at 10% 5%, rgba(90,93,240,0.1), transparent 60%), radial-gradient(circle at 90% 0%, rgba(236,110,207,0.08), transparent 70%)",
        }}
      />
      {hero}
      <div className="w-full max-w-6xl mx-auto space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <Panel className="space-y-5">
            {step === "kitchen" ? (
              <>
                <KitchenForm
                  kitchen={kitchen}
                  setKitchenShape={setKitchenShape}
                  setKitchenFinish={setKitchenFinish}
                  setKitchenLength={setKitchenLength}
                />
                <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-chip)] dark:bg-[var(--surface-chip-dark)] px-4 py-3 text-xs text-[var(--text-secondary)] flex flex-wrap gap-3">
                  <span className="inline-flex items-center gap-1 rounded-full border border-[var(--border-soft)] px-3 py-1 text-[var(--text-primary)]">
                    Shape · {kitchen.shape.toUpperCase()}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-[var(--border-soft)] px-3 py-1 capitalize">
                    Finish · {kitchen.finish}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-[var(--border-soft)] px-3 py-1">
                    Per-wall max · {kitchen.perWallMax} ft
                  </span>
                </div>
              </>
            ) : (
              <>
                <WardrobeForm
                  wardrobe={wardrobe}
                  setWardrobeWidth={setWardrobeWidth}
                  setWardrobeFinish={setWardrobeFinish}
                />
                <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-chip)] dark:bg-[var(--surface-chip-dark)] px-4 py-3 text-xs text-[var(--text-secondary)] flex flex-wrap gap-3">
                  <span className="inline-flex items-center gap-1 rounded-full border border-[var(--border-soft)] px-3 py-1">
                    Width · {wardrobe.widthFt.toFixed(1)} ft
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-[var(--border-soft)] px-3 py-1">
                    Loft · 3 ft default
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-[var(--border-soft)] px-3 py-1 capitalize">
                    Finish · {wardrobe.finish}
                  </span>
                </div>
              </>
            )}
          </Panel>

          <Panel className="relative min-h-[360px] overflow-hidden px-0 py-0">
            <div
              className="absolute top-4 left-4 z-10 inline-flex items-center gap-2 rounded-full border border-[var(--border-soft)] px-3 py-1 text-xs font-semibold text-[var(--accent-primary)]"
              style={{
                background:
                  "color-mix(in srgb, var(--surface-light) 80%, transparent)",
              }}
            >
              {step === "kitchen"
                ? `Shape · ${kitchen.shape.toUpperCase()}`
                : `Finish · ${wardrobe.finish}`}
            </div>
            <div className="rounded-3xl overflow-hidden">
              {step === "kitchen" ? <KitchenRender /> : <WardrobeRender />}
            </div>
          </Panel>
        </div>

        <div className="flex justify-end gap-3">
          {step !== "kitchen" && (
            <button
              onClick={() => setStep("kitchen")}
              className="px-4 py-2 rounded-xl border border-[var(--border-soft)] text-sm font-medium text-[var(--accent-primary)] hover:bg-[var(--surface-hover)] transition"
            >
              ← Back to kitchen
            </button>
          )}
          {step === "kitchen" && (
            <button
              onClick={() => setStep("wardrobe")}
              className="px-5 py-2 rounded-xl bg-[var(--accent-primary)] text-white text-sm font-semibold shadow-sm hover:opacity-90 transition"
            >
              Next · Wardrobe
            </button>
          )}
          {step === "wardrobe" && (
            <button
              onClick={() => setStep("summary")}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white text-sm font-semibold shadow-sm hover:opacity-95 transition"
            >
              Generate summary →
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
