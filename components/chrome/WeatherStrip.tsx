"use client";

export default function WeatherStrip() {
  const city = "Chennai";
  const headline = "Showers expected this week";

  return (
    <div className="w-full border-b border-[var(--border-subtle)] bg-[color-mix(in_srgb,var(--surface-panel)94%,transparent)]">
      <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8 py-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs sm:text-[13px] text-[var(--text-muted-soft)]">
        <span>
          {city} · {headline}
        </span>
        <span className="text-[var(--accent-primary)] font-medium">
          Ideal time to fix seepage &amp; balcony tiles — book a waterproofing inspection.
        </span>
      </div>
    </div>
  );
}
