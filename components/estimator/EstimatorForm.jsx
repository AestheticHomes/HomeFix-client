"use client";
import React, { useEffect } from "react";
import useEstimator from "@/components/estimator/store/estimatorStore";

export default function KitchenForm() {
  const { kitchen, setKitchenShape, setKitchenFinish, setKitchenLength } = useEstimator();
  const max = kitchen.perWallMax || 20;

  /* 🔍 Log store changes */
  useEffect(() => {
    console.log("🔥 Active Shape in Store:", kitchen.shape);
  }, [kitchen.shape]);

  /* 🟦 Shape selector handler */
  const handleShapeChange = (e) => {
    const raw = e.target.value?.toLowerCase().trim() || "linear";
    let normalized = "linear";
    if (raw.includes("lshape")) normalized = "lshape";
    else if (raw.includes("ushape") || raw === "u") normalized = "u";
    else if (raw.includes("parallel")) normalized = "parallel";

    console.log("🧱 [UI] Shape selected →", normalized);

    // Wait for React to commit the selection before syncing Zustand
    requestAnimationFrame(() => setKitchenShape(normalized));
  };

  /* ⚙️ Dynamic min length */
  const minByShape = kitchen.shape === "linear" ? 10 : 8;

  /* 📏 Wall input */
  const Input = (key, label, min = minByShape) => (
    <div className="space-y-1">
      <label className="text-sm font-medium text-[#5A5DF0] dark:text-[#EC6ECF]">
        {label} (ft)
      </label>
      <input
        type="number"
        min={min}
        max={max}
        step={0.1}
        value={kitchen.lengths[key] ?? min}
        onChange={(e) => {
          const v = Math.max(min, parseFloat(e.target.value) || 0);
          setKitchenLength(key, v);
          console.log(
            `📏 [${kitchen.shape.toUpperCase()}] Wall ${key}: ${v.toFixed(
              2
            )} ft (min ${min} · max ${max})`
          );
        }}
        className="w-full rounded-lg border border-[#9B5CF8]/30 bg-white/20 dark:bg-[#0D0B2B]/40 px-3 py-2 text-sm"
      />
      <p className="text-[10px] text-gray-400">
        Min {min} ft · Max {max} ft
      </p>
    </div>
  );

  /* 🧩 Render */
  return (
    <div className="space-y-4">
      {/* Shape selector */}
      <div>
        <label className="text-sm font-semibold text-[#5A5DF0] dark:text-[#EC6ECF]">
          Shape
        </label>
        <select
          key={kitchen.shape}              // forces DOM refresh on store update
          defaultValue={kitchen.shape}     // keeps UI stable
          onChange={handleShapeChange}
          className="w-full rounded-lg border border-[#9B5CF8]/30 px-3 py-2 bg-white/20 dark:bg-[#0D0B2B]/40"
        >
          <option value="linear">Single Wall (Linear)</option>
          <option value="parallel">Galley (Parallel)</option>
          <option value="lshape">L Shape</option>
          <option value="u">U Shape</option>
        </select>
      </div>

      {/* Wall inputs */}
      {kitchen.shape === "u" ? (
        <div className="grid grid-cols-3 gap-3">
          {Input("A", "Wall A")}
          {Input("B", "Wall B")}
          {Input("C", "Wall C")}
        </div>
      ) : kitchen.shape === "parallel" || kitchen.shape === "lshape" ? (
        <div className="grid grid-cols-2 gap-3">
          {Input("A", "Wall A")}
          {Input("B", "Wall B")}
        </div>
      ) : (
        Input("A", "Wall A", 10)
      )}

      {/* Finish selector */}
      <div>
        <label className="text-sm font-semibold text-[#5A5DF0] dark:text-[#EC6ECF]">
          Finish
        </label>
        <select
          value={kitchen.finish}
          onChange={(e) => setKitchenFinish(e.target.value)}
          className="w-full rounded-lg border border-[#9B5CF8]/30 px-3 py-2 bg-white/20 dark:bg-[#0D0B2B]/40"
        >
          <option value="essential">Essential</option>
          <option value="premium">Premium</option>
          <option value="luxury">Luxury</option>
        </select>
      </div>
    </div>
  );
}
