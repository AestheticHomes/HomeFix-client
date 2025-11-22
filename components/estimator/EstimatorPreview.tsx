"use client";

/**
 * EstimatorPreview.tsx
 * ---------------------------------------------
 * Single gateway between estimator state and the actual 2D / 3D viewers.
 * - Exactly one viewport mounted at a time.
 * - 2D → PanZoomViewport + provided SVG.
 * - 3D → UniversalPreview loading GLB derived from shape.
 */

import KitchenSvg2D from "@/components/estimator/KitchenSvg2D";
import PanZoomViewport from "@/components/estimator/common/PanZoomViewport";
import { getEstimatorGlbUrl } from "@/components/estimator/lib/getEstimatorGlbUrl";
import useEstimator from "@/components/estimator/store/estimatorStore";
import UniversalPreview from "@/components/preview/UniversalPreview";
import { motion } from "framer-motion";
import { useMemo } from "react";

const PANEL_SURFACE =
  "color-mix(in srgb, var(--surface-panel) 95%, transparent)";

export type EstimatorPreviewProps = {
  SvgComponent?: React.ComponentType<Record<string, never>>;
  ModelComponent?: React.ComponentType<Record<string, never>>; // reserved for future custom R3F
  title?: string;
  showTitle?: boolean;
};

function EntangledDualityToggle() {
  const mode = useEstimator((s) => s.mode);
  const setMode = useEstimator((s) => s.setMode);
  const is3d = mode === "3d";

  return (
    <div className="absolute top-3 right-3 z-20">
      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={() => setMode(is3d ? "2d" : "3d")}
        aria-label={is3d ? "Switch to 2D Plan" : "Switch to 3D View"}
        className="relative h-8 w-[118px] rounded-full border border-[var(--border-soft)] bg-[var(--surface-panel)] dark:bg-[var(--surface-panel-dark)] backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.12)] flex items-center justify-between px-4 overflow-hidden transition-colors duration-300"
      >
        <div
          className={`absolute inset-0 rounded-full transition-colors duration-500 ${
            is3d
              ? "bg-[color-mix(in_srgb,var(--accent-secondary)15%,transparent)]"
              : "bg-[color-mix(in_srgb,var(--accent-primary)15%,transparent)]"
          }`}
        />
        <div className="absolute inset-0 rounded-full ring-1 ring-[var(--border-subtle)]" />

        <span
          className="z-10 text-[11px] font-semibold transition-opacity"
          style={{ color: "var(--text-primary)", opacity: is3d ? 0.5 : 1 }}
        >
          2D
        </span>
        <span
          className="z-10 text-[11px] font-semibold transition-opacity"
          style={{ color: "var(--text-primary)", opacity: is3d ? 1 : 0.5 }}
        >
          3D
        </span>

        <motion.div
          className="absolute inset-y-[2px] left-[5px] flex items-center justify-start"
          animate={{ x: is3d ? 52 : 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          style={{
            width: "52px",
            height: "calc(100% - 4px)",
            borderRadius: "9999px",
            pointerEvents: "none",
          }}
        >
          <motion.div
            className="mx-auto flex items-center justify-center"
            animate={{
              width: 14,
              height: 14,
              borderRadius: "9999px",
              background: is3d
                ? "linear-gradient(135deg,var(--accent-secondary),var(--accent-tertiary))"
                : "linear-gradient(135deg,var(--accent-primary),var(--accent-tertiary))",
              boxShadow: is3d
                ? "0 0 12px color-mix(in srgb,var(--accent-secondary)80%,transparent), 0 0 2px color-mix(in srgb,var(--accent-secondary)85%,transparent) inset"
                : "0 0 12px color-mix(in srgb,var(--accent-primary)80%,transparent), 0 0 2px color-mix(in srgb,var(--accent-primary)85%,transparent) inset",
            }}
            transition={{
              duration: 1.4,
              repeat: Infinity,
              repeatType: "mirror",
            }}
          />
        </motion.div>
      </motion.button>
    </div>
  );
}

export default function EstimatorPreview({
  SvgComponent = KitchenSvg2D,
  ModelComponent: _ModelComponent,
  title,
  showTitle,
}: EstimatorPreviewProps) {
  const mode = useEstimator((s) => s.mode);
  const shape = useEstimator((s) => s.kitchen.shape);

  const glbUrl = useMemo(() => getEstimatorGlbUrl(shape), [shape]);

  if (process.env.NODE_ENV !== "production" && mode === "3d" && !glbUrl) {
    // eslint-disable-next-line no-console
    console.warn("[EstimatorPreview] 3D mode active but glbUrl is null for shape:", shape);
  }

  const watermarkTone = useMemo(
    () =>
      mode === "3d"
        ? "text-[color-mix(in_srgb,var(--accent-secondary)80%,transparent)]"
        : "text-[color-mix(in_srgb,var(--accent-primary)80%,transparent)]",
    [mode]
  );

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden border border-[var(--border-muted)] bg-[var(--surface-panel)] dark:bg-[var(--surface-panel-dark)]
                 min-h-[420px] md:min-h-[520px] lg:min-h-[600px] max-h-[80vh]"
      style={{
        background: PANEL_SURFACE,
        boxShadow:
          "0 28px 90px color-mix(in srgb, var(--text-primary) 9%, transparent)",
      }}
    >
      {/* Aura background */}
      <div
        className="absolute inset-0 pointer-events-none -z-10 opacity-20 dark:opacity-55"
        style={{
          background:
            "radial-gradient(circle at 20% 20%, color-mix(in srgb, var(--aura-light) 60%, transparent), transparent 65%), radial-gradient(circle at 80% 0%, color-mix(in srgb, var(--aura-dark) 45%, transparent), transparent 70%)",
        }}
      />

      {showTitle && (
        <div className="absolute top-3 left-3 text-xs font-semibold text-[var(--accent-tertiary)]">
          {title} · {mode.toUpperCase()} Mode
        </div>
      )}

      <EntangledDualityToggle />

      {/* VIEWPORT: exactly one branch mounted */}
      {mode === "2d" ? (
        <PanZoomViewport
          sceneWidth={4000}
          sceneHeight={2000}
          autoFitOnMount
          autoFitOnFitKeyChange
          fitKey={shape}
        >
          {() => (
            <div className="w-full h-full flex items-center justify-center">
              {SvgComponent ? <SvgComponent /> : null}
            </div>
          )}
        </PanZoomViewport>
      ) : (
        <div className="absolute inset-0 pt-8 pb-8 px-3">
          <UniversalPreview
            glbUrl={glbUrl ?? undefined}
            imageUrl={undefined}
            svgComponent={undefined}
            modelComponent={undefined}
            initialMode="3d"
            forcedViewMode="3d"
            enableModeToggle={false}
            enableSelectionOverlay={false}
            showFullscreenToggle={false}
            fillContainer
          />
        </div>
      )}

      {/* Watermark & disclaimer */}
      <div
        className={`pointer-events-none absolute right-3 bottom-5 text-[11px] font-medium select-none ${watermarkTone}`}
      >
        HomeFix Studio
      </div>

      <span className="pointer-events-none absolute left-3 bottom-3 text-[10px] text-[var(--text-muted)]">
        2D plan is the exact layout used for pricing. 3D view is an approximate
        visual for reference only.
      </span>
    </div>
  );
}
