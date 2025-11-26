"use client";

/**
 * EstimatorPreview.tsx
 * ---------------------------------------------
 * Single gateway between estimator state and the actual 2D / 3D viewers.
 *
 * Rules:
 *  - Exactly one viewport mounted at a time.
 *  - 2D → directly render the provided SvgComponent (which itself can
 *         use PanZoomViewport / CAD logic).
 *  - 3D → UniversalPreview with GLB derived from shape, or from an
 *         explicit override (glbUrlOverride).
 *
 * 2D is the canonical pricing view and must never break:
 *  - If 3D has no GLB or fails, UniversalPreview falls back to SvgComponent.
 */

import KitchenSvg2D from "@/components/estimator/KitchenSvg2D";
import { getEstimatorGlbUrl } from "@/components/estimator/lib/getEstimatorGlbUrl";
import useEstimator from "@/components/estimator/store/estimatorStore";
import UniversalPreview from "@/components/preview/UniversalPreview";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";

const PANEL_SURFACE =
  "color-mix(in srgb, var(--surface-panel) 95%, transparent)";

export type EstimatorPreviewProps = {
  /**
   * 2D renderer. For kitchen this is KitchenSvg2D; for wardrobe it's
   * WardrobeSvg2D. Component is assumed to be self-contained (it can
   * include its own PanZoomViewport / svg logic).
   */
  SvgComponent?: React.ComponentType<Record<string, never>>;

  /**
   * Reserved for future custom R3F models (instead of GLB). For now,
   * estimators use GLB via getEstimatorGlbUrl.
   */
  ModelComponent?: React.ComponentType<Record<string, never>>;

  /** Optional label in the top-left (e.g., "Kitchen Layout"). */
  title?: string;

  /** Whether to render the title. */
  showTitle?: boolean;

  /**
   * Optional manual override for GLB URL.
   * - If provided, estimator will use this exactly.
   * - If undefined, we derive from kitchen.shape via getEstimatorGlbUrl.
   * - For wardrobe you can pass null here to effectively disable GLB.
   */
  glbUrlOverride?: string | null;
};

/* =========================================================
   🔹 MODE TOGGLE (GLOBAL STORE)
   ---------------------------------------------------------
   Controls estimator.mode ("2d" | "3d") in Zustand.
   Shared between kitchen and wardrobe.
   ========================================================= */
function EntangledDualityToggle({
  xrayOn,
  onToggleXray,
}: {
  xrayOn: boolean;
  onToggleXray: () => void;
}) {
  const mode = useEstimator((s) => s.mode);
  const setMode = useEstimator((s) => s.setMode);
  const is3d = mode === "3d";

  return (
    <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={() => setMode(is3d ? "2d" : "3d")}
        aria-label={is3d ? "Switch to 2D Plan" : "Switch to 3D View"}
        className="relative flex h-8 w-[118px] items-center justify-between overflow-hidden rounded-full border border-[var(--border-soft)] bg-[var(--surface-panel)] shadow-[0_10px_30px_rgba(0,0,0,0.12)] backdrop-blur-md dark:bg-[var(--surface-panel-dark)] px-4 transition-colors duration-300"
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
      {is3d && (
        <button
          type="button"
          onClick={onToggleXray}
          className={`h-8 rounded-full border border-[var(--border-soft)] px-3 text-[11px] font-semibold transition-colors ${
            xrayOn
              ? "bg-[color-mix(in_srgb,var(--accent-secondary)18%,transparent)] text-[var(--text-primary)]"
              : "bg-[var(--surface-panel)] text-[var(--text-secondary)]"
          }`}
          aria-pressed={xrayOn}
        >
          {xrayOn ? "X-ray: On" : "X-ray vision"}
        </button>
      )}
    </div>
  );
}

/* =========================================================
   🔸 MAIN PREVIEW COMPONENT
   ========================================================= */
export default function EstimatorPreview({
  SvgComponent = KitchenSvg2D,
  ModelComponent: _ModelComponent, // reserved for future use
  title,
  showTitle,
  glbUrlOverride,
}: EstimatorPreviewProps) {
  const [xrayOn, setXrayOn] = useState(false);
  const mode = useEstimator((s) => s.mode);
  const kitchenShape = useEstimator((s) => s.kitchen.shape);

  // Decide GLB URL:
  //  - For kitchen: default to getEstimatorGlbUrl(kitchenShape)
  //  - For wardrobe: caller passes glbUrlOverride = null (no GLB)
  const glbUrl = useMemo(() => {
    if (glbUrlOverride !== undefined) return glbUrlOverride;
    return getEstimatorGlbUrl(kitchenShape);
  }, [glbUrlOverride, kitchenShape]);

  // Dev-only warning *only* for auto-GLB flows (kitchen),
  // not for places that explicitly disable GLB with glbUrlOverride=null.
  if (
    process.env.NODE_ENV !== "production" &&
    mode === "3d" &&
    glbUrlOverride === undefined &&
    !glbUrl
  ) {
    // eslint-disable-next-line no-console
    console.warn(
      "[EstimatorPreview] 3D mode active but glbUrl is null for shape:",
      kitchenShape
    );
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
      className="relative max-h-[80vh] min-h-[420px] w-full overflow-hidden rounded-2xl border border-[var(--border-muted)] bg-[var(--surface-panel)] shadow-[0_28px_90px_color-mix(in_srgb,var(--text-primary)_9%,transparent)] dark:bg-[var(--surface-panel-dark)] md:min-h-[520px] lg:min-h-[600px]"
      style={{
        background: PANEL_SURFACE,
      }}
    >
      {/* Aura background */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-20 dark:opacity-55"
        style={{
          background:
            "radial-gradient(circle at 20% 20%, color-mix(in srgb, var(--aura-light) 60%, transparent), transparent 65%), radial-gradient(circle at 80% 0%, color-mix(in srgb, var(--aura-dark) 45%, transparent), transparent 70%)",
        }}
      />

      {showTitle && (
        <div className="absolute left-3 top-3 text-xs font-semibold text-[var(--accent-tertiary)]">
          {title} · {mode.toUpperCase()} Mode
        </div>
      )}

      <EntangledDualityToggle
        xrayOn={xrayOn}
        onToggleXray={() => setXrayOn((prev) => !prev)}
      />

      {/* VIEWPORT: exactly one branch mounted */}
      {mode === "2d" ? (
        // 2D mode → we trust SvgComponent to manage its own PanZoomViewport / svg
        <div className="absolute inset-0 pt-8 pb-6 pl-3 pr-3">
          <div className="relative flex h-full w-full items-center justify-center">
            {SvgComponent ? <SvgComponent /> : null}
          </div>
        </div>
      ) : (
        // 3D mode → UniversalPreview, but we pass SvgComponent so if GLB
        // is missing/broken it falls back to 2D instead of blank.
        <div className="absolute inset-0 px-3 pb-8 pt-8">
          <UniversalPreview
            glbUrl={glbUrl ?? undefined}
            imageUrl={undefined}
            svgComponent={SvgComponent}
            modelComponent={undefined}
            initialMode="3d"
            forcedViewMode="3d"
            enableModeToggle={false}
            enableSelectionOverlay={false}
            showFullscreenToggle={false}
            fillContainer
            showInteractionHint
            xrayEnabled
            xrayOn={xrayOn}
          />
        </div>
      )}

      {/* Watermark & disclaimer */}
      <div
        className={`pointer-events-none absolute right-3 bottom-5 select-none text-[11px] font-medium ${watermarkTone}`}
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
