"use client";
import { create } from "zustand";

const MIN_WALLS = {
  linear: 10, // ft
  parallel: 8,
  lshape: 8,
  u: 8,
};

const VALID_SHAPES = ["linear", "parallel", "lshape", "u"];

const useEstimator = create((set, get) => ({
  // 🔹 UI State
  step: "kitchen",
  mode: "2d",
  setStep: (s) => set({ step: s }),
  setMode: (mode) => set({ mode }),

  // 🔹 Configuration
  rates: {
    kitchen: { base: 2000, wall: 1500 },
    wardrobe: { base: 1800, loft: 1000 },
  },
  finishMult: { essential: 1.0, premium: 1.25, luxury: 1.5 },

  // 🔹 Kitchen Data
  kitchen: {
    shape: "linear",
    finish: "essential",
    perWallMax: 20,
    lengths: { A: 10, B: 10, C: 10 },
  },

  // 🔸 Safe shape setter — bullet-proof & verbose
setKitchenShape: (shape) =>
  set((s) => {
    const raw =
      typeof shape === "string"
        ? shape.toLowerCase().trim()
        : typeof shape?.target?.value === "string"
        ? shape.target.value.toLowerCase().trim()
        : "linear";

    const allowed = ["linear", "parallel", "lshape", "u"];
    const safe = allowed.includes(raw) ? raw : "linear";

    console.log("🧱 [Store] Shape change →", safe);

    return {
      kitchen: {
        ...s.kitchen,
        shape: safe,
      },
    };
  }, false), // 👈 prevents immediate re-render feedback loop


  setKitchenFinish: (finish) =>
    set((s) => ({ kitchen: { ...s.kitchen, finish } })),

  // 🔸 Wall input with safe clamping
  setKitchenLength: (key, ft) =>
    set((s) => {
      const { shape, perWallMax, lengths } = s.kitchen;
      const num = Number(ft) || 0;
      const min = MIN_WALLS[shape] || 8;
      const clamped = Math.min(Math.max(num, min), perWallMax);
      console.log(
        `📏 Wall ${key} (${shape}) → ${clamped.toFixed(2)} ft (min ${min}, max ${perWallMax})`
      );
      return {
        kitchen: {
          ...s.kitchen,
          lengths: { ...lengths, [key]: clamped },
        },
      };
    }),

  // 🔹 Wardrobe Data
  wardrobe: {
    widthFt: 10,
    finish: "essential",
    maxFt: 20,
    baseH: 7,
    loftH: 3,
  },
  setWardrobeWidth: (ft) =>
    set((s) => {
      const num = Number(ft) || 0;
      return {
        wardrobe: {
          ...s.wardrobe,
          widthFt: Math.min(num, s.wardrobe.maxFt),
        },
      };
    }),
  setWardrobeFinish: (finish) =>
    set((s) => ({ wardrobe: { ...s.wardrobe, finish } })),

  // 🔹 Cost computation
  getComputed: () => {
    const { kitchen, wardrobe, rates, finishMult } = get();
    const totalRun = Object.values(kitchen.lengths).reduce(
      (a, b) => a + (Number(b) || 0),
      0
    );

    const kBaseSqft = totalRun * 2.46;
    const kWallSqft = totalRun * 2.0;
    const km = finishMult[kitchen.finish] || 1;
    const wm = finishMult[wardrobe.finish] || 1;

    const kBaseCost = kBaseSqft * rates.kitchen.base * km;
    const kWallCost = kWallSqft * rates.kitchen.wall * km;

    const wBaseSqft = wardrobe.widthFt * wardrobe.baseH;
    const wLoftSqft = wardrobe.widthFt * wardrobe.loftH;
    const wBaseCost = wBaseSqft * rates.wardrobe.base * wm;
    const wLoftCost = wLoftSqft * rates.wardrobe.loft * wm;

    const total = kBaseCost + kWallCost + wBaseCost + wLoftCost;
    return {
      kBaseSqft,
      kWallSqft,
      kBaseCost,
      kWallCost,
      wBaseCost,
      wLoftCost,
      total,
    };
  },
}));

export default useEstimator;
