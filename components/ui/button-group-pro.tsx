"use client";
/**
 * ============================================================
 * 🎛️ EdithButtonGroupPro — v7.6
 * ------------------------------------------------------------
 * ✅ Persistent selection (localStorage)
 * ✅ Optional URL query sync
 * ✅ Keyboard navigation (← → or ↑ ↓)
 * ✅ Framer Motion highlight
 * ✅ Light/Dark adaptive (Edith theme)
 * ============================================================
 */

import clsx from "clsx";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";

export interface ButtonGroupProProps {
  groupKey: string; // unique key for persistence (e.g., "ledger-filter")
  options: { id: string; label: string; icon?: React.ElementType }[];
  defaultId?: string;
  syncURL?: boolean;
  className?: string;
  orientation?: "horizontal" | "vertical";
  rounded?: boolean;
  onChange?: (id: string) => void;
}

/**
 * Example:
 *  <ButtonGroupPro
 *     groupKey="ledger-filter"
 *     options={[
 *        { id: "all", label: "All" },
 *        { id: "paid", label: "Paid", icon: CheckCircle2 },
 *        { id: "failed", label: "Failed", icon: XCircle },
 *     ]}
 *     defaultId="all"
 *     syncURL
 *     onChange={setFilter}
 *  />
 */
export function ButtonGroupPro({
  groupKey,
  options,
  defaultId = options[0]?.id,
  syncURL = false,
  onChange,
  className,
  orientation = "horizontal",
  rounded = true,
}: ButtonGroupProProps) {
  const isVertical = orientation === "vertical";
  const router = useRouter();
  const params = useSearchParams();
  const containerRef = useRef<HTMLDivElement>(null);

  // 🧠 Active ID
  const [activeId, setActiveId] = useState<string>(defaultId);

  /* ------------------------------------------------------------
     🧩 Load persisted state or URL param
  ------------------------------------------------------------ */
  useEffect(() => {
    const stored = localStorage.getItem(`edith-group-${groupKey}`);
    const urlValue = syncURL ? params.get(groupKey) : null;
    setActiveId(urlValue || stored || defaultId);
  }, [groupKey, defaultId, params, syncURL]);

  /* ------------------------------------------------------------
     💾 Persist + Optional URL Sync
  ------------------------------------------------------------ */
  const handleChange = useCallback(
    (id: string) => {
      setActiveId(id);
      localStorage.setItem(`edith-group-${groupKey}`, id);
      if (syncURL) {
        const search = new URLSearchParams(Array.from(params.entries()));
        search.set(groupKey, id);
        router.replace(`?${search.toString()}`);
      }
      onChange?.(id);
    },
    [groupKey, syncURL, params, router, onChange]
  );

  /* ------------------------------------------------------------
     🎹 Keyboard Navigation (← → or ↑ ↓)
  ------------------------------------------------------------ */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const idx = options.findIndex((o) => o.id === activeId);
    if (idx === -1) return;
    if (
      (isVertical && e.key === "ArrowDown") ||
      (!isVertical && e.key === "ArrowRight")
    ) {
      e.preventDefault();
      const next = options[(idx + 1) % options.length];
      handleChange(next.id);
    } else if (
      (isVertical && e.key === "ArrowUp") ||
      (!isVertical && e.key === "ArrowLeft")
    ) {
      e.preventDefault();
      const prev = options[(idx - 1 + options.length) % options.length];
      handleChange(prev.id);
    }
  };

  /* ------------------------------------------------------------
     🎨 Render
  ------------------------------------------------------------ */
  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className={clsx(
        "relative inline-flex isolate overflow-hidden outline-none",
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
            onClick={() => handleChange(opt.id)}
            className={clsx(
              "relative z-10 flex-1 px-4 py-2 text-sm font-medium transition-all duration-150",
              "flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--edith-accent)]",
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

      {/* 🪶 Animated highlight */}
      <motion.div
        key={activeId}
        layoutId={`edith-highlight-${groupKey}`}
        className="absolute bg-[var(--edith-primary)] z-0 rounded-xl"
        style={{
          [isVertical ? "height" : "width"]: `${100 / options.length}%`,
          [isVertical ? "top" : "left"]: `${
            options.findIndex((o) => o.id === activeId) * (100 / options.length)
          }%`,
          [isVertical ? "width" : "height"]: "100%",
        }}
        transition={{ type: "spring", stiffness: 260, damping: 30 }}
      />
    </div>
  );
}

export default ButtonGroupPro;
