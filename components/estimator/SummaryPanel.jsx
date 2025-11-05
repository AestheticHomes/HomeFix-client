"use client";
import React, { useMemo } from "react";
import useEstimator from "@/components/estimator/store/estimatorStore";
import { ResponsiveContainer, BarChart, Bar, XAxis, PieChart, Pie, Cell, Tooltip } from "recharts";

/* 💰 Currency Helper */
const Money = ({ v }) => <>₹{Math.round(v || 0).toLocaleString()}</>;

/* 🎨 Colors */
const COLORS = ["#5A5DF0", "#EC6ECF", "#9B5CF8", "#FBBF24"];

export default function SummaryPanel() {
  const setStep = useEstimator((s) => s.setStep);
  const k = useEstimator((s) => s.kitchen);
  const w = useEstimator((s) => s.wardrobe);
  const getComputed = useEstimator((s) => s.getComputed);
  const comp = useMemo(() => getComputed(), [k, w]);

  const parts = [
    { label: "Kitchen Base Units", value: comp.kBaseCost || 0 },
    { label: "Kitchen Wall Units", value: comp.kWallCost || 0 },
    { label: "Wardrobe (Bottom)", value: comp.wBaseCost || 0 },
    { label: "Wardrobe (Loft)", value: comp.wLoftCost || 0 },
  ];

  const total = comp.total || 0;
  const max = Math.max(...parts.map((p) => p.value), 1);

  const pieData = [
    { name: "Kitchen", value: (comp.kBaseCost || 0) + (comp.kWallCost || 0) },
    { name: "Wardrobe", value: (comp.wBaseCost || 0) + (comp.wLoftCost || 0) },
  ];

  return (
    <div className="space-y-6 pb-16">
      <div className="rounded-2xl border border-[#9B5CF8]/20 bg-white/10 dark:bg-[#0D0B2B]/40 shadow-sm p-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* 🔹 Left — Text Summary */}
          <div className="space-y-3">
            <h2 className="font-semibold text-[#5A5DF0] dark:text-[#EC6ECF] text-lg">
              Estimate Summary
            </h2>

            <div className="text-sm text-gray-700 dark:text-gray-300">
              <div>
                Kitchen: <b>{k.shape}</b> · Finish: <b>{k.finish}</b> · Total run:{" "}
                <b>{comp.totalRun?.toFixed(2)} ft</b>
              </div>
              <div>
                Wardrobe: width <b>{comp.width?.toFixed(1)} ft</b> · Finish:{" "}
                <b>{w.finish}</b>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {parts.map((p, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-44 text-sm text-gray-700 dark:text-gray-300">{p.label}</div>
                  <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${(p.value / max) * 100}%`,
                        background: COLORS[i % COLORS.length],
                      }}
                    />
                  </div>
                  <div className="w-28 text-right text-sm text-gray-800 dark:text-gray-200">
                    <Money v={p.value} />
                  </div>
                </div>
              ))}
            </div>

            {/* ✨ Total Card */}
            <div className="mt-5 p-4 rounded-xl text-center font-bold text-lg text-white shadow-md bg-gradient-to-r from-[#5A5DF0] to-[#EC6ECF]">
              Grand Total: <Money v={total} />
            </div>
          </div>

          {/* 🔸 Right — Charts */}
          <div className="space-y-4">
            <div className="font-medium text-[#5A5DF0] dark:text-[#EC6ECF] text-sm">
              Cost Breakdown (₹)
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={parts}>
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#A1A1AA" }} interval={0} />
                <Tooltip formatter={(v) => `₹${Math.round(v).toLocaleString()}`} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {parts.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            <div className="font-medium text-[#5A5DF0] dark:text-[#EC6ECF] text-sm">
              Kitchen vs Wardrobe
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  dataKey="value"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `₹${Math.round(v).toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 🔹 Assumptions */}
        <div className="mt-6 text-sm text-gray-600 dark:text-gray-400">
          <div className="font-medium text-[#5A5DF0] dark:text-[#EC6ECF] mb-2">
            Assumptions
          </div>
          <ul className="list-disc pl-5 space-y-1">
            <li>Per-wall cap for kitchen runs: 20 ft</li>
            <li>Counter depth assumed: 2 ft (visual only)</li>
            <li>Base unit height: 2.46 ft · Wall unit height: 2.0 ft</li>
            <li>Wardrobe heights: 7 ft (bottom) + 3 ft (loft)</li>
            <li>Finishes apply multipliers to area rates</li>
          </ul>
        </div>
      </div>

      {/* 📱 Sticky Footer Actions */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-3 bg-gradient-to-r from-[#F8F7FF]/95 to-[#F2F0FF]/95 dark:from-[#0D0B2B]/90 dark:to-[#1B1545]/90 backdrop-blur-md border-t border-[#9B5CF8]/20 flex items-center justify-between">
        <span className="text-sm font-medium text-[#5A5DF0] dark:text-[#EC6ECF]">
          Total: <Money v={total} />
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setStep("wardrobe")}
            className="px-3 py-1.5 rounded-lg border border-[#9B5CF8]/30 text-sm text-[#5A5DF0] dark:text-[#EC6ECF]"
          >
            ← Back
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-1.5 rounded-lg bg-[#5A5DF0] dark:bg-[#EC6ECF] text-white text-sm shadow"
          >
            Print / Save PDF
          </button>
        </div>
      </div>
    </div>
  );
}
