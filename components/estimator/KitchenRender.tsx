"use client";

/**
 * KitchenRender
 * ---------------------------------------------------------
 * Step-level container for the Kitchen estimator.
 *
 * Responsibilities:
 *  - Show the kitchen configuration summary / controls.
 *  - Own the 2D ↔ 3D view toggle.
 *  - Mount <KitchenSvg2D /> for 2D view.
 *  - Show a lightweight placeholder for 3D for now
 *    (we can swap this with UniversalPreview / 3D later).
 */

import KitchenSvg2D from "@/components/estimator/KitchenSvg2D";
import useEstimator from "@/components/estimator/store/estimatorStore";
import React, { useState } from "react";

type ViewMode = "2d" | "3d";

export default function KitchenRender(): React.ReactElement {
  const kitchen = useEstimator((s) => s.kitchen);
  const [viewMode, setViewMode] = useState<ViewMode>("2d");

  const handleModeChange = (mode: ViewMode) => {
    setViewMode(mode);
  };

  return (
    <div className="grid gap-6 px-4 py-4 sm:px-6 sm:py-6 lg:grid-cols-[minmax(0,2.1fr)_minmax(0,2.4fr)]">
      {/* LEFT: copy + summary / (real form goes here in your existing file) */}
      <section className="space-y-4">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
              Kitchen layout
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Adjust wall lengths, layout shape and finishes. 2D plan is used
              for pricing.
            </p>
          </div>

          {/* 2D / 3D toggle */}
          <div className="inline-flex items-center rounded-full bg-[color-mix(in_srgb,var(--surface-panel)90%,transparent)] p-1 text-xs font-medium">
            <button
              type="button"
              onClick={() => handleModeChange("2d")}
              className={`px-3 py-1 rounded-full transition ${
                viewMode === "2d"
                  ? "bg-[var(--accent-primary)] text-white shadow-sm"
                  : "text-[var(--text-secondary)]"
              }`}
            >
              2D
            </button>
            <button
              type="button"
              onClick={() => handleModeChange("3d")}
              className={`px-3 py-1 rounded-full transition ${
                viewMode === "3d"
                  ? "bg-[var(--accent-primary)] text-white shadow-sm"
                  : "text-[var(--text-secondary)]"
              }`}
            >
              3D
            </button>
          </div>
        </header>

        {/* Simple summary block – plug your real form controls back here */}
        <div className="space-y-2 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-subtle)] px-4 py-4 text-xs text-[var(--text-secondary)]">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
            Current configuration
          </p>
          <p>
            Shape:{" "}
            <span className="font-mono">
              {kitchen.shape ? kitchen.shape : "linear"}
            </span>
          </p>
          <p className="font-mono">
            A: {kitchen.lengths?.A ?? 10} ft · B: {kitchen.lengths?.B ?? 10} ft
            · C: {kitchen.lengths?.C ?? 10} ft
          </p>
          <p>Finish: {kitchen.finish || "Essential"}</p>
        </div>
      </section>

      {/* RIGHT: Preview panel */}
      <section className="relative">
        <div className="relative h-[320px] w-full overflow-hidden rounded-3xl border border-[var(--border-soft)] bg-[var(--surface-panel)]">
          {viewMode === "2d" ? (
            // 2D CAD – this is the important wire
            <div className="relative h-full w-full">
              <KitchenSvg2D />
            </div>
          ) : (
            // 3D placeholder – replace with UniversalPreview / 3D later
            <div className="flex h-full w-full items-center justify-center text-xs text-[var(--text-secondary)]">
              3D preview will be wired back in next pass.
            </div>
          )}
        </div>

        <p className="mt-2 text-[11px] text-[var(--text-muted)]">
          2D plan is the exact layout used for pricing. 3D view is an
          approximate visual to help orientation.
        </p>
      </section>
    </div>
  );
}
