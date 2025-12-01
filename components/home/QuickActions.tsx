"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  fetchServicesConfig,
  type ServiceDefinition,
} from "@/lib/servicesConfig";

type Action = {
  id: string;
  label: string;
  href: string;
};

export default function QuickActions() {
  const [actions, setActions] = useState<Action[]>([]);

  useEffect(() => {
    let cancelled = false;

    fetchServicesConfig()
      .then((services) => {
        if (cancelled) return;

        const turnkey = services.filter(
          (s: ServiceDefinition) => s.category === "turnkey"
        );

        const mapped: Action[] = turnkey.map((svc) => ({
          id: svc.slug,
          label: svc.name,
          href: `/services/${svc.slug}`,
        }));

        setActions(mapped);
      })
      .catch(() => {
        if (!cancelled) {
          setActions([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!actions.length) return null;

  return (
    <section
      className="
        mt-4
        px-3 sm:px-4 lg:px-8 xl:px-12
        py-4
        border-t border-b border-[var(--border-subtle)]
        bg-[var(--surface-base)]/90
        backdrop-blur-sm
      "
      aria-labelledby="quick-actions-heading"
    >
      <div
        className="
          w-full max-w-[1200px] 2xl:max-w-[1360px]
          mx-auto flex flex-col gap-3
        "
      >
        <div className="flex items-center justify-between gap-2">
          <h2
            id="quick-actions-heading"
            className="text-[11px] font-semibold tracking-[0.22em] uppercase text-[var(--text-muted)]"
          >
            What we do · Interior services in Chennai
          </h2>
          <span className="hidden md:inline text-xs text-[var(--text-muted)]">
            Explore full home interiors, modular kitchens and more
          </span>
        </div>

        <nav aria-label="Quick links to HomeFix interior services">
          <ul
            className="
              flex gap-3
              max-md:overflow-x-auto max-md:flex-nowrap max-md:whitespace-nowrap no-scrollbar
              md:flex-wrap
              pb-1
            "
          >
            {actions.map((action) => (
              <li key={action.id}>
                <Link
                  href={action.href}
                  className="
                    inline-flex items-center justify-center
                    px-4 py-2 rounded-2xl
                    bg-[var(--surface-panel)]
                    border border-[var(--border-soft)]
                    text-xs sm:text-sm font-medium whitespace-nowrap
                    text-[var(--text-primary)]
                    hover:border-[var(--accent-primary)]
                    hover:text-[var(--accent-primary)]
                    transition
                  "
                >
                  {action.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  );
}
