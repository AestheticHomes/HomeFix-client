"use client";

import { useMemo } from "react";
import ContextStrip from "@/components/layout/ContextStrip";
import LiveClimateBar from "@/components/layout/LiveClimateBar";
import { getPromoFor } from "@/lib/promoEngine";

type ClimateSummary = {
  temp: number | null;
  city: string | null;
  condition: string | null;
};

type HomePromoClimateStripProps = {
  initialClimate?: ClimateSummary;
  condition?: string | null;
  temperature?: number | null;
};

/**
 * HomePromoClimateStrip
 * ---------------------
 * Homepage-only header strip that blends:
 * - location + weather
 * - a single contextual promo line
 *
 * The promo message is intentionally simple for now;
 * later we can plug in the Edith Promo Engine.
 */
export default function HomePromoClimateStrip({
  condition,
  temperature,
}: HomePromoClimateStripProps) {
  const promoText = useMemo(
    () => getPromoFor(condition ?? "", temperature ?? Number.NaN),
    [condition, temperature]
  );

  return (
    <ContextStrip className="border-t border-[color-mix(in_srgb,var(--border-soft)70%,transparent)]">
      <div className="flex items-center gap-3 min-w-0">
        <LiveClimateBar />
      </div>

      <div className="flex-1 flex items-center justify-end min-w-0">
        <p className="text-[10px] sm:text-xs text-[var(--text-muted-soft)] text-right overflow-hidden whitespace-nowrap text-ellipsis">
          {promoText}
        </p>
      </div>
    </ContextStrip>
  );
}
