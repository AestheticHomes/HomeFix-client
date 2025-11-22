"use client";

/**
 * WardrobeRender
 * ---------------------------------------------------------
 * Step-level container for the Wardrobe estimator.
 *
 * Responsibilities:
 *  - Render a small control strip (width, loft info, finish).
 *  - Own its own 2D ↔ 3D view toggle (local state).
 *  - Mount <WardrobeSvg2D /> directly in 2D mode.
 *  - Show a safe placeholder in 3D mode for now.
 *
 * This intentionally avoids EstimatorPreview so that wardrobe
 * cannot be broken by its internal logic. We can re-unify
 * later once both sides are stable.
 */

import useEstimator, {
  type Finish,
} from "@/components/estimator/store/estimatorStore";
import WardrobeSvg2D from "@/components/estimator/WardrobeSvg2D";
import { motion } from "framer-motion";
import React, { useState } from "react";

type ViewMode = "2d" | "3d";

export default function WardrobeRender(): React.ReactElement {
  const [viewMode, setViewMode] = useState<ViewMode>("2d");

  const widthFt = useEstimator((s) => s.wardrobe.widthFt);
  const setWidth = useEstimator((s) => s.setWardrobeWidth);
  const finish = useEstimator((s) => s.wardrobe.finish);
  const setFinish = useEstimator((s) => s.setWardrobeFinish);

  return (
    <div className="grid gap-6 px-4 py-4 sm:px-6 sm:py-6 lg:grid-cols-[minmax(0,2.1fr)_minmax(0,2.4fr)]">
      {/* LEFT: config + toggle */}
      <section className="space-y-4">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
              Wardrobe layout
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Configure spans, loft and finish. 2D elevation is used for
              pricing.
            </p>
          </div>

          {/* 2D / 3D toggle (local) */}
          <div className="inline-flex items-center rounded-full bg-[color-mix(in_srgb,var(--surface-panel)90%,transparent)] p-1 text-xs font-medium">
            <button
              type="button"
              onClick={() => setViewMode("2d")}
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
              onClick={() => setViewMode("3d")}
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

        {/* Simple config panel — keep or replace with your real form */}
        <div className="space-y-3 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-subtle)] px-4 py-4 text-xs text-[var(--text-secondary)]">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
            Current configuration
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--text-secondary)]">
                Width (ft)
              </span>
              <input
                type="number"
                min={4}
                max={20}
                value={Number(widthFt) || 0}
                onChange={(e) => setWidth(Number(e.target.value) || 0)}
                className="w-16 rounded-lg border border-[var(--border-soft)] bg-[var(--surface-panel)] px-2 py-1 text-center text-xs text-[var(--text-primary)]"
                aria-label="Wardrobe width (ft)"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--text-secondary)]">Loft</span>
              <span className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface-panel)] px-2 py-1 text-[11px] text-[var(--text-primary)]">
                3 ft default
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--text-secondary)]">
                Finish
              </span>
              <select
                value={finish}
                onChange={(e) => setFinish(e.target.value as Finish)}
                className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface-panel)] px-2 py-1 text-xs text-[var(--text-primary)]"
              >
                <option value="essential">Essential</option>
                <option value="premium">Premium</option>
                <option value="luxury">Luxury</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* RIGHT: preview */}
      <section className="relative">
        <div className="relative h-[320px] w-full overflow-hidden rounded-3xl border border-[var(--border-soft)] bg-[var(--surface-panel)]">
          {viewMode === "2d" ? (
            <div className="relative h-full w-full">
              <WardrobeSvg2D />
            </div>
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-[var(--text-secondary)]">
              3D wardrobe preview will be wired back in a later pass.
            </div>
          )}
        </div>

        <motion.p
          className="mt-2 text-[11px] text-[var(--text-muted)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.9 }}
        >
          2D elevation is the canonical layout for pricing. 3D view is only for
          visual orientation.
        </motion.p>
      </section>
    </div>
  );
}
