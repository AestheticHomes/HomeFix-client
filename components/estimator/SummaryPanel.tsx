"use client";
import React from "react";
import useEstimator from "@/components/estimator/store/estimatorStore";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  type PieLabelRenderProps,
} from "recharts";

/* 💰 Currency Helper */
const Money = ({ v = 0 }: { v?: number }) => (
  <>₹{Math.round(v).toLocaleString()}</>
);

/* 🎨 Colors */
const COLORS = [
  "var(--accent-primary)",
  "var(--accent-secondary)",
  "var(--accent-tertiary)",
  "var(--accent-warning)",
];

export default function SummaryPanel() {
  const setStep = useEstimator((s) => s.setStep);
  const k = useEstimator((s) => s.kitchen);
  const w = useEstimator((s) => s.wardrobe);
  const getComputed = useEstimator((s) => s.getComputed);
  const comp = getComputed();

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
      <div
        className="rounded-3xl border border-[var(--border-soft)] bg-[var(--surface-panel)] dark:bg-[var(--surface-panel-dark)] backdrop-blur-xl p-6 transition-colors duration-500"
        style={{
          boxShadow:
            "0 32px 120px color-mix(in srgb, var(--text-primary) 10%, transparent)",
          background: "color-mix(in srgb, var(--surface-panel) 96%, transparent)",
        }}
      >
        <div className="grid lg:grid-cols-2 gap-6">
          {/* 🔹 Left — Text Summary */}
          <div className="space-y-3">
            <h2 className="font-semibold text-[var(--accent-primary)] dark:text-[var(--accent-secondary)] text-lg">
              Estimate Summary
            </h2>

            <div className="text-sm text-[var(--text-secondary)] space-y-1">
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
                  <div className="w-44 text-sm text-[var(--text-secondary)]">
                    {p.label}
                  </div>
                  <div className="flex-1 h-2 rounded-full overflow-hidden bg-[var(--surface-chip)] dark:bg-[var(--surface-chip-dark)]">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${(p.value / max) * 100}%`,
                        background: COLORS[i % COLORS.length],
                      }}
                    />
                  </div>
                  <div className="w-28 text-right text-sm text-[var(--text-primary)] dark:text-[var(--text-primary-dark)]">
                    <Money v={p.value} />
                  </div>
                </div>
              ))}
            </div>

            {/* ✨ Total Card */}
            <div className="mt-5 p-4 rounded-2xl text-center font-bold text-lg text-white shadow-md bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)]">
              Grand Total: <Money v={total} />
            </div>
          </div>

          {/* 🔸 Right — Charts */}
          <div className="space-y-4">
            <div className="font-medium text-[var(--accent-primary)] dark:text-[var(--accent-secondary)] text-sm">
              Cost Breakdown (₹)
            </div>
            <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-panel)] dark:bg-[var(--surface-panel-dark)]/85 p-3 shadow-sm">
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={parts}>
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10, fill: "var(--text-muted)" }}
                    interval={0}
                  />
                  <Tooltip
                    formatter={(value: number | string) =>
                      `₹${Math.round(Number(value) || 0).toLocaleString()}`
                    }
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {parts.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="font-medium text-[var(--accent-primary)] dark:text-[var(--accent-secondary)] text-sm">
              Kitchen vs Wardrobe
            </div>
            <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-panel)] dark:bg-[var(--surface-panel-dark)]/85 p-3 shadow-sm">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    dataKey="value"
                    labelLine={false}
                    label={({ name, percent }: PieLabelRenderProps) => {
                      const ratio =
                        typeof percent === "number"
                          ? percent
                          : Number(percent ?? 0);
                      return `${name ?? ""} ${(ratio * 100).toFixed(0)}%`;
                    }}
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number | string) =>
                      `₹${Math.round(Number(value) || 0).toLocaleString()}`
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 🔹 Assumptions */}
        <div className="mt-6 text-sm text-[var(--text-secondary)]">
          <div className="font-medium text-[var(--accent-primary)] dark:text-[var(--accent-secondary)] mb-2">
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
      <div
        className="fixed bottom-0 left-0 right-0 z-50 p-3 bg-[var(--surface-panel)] dark:bg-[var(--surface-panel-dark)] backdrop-blur-lg border-t border-[var(--border-soft)] flex items-center justify-between"
        style={{
          boxShadow:
            "0 -18px 40px color-mix(in srgb, var(--text-primary) 8%, transparent)",
          background: "color-mix(in srgb, var(--surface-panel) 95%, transparent)",
        }}
      >
        <span className="text-sm font-medium text-[var(--accent-primary)] dark:text-[var(--accent-secondary)]">
          Total: <Money v={total} />
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setStep("wardrobe")}
            className="px-3 py-1.5 rounded-lg border border-[var(--border-soft)] text-sm text-[var(--accent-primary)] hover:bg-[var(--surface-hover)] transition"
          >
            ← Back
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-1.5 rounded-lg bg-[var(--accent-primary)] text-white text-sm font-medium shadow hover:opacity-90 transition"
          >
            Print / Save PDF
          </button>
        </div>
      </div>
    </div>
  );
}
