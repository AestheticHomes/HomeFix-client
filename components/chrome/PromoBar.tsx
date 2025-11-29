"use client";

import ClimateBar from "@/components/chrome/ClimateBar";
import { useHomefixWeather } from "@/hooks/useHomefixWeather";
import { usePromo } from "@/hooks/usePromo";

export default function PromoBar() {
  const promo = usePromo();
  const weather = useHomefixWeather();

  if (!promo) return null;

  // Promo engine decides: when id === "home-climate", we render
  // the weather-aware ClimateBar instead of a text banner.
  const isClimatePromo = promo.id === "home-climate";

  if (isClimatePromo) {
    return (
      <ClimateBar
        city={weather.cityName ?? "Chennai"}
        tempC={weather.currentTempC ?? 27}
        condition={weather.summary ?? "Mainly clear"}
        highC={weather.todayHighC ?? 29}
        lowC={weather.todayLowC ?? 23}
      />
    );
  }

  const title = promo.headline?.trim();
  if (!title) return null;

  return (
    <div className="border-t border-[var(--border-soft)] bg-[var(--surface-header)]/92 backdrop-blur-md">
      <div className="mx-auto max-w-[1360px] px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        <p className="text-sm text-[var(--text-secondary)]">{title}</p>
        {promo.ctaHref && promo.ctaLabel && (
          <a
            href={promo.ctaHref}
            className="text-sm font-medium underline text-[var(--accent-primary)] hover:text-[var(--accent-primary)]/80"
          >
            {promo.ctaLabel}
          </a>
        )}
      </div>
    </div>
  );
}
