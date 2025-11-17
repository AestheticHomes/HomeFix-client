"use client";

export default function PromoStrip() {
  return (
    <section className="px-4 sm:px-8 py-3 bg-[var(--surface-panel)] border-y border-[var(--border-muted)]">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs sm:text-sm">
        <div className="text-[var(--text-muted)]">Chennai · Showers expected this week</div>
        <div className="text-[var(--accent-primary)] font-medium">
          Ideal time to fix seepage & balcony tiles — book a waterproofing inspection.
        </div>
      </div>
    </section>
  );
}
