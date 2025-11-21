"use client";

import { motion, useReducedMotion } from "framer-motion";

export default function BackgroundWaves() {
  const reduce = useReducedMotion();

  if (reduce) {
    return (
      <div
        className="
          pointer-events-none
          fixed inset-0 -z-10
          bg-[radial-gradient(circle_at_10%_0%,rgba(129,140,248,0.22),transparent_60%),radial-gradient(circle_at_90%_100%,rgba(45,212,191,0.18),transparent_55%),radial-gradient(circle_at_50%_100%,rgba(244,114,182,0.14),transparent_65%)]
        "
        style={{ transform: "none" }}
      />
    );
  }

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="pointer-events-none fixed inset-0
                   bg-[radial-gradient(circle_at_10%_0%,rgba(129,140,248,0.22),transparent_60%),radial-gradient(circle_at_90%_100%,rgba(45,212,191,0.18),transparent_55%),radial-gradient(circle_at_50%_100%,rgba(244,114,182,0.14),transparent_65%)]"
        style={{ transform: "none" }}
      />

      <motion.div
        className="absolute -left-1/4 top-1/3 w-[160%] h-[260px] opacity-[0.38]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(236,252,203,0.9) 1px, transparent 0)",
          backgroundSize: "18px 18px",
          maskImage:
            "linear-gradient(90deg, transparent 0%, black 12%, black 88%, transparent 100%)",
        }}
        initial={{ x: -60 }}
        animate={{ x: 60 }}
        transition={{ duration: 40, repeat: Infinity, repeatType: "reverse" }}
      />
    </div>
  );
}
