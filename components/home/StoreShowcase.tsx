"use client";

import Link from "next/link";
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

export default function StoreShowcase() {
  return (
    <section className="px-3 sm:px-4 lg:px-8 xl:px-12 pt-4 pb-6">
      <div className="w-full max-w-[1200px] 2xl:max-w-[1360px] mx-auto">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              className="rounded-3xl border border-[var(--border-muted)]
                         bg-[color-mix(in_srgb,var(--surface-panel)90%,black_5%)]
                         hover:bg-[color-mix(in_srgb,var(--surface-panel)96%,white_4%)]
                         transition-colors shadow-[0_18px_45px_rgba(15,23,42,0.5)]
                         flex flex-col md:flex-row items-stretch gap-4 px-4 sm:px-6 py-4 sm:py-5"
            >
              <div className="flex-1 flex flex-col gap-2">
                <h3 className="text-[15px] font-semibold text-[var(--text-primary)]">
                  {cat.title}
                </h3>
                <p className="text-[13px] text-[var(--text-muted-soft)]">
                  {cat.subtitle}
                </p>
                <div className="mt-auto flex items-center gap-3">
                  <Link
                    href={cat.href}
                    onClick={() =>
                      track("view_modules", { category: cat.slug, target: "store" })
                    }
                    className="text-[13px] text-[var(--accent-primary)] font-medium"
                  >
                    View modules →
                  </Link>
                  <Link
                    href={`/studio?category=${cat.slug}`}
                    onClick={() =>
                      track("view_modules", { category: cat.slug, target: "studio" })
                    }
                    className="px-3 py-1.5 text-[11px] rounded-full border border-[var(--border-soft)] hover:border-[var(--accent-primary)]"
                  >
                    Studio
                  </Link>
                </div>
              </div>

              <div className="md:w-[140px] flex md:flex-col gap-2 items-center justify-center">
                <div className="w-[120px] h-[80px] md:w-full md:h-[100px] rounded-2xl bg-[color-mix(in_srgb,var(--surface-panel)80%,transparent)] flex items-center justify-center text-[11px] text-[var(--text-muted-soft)]">
                  {cat.ctaLabel}
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
