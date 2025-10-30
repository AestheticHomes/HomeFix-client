"use client";
/**
 * File: /components/ui/progress.js
 * Purpose: (auto-added during Portable Cleanup) — add a concise, human-readable purpose for this file.
 * Process: Part of HomeFix portable refactor; no functional changes made by header.
 * Dependencies: Review local imports; ensure single supabase client in /lib when applicable.
 * Note: This header is documentation-only and safe to remove or edit.
 */

import { motion } from "framer-motion";
import React from "react";

/**
 * Animated Progress Bar Component
 *
 * Props:
 * - value (number): progress percentage (0–100)
 * - color (string): Tailwind color class (default: "bg-green-600")
 * - height (string): Tailwind height class (default: "h-2.5")
 * - duration (number): animation duration in seconds (default: 0.6)
 */
export function Progress({
  value = 0,
  color = "bg-green-600",
  height = "h-2.5",
  duration = 0.6,
}) {
  return (
    <div
      className={`w-full bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden ${height}`}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin="0"
      aria-valuemax="100"
    >
      <motion.div
        className={`${color} ${height}`}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(value, 100)}%` }}
        transition={{ duration, ease: "easeOut" }}
      />
    </div>
  );
}