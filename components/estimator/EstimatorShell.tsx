"use client";
/**
 * File: components/estimator/EstimatorShell.tsx
 * Version: v4.0 — Edith Stable Build 🌗
 */

import React, { useCallback, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import useEstimator, {
  type EstimatorStep,
} from "@/components/estimator/store/estimatorStore";
import KitchenRender from "@/components/estimator/KitchenRender";
import WardrobeRender from "@/components/estimator/WardrobeRender";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import Script from "next/script";

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
    includeKitchen,
    includeWardrobe,
    hasKitchen,
    hasWardrobe,
    setStep,
    setIncludeKitchen,
    setIncludeWardrobe,
  } = useEstimator();

  const stageBadge =
    step === "kitchen"
      ? "STEP 1 · KITCHEN"
      : step === "wardrobe"
      ? "STEP 2 · WARDROBE"
      : "STEP 3 · SUMMARY";

  const heroTitle =
    step === "summary" ? "Interior Budget Summary" : "Interior Budget Estimator";

  const noneSelected = !hasKitchen && !hasWardrobe;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://homefix.in";

  const breadcrumbJsonLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
        { "@type": "ListItem", position: 2, name: "Estimator", item: `${siteUrl}/estimator` },
        {
          "@type": "ListItem",
          position: 3,
          name:
            step === "summary"
              ? "Summary"
              : step === "kitchen"
              ? "Kitchen"
              : "Wardrobe",
          item: `${siteUrl}/estimator`,
        },
      ],
    }),
    [siteUrl, step]
  );

  const hero = (
    <header className="max-w-4xl mx-auto text-center space-y-3">
      <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">
        {stageBadge}
      </p>
      <h1 className="text-3xl font-semibold text-[var(--text-primary-light)] dark:text-[var(--text-primary-dark)]">
        {heroTitle}
      </h1>
      <p className="text-sm text-[var(--text-secondary)]">
        {STAGE_DESCRIPTION[step]}
      </p>
    </header>
  );

  const toggleRow = (
    <div className="w-full max-w-5xl mx-auto flex flex-wrap items-center gap-3 justify-center">
      {(["kitchen", "wardrobe", "summary"] as EstimatorStep[]).map((s) => {
        const disabled =
          (s === "kitchen" && !includeKitchen) ||
          (s === "wardrobe" && !includeWardrobe);
        const active = step === s;
        return (
          <button
            key={s}
            onClick={() => goTo(s)}
            disabled={disabled}
            className={`px-4 py-2 rounded-full text-sm font-semibold border transition ${
              active
                ? "bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]"
                : "bg-[var(--surface-panel)] border-[var(--border-soft)] text-[var(--text-primary)]"
            } ${disabled ? "opacity-50 cursor-not-allowed" : "hover:border-[var(--accent-primary)]"}`}
          >
            {s === "kitchen"
              ? "Kitchen"
              : s === "wardrobe"
              ? "Wardrobe"
              : "Summary"}
          </button>
        );
      })}
      <div className="flex items-center gap-2 text-xs sm:text-sm px-3 py-2 rounded-full border border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--surface-panel)85%,transparent)]">
        <label className="inline-flex items-center gap-1 cursor-pointer">
          <input
            type="checkbox"
            className="accent-[var(--accent-primary)]"
            checked={hasKitchen}
            onChange={(e) => setIncludeKitchen(e.target.checked)}
          />
          <span>Kitchen</span>
        </label>
        <span className="text-[var(--border-muted)]">|</span>
        <label className="inline-flex items-center gap-1 cursor-pointer">
          <input
            type="checkbox"
            className="accent-[var(--accent-primary)]"
            checked={hasWardrobe}
            onChange={(e) => setIncludeWardrobe(e.target.checked)}
          />
          <span>Wardrobe</span>
        </label>
        {noneSelected && (
          <span className="text-[var(--accent-danger)] text-[11px] ml-2">
            Select at least one
          </span>
        )}
      </div>
    </div>
  );

  const goTo = useCallback(
    (target: EstimatorStep) => {
      if (target === "summary" && noneSelected) return;
      if (target === "kitchen" && !includeKitchen) return;
      if (target === "wardrobe" && !includeWardrobe) return;
      setStep(target);
    },
    [includeKitchen, includeWardrobe, noneSelected, setStep]
  );

  useEffect(() => {
    if (step === "kitchen" && !includeKitchen) {
      goTo(includeWardrobe ? "wardrobe" : "summary");
    }
    if (step === "wardrobe" && !includeWardrobe) {
      goTo(includeKitchen ? "kitchen" : "summary");
    }
  }, [includeKitchen, includeWardrobe, step, goTo]);

  /* 🟣 Summary Mode */
  if (step === "summary") {
    return (
      <section className="w-full space-y-8">
        <div className="mt-6 space-y-5">
          {hero}
          {toggleRow}
        </div>
        <div className="w-full max-w-5xl mx-auto">
          <SummaryPanel />
        </div>
        <div className="flex justify-end gap-3 max-w-5xl mx-auto">
          <button
            onClick={() =>
              setStep(includeWardrobe ? "wardrobe" : includeKitchen ? "kitchen" : "summary")
            }
            className="px-4 py-2 rounded-xl border border-[var(--border-soft)] text-sm font-medium text-[var(--accent-primary)] hover:bg-[var(--surface-hover)] transition"
            disabled={!includeWardrobe && !includeKitchen}
          >
            ← Back
          </button>
        </div>
      </section>
    );
  }

  /* 🟦 Normal Flow (Kitchen / Wardrobe) */
  return (
    <section className="relative w-full space-y-8">
      <Script
        id="estimator-breadcrumb-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-40"
        style={{
          background:
            "radial-gradient(circle at 10% 5%, rgba(90,93,240,0.1), transparent 60%), radial-gradient(circle at 90% 0%, rgba(236,110,207,0.08), transparent 70%)",
        }}
      />
      <div className="mt-6 space-y-5">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Estimator", href: "/estimator" },
            {
              label: step === "kitchen" ? "Kitchen" : "Wardrobe",
            },
          ]}
          className="flex justify-center"
        />
        {hero}
        {toggleRow}
      </div>

      <div className="w-full max-w-6xl mx-auto space-y-6">
        <Panel className="relative min-h-[360px] overflow-hidden px-0 py-0">
          <div className="rounded-3xl overflow-hidden">
            {step === "kitchen" ? <KitchenRender /> : <WardrobeRender />}
          </div>
        </Panel>
        {step === "kitchen" && (
          <p className="text-[11px] text-pink-300/80 max-w-3xl mx-auto px-2">
            Wall lengths assume a continuous counter with 2 ft depth. Adjust each span to mirror your kitchen layout.
          </p>
        )}

        <div className="flex justify-end gap-3">
          {step !== "kitchen" && (
            <button
              onClick={() => goTo("kitchen")}
              className="px-4 py-2 rounded-xl border border-[var(--border-soft)] text-sm font-medium text-[var(--accent-primary)] hover:bg-[var(--surface-hover)] transition"
              disabled={!includeKitchen}
            >
              ← Back to kitchen
            </button>
          )}
          {step === "kitchen" && (
            <button
              onClick={() => goTo(includeWardrobe ? "wardrobe" : "summary")}
              className="px-5 py-2 rounded-xl bg-[var(--accent-primary)] text-white text-sm font-semibold shadow-sm hover:opacity-90 transition"
            >
              {includeWardrobe ? "Next · Wardrobe" : "Next · Summary"}
            </button>
          )}
          {step === "wardrobe" && (
            <button
              onClick={() => goTo("summary")}
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
