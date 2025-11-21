"use client";

export type ClimateBarProps = {
  city: string;
  tempC: number;
  condition: string;
  highC?: number | null;
  lowC?: number | null;
};

export function ClimateBar(props: ClimateBarProps) {
  const { city, tempC, condition, highC, lowC } = props;

  return (
    <div className="w-full border-b border-[var(--border-subtle)] bg-[color-mix(in_srgb,var(--surface-panel)94%,transparent)]">
      <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex items-center justify-between px-4 md:px-6 text-xs md:text-sm">
          <div className="flex items-center gap-2">
            <span className="font-medium">{city}</span>
            <span className="rounded-full px-2 py-0.5 text-[0.7rem] md:text-xs bg-white/10 backdrop-blur">
              {Math.round(tempC)}°C · {condition}
            </span>
            {highC != null && lowC != null && (
              <span className="hidden sm:inline opacity-70">
                Today {Math.round(lowC)}° / {Math.round(highC)}°
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-[0.7rem] md:text-xs opacity-80">
            <span className="hidden sm:inline">
              Ideal time to fix seepage &amp; balcony tiles — waterproof before
              the next spell.
            </span>
            <button
              type="button"
              className="rounded-full border border-white/20 px-3 py-1 text-[0.7rem] md:text-xs hover:bg-white/10"
            >
              Book waterproofing visit →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClimateBar;
