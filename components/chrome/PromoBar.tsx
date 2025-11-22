"use client";

import { usePromo } from "@/hooks/usePromo";

export default function PromoBar() {
  const promo = usePromo();
  const title = promo?.title?.trim();

  if (!title) return null;

  return (
    <div className="border-t border-[var(--border-soft)] bg-[var(--surface-header)]/92 backdrop-blur-md">
      <div className="mx-auto max-w-[1360px] px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        <p className="text-sm text-[var(--text-secondary)]">{title}</p>
        {promo?.ctaHref && promo?.ctaLabel && (
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
