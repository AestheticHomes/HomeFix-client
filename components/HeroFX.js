"use client";
/**
 * File: /components/HeroFX.js
 * Purpose: (auto-added during Portable Cleanup) — add a concise, human-readable purpose for this file.
 * Process: Part of HomeFix portable refactor; no functional changes made by header.
 * Dependencies: Review local imports; ensure single supabase client in /lib when applicable.
 * Note: This header is documentation-only and safe to remove or edit.
 */
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

export default function HeroFX() {
  const [hydrated, setHydrated] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // safe hydration
  useEffect(() => {
    setHydrated(true);
  }, []);

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { stiffness: 60 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { stiffness: 60 });

  useEffect(() => {
    if (!hydrated) return;
    const handleMove = (e) => {
      const ratioX = (e.clientX / window.innerWidth) - 0.5;
      const ratioY = (e.clientY / window.innerHeight) - 0.5;
      x.set(ratioX);
      y.set(ratioY);
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [x, y, hydrated]);

  // 🧩 Render only after hydration
  if (!hydrated) return null;

  return (
    <motion.div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{ perspective: 1000 }}
    >
      {/* Dust shimmer */}
      <motion.img
        src="/effects/wood-dust.webp"
        alt="floating dust overlay"
        className="w-full h-full object-cover opacity-20 mix-blend-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.25, 0.15, 0.25, 0.1, 0.2] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        style={{ rotateX, rotateY }}
      />

      {/* Sliding light beam */}
      <motion.div
        className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-yellow-200/10 to-transparent blur-3xl"
        animate={{ x: ["-30%", "130%"] }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
      />
    </motion.div>
  );
}