"use client";

export default function MoreServicesStrip() {
  return (
    <section className="px-4 sm:px-8 pb-10 pt-4">
      <div className="max-w-6xl mx-auto">
        <div className="rounded-2xl border border-dashed border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--surface-panel) 80%,transparent)] px-4 py-3 sm:px-5 sm:py-4">
          <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-1">
            More services coming soon
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-muted-soft)]">
            Electrician, plumbing, AC service and appliance repair will be added in upcoming phases. For now, we&apos;re focused on full home renovation, interiors, carpentry, tiling and civil work through AestheticHomes.
          </p>
        </div>
      </div>
    </section>
  );
}
