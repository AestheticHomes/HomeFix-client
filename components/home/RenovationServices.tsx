"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { track } from "@/lib/track";

const SERVICES = [
  {
    id: "full-home",
    title: "Full home renovation",
    desc: "Complete interior and civil work for apartments and independent homes.",
    href: "/services/full-home-renovation",
  },
  {
    id: "kitchen",
    title: "Kitchen remodelling",
    desc: "Modular kitchens, tiling, countertops, appliances and lighting.",
    href: "/services/kitchen-remodelling",
  },
  {
    id: "bedrooms",
    title: "Bedrooms & wardrobes",
    desc: "Wardrobes, lofts, study units and false ceiling.",
    href: "/services/bedrooms",
  },
  {
    id: "bathroom",
    title: "Bathroom renovation",
    desc: "Tiling, plumbing, fixtures and waterproofing.",
    href: "/services/bathroom-renovation",
  },
  {
    id: "tiling",
    title: "Tiling & flooring",
    desc: "Living, balcony, bathroom and parking tiles.",
    href: "/services/tiling",
  },
  {
    id: "civil",
    title: "Civil modifications",
    desc: "Wall removals, new partitions and structural changes (as feasible).",
    href: "/services/civil-modifications",
  },
] as const;

const auraShadow: CSSProperties = {
  boxShadow:
    "0 18px 55px rgba(15,23,42,0.18), 0 0 34px color-mix(in srgb, var(--aura-dark) 30%, transparent)",
};

export default function RenovationServices() {
  return (
    <section className="px-3 sm:px-4 lg:px-8 xl:px-12 pt-8 pb-6">
      <div className="w-full max-w-[1200px] 2xl:max-w-[1360px] mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-[var(--text-primary)]">
            Renovation & interior services
          </h2>
          <Link
            href="/services"
            className="text-xs sm:text-sm font-semibold text-[var(--accent-primary)] hover:text-[color-mix(in_srgb,var(--accent-primary)85%,white)]"
          >
            View all services →
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SERVICES.map((service) => (
            <Link
              key={service.id}
              href={service.href}
              className="relative rounded-2xl border border-[color-mix(in_srgb,white_20%,var(--border-muted))] bg-[var(--surface-panel)] p-4 overflow-hidden group"
              style={auraShadow}
              onClick={() => track("book_consultation", { service: service.id })}
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
                  {service.title}
                </h3>
                <p className="text-xs sm:text-sm text-[var(--text-muted-soft)]">
                  {service.desc}
                </p>
                <span className="mt-1 text-[11px] font-semibold text-[var(--accent-primary)] group-hover:translate-x-0.5 transition-transform">
                  Book consultation →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
