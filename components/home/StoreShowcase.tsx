"use client";
/**
 * HomeFix — StoreShowcase
 *
 * What: Interactive modular store rail for kitchens/wardrobes/storage with swipe + auto-play slices.
 * Where: Homepage, immediately after the promo rail; reuses existing category definitions.
 * Layout/SEO: Responsive 1/2/3 grid aligned with store cards; up to 12 cards per slice, CTA buttons stay outside imagery.
 */

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

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

const SLICE_SIZE = 12;
const AUTO_INTERVAL_MS = 5000;
const RESUME_TIMEOUT_MS = 6000;

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: "easeOut",
      delay,
    },
  }),
};

const staggerParent = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const childItem = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

const hoverLift = {
  whileHover: {
    y: -4,
    scale: 1.01,
    transition: { type: "spring", stiffness: 220, damping: 18 },
  },
};

export default function StoreShowcase() {
  const slices = useMemo(() => {
    const groups: StoreCategory[][] = [];
    for (let i = 0; i < CATEGORIES.length; i += SLICE_SIZE) {
      groups.push(CATEGORIES.slice(i, i + SLICE_SIZE));
    }
    return groups;
  }, []);

  const [sliceIndex, setSliceIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [userControlled, setUserControlled] = useState(false);
  const resumeHandle = useRef<ReturnType<typeof setTimeout> | null>(null);

  const totalSlices = slices.length || 1;
  const activeSlice = slices[sliceIndex] ?? [];

  const pauseForUser = () => {
    setIsAutoPlaying(false);
    setUserControlled(true);
    if (resumeHandle.current) clearTimeout(resumeHandle.current);
  };

  const resumeAfterIdle = () => {
    if (resumeHandle.current) clearTimeout(resumeHandle.current);
    resumeHandle.current = setTimeout(() => {
      setIsAutoPlaying(true);
      setUserControlled(false);
    }, RESUME_TIMEOUT_MS);
  };

  const handleNext = () => {
    pauseForUser();
    setSliceIndex((prev) => (prev + 1) % totalSlices);
    resumeAfterIdle();
  };

  const handlePrev = () => {
    pauseForUser();
    setSliceIndex((prev) => (prev - 1 + totalSlices) % totalSlices);
    resumeAfterIdle();
  };

  const handleDirectNav = (target: number) => {
    pauseForUser();
    setSliceIndex(target);
    resumeAfterIdle();
  };

  useEffect(
    () => () => {
      if (resumeHandle.current) clearTimeout(resumeHandle.current);
    },
    []
  );

  useEffect(() => {
    if (!isAutoPlaying || totalSlices <= 1) return;
    const id = setInterval(() => {
      setSliceIndex((prev) => (prev + 1) % totalSlices);
    }, AUTO_INTERVAL_MS);
    return () => clearInterval(id);
  }, [isAutoPlaying, totalSlices]);

  const onDragEnd = (_: any, info: any) => {
    const threshold = 60;
    if (info.offset.x < -threshold || info.velocity.x < -500) {
      handleNext();
    } else if (info.offset.x > threshold || info.velocity.x > 500) {
      handlePrev();
    }
  };

  return (
    <section className="px-3 sm:px-4 lg:px-8 xl:px-12 pt-3 pb-6">
      <motion.div
        className="w-full max-w-[1200px] 2xl:max-w-[1360px] mx-auto"
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.4 }}
        custom={0.1}
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] sm:text-xl">
              Interactive modular store – kitchens, wardrobes and storage
            </h2>
            <p className="text-xs text-[var(--text-muted-soft)] sm:text-sm">
              Browse ready-made modules and view them in 2D / 3D — swipe or auto-rotate through the catalog rail.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous catalog slice"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-soft)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next catalog slice"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-soft)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              ›
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={sliceIndex}
            initial={{ opacity: 0.9, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0.95, x: -12 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="mt-4"
            drag="x"
            dragElastic={0.18}
            onDragStart={pauseForUser}
            onDragEnd={onDragEnd}
            onMouseEnter={pauseForUser}
            onMouseLeave={resumeAfterIdle}
            onTouchStart={pauseForUser}
            onTouchEnd={resumeAfterIdle}
          >
            <motion.div
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
              variants={staggerParent}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              {activeSlice.map((cat) => (
                <motion.article
                  key={cat.id}
                  className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] px-3 py-3 shadow-[0_14px_36px_rgba(15,23,42,0.10)] transition hover:-translate-y-0.5 hover:border-[var(--accent-primary)]"
                  variants={childItem}
                  {...hoverLift}
                >
                  <div className="flex flex-col gap-2">
                    <h3 className="text-sm font-semibold text-[var(--text-primary)] sm:text-base">
                      {cat.title}
                    </h3>
                    <p className="text-[12px] text-[var(--text-muted-soft)] sm:text-[13px]">
                      {cat.subtitle}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] sm:text-[12px]">
                      <Link
                        href={cat.href}
                        onClick={() =>
                          track("view_modules", { category: cat.slug, target: "store" })
                        }
                        className="font-semibold text-[var(--accent-primary)]"
                      >
                        View modules →
                      </Link>
                      <Link
                        href={`/design-lab?category=${cat.slug}`}
                        onClick={() =>
                          track("view_modules", { category: cat.slug, target: "studio" })
                        }
                        className="rounded-full border border-[var(--border-soft)] px-2.5 py-1 font-medium hover:border-[var(--accent-primary)]"
                      >
                        {cat.ctaLabel}
                      </Link>
                    </div>
                  </div>
                </motion.article>
              ))}
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {totalSlices > 1 && (
          <div className="mt-3 flex items-center justify-center gap-2">
            {slices.map((_, idx) => (
              <button
                key={idx}
                onClick={() => handleDirectNav(idx)}
                className={`h-2 w-2 rounded-full transition ${idx === sliceIndex ? "bg-[var(--accent-primary)] w-5" : "bg-[var(--border-soft)]"}`}
                aria-label={`Go to catalog set ${idx + 1}`}
              />
            ))}
          </div>
        )}

        <div className="mt-2 text-[11px] sm:text-xs">
          <Link
            href="/store"
            className="font-semibold text-[var(--accent-primary)] hover:text-[color-mix(in_srgb,var(--accent-primary)85%,white)]"
          >
            View full catalogue →
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
