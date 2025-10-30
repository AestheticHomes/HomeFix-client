/**
 * File: /components/HeroParallax.tsx
 * Purpose: Animated parallax hero with depth using Framer Motion scroll.
 */

"use client";
import { motion, useScroll, useTransform } from "framer-motion";

export default function HeroParallax() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 80]);
  const y2 = useTransform(scrollY, [0, 500], [0, -40]);

  return (
    <section className="relative h-[70vh] overflow-hidden bg-gradient-to-b from-slate-900 to-slate-700">
      <motion.img
        src="/images/bg-layer1.png"
        className="absolute top-0 w-full h-full object-cover opacity-60"
        style={{ y: y1 }}
      />
      <motion.img
        src="/images/bg-layer2.png"
        className="absolute top-0 w-full h-full object-cover opacity-80"
        style={{ y: y2 }}
      />
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-white">
        <h1 className="text-4xl md:text-5xl font-bold">HomeFix India</h1>
        <p className="text-lg mt-3 opacity-80">
          Tech-Enabled DIY & Workforce Cloud
        </p>
      </div>
    </section>
  );
}
