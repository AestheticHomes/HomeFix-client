"use client";
/**
 * File: components/estimator/EstimatorShell.jsx
 * Version: v3.6 — Edith Stable Build 🌈
 * Fixes:
 *  ✅ U-Shape selection persistence
 *  ✅ Removed JSX style syntax error
 *  ✅ Added Tailwind animation utility instead
 */

import React, { useMemo } from "react";
import useEstimator from "@/components/estimator/store/estimatorStore";
import KitchenRender from "@/components/estimator/KitchenRender";
import WardrobeRender from "@/components/estimator/WardrobeRender";
import SummaryPanel from "@/components/estimator/SummaryPanel";

/* =========================================================
   🔹 Kitchen Form
   ========================================================= */
function KitchenForm({ kitchen, setKitchenShape, setKitchenFinish, setKitchenLength }) {
  const max = kitchen.perWallMax;

  const handleShapeChange = (e) => {
    const raw = e.target.value.toLowerCase().trim();
    let normalized = "linear";
    if (raw.includes("lshape")) normalized = "lshape";
    else if (raw.includes("ushape") || raw === "u") normalized = "u";
    else if (raw.includes("parallel")) normalized = "parallel";
    console.log("🧱 [UI] Shape selected →", normalized);
    setKitchenShape(normalized);
  };

  const minByShape = kitchen.shape === "linear" ? 10 : 8;
  const Input = (key, label, min = minByShape) => (
    <div className="space-y-1 animate-fadeIn">
      <label className="text-sm font-medium text-[#5A5DF0] dark:text-[#EC6ECF]">{label} (ft)</label>
      <input
        type="number"
        min={min}
        max={max}
        step={0.1}
        value={kitchen.lengths[key] ?? min}
        onChange={(e) => {
          const v = Math.max(min, parseFloat(e.target.value) || 0);
          setKitchenLength(key, v);
          console.log(`📏 [${kitchen.shape.toUpperCase()}] Wall ${key}: ${v.toFixed(2)} ft`);
        }}
        className="w-full rounded-lg border border-[#9B5CF8]/30 bg-white/25 dark:bg-[#0D0B2B]/40 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#5A5DF0]/40"
      />
      <p className="text-[10px] text-gray-400">Min {min} ft · Max {max} ft</p>
    </div>
  );

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* --- Shape Selector --- */}
      <div>
        <label className="text-sm font-semibold text-[#5A5DF0] dark:text-[#EC6ECF]">Shape</label>
        <select
          value={kitchen.shape}
          onChange={handleShapeChange}
          className="w-full rounded-lg border border-[#9B5CF8]/30 px-3 py-2 mt-1 bg-white/25 dark:bg-[#0D0B2B]/40"
        >
          <option value="linear">Single Wall (Linear)</option>
          <option value="parallel">Galley (Parallel)</option>
          <option value="lshape">L Shape</option>
          <option value="u">U Shape</option>
        </select>
      </div>

      {/* --- Wall Inputs --- */}
      {kitchen.shape === "u" ? (
        <div className="grid grid-cols-3 gap-3">{["A", "B", "C"].map((w) => Input(w, `Wall ${w}`))}</div>
      ) : kitchen.shape === "parallel" || kitchen.shape === "lshape" ? (
        <div className="grid grid-cols-2 gap-3">{["A", "B"].map((w) => Input(w, `Wall ${w}`))}</div>
      ) : (
        Input("A", "Wall A", 10)
      )}

      {/* --- Finish Selector --- */}
      <div>
        <label className="text-sm font-semibold text-[#5A5DF0] dark:text-[#EC6ECF]">Finish</label>
        <select
          value={kitchen.finish}
          onChange={(e) => setKitchenFinish(e.target.value)}
          className="w-full rounded-lg border border-[#9B5CF8]/30 px-3 py-2 mt-1 bg-white/25 dark:bg-[#0D0B2B]/40"
        >
          <option value="essential">Essential</option>
          <option value="premium">Premium</option>
          <option value="luxury">Luxury</option>
        </select>
      </div>
    </div>
  );
}

/* =========================================================
   🔹 Wardrobe Form
   ========================================================= */
