"use client";

/**
 * HomeFixLogo v3.0 — Static Gemini Core 💎
 * ----------------------------------------
 * ✅ Sharp, gradient text (no blur)
 * ✅ Used in UniversalHeader & branding exports
 */

import { motion } from "framer-motion";

export default function HomeFixLogo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const fontSize = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl",
  }[size];

  return (
    <motion.span
      className={`font-extrabold tracking-tight bg-gradient-to-r 
                  from-[#5A5DF0] via-[#9B5CF8] to-[#EC6ECF] bg-clip-text 
                  text-transparent ${fontSize} select-none`}
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      HomeFix
    </motion.span>
  );
}
