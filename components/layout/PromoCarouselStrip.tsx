// components/layout/PromoCarouselStrip.tsx
"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type Promo = {
  id: number;
  title: string;
  body: string;
  tag?: string;
  ctaLabel?: string;
  href?: string;
  emoji: string;
  auraClass: string;
};

const PROMOS: Promo[] = [
  {
    id: 1,
    title: "Single vanity units",
    body: "Don’t need full interiors? Install one designer vanity with free installation in the HomeFix Store.",
    tag: "New in Store",
    ctaLabel: "Browse units",
    href: "/store",
    emoji: "🛁",
    auraClass: "from-sky-200/80 via-indigo-200/70 to-fuchsia-200/60",
  },
  {
    id: 2,
    title: "Tall units & pantry ladders",
    body: "Kitchen tall units and pantry ladders available as standalone upgrades. Pay only for what you need.",
    tag: "Kitchen upgrades",
    ctaLabel: "View options",
    href: "/store",
    emoji: "🧰",
    auraClass: "from-amber-200/80 via-orange-200/70 to-rose-200/60",
  },
  {
    id: 3,
    title: "Bathroom storage refresh",
    body: "Upgrade just your bathroom storage — modular vanity units with transparent pricing and quick install.",
    tag: "Free installation",
    ctaLabel: "See bathroom picks",
    href: "/store",
    emoji: "🧼",
    auraClass: "from-teal-200/80 via-sky-200/70 to-indigo-200/60",
  },
  {
    id: 4,
    title: "Small interior upgrades",
    body: "Add one designer unit instead of a full project — wardrobes, study desks, and more.",
    tag: "Small but mighty",
    ctaLabel: "Explore upgrades",
    href: "/store",
    emoji: "✨",
    auraClass: "from-fuchsia-200/80 via-purple-200/70 to-sky-200/60",
  },
  {
    id: 5,
    title: "Entryway tidy-ups",
    body: "Shoe racks and console units that keep the foyer clutter-free, installed by the HomeFix team.",
    tag: "HomeFix Store",
    ctaLabel: "Shop entryway",
    href: "/store",
    emoji: "🚪",
    auraClass: "from-emerald-200/80 via-lime-200/70 to-sky-200/60",
  },
  {
    id: 6,
    title: "Free installation on every unit",
    body: "All HomeFix Store products — vanities, tall units, ladders, and storage modules — include expert installation at no extra cost.",
    tag: "Free installation",
    ctaLabel: "View store",
    href: "/store",
    emoji: "🎁",
    auraClass: "from-pink-200/80 via-rose-200/70 to-amber-200/60",
  },
];

const ROTATE_MS = 7000;

export function PromoCarouselStrip() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const activePromo = PROMOS[activeIndex];

  useEffect(() => {
    if (paused) return;

    const id = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % PROMOS.length);
    }, ROTATE_MS);

    return () => window.clearInterval(id);
  }, [paused, activeIndex]);

  const goNext = () => {
    setActiveIndex((prev) => (prev + 1) % PROMOS.length);
  };

  const goPrev = () => {
    setActiveIndex((prev) => (prev - 1 + PROMOS.length) % PROMOS.length);
  };

  const goTo = (index: number) => {
    setActiveIndex(index);
  };

  const pause = () => setPaused(true);
  const resume = () => setPaused(false);

  const handleTouchStart: React.TouchEventHandler<HTMLDivElement> = (e) => {
    if (e.touches.length === 1) {
      pause();
      setTouchStartX(e.touches[0].clientX);
    }
  };

  const handleTouchEnd: React.TouchEventHandler<HTMLDivElement> = (e) => {
    if (touchStartX == null) {
      resume();
      return;
    }

    const endX = e.changedTouches[0]?.clientX ?? touchStartX;
    const deltaX = endX - touchStartX;

    const SWIPE_THRESHOLD = 40; // px

    if (Math.abs(deltaX) > SWIPE_THRESHOLD) {
      if (deltaX < 0) {
        goNext();
      } else {
        goPrev();
      }
    }

    setTouchStartX(null);
    resume();
  };

  return (
    <div
      className="relative mx-4 mb-4 mt-2"
      onMouseEnter={pause}
      onMouseLeave={resume}
      onFocusCapture={pause}
      onBlurCapture={resume}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative flex w-full items-center gap-3 rounded-full border border-white/50 bg-white/80 px-4 py-3 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur-md transition md:rounded-[999px]">
        {/* Emoji + aura */}
        <div className="relative flex h-12 w-12 flex-shrink-0 items-center justify-center">
          <span
            className={`absolute inset-1 rounded-full bg-gradient-to-br ${activePromo.auraClass} blur-md animate-pulse`}
          />
          <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl shadow-sm animate-bounce">
            {activePromo.emoji}
          </span>
        </div>

        {/* Text content */}
        <div
          className="flex min-w-0 flex-1 flex-col gap-1"
          aria-live="polite"
          aria-atomic="true"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activePromo.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3 }}
              className="space-y-1"
            >
              {activePromo.tag && (
                <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-[3px] text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-indigo-700">
                  {activePromo.tag}
                </span>
              )}
              <div className="flex flex-col gap-0.5">
                <p className="text-sm font-semibold text-slate-900 md:text-base">
                  {activePromo.title}
                </p>
                <p className="text-xs text-slate-700 md:text-sm">
                  {activePromo.body}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* CTA + arrows + dots */}
        <div className="flex min-w-[120px] flex-col items-end gap-1 sm:min-w-[150px]">
          <Link
            href={activePromo.href ?? "/store"}
            className="inline-flex h-9 items-center justify-center rounded-full border border-indigo-200 bg-indigo-50 px-3 text-xs font-medium text-indigo-700 transition hover:border-indigo-300 hover:bg-indigo-100 md:text-sm"
            onClick={pause}
          >
            {activePromo.ctaLabel ?? "View store"}
          </Link>

          <div className="flex items-center gap-2">
            {/* Progress dots */}
            <div className="hidden items-center gap-1 sm:flex">
              {PROMOS.map((promo, index) => {
                const isActive = index === activeIndex;
                return (
                  <button
                    key={promo.id}
                    type="button"
                    aria-label={`Go to promo ${index + 1}`}
                    className={`h-1.5 rounded-full transition-all ${
                      isActive
                        ? "w-4 bg-indigo-500"
                        : "w-2 bg-slate-300 hover:bg-slate-400"
                    }`}
                    onClick={() => goTo(index)}
                  />
                );
              })}
            </div>

            {/* Arrows */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Previous promo"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                onClick={goPrev}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                aria-label="Next promo"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                onClick={goNext}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