function WardrobeForm({ wardrobe, setWardrobeWidth, setWardrobeFinish }) {
  return (
    <div className="space-y-4 animate-fadeIn">
      <div>
        <label className="text-sm font-semibold text-[#5A5DF0] dark:text-[#EC6ECF]">Width (ft)</label>
        <input
          type="number"
          min={0}
          max={wardrobe.maxFt}
          step={0.1}
          value={wardrobe.widthFt}
          onChange={(e) => setWardrobeWidth(e.target.value)}
          className="w-full rounded-lg border border-[#9B5CF8]/30 bg-white/25 dark:bg-[#0D0B2B]/40 px-3 py-2 mt-1"
        />
        <p className="text-[10px] text-gray-400">Max width: {wardrobe.maxFt} ft</p>
      </div>

      <div>
        <label className="text-sm font-semibold text-[#5A5DF0] dark:text-[#EC6ECF]">Finish</label>
        <select
          value={wardrobe.finish}
          onChange={(e) => setWardrobeFinish(e.target.value)}
          className="w-full rounded-lg border border-[#9B5CF8]/30 bg-white/25 dark:bg-[#0D0B2B]/40 px-3 py-2 mt-1"
        >
          <option value="essential">Essential</option>
          <option value="premium">Premium</option>
          <option value="luxury">Luxury</option>
        </select>
      </div>
    </div>
  );
}

/* =========================================================
   🔹 EstimatorShell
   ========================================================= */
export default function EstimatorShell() {
  const {
    step,
    kitchen,
    wardrobe,
    setStep,
    setKitchenShape,
    setKitchenFinish,
    setKitchenLength,
    setWardrobeWidth,
    setWardrobeFinish,
    getComputed,
  } = useEstimator();

  const computed = useMemo(() => getComputed(), [kitchen, wardrobe]);

  /* 🟣 Summary Mode */
  if (step === "summary") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F9F8FF] to-[#F3F1FF] dark:from-[#0A0820] dark:to-[#120F2C]">
        <div className="max-w-5xl mx-auto p-8">
          <SummaryPanel data={computed} />
          <div className="flex justify-end mt-6">
            <button
              onClick={() => setStep("wardrobe")}
              className="px-4 py-2 border border-[#9B5CF8]/30 rounded-lg text-[#5A5DF0]"
            >
              ← Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* 🟦 Normal Flow (Kitchen / Wardrobe) */
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9F8FF] to-[#F3F1FF] dark:from-[#0A0820] dark:to-[#120F2C]">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6 p-8 transition-all duration-300">
        
        {step === "kitchen" && (
          <>
            <KitchenForm
              kitchen={kitchen}
              setKitchenShape={setKitchenShape}
              setKitchenFinish={setKitchenFinish}
              setKitchenLength={setKitchenLength}
            />
            <div className="relative rounded-2xl overflow-hidden shadow-inner bg-white/10 dark:bg-[#0D0B2B]/30 border border-[#9B5CF8]/10">
              <div className="absolute top-3 left-3 z-10 px-2 py-1 rounded-full text-xs font-semibold bg-[#5A5DF0]/10 text-[#5A5DF0] dark:text-[#C9A7FF] border border-[#5A5DF0]/20 backdrop-blur-sm">
                Shape: {kitchen.shape.toUpperCase()}
              </div>
              <KitchenRender />
            </div>
          </>
        )}

        {step === "wardrobe" && (
          <>
            <WardrobeForm
              wardrobe={wardrobe}
              setWardrobeWidth={setWardrobeWidth}
              setWardrobeFinish={setWardrobeFinish}
            />
            <div className="rounded-2xl overflow-hidden shadow-inner bg-white/10 dark:bg-[#0D0B2B]/30 border border-[#9B5CF8]/10">
              <WardrobeRender />
            </div>
          </>
        )}

        {/* 🔘 Navigation Buttons */}
        <div className="col-span-2 flex justify-end gap-3 mt-6">
          {step !== "kitchen" && (
            <button
              onClick={() => setStep("kitchen")}
              className="px-4 py-2 border border-[#9B5CF8]/30 rounded-lg text-[#5A5DF0] hover:bg-[#5A5DF0]/10 transition"
            >
              ← Back
            </button>
          )}
          {step === "kitchen" && (
            <button
              onClick={() => setStep("wardrobe")}
              className="px-4 py-2 rounded-lg bg-[#5A5DF0] hover:bg-[#4a4eea] text-white shadow transition"
            >
              Next → Wardrobe
            </button>
          )}
          {step === "wardrobe" && (
            <button
              onClick={() => setStep("summary")}
              className="px-4 py-2 rounded-lg bg-[#EC6ECF] hover:bg-[#d65dc2] text-white shadow transition"
            >
              Calculate & Continue →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
