"use client";

import { useRouter } from "next/navigation";

type Action = {
  id: string;
  label: string;
  href: string;
};

const ACTIONS: Action[] = [
  {
    id: "turnkey",
    label: "Start turnkey project",
    href: "/services/start-turnkey",
  },
  {
    id: "full-home",
    label: "Full home interiors",
    href: "/services/full-home",
  },
  {
    id: "kitchens",
    label: "Modular kitchens",
    href: "/services/modular-kitchens",
  },
  {
    id: "wardrobes",
    label: "Wardrobes & storage",
    href: "/services/wardrobes",
  },
  { id: "bathrooms", label: "Bathroom renovation", href: "/services/bathroom" },
  { id: "tiling", label: "Tiling & flooring", href: "/services/tiling" },
] as const;

export default function QuickActions() {
  const router = useRouter();

  return (
    <section className="px-3 sm:px-4 lg:px-8 xl:px-12 py-3 border-t border-b border-[var(--border-muted)] bg-[var(--surface-base)]/90">
      <div
        className="
          w-full max-w-[1200px] 2xl:max-w-[1360px] mx-auto
          flex flex-wrap gap-3 
          max-md:overflow-x-auto max-md:flex-nowrap max-md:whitespace-nowrap
          pb-1
        "
      >
        {ACTIONS.map((action) => (
          <button
            key={action.id}
            onClick={() => router.push(action.href)}
            className="
              flex items-center justify-center
              px-4 py-2.5 rounded-2xl bg-[var(--surface-panel)]
              border border-[var(--border-soft)]
              text-xs sm:text-sm font-medium whitespace-nowrap
              hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)]
              transition
            "
          >
            {action.label}
          </button>
        ))}
      </div>
    </section>
  );
}
