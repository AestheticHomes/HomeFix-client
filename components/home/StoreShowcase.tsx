"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { CSSProperties } from "react";
import { useReducedMotion } from "framer-motion";
import { track } from "@/lib/track";

type StoreCategory = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  href: string;
};

const CATEGORIES: StoreCategory[] = [
  {
    id: "kitchens",
    slug: "kitchens",
    title: "Modular kitchens",
    subtitle: "L-shaped, U-shaped, island and parallel layouts.",
    ctaLabel: "2D / 3D preview",
    href: "/store/kitchens",
  },
  {
    id: "wardrobes",
    slug: "wardrobes",
    title: "Wardrobes & lofts",
    subtitle: "Sliding, hinged and walk-in wardrobes with loft storage.",
    ctaLabel: "2D / 3D preview",
    href: "/store/wardrobes",
  },
  {
    id: "tv-units",
    slug: "tv-units",
    title: "TV units & consoles",
    subtitle: "Wall-mounted panels, media walls and consoles.",
    ctaLabel: "2D / 3D preview",
    href: "/store/tv-units",
  },
  {
    id: "shoe-racks",
    slug: "shoe-racks",
    title: "Shoe racks & foyer units",
    subtitle: "Compact entry units with hidden storage.",
    ctaLabel: "Image preview",
    href: "/store/shoe-racks",
  },
  {
    id: "utility-storage",
    slug: "utility",
    title: "Utility & storage",
    subtitle: "Laundry, crockery and multipurpose tall units.",
    ctaLabel: "Image preview",
    href: "/store/utility-storage",
  },
] as const;

const cardBase: CSSProperties = {
  boxShadow: "0 18px 40px rgba(15,23,42,0.35)",
};

export default function StoreShowcase() {
  const reduceMotion = useReducedMotion();
  const hoverLift = reduceMotion ? "" : "md:hover:-translate-y-1";
  const auraHover = reduceMotion
    ? "md:group-hover:opacity-75"
    : "md:group-hover:opacity-100";
  const router = useRouter();

  return (
    <section className="px-4 sm:px-8 pt-4 pb-6">
      <div className="w-full max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-[var(--text-primary)]">
              Interactive modular store
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted-soft)]">
              Browse ready-made modules for kitchens, wardrobes and storage — then view them in 2D / 3D in Edith Studio and Online Estimator.
            </p>
          </div>
          <Link
            href="/store"
            className="hidden sm:inline text-xs font-semibold text-[var(--accent-primary)] hover:text-[color-mix(in_srgb,var(--accent-primary)85%,white)]"
          >
            View full catalogue →
          </Link>
        </div>

        <div className="flex flex-col gap-4">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              role="button"
              tabIndex={0}
              onClick={() => router.push(cat.href)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  router.push(cat.href);
                }
              }}
              className={`group relative rounded-3xl border border-[var(--edith-border)] bg-gradient-to-br from-[#0d1b2a] via-[#14273d] to-[#0a1624] shadow-[0_12px_40px_rgba(0,0,0,0.45)] overflow-hidden transition-transform ${hoverLift}`}
              style={cardBase}
            >
              <div
                className="absolute inset-0 opacity-35 transition-opacity md:group-hover:opacity-55"
                style={{
                  background:
                    cat.id === "kitchens"
                      ? "radial-gradient(circle at 20% 20%, #4f46e5 30%, transparent 60%)"
                      : cat.id === "wardrobes"
                      ? "radial-gradient(circle at 20% 20%, #7c3aed 30%, transparent 60%)"
                      : cat.id === "tv-units"
                      ? "radial-gradient(circle at 20% 20%, #2563eb 30%, transparent 60%)"
                      : cat.id === "shoe-racks"
                      ? "radial-gradient(circle at 20% 20%, #f59e0b 30%, transparent 60%)"
                      : "radial-gradient(circle at 20% 20%, #10b981 30%, transparent 60%)",
                }}
              />

              <div
                className={`pointer-events-none absolute inset-0 opacity-0 transition-opacity ${auraHover}`}
                aria-hidden
                style={{
                  boxShadow:
                    "0 26px 80px color-mix(in srgb,var(--aura-light)45%,transparent)",
                }}
              />

              <div className="relative px-5 pt-5 pb-4 flex flex-col gap-3">
                <div>
                  <h3 className="text-sm sm:text-base font-semibold text-[color-mix(in_srgb,var(--text-primary)90%,black)]">
                    {cat.title}
                  </h3>
                  <p className="mt-1 text-[11px] sm:text-xs text-[color-mix(in_srgb,var(--text-muted-soft)90%,black)]">
                    {cat.subtitle}
                  </p>
                </div>

                <div className="mt-auto">
                  <div className="flex items-center justify-between rounded-2xl bg-black/40 text-[11px] sm:text-xs text-white px-3 py-2">
                    <div className="flex flex-col">
                      <span className="font-semibold">Sample layout</span>
                      <span className="opacity-80">Tap to explore finishes & sizes</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          track("view_modules", { category: cat.slug, target: "estimator" });
                          router.push(`/estimator?category=${cat.slug}`);
                        }}
                        className="inline-flex items-center gap-2 rounded-full bg-[var(--accent-primary)] px-3 py-1 text-[10px] font-semibold shadow-[0_0_15px_color-mix(in_srgb,var(--accent-primary)75%,transparent)]"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                        {cat.ctaLabel}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          track("view_modules", { category: cat.slug, target: "studio" });
                          router.push(`/studio?category=${cat.slug}`);
                        }}
                        className="inline-flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[color-mix(in_srgb,var(--surface-panel)70%,transparent)] text-[10px] font-semibold text-[var(--text-primary)] px-3 py-1"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)]" />
                        Studio
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 text-[10px] text-[var(--text-muted-soft)] flex items-center justify-between">
                    <span>Configurable in Online Estimator</span>
                    <button
                      className="font-semibold text-[var(--text-primary)]"
                      onClick={(e) => {
                        e.stopPropagation();
                        track("view_modules", { category: cat.slug, target: "store" });
                        router.push(cat.href);
                      }}
                    >
                      View modules →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-2 sm:hidden text-[11px]">
          <Link href="/store" className="text-[var(--accent-primary)] font-semibold">
            View full catalogue →
          </Link>
        </div>
      </div>
    </section>
  );
}
