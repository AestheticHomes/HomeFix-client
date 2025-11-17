"use client";

import Link from "next/link";
import React from "react";

type ContextStripProps = {
  className?: string;
  icon?: React.ReactNode;
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
  children?: React.ReactNode;
};

/**
 * ContextStrip
 * ------------
 * Shared visual shell for all "secondary header" strips below the main nav.
 */
export default function ContextStrip({
  className,
  icon,
  title,
  subtitle,
  ctaLabel,
  ctaHref,
  children,
}: ContextStripProps) {
  const hasContent =
    children || title || subtitle || ctaLabel || icon;

  if (!hasContent) return null;

  return (
    <div
      className={
        "w-full border-b border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--surface-panel)80%,transparent)] backdrop-blur-xl " +
        (className ?? "")
      }
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-2 text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        {children ? (
          children
        ) : (
          <>
            <div className="flex items-center gap-2 min-w-0">
              {icon && <span className="shrink-0 text-[var(--accent-primary)]">{icon}</span>}
              <div className="min-w-0">
                {title && (
                  <p className="font-semibold text-[var(--text-primary)] overflow-hidden whitespace-nowrap text-ellipsis">
                    {title}
                  </p>
                )}
                {subtitle && (
                  <p className="text-[var(--text-muted-soft)] overflow-hidden whitespace-nowrap text-ellipsis">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
            {ctaLabel && ctaHref && (
              <Link
                href={ctaHref}
                className="text-[11px] sm:text-xs font-semibold text-[var(--accent-primary)] hover:text-[color-mix(in_srgb,var(--accent-primary)85%,white)] overflow-hidden whitespace-nowrap text-ellipsis"
              >
                {ctaLabel}
              </Link>
            )}
          </>
        )}
      </div>
    </div>
  );
}
