"use client";

/**
 * HomeFixLogo v3.0 — Static Gemini Core 💎
 * ----------------------------------------
 * ✅ Sharp, gradient text (no blur)
 * ✅ Used in UniversalHeader & branding exports
 */

import { motion } from "framer-motion";

export default function HomeFixLogo({
  size = "md",
}: {
  size?: "sm" | "md" | "lg";
}) {
  const fontSize = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-4xl",
  }[size];

  return (
    <motion.span
      className={`relative inline-flex items-center ${fontSize} select-none`}
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Edith Aura behind the logo */}
      <span
        aria-hidden="true"
        className="absolute -inset-1 rounded-full blur-md opacity-45"
        style={{
          background:
            "linear-gradient(120deg, color-mix(in srgb, var(--accent-tertiary) 55%, transparent 45%), color-mix(in srgb, var(--accent-primary) 45%, transparent 55%), color-mix(in srgb, var(--accent-secondary) 35%, transparent 65%))",
        }}
      />

      {/* Gradient wordmark — animated Edith aura */}
      <span
        className="relative font-extrabold tracking-tight bg-clip-text text-transparent edith-logo-gradient"
      >
        HomeFix
      </span>
    </motion.span>
  );
}
