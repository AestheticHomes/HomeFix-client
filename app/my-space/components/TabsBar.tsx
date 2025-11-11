"use client";
/**
 * TabsBar v1.0 — Draggable Bookings Filter Tabs
 * ------------------------------------------------------------
 * ✅ Drag-scrollable with mouse & touch
 * ✅ Snaps smoothly and respects SafeViewport top
 * ✅ Reusable across future lists (projects, invoices)
 * ============================================================
 */

import clsx from "clsx";
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

const STATUS_TABS = [
  { key: "all", label: "All" },
  { key: "upcoming", label: "Upcoming" },
  { key: "in-progress", label: "In Progress" },
  { key: "rescheduled", label: "Rescheduled" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

export default function TabsBar({
  activeTab,
  setActiveTab,
}: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}) {
  const tabRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = tabRef.current;
    if (!el) return;

    let isDown = false;
    let startX = 0,
      scrollLeft = 0;

    const start = (e: MouseEvent | TouchEvent) => {
      isDown = true;
      startX =
        (e instanceof MouseEvent ? e.pageX : e.touches[0].pageX) -
        el.offsetLeft;
      scrollLeft = el.scrollLeft;
    };
    const move = (e: MouseEvent | TouchEvent) => {
      if (!isDown) return;
      const x =
        (e instanceof MouseEvent ? e.pageX : e.touches[0].pageX) -
        el.offsetLeft;
      el.scrollLeft = scrollLeft - (x - startX) * 1.2;
    };
    const end = () => (isDown = false);

    el.addEventListener("mousedown", start);
    el.addEventListener("mousemove", move);
    el.addEventListener("mouseup", end);
    el.addEventListener("mouseleave", end);
    el.addEventListener("touchstart", start);
    el.addEventListener("touchmove", move);
    el.addEventListener("touchend", end);

    return () => {
      el.removeEventListener("mousedown", start);
      el.removeEventListener("mousemove", move);
      el.removeEventListener("mouseup", end);
      el.removeEventListener("mouseleave", end);
      el.removeEventListener("touchstart", start);
      el.removeEventListener("touchmove", move);
      el.removeEventListener("touchend", end);
    };
  }, []);

  return (
    <div
      ref={tabRef}
      className="flex gap-2 overflow-x-auto pb-2 pt-2 px-1
                 scrollbar-none scroll-smooth touch-pan-x snap-x snap-mandatory
                 border-b border-gray-200/30 dark:border-slate-800/30
                 backdrop-blur-md sticky top-[var(--header-h)] z-[60]
                 bg-[var(--surface-light)/70] dark:bg-[var(--surface-dark)/70]"
      style={{ WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}
    >
      {STATUS_TABS.map((t) => {
        const active = activeTab === t.key;
        return (
          <motion.button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            whileTap={{ scale: 0.95 }}
            className={clsx(
              "px-4 py-1.5 rounded-full text-sm font-medium snap-start whitespace-nowrap border transition-all",
              active
                ? "bg-gradient-to-r from-emerald-600 to-lime-500 text-white shadow-md border-transparent"
                : "border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800"
            )}
          >
            {t.label}
          </motion.button>
        );
      })}
    </div>
  );
}
