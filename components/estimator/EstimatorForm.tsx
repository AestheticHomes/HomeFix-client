"use client";
import React from "react";
import type {
  Finish,
  KitchenData,
  WardrobeData,
} from "@/components/estimator/store/estimatorStore";

const FIELD_LABEL =
  "text-sm font-semibold text-[var(--text-primary)] dark:text-[var(--text-primary-dark)]";
const CONTROL_BASE =
  "w-full rounded-2xl border border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--surface-panel)94%,transparent)] dark:bg-[var(--surface-panel-dark)]/90 px-4 py-2.5 text-sm text-[var(--text-primary)] dark:text-[var(--text-primary-dark)] placeholder:text-[var(--text-muted)] shadow-[0_18px_40px_rgba(15,23,42,0.08)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/25 focus:border-[var(--accent-primary)] transition";
const SUPPORT_TEXT = "text-[11px] text-[var(--text-muted)]";

type KitchenFormProps = {
  kitchen: KitchenData;
  setKitchenShape: (shape: string) => void;
  setKitchenFinish: (finish: Finish) => void;
  setKitchenLength: (wall: string, value: number) => void;
};

type WardrobeFormProps = {
  wardrobe: WardrobeData;
  setWardrobeWidth: (value: number | string) => void;
  setWardrobeFinish: (finish: Finish) => void;
};

const SectionHint = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => (
  <div className="rounded-2xl border border-[var(--border-subtle)] bg-[color-mix(in_srgb,var(--surface-panel)92%,transparent)] dark:bg-[var(--surface-panel-dark)]/70 px-4 py-3 text-xs text-[var(--text-secondary)] shadow-sm">
    <p className="font-semibold text-[var(--accent-primary)] dark:text-[var(--accent-secondary)]">
      {title}
    </p>
    <p>{description}</p>
  </div>
);

export function KitchenForm({
  kitchen,
  setKitchenShape,
  setKitchenFinish,
  setKitchenLength,
}: KitchenFormProps) {
  const max = kitchen.perWallMax || 20;
  const minByShape = kitchen.shape === "linear" ? 10 : 8;

  const Input = (key: string, label: string, min = minByShape) => (
    <div className="space-y-1.5" key={key}>
      <label className={FIELD_LABEL}>{label} (ft)</label>
      <input
        type="number"
        min={min}
        max={max}
        step={0.1}
        value={kitchen.lengths[key] ?? min}
        onChange={(e) => {
          const value = Math.max(min, parseFloat(e.target.value) || 0);
          setKitchenLength(key, value);
        }}
        className={CONTROL_BASE}
      />
      <p className={SUPPORT_TEXT}>
        Min {min} ft · Max {max} ft
      </p>
    </div>
  );

  return (
    <div className="space-y-4">
      <div>
        <label className={FIELD_LABEL}>Shape</label>
        <select
          value={kitchen.shape}
          onChange={(e) => setKitchenShape(e.target.value)}
          className={`${CONTROL_BASE} mt-1`}
        >
          <option value="linear">Single Wall (Linear)</option>
          <option value="parallel">Galley (Parallel)</option>
          <option value="lshape">L Shape</option>
          <option value="u">U Shape</option>
        </select>
      </div>

      {kitchen.shape === "u" ? (
        <div className="grid grid-cols-3 gap-3">
          {["A", "B", "C"].map((key) => Input(key, `Wall ${key}`))}
        </div>
      ) : kitchen.shape === "parallel" || kitchen.shape === "lshape" ? (
        <div className="grid grid-cols-2 gap-3">
          {["A", "B"].map((key) => Input(key, `Wall ${key}`))}
        </div>
      ) : (
        Input("A", "Wall A", 10)
      )}

      <div>
        <label className={FIELD_LABEL}>Finish</label>
        <select
          value={kitchen.finish}
          onChange={(e) => setKitchenFinish(e.target.value as Finish)}
          className={`${CONTROL_BASE} mt-1`}
        >
          <option value="essential">Essential</option>
          <option value="premium">Premium</option>
          <option value="luxury">Luxury</option>
        </select>
      </div>

      <SectionHint
        title="Design Note"
        description="Wall lengths assume a continuous counter with 2 ft depth. Adjust each span to mirror your kitchen layout."
      />
    </div>
  );
}

export function WardrobeForm({
  wardrobe,
  setWardrobeWidth,
  setWardrobeFinish,
}: WardrobeFormProps) {
  const max = wardrobe.maxFt || 20;

  return (
    <div className="space-y-4">
      <div>
        <label className={FIELD_LABEL}>Width (ft)</label>
        <input
          type="number"
          min={4}
          max={max}
          step={0.1}
          value={wardrobe.widthFt}
          onChange={(e) => setWardrobeWidth(e.target.value)}
          className={`${CONTROL_BASE} mt-1`}
        />
        <p className={SUPPORT_TEXT}>Max width: {max} ft</p>
      </div>

      <div>
        <label className={FIELD_LABEL}>Finish</label>
        <select
          value={wardrobe.finish}
          onChange={(e) => setWardrobeFinish(e.target.value as Finish)}
          className={`${CONTROL_BASE} mt-1`}
        >
          <option value="essential">Essential</option>
          <option value="premium">Premium</option>
          <option value="luxury">Luxury</option>
        </select>
      </div>

      <SectionHint
        title="Loft Reminder"
        description="All wardrobes include a default 3 ft loft module. Modify widths to match each wall bay."
      />
    </div>
  );
}

export default KitchenForm;
