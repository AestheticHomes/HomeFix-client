"use client";

/**
 * WardrobeRender
 * ---------------------------------------------------------
 * Step-level container for the Wardrobe estimator.
 *
 * Layout:
 *  - Top: compact “toolbar” card with width + loft info + finish.
 *  - Bottom: full-width EstimatorPreview canvas (2D/3D).
 *
 * Rules:
 *  - 2D elevation (WardrobeSvg2D) is the pricing view.
 *  - 3D is purely visual; GLB is disabled for now via glbUrlOverride=null
 *    so EstimatorPreview/UniversalPreview always falls back to 2D.
 */

import EstimatorPreview from "@/components/estimator/EstimatorPreview";
import useEstimator, {
  type Finish,
} from "@/components/estimator/store/estimatorStore";
import WardrobeSvg2D from "@/components/estimator/WardrobeSvg2D";
import { motion } from "framer-motion";
import React, { useCallback } from "react";

export default function WardrobeRender(): React.ReactElement {
  const wardrobe = useEstimator((s) => s.wardrobe);

  const setWidth = useEstimator(
    (s) =>
      (s as any).setWardrobeWidth as ((widthFt: number) => void) | undefined
  );
  const setFinish = useEstimator(
    (s) =>
      (s as any).setWardrobeFinish as ((finish: Finish) => void) | undefined
  );
  const setLoftH = useEstimator(
    (s) => (s as any).setWardrobeLoftH as ((loftFt: number) => void) | undefined
  );

  const handleWidthChange = useCallback(
    (value: string) => {
      if (!setWidth) return;
      const numeric = Number(value.replace(/[^\d.]/g, ""));
      setWidth(Number.isFinite(numeric) ? numeric : 0);
    },
    [setWidth]
  );

  const handleLoftChange = useCallback(
    (value: string) => {
      if (!setLoftH) return;
      const numeric = Number(value.replace(/[^\d.]/g, ""));
      setLoftH(Number.isFinite(numeric) ? numeric : 0);
    },
    [setLoftH]
  );

  return (
    <div className="flex w-full flex-col gap-5 px-4 py-4 sm:px-6 sm:py-6">
      {/* TOOLBAR CARD ------------------------------------------------------ */}
      <section className="space-y-4 rounded-3xl border border-[var(--border-soft)] bg-[var(--surface-subtle)] px-4 py-4 sm:px-6 sm:py-5">
        <header className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
              Wardrobe layout
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Configure spans, loft height and finish. 2D elevation is used for
              pricing; 3D is a visual reference.
            </p>
          </div>
        </header>

        <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--text-secondary)]">
          {/* Width */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[var(--text-secondary)]">
              Width (ft)
            </span>
            <input
              type="number"
              min={3}
              max={20}
              value={Number(wardrobe.widthFt) || 0}
              onChange={(e) => handleWidthChange(e.target.value)}
              className="w-16 rounded-lg border border-[var(--border-soft)] bg-[var(--surface-panel)] px-2 py-1 text-center text-[11px] text-[var(--text-primary)]"
              aria-label="Wardrobe width (ft)"
            />
          </div>

          {/* Loft height */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[var(--text-secondary)]">
              Loft height (ft)
            </span>
            <input
              type="number"
              min={0}
              max={5}
              value={Number(wardrobe.loftH ?? 3)}
              onChange={(e) => handleLoftChange(e.target.value)}
              className="w-16 rounded-lg border border-[var(--border-soft)] bg-[var(--surface-panel)] px-2 py-1 text-center text-[11px] text-[var(--text-primary)]"
              aria-label="Loft height (ft)"
            />
          </div>

          {/* Finish */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[var(--text-secondary)]">
              Finish
            </span>
            <select
              value={(wardrobe.finish as Finish) || "essential"}
              onChange={(e) => setFinish && setFinish(e.target.value as Finish)}
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
          SvgComponent={WardrobeSvg2D}
          glbUrlOverride={null} // 🔒 no GLB yet → always safe 2D fallback
          title="Wardrobe Layout"
          showTitle
        />

        <motion.p
          className="mt-2 text-[11px] text-[var(--text-muted)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.9 }}
        >
          2D elevation is the canonical layout for pricing. 3D mode reuses the
          same layout as a visual guide until wardrobe GLB assets are added.
        </motion.p>
      </section>
    </div>
  );
}
