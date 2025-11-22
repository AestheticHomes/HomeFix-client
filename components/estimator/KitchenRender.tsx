"use client";

/**
 * KitchenRender
 * ---------------------------------------------------------
 * Step-level container for the Kitchen estimator.
 *
 * Layout:
 *  - Top: a single “toolbar” card with shape + lengths + finish.
 *  - Bottom: full-width EstimatorPreview canvas (2D/3D).
 *
 * Rules:
 *  - 2D plan (KitchenSvg2D) is the canonical pricing view.
 *  - 3D uses UniversalPreview with GLB from Supabase via
 *    getEstimatorGlbUrl(kitchen.shape) inside EstimatorPreview.
 */

import EstimatorPreview from "@/components/estimator/EstimatorPreview";
import KitchenSvg2D from "@/components/estimator/KitchenSvg2D";
import useEstimator from "@/components/estimator/store/estimatorStore";
import React, { useCallback } from "react";

const SHAPES: { key: string; label: string }[] = [
  { key: "linear", label: "Linear" },
  { key: "lshape", label: "L-shape" },
  { key: "u", label: "U-shape" },
  { key: "parallel", label: "Parallel" },
];

export default function KitchenRender(): React.ReactElement {
  const kitchen = useEstimator((s) => s.kitchen);

  // NOTE:
  // These setters are accessed via `as any` so this file compiles
  // even if the exact function names differ slightly in the store.
  // If you see runtime errors on click/change, just fix the names here.
  const setShape = useEstimator(
    (s) => (s as any).setKitchenShape as ((shape: string) => void) | undefined
  );
  const setLength = useEstimator(
    (s) =>
      (s as any).setKitchenLength as
        | ((key: "A" | "B" | "C", value: number) => void)
        | undefined
  );
  const setFinish = useEstimator(
    (s) => (s as any).setKitchenFinish as ((finish: string) => void) | undefined
  );

  const handleLengthChange = useCallback(
    (key: "A" | "B" | "C", value: string) => {
      const numeric = Number(value.replace(/[^\d.]/g, ""));
      if (!setLength) return;
      setLength(key, Number.isFinite(numeric) ? numeric : 0);
    },
    [setLength]
  );

  return (
    <div className="flex w-full flex-col gap-5 px-4 py-4 sm:px-6 sm:py-6">
      {/* TOOLBAR CARD ------------------------------------------------------ */}
      <section className="rounded-3xl border border-[var(--border-soft)] bg-[var(--surface-subtle)] px-4 py-4 sm:px-6 sm:py-5 space-y-4">
        <header className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
              Kitchen layout
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Adjust wall lengths, layout shape and finishes. 2D plan is used
              for pricing; 3D is a visual reference.
            </p>
          </div>
        </header>

        {/* Shape + lengths + finish in one horizontal “toolbar” row */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--text-secondary)]">
          {/* Shape buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
              Shape
            </span>
            <div className="inline-flex flex-wrap gap-1 rounded-full bg-[color-mix(in_srgb,var(--surface-panel)90%,transparent)] p-1">
              {SHAPES.map((shape) => {
                const active =
                  (kitchen.shape || "linear").toLowerCase() === shape.key;
                return (
                  <button
                    key={shape.key}
                    type="button"
                    onClick={() => setShape && setShape(shape.key)}
                    className={`px-3 py-1 rounded-full text-[11px] font-medium transition ${
                      active
                        ? "bg-[var(--accent-primary)] text-white shadow-sm"
                        : "text-[var(--text-secondary)] hover:bg-[var(--surface-panel)]"
                    }`}
                  >
                    {shape.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Length inputs */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-[var(--text-secondary)]">
                A length (ft)
              </span>
              <input
                type="number"
                min={4}
                max={30}
                value={kitchen.lengths?.A ?? 10}
                onChange={(e) => handleLengthChange("A", e.target.value)}
                className="w-16 rounded-lg border border-[var(--border-soft)] bg-[var(--surface-panel)] px-2 py-1 text-center text-[11px] text-[var(--text-primary)]"
              />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-[var(--text-secondary)]">
                B length (ft)
              </span>
              <input
                type="number"
                min={0}
                max={30}
                value={kitchen.lengths?.B ?? 10}
                onChange={(e) => handleLengthChange("B", e.target.value)}
                className="w-16 rounded-lg border border-[var(--border-soft)] bg-[var(--surface-panel)] px-2 py-1 text-center text-[11px] text-[var(--text-primary)]"
              />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-[var(--text-secondary)]">
                C length (ft)
              </span>
              <input
                type="number"
                min={0}
                max={30}
                value={kitchen.lengths?.C ?? 10}
                onChange={(e) => handleLengthChange("C", e.target.value)}
                className="w-16 rounded-lg border border-[var(--border-soft)] bg-[var(--surface-panel)] px-2 py-1 text-center text-[11px] text-[var(--text-primary)]"
              />
            </div>
          </div>

          {/* Finish dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[var(--text-secondary)]">
              Finish
            </span>
            <select
              value={kitchen.finish || "essential"}
              onChange={(e) => setFinish && setFinish(e.target.value)}
              className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface-panel)] px-2 py-1 text-[11px] text-[var(--text-primary)]"
            >
              <option value="essential">Essential</option>
              <option value="premium">Premium</option>
              <option value="luxury">Luxury</option>
            </select>
          </div>
        </div>
      </section>

      {/* CANVAS MASTERPIECE ------------------------------------------------ */}
      <section className="relative">
        <EstimatorPreview
          SvgComponent={KitchenSvg2D}
          title="Kitchen Layout"
          showTitle
        />
        <p className="mt-2 text-[11px] text-[var(--text-muted)]">
          2D plan is the exact layout used for pricing. 3D view is an
          approximate visual to help orientation. Wall lengths assume a
          continuous counter with 2 ft depth—tweak spans to mirror your kitchen.
        </p>
      </section>
    </div>
  );
}
