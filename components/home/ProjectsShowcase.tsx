"use client";
/**
 * ProjectsShowcase
 *
 * What: Highlights recent completed projects in Chennai.
 * Where: Bottom of the homepage after services/testimonials.
 * Layout/SEO: 1/2/3 grid aligned with store spacing; compact padding and soft aura shadow; static copy only.
 */

import type { CSSProperties } from "react";

const PROJECTS = [
  {
    id: "adyar-2bhk",
    name: "2BHK – Adyar",
    scope: "Full home interiors & tiling",
    duration: "38 days",
  },
  {
    id: "velachery-3bhk",
    name: "3BHK – Velachery",
    scope: "Kitchen, wardrobes & painting",
    duration: "42 days",
  },
  {
    id: "porur-2bhk",
    name: "2BHK – Porur",
    scope: "Kitchen remodelling & bathrooms",
    duration: "29 days",
  },
] as const;

const auraShadow: CSSProperties = {
  boxShadow:
    "0 16px 40px rgba(15,23,42,0.16), 0 0 26px color-mix(in srgb, var(--aura-light) 26%, transparent)",
};

export default function ProjectsShowcase() {
  return (
    <section
      aria-labelledby="recent-projects-heading"
      className="px-3 sm:px-4 lg:px-8 xl:px-12 pt-4 pb-8"
    >
      <div className="w-full max-w-[1200px] 2xl:max-w-[1360px] mx-auto">
        <h2
          id="recent-projects-heading"
          className="text-base sm:text-lg font-semibold text-[var(--text-primary)] mb-3 sm:mb-4"
        >
          Recent projects in Chennai
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {PROJECTS.map((project) => (
            <div
              key={project.id}
              className="relative rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 sm:p-5 overflow-hidden shadow-[0_14px_40px_rgba(15,23,42,0.10)]"
              style={auraShadow}
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-45"
                style={{
                  background:
                    "radial-gradient(circle at 0% 0%, color-mix(in srgb, var(--aura-light) 35%, transparent), transparent 55%), radial-gradient(circle at 100% 100%, color-mix(in srgb, var(--aura-dark) 32%, transparent), transparent 65%)",
                }}
              />
              <div className="relative flex flex-col gap-2">
                <p className="text-[11px] text-[var(--text-muted-soft)]">
                  Completed project
                </p>
                <h3 className="text-sm sm:text-base font-semibold text-[var(--text-primary)]">
                  {project.name}
                </h3>
                <p className="text-xs sm:text-[13px] text-[var(--text-secondary)]">
                  {project.scope}
                </p>
                <p className="mt-1 text-[11px] sm:text-[12px] text-[var(--text-secondary)]">
                  Execution time:{" "}
                  <span className="font-semibold">{project.duration}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
