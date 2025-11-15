"use client";

import { create } from "zustand";

export type EstimatorStep = "kitchen" | "wardrobe" | "summary";
export type ViewMode = "2d" | "3d";
export type Shape = "linear" | "parallel" | "lshape" | "u";
export type Finish = "essential" | "premium" | "luxury";

type KitchenLengths = Record<string, number>;

export interface KitchenData {
  shape: Shape;
  finish: Finish;
  perWallMax: number;
  lengths: KitchenLengths;
}

export interface WardrobeData {
  widthFt: number;
  finish: Finish;
  maxFt: number;
  baseH: number;
  loftH: number;
}

interface Rates {
  kitchen: { base: number; wall: number };
  wardrobe: { base: number; loft: number };
}

interface ComputedEstimate {
  kBaseSqft: number;
  kWallSqft: number;
  kBaseCost: number;
  kWallCost: number;
  wBaseCost: number;
  wLoftCost: number;
  total: number;
  totalRun?: number;
  width?: number;
}

interface EstimatorState {
  step: EstimatorStep;
  mode: ViewMode;
  rates: Rates;
  finishMult: Record<Finish, number>;
  kitchen: KitchenData;
  wardrobe: WardrobeData;
  setStep: (step: EstimatorStep) => void;
  setMode: (mode: ViewMode) => void;
  setKitchenShape: (shape: string) => void;
  setKitchenFinish: (finish: Finish) => void;
  setKitchenLength: (key: string, value: number) => void;
  setWardrobeWidth: (value: number | string) => void;
  setWardrobeFinish: (finish: Finish) => void;
  getComputed: () => ComputedEstimate;
}

const MIN_WALLS: Record<Shape, number> = {
  linear: 10,
  parallel: 8,
  lshape: 8,
  u: 8,
};

const VALID_SHAPES: Shape[] = ["linear", "parallel", "lshape", "u"];

const useEstimator = create<EstimatorState>((set, get) => ({
  step: "kitchen",
  mode: "2d",
  rates: {
    kitchen: { base: 2000, wall: 1500 },
    wardrobe: { base: 1800, loft: 1000 },
  },
  finishMult: { essential: 1.0, premium: 1.25, luxury: 1.5 },
  kitchen: {
    shape: "linear",
    finish: "essential",
    perWallMax: 20,
    lengths: { A: 10, B: 10, C: 10 },
  },
  wardrobe: {
    widthFt: 10,
    finish: "essential",
    maxFt: 20,
    baseH: 7,
    loftH: 3,
  },
  setStep: (step) => set({ step }),
  setMode: (mode) => set({ mode }),
  setKitchenShape: (shape) =>
    set((state) => {
      const raw =
        typeof shape === "string"
          ? shape.toLowerCase().trim()
          : "linear";
      const safe = VALID_SHAPES.includes(raw as Shape)
        ? (raw as Shape)
        : "linear";
      return { kitchen: { ...state.kitchen, shape: safe } };
    }),
  setKitchenFinish: (finish) =>
    set((state) => ({ kitchen: { ...state.kitchen, finish } })),
  setKitchenLength: (key, value) =>
    set((state) => {
      const { shape, perWallMax, lengths } = state.kitchen;
      const num = Number(value) || 0;
      const min = MIN_WALLS[shape];
      const clamped = Math.min(Math.max(num, min), perWallMax);
      return {
        kitchen: {
          ...state.kitchen,
          lengths: { ...lengths, [key]: clamped },
        },
      };
    }),
  setWardrobeWidth: (ft) =>
    set((state) => {
      const num = Number(ft) || 0;
      return {
        wardrobe: {
          ...state.wardrobe,
          widthFt: Math.min(num, state.wardrobe.maxFt),
        },
      };
    }),
  setWardrobeFinish: (finish) =>
    set((state) => ({ wardrobe: { ...state.wardrobe, finish } })),
  getComputed: () => {
    const { kitchen, wardrobe, rates, finishMult } = get();
    const totalRun = Object.values(kitchen.lengths).reduce(
      (acc, ft) => acc + (Number(ft) || 0),
      0
    );

    const kBaseSqft = totalRun * 2.46;
    const kWallSqft = totalRun * 2.0;
    const kitchenMultiplier = finishMult[kitchen.finish];
    const wardrobeMultiplier = finishMult[wardrobe.finish];

    const kBaseCost = kBaseSqft * rates.kitchen.base * kitchenMultiplier;
    const kWallCost = kWallSqft * rates.kitchen.wall * kitchenMultiplier;
    const wBaseSqft = wardrobe.widthFt * wardrobe.baseH;
    const wLoftSqft = wardrobe.widthFt * wardrobe.loftH;
    const wBaseCost = wBaseSqft * rates.wardrobe.base * wardrobeMultiplier;
    const wLoftCost = wLoftSqft * rates.wardrobe.loft * wardrobeMultiplier;

    return {
      kBaseSqft,
      kWallSqft,
      kBaseCost,
      kWallCost,
      wBaseCost,
      wLoftCost,
      total: kBaseCost + kWallCost + wBaseCost + wLoftCost,
      totalRun,
      width: wardrobe.widthFt,
    };
  },
}));

export default useEstimator;
