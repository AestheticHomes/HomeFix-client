"use client";
/**
 * Accessible breadcrumb trail with minimal styling.
 * - Semantic <nav> + <ol>
 * - Visuals stay lightweight to avoid layout shifts.
 * - Use existing design tokens (text + subtle separators).
 */

import Link from "next/link";

type Crumb = {
  label: string;
  href?: string;
};

type Props = {
  items: Crumb[];
  className?: string;
};

export default function Breadcrumbs({ items, className = "" }: Props) {
  if (!items?.length) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={`text-[11px] text-[var(--text-secondary)] ${className}`}
    >
      <ol className="flex items-center flex-wrap gap-1 sm:gap-1.5">
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <li key={idx} className="inline-flex items-center gap-1">
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="hover:text-[var(--text-primary)] transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-[var(--text-muted)]">{item.label}</span>
              )}
              {!isLast && <span aria-hidden="true">›</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
