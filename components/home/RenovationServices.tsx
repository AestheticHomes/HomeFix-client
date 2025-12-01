"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { track } from "@/lib/track";
import { useEffect, useState } from "react";
import { fetchServicesConfig, type ServiceDefinition } from "@/lib/servicesConfig";

const auraShadow: CSSProperties = {
  boxShadow:
    "0 18px 55px rgba(15,23,42,0.18), 0 0 34px color-mix(in srgb, var(--aura-dark) 30%, transparent)",
};

export default function RenovationServices() {
  const [services, setServices] = useState<ServiceDefinition[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetchServicesConfig()
      .then((data) => {
        if (cancelled) return;
        setServices(data.filter((s) => s.category === "turnkey"));
      })
      .catch(() => {
        if (!cancelled) setServices([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!services.length) return null;

  return (
    <section
      className="px-3 sm:px-4 lg:px-8 xl:px-12 py-3 border-t border-b border-[var(--border-muted)] bg-[var(--surface-base)]/90"
      aria-labelledby="quick-actions-heading"
    >
      <div className="w-full max-w-[1200px] 2xl:max-w-[1360px] mx-auto">
        <h2
          id="quick-actions-heading"
          className="text-xs sm:text-sm font-semibold text-[var(--text-secondary)] mb-2"
        >
          Interior services we offer in Chennai
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service) => (
            <Link
              key={service.slug}
              href={`/services/${service.slug}`}
              className="relative rounded-2xl border border-[color-mix(in_srgb,white_20%,var(--border-muted))] bg-[var(--surface-panel)] p-4 overflow-hidden group"
              style={auraShadow}
              onClick={() => track("book_consultation", { service: service.slug })}
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-55"
                style={{
                  background:
                    "radial-gradient(circle at 10% 0%, color-mix(in srgb, var(--aura-light) 45%, transparent), transparent 55%), radial-gradient(circle at 90% 100%, color-mix(in srgb, var(--aura-dark) 40%, transparent), transparent 65%)",
                }}
              />

              <div className="relative flex flex-col gap-2">
                <h3 className="text-sm sm:text-base font-semibold text-[var(--text-primary)]">
                  {service.name}
                </h3>
                <p className="text-xs sm:text-sm text-[var(--text-muted-soft)]">
                  {service.heroSubtitle || service.tagline}
                </p>
                <span className="mt-1 text-[11px] font-semibold text-[var(--accent-primary)] group-hover:translate-x-0.5 transition-transform">
                  Book consultation →
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-3">
          <Link
            href="/services"
            className="text-xs sm:text-sm font-semibold text-[var(--accent-primary)] hover:text-[color-mix(in_srgb,var(--accent-primary)85%,white)]"
          >
            View all services →
          </Link>
        </div>
      </div>
    </section>
  );
}
