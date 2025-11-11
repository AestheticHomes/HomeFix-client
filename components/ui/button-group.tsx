"use client";
/**
 * ============================================================
 * 🎛️ EdithButtonGroup — v7.5 (Toggle-Enabled)
 * ------------------------------------------------------------
 * ✅ Horizontal/Vertical group
 * ✅ Segmented toggle with Framer Motion highlight
 * ✅ Light/Dark adaptive
 * ✅ Works with <Button> seamlessly
 * ============================================================
 */

import clsx from "clsx";
import { motion } from "framer-motion";
import * as React from "react";

export interface ButtonGroupProps {
  options: { id: string; label: string; icon?: React.ElementType }[];
  activeId?: string;
  onChange?: (id: string) => void;
  className?: string;
  orientation?: "horizontal" | "vertical";
  rounded?: boolean;
}

/**
 * Usage Example:
 * <ButtonGroup
 *    options={[
 *      { id: "all", label: "All" },
 *      { id: "paid", label: "Paid" },
 *      { id: "failed", label: "Failed" },
 *    ]}
 *    activeId={filter}
 *    onChange={setFilter}
 * />
 */
export function ButtonGroup({
  options,
  activeId,
  onChange,
  className,
  orientation = "horizontal",
  rounded = true,
}: ButtonGroupProps) {
  const isVertical = orientation === "vertical";

  return (
    <div
      className={clsx(
        "relative inline-flex isolate overflow-hidden",
        isVertical ? "flex-col" : "flex-row",
        "border border-[var(--edith-border)] bg-[var(--edith-surface)] dark:bg-[var(--edith-surface)] shadow-sm",
        rounded && "rounded-xl",
        className
      )}
    >
      {options.map((opt) => {
        const isActive = activeId === opt.id;
        const Icon = opt.icon;

        return (
          <button
            key={opt.id}
            onClick={() => onChange?.(opt.id)}
            className={clsx(
              "relative z-10 flex-1 px-4 py-2 text-sm font-medium transition-all duration-150",
              "flex items-center justify-center gap-2",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--edith-accent)]",
              isActive
                ? "text-[var(--edith-on-primary)]"
                : "text-[var(--edith-text)] hover:bg-[var(--edith-surface-hover)]"
            )}
          >
            {Icon && <Icon className="w-4 h-4" />}
            {opt.label}
          </button>
        );
      })}

      {/* 🪶 Animated highlight background */}
      <motion.div
        key={activeId}
        layoutId="edith-button-group-highlight"
        className={clsx(
          "absolute bg-[var(--edith-primary)] inset-0 z-0",
          isVertical
            ? "top-[calc(var(--index)*100%)] left-0 w-full h-[33%]"
            : "top-0 left-[calc(var(--index)*100%)] h-full",
          "rounded-xl"
        )}
        style={{
          // Calculate highlight position dynamically
          [isVertical ? "height" : "width"]: `${100 / options.length}%`,
          [isVertical ? "top" : "left"]: `${
            options.findIndex((o) => o.id === activeId) * (100 / options.length)
          }%`,
        }}
        transition={{ type: "spring", stiffness: 250, damping: 30 }}
      />
    </div>
  );
}

export default ButtonGroup;
