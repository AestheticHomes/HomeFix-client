"use client";
/**
 * ============================================================
 * CategoryRail v1.1 — Edith Blinkit Rail 🌿
 * ------------------------------------------------------------
 * ✅ TypeScript safe (explicit props)
 * ✅ Vertical swipeable sidebar (mobile)
 * ✅ 15mm pinned design (≈ 60px)
 * ============================================================
 */

import { motion } from "framer-motion";
import React from "react";

interface CategoryRailProps {
  categories: string[];
  active: string;
  onSelect: (cat: string) => void;
}

const CategoryRail: React.FC<CategoryRailProps> = ({
  categories,
  active,
  onSelect,
}) => {
  return (
    <aside
      className="fixed left-0 top-[var(--header-h)]
                 bottom-[var(--mbnav-h,72px)] z-[70]
                 w-[60px] flex flex-col items-center
                 border-r border-[var(--edith-border)]
                 bg-[var(--surface-light)] dark:bg-[var(--surface-dark)]
                 md:hidden overflow-y-auto overscroll-contain
                 scrollbar-none touch-pan-y snap-y snap-mandatory
                 backdrop-blur-md transition-all duration-500"
      style={{
        WebkitOverflowScrolling: "touch",
        scrollbarWidth: "none",
      }}
    >
      <div className="flex flex-col py-3 gap-2 items-center w-full">
        {categories.map((cat: string) => {
          const isActive = cat === active;
          return (
            <motion.button
              key={cat}
              onClick={() => onSelect(cat)}
              whileTap={{ scale: 0.92 }}
              className={`relative w-[48px] h-[48px] rounded-full flex items-center justify-center text-[11px] font-medium
                overflow-hidden transition-all duration-300 snap-start
                ${
                  isActive
                    ? "bg-gradient-to-b from-emerald-500 to-lime-400 text-white shadow-[0_0_8px_rgba(16,185,129,0.6)]"
                    : "bg-[var(--surface-card)] dark:bg-[var(--surface-card-dark)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]"
                }`}
            >
              <span className="truncate max-w-[42px] text-center leading-tight px-1">
                {cat.replace(/\s+/g, "\n")}
              </span>
            </motion.button>
          );
        })}
      </div>
    </aside>
  );
};

export default CategoryRail;
