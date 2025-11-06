"use client";
import React from "react";
import { motion } from "framer-motion";
import Lottie from "lottie-react";

import fixAnim from "@/app/animations/fix.json";
import interiorAnim from "@/app/animations/interior.json";
import paintAnim from "@/app/animations/paint.json";
import electricAnim from "@/app/animations/electric.json";
import diyAnim from "@/app/animations/diy.json";
import civilAnim from "@/app/animations/civil.json";

const SERVICES = [
  {
    name: "Home Repairs",
    tagline: "Quick Fixes & Maintenance",
    anim: fixAnim,
    color: "from-green-400 to-emerald-500",
  },
  {
    name: "Interior Design",
    tagline: "Modern Modular Spaces",
    anim: interiorAnim,
    color: "from-indigo-500 to-purple-500",
  },
  {
    name: "Painting & Finishes",
    tagline: "Vibrant Walls, Lasting Impressions",
    anim: paintAnim,
    color: "from-amber-400 to-pink-500",
  },
  {
    name: "Electrical Works",
    tagline: "Safe & Smart Wiring",
    anim: electricAnim,
    color: "from-blue-400 to-cyan-500",
  },
  {
    name: "DIY Inspirations",
    tagline: "Learn, Build, Create",
    anim: diyAnim,
    color: "from-violet-500 to-pink-500",
  },
  {
    name: "Civil & Renovation",
    tagline: "Foundations & Transformations",
    anim: civilAnim,
    color: "from-rose-500 to-orange-400",
  },
];

export default function ServicesSection() {
  return (
    <section
      id="services"
      className="relative py-24 px-4 md:px-8 w-full max-w-7xl mx-auto"
    >
      {/* 🌈 Header */}
      <div className="text-center mb-14">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-[#5A5DF0] to-[#EC6ECF] bg-clip-text text-transparent drop-shadow-sm"
        >
          The Heart of HomeFix India
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-gray-600 dark:text-slate-300 mt-3 max-w-2xl mx-auto text-sm md:text-base"
        >
          Discover all that we craft — from the smallest fixes to grand interiors,
          built with precision, care, and Edith’s AI-powered design flow.
        </motion.p>
      </div>

      {/* 🧱 Service Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {SERVICES.map((s, i) => (
          <motion.div
            key={s.name}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ scale: 1.04, y: -4 }}
            className={`relative rounded-2xl p-[2px] bg-gradient-to-br ${s.color} shadow-md hover:shadow-lg transition-all duration-500`}
          >
            <div
              className="relative bg-white dark:bg-slate-900 rounded-2xl h-full flex flex-col items-center
                         justify-center text-center p-8 overflow-hidden"
            >
              {/* ✨ Lottie Animation */}
              <div className="relative w-28 h-28 mb-3">
                <Lottie animationData={s.anim} loop autoplay />
              </div>

              {/* 🏷 Title + tagline */}
              <h3 className="text-lg font-semibold text-[#5A5DF0] dark:text-[#EC6ECF]">
                {s.name}
              </h3>
              <p className="text-gray-500 dark:text-slate-300 text-sm mt-1">
                {s.tagline}
              </p>

              {/* 🔮 Quantum Aura Glow */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileHover={{ opacity: 1, scale: 1.05 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#5A5DF0]/15 to-[#EC6ECF]/15 blur-xl opacity-0 group-hover:opacity-100 pointer-events-none"
              />

              {/* 🌈 Bottom Accent */}
              <motion.div
                layoutId={`border-${i}`}
                className={`absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r ${s.color}`}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
