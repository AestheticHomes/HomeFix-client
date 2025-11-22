"use client";

/**
 * KitchenShapeSelector
 * -----------------------------------------
 * Lightweight replacement for the old Shape <Select>.
 *
 * Why this exists:
 *  - The Radix-based Select was slow to open inside the estimator shell
 *    because it triggered a large React re-render and layout calculations.
 *  - We only have 4 discrete options (Linear, Parallel, L, U), which are
 *    better expressed as a segmented control.
 *
 * Behaviour:
 *  - Reads the current shape from the estimator zustand store.
 *  - Writes the selected shape back using the store's setter.
 *  - Pure client component, no server dependencies.
 *
 * Dependencies:
 *  - useEstimator from "@/components/estimator/store/estimatorStore"
 *    must expose:
 *      - kitchen.shape: string
 *      - setShape(next: string) or equivalent updater.
 *
 * How to wire:
 *  - Replace the old <Select> used for "Shape" in the estimator toolbar
 *    with <KitchenShapeSelector />.
 */

import useEstimator from "@/components/estimator/store/estimatorStore";

// Adjust these keys to exactly match your store values
type ShapeKey = "linear" | "parallel" | "lshape" | "u";

const SHAPES: { key: ShapeKey; label: string }[] = [
  { key: "linear", label: "Single wall" },
  { key: "parallel", label: "Parallel" },
  { key: "lshape", label: "L-shape" },
  { key: "u", label: "U-shape" },
];

export default function KitchenShapeSelector() {
  const shape = useEstimator((s) => s.kitchen.shape as ShapeKey);
  const setShape = useEstimator((s) => s.setKitchenShape);

  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] font-medium text-[var(--text-muted)]">
        Shape
      </span>
      <div className="inline-flex rounded-full bg-[color-mix(in_srgb,var(--surface-panel)80%,transparent)] border border-[var(--border-soft)] p-[2px]">
        {SHAPES.map((option) => {
          const isActive = shape === option.key;

          return (
            <button
              key={option.key}
              type="button"
              onClick={() => setShape(option.key)}
              className={[
                "px-3 py-1 rounded-full text-[11px] font-medium transition-all",
                "whitespace-nowrap",
                isActive
                  ? "bg-[color-mix(in_srgb,var(--accent-primary)35%,transparent)] text-[var(--text-primary)] shadow-sm"
                  : "text-[var(--text-secondary)] hover:bg-[color-mix(in_srgb,var(--surface-card)80%,transparent)]",
              ].join(" ")}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
