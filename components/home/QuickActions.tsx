"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchServicesConfig, type ServiceDefinition } from "@/lib/servicesConfig";

type Action = {
  id: string;
  label: string;
  href: string;
};

export default function QuickActions() {
  const router = useRouter();
  const [actions, setActions] = useState<Action[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetchServicesConfig()
      .then((services) => {
        if (cancelled) return;
        const turnkey = services.filter((s) => s.category === "turnkey");
        const mapped: Action[] = turnkey.map((svc) => ({
          id: svc.slug,
          label: svc.name,
          href: `/services/${svc.slug}`,
        }));
        setActions(mapped);
      })
      .catch(() => {
        if (cancelled) setActions([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!actions.length) return null;

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
        {actions.map((action) => (
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
