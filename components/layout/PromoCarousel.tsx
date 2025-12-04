/**
 * HomeFix — PromoCarousel (Client Component)
 *
 * Purpose:
 *   - Client-only animation/interaction engine for the Cosmic Deals Rail.
 *   - Handles swipe, timers, auto-rotate, crossfade, countdown, stories mode.
 * Notes:
 *   - Receives promos via props from PromoCarouselShell (server); no data fetching here.
 *   - Returns null when promos are empty to avoid crashes.
 */

"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import NextImage from "next/image";
import type { Promo } from "@/lib/promoBrain";

const ROTATION_INTERVAL_MS = 8000;
const STORY_ADVANCE_MS = 4000;

const LIGHT_AURAS: Record<string, [string, string, string]> = {
  bathroom: [
    "color-mix(in srgb,var(--accent-secondary)70%,transparent)",
    "color-mix(in srgb,var(--accent-primary)55%,transparent)",
    "color-mix(in srgb,var(--surface-strong)40%,transparent)",
  ],
  kitchen: [
    "color-mix(in srgb,var(--accent-primary)70%,transparent)",
    "color-mix(in srgb,var(--accent-tertiary, #38bdf8)60%,transparent)",
    "color-mix(in srgb,var(--surface-strong)38%,transparent)",
  ],
  storage: [
    "color-mix(in srgb,var(--accent-success, #22c55e)65%,transparent)",
    "color-mix(in srgb,var(--accent-secondary)45%,transparent)",
    "color-mix(in srgb,var(--surface-card)40%,transparent)",
  ],
  entryway: [
    "color-mix(in srgb,var(--accent-warning, #f59e0b)68%,transparent)",
    "color-mix(in srgb,var(--accent-primary)55%,transparent)",
    "color-mix(in srgb,var(--surface-card)38%,transparent)",
  ],
  default: [
    "color-mix(in srgb,var(--accent-primary)65%,transparent)",
    "color-mix(in srgb,var(--accent-secondary)55%,transparent)",
    "color-mix(in srgb,var(--surface-strong)40%,transparent)",
  ],
};

const DARK_AURAS: Record<string, [string, string, string]> = {
  bathroom: [
    "color-mix(in srgb,var(--accent-secondary)55%,transparent)",
    "color-mix(in srgb,#7c3aed 45%,transparent)",
    "color-mix(in srgb,var(--surface-strong)50%,transparent)",
  ],
  kitchen: [
    "color-mix(in srgb,#6366f1 55%,transparent)",
    "color-mix(in srgb,#22d3ee 45%,transparent)",
    "color-mix(in srgb,var(--surface-strong)55%,transparent)",
  ],
  storage: [
    "color-mix(in srgb,#10b981 60%,transparent)",
    "color-mix(in srgb,#2dd4bf 45%,transparent)",
    "color-mix(in srgb,var(--surface-strong)55%,transparent)",
  ],
  entryway: [
    "color-mix(in srgb,#f59e0b 60%,transparent)",
    "color-mix(in srgb,#fb7185 45%,transparent)",
    "color-mix(in srgb,var(--surface-strong)55%,transparent)",
  ],
  default: [
    "color-mix(in srgb,var(--accent-primary)60%,transparent)",
    "color-mix(in srgb,#7c3aed 45%,transparent)",
    "color-mix(in srgb,var(--surface-strong)55%,transparent)",
  ],
};

function getAuraVars(promo: Promo): CSSProperties {
  const key = ((promo as any).category || "default").toLowerCase();
  const light = LIGHT_AURAS[key] || LIGHT_AURAS.default;
  const dark = DARK_AURAS[key] || DARK_AURAS.default;
  return {
    "--promo-aura-light-1": light[0],
    "--promo-aura-light-2": light[1],
    "--promo-aura-light-3": light[2],
    "--promo-aura-dark-1": dark[0],
    "--promo-aura-dark-2": dark[1],
    "--promo-aura-dark-3": dark[2],
  } as CSSProperties;
}

function resolveImage(p: Promo | undefined): string | null {
  if (!p) return null;
  if (p.image) return p.image;
  return null;
}

function preloadImage(src?: string | null) {
  if (!src || typeof window === "undefined") return;
  const img = new window.Image();
  img.src = src;
}

export function PromoCarousel({ promos }: { promos: Promo[] }) {
  const effectivePromos = useMemo(
    () => (promos && promos.length > 0 ? promos : []),
    [promos]
  );

  const [activeIndex, setActiveIndex] = useState(() => {
    const highlightedIndex = effectivePromos.findIndex((p: any) => (p as any).highlight);
    return highlightedIndex >= 0 ? highlightedIndex : 0;
  });
  const [storiesMode, setStoriesMode] = useState(false);
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const lastDirection = useRef<"next" | "prev">("next");
  const autoTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const idleHandle = useRef<number | null>(null);

  // Preload current/adjacent images
  useEffect(() => {
    const promo = effectivePromos[activeIndex];
    const prev = effectivePromos[(activeIndex - 1 + effectivePromos.length) % effectivePromos.length];
    const next = effectivePromos[(activeIndex + 1) % effectivePromos.length];
    preloadImage(resolveImage(promo));
    preloadImage(promo?.imageAlt);
    preloadImage(resolveImage(prev));
    preloadImage(resolveImage(next));
  }, [activeIndex, effectivePromos]);

  const handleNavigate = useCallback(
    (dir: "next" | "prev", viaUser = false) => {
      if (viaUser) setIsUserInteracting(true);
      lastDirection.current = dir;
      setActiveIndex((prev) => {
        const len = effectivePromos.length || 1;
        return dir === "next" ? (prev + 1) % len : (prev - 1 + len) % len;
      });
      if (viaUser) {
        setTimeout(() => setIsUserInteracting(false), 1200);
      }
    },
    [effectivePromos.length]
  );

  // Auto-rotate using idle callback
  useEffect(() => {
    if (effectivePromos.length <= 1) return;

    const schedule = () => {
      if (autoTimer.current) clearInterval(autoTimer.current);
      autoTimer.current = setInterval(() => {
        if (isUserInteracting) return;
        lastDirection.current = "next";
        setActiveIndex((prev) => (prev + 1) % effectivePromos.length);
      }, storiesMode ? STORY_ADVANCE_MS : ROTATION_INTERVAL_MS);
    };

    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      idleHandle.current = (window as any).requestIdleCallback(schedule);
    } else {
      schedule();
    }

    return () => {
      if (idleHandle.current && typeof window !== "undefined" && "cancelIdleCallback" in window) {
        (window as any).cancelIdleCallback(idleHandle.current);
      }
      if (autoTimer.current) clearInterval(autoTimer.current);
    };
  }, [effectivePromos.length, isUserInteracting, storiesMode]);

  if (effectivePromos.length === 0) {
    return null;
  }

  const primary = effectivePromos[activeIndex];

  const onDragEnd = (_: any, info: any) => {
    const threshold = 80;
    if (info.offset.x < -threshold || info.velocity.x < -600) {
      handleNavigate("next", true);
    } else if (info.offset.x > threshold || info.velocity.x > 600) {
      handleNavigate("prev", true);
    }
  };

  if (!primary) return null;

  return (
    <section className="relative mx-auto max-w-6xl space-y-4 px-4 md:px-6">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-(--text-secondary)">
          Cosmic Deals Rail
        </div>
        <button
          type="button"
          onClick={() => setStoriesMode((s) => !s)}
          className="rounded-full border border-(--border-soft) px-3 py-1 text-xs font-semibold text-(--text-secondary) transition hover:text-(--text-primary)"
        >
          {storiesMode ? "Exit stories mode" : "Stories mode"}
        </button>
      </div>

      <div className={storiesMode ? "relative w-full" : "relative"}>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={primary.id}
            layout
            drag="x"
            dragElastic={0.15}
            onDragStart={() => setIsUserInteracting(true)}
            onDragEnd={onDragEnd}
            onDragTransitionEnd={() => setIsUserInteracting(false)}
            className={`w-full will-change-transform ${
              storiesMode ? "aspect-3/4 md:aspect-16/6" : ""
            }`}
            transition={{ type: "spring", stiffness: 280, damping: 32 }}
          >
            <PrimaryBanner
              promo={primary}
              direction={lastDirection.current}
              storiesMode={storiesMode}
              onPrev={() => handleNavigate("prev", true)}
              onNext={() => handleNavigate("next", true)}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Mini rail */}
      <div className="flex flex-wrap items-center gap-2 md:gap-3">
        {effectivePromos.map((p, i) => {
          const activeNow = i === activeIndex;
          return (
            <button
              key={p.id}
              onClick={() => handleNavigate(i > activeIndex ? "next" : "prev", true)}
              className={[
                "group flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition",
                activeNow
                  ? "border-(--accent-primary) bg-[color-mix(in_srgb,var(--accent-primary)12%,transparent)] text-(--accent-primary)"
                  : "border-(--border-soft) bg-(--surface-card) text-(--text-secondary) hover:border-(--accent-primary)",
              ].join(" ")}
            >
              <span className="text-sm">{p.tag === "Hot Deal" ? "🔥" : "✨"}</span>
              <span className="line-clamp-1 max-w-28 text-left">{p.title}</span>
              <span
                className={[
                  "h-1.5 w-1.5 rounded-full",
                  activeNow ? "bg-(--accent-primary)" : "bg-(--border-soft)",
                ].join(" ")}
              />
            </button>
          );
        })}
      </div>
    </section>
  );
}

function PrimaryBanner({
  promo,
  direction,
  storiesMode,
  onPrev,
  onNext,
}: {
  promo: Promo;
  direction: "next" | "prev";
  storiesMode: boolean;
  onPrev: () => void;
  onNext: () => void;
}) {
  const imageUrl = resolveImage(promo);
  const altImage = promo.imageAlt || null;

  const formattedPrice =
    typeof promo.priceRupees === "number"
      ? `₹${promo.priceRupees.toLocaleString("en-IN")}`
      : null;

  const auraVars = useMemo(() => getAuraVars(promo), [promo]);
  const glassCtaStyle: CSSProperties = {
    background: "rgba(255,255,255,0.25)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    border: "1px solid rgba(255,255,255,0.4)",
    color: "var(--accent-primary)",
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0.85, x: direction === "next" ? 60 : -60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0.6, scale: 0.98, x: direction === "next" ? -40 : 40 }}
      transition={{ type: "spring", stiffness: 260, damping: 28 }}
      style={{
        ...auraVars,
        backgroundImage:
          "radial-gradient(circle at 12% 20%, var(--promo-aura-light-1), transparent 38%), radial-gradient(circle at 88% 12%, var(--promo-aura-light-2), transparent 32%), linear-gradient(95deg, color-mix(in srgb, var(--surface-card) 90%, var(--promo-aura-light-3)), color-mix(in srgb, var(--surface-strong) 90%, var(--promo-aura-light-2)))",
        willChange: "transform, opacity",
      }}
      className={`relative overflow-hidden rounded-3xl border border-(--border-soft) p-6 shadow-[0_20px_60px_rgba(0,0,0,0.2)] backdrop-blur-md md:p-8 ${
        storiesMode ? "h-full" : "min-h-60"
      }`}
    >
      {storiesMode && (
        <div className="absolute inset-0">
          <div className="absolute inset-x-0 top-0 flex h-1 gap-1 px-4 pt-2">
            <div className="h-full flex-1 rounded-full bg-white/20">
              <motion.div
                key={promo.id}
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: STORY_ADVANCE_MS / 1000, ease: "linear" }}
                className="h-full rounded-full bg-white/60"
              />
            </div>
          </div>
          <button aria-label="Previous promo" onClick={onPrev} className="absolute inset-y-0 left-0 w-1/3" />
          <button aria-label="Next promo" onClick={onNext} className="absolute inset-y-0 right-0 w-1/3" />
        </div>
      )}
      <div className="flex h-full flex-col gap-4 md:flex-row md:items-center md:gap-6">
        {/* Emoji + aura */}
        <div className="relative flex h-14 w-14 shrink-0 items-center justify-center">
          <span
            className={`absolute inset-1 rounded-2xl bg-linear-to-br ${promo.auraClass} blur-xl`}
          />
          <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-(--surface-card) text-2xl shadow-md">
            {(promo as any).emoji ?? "✨"}
          </span>
        </div>

        {/* Copy */}
        <div className="flex-1 space-y-2 text-(--text-primary)">
          <div className="flex flex-wrap items-center gap-2">
            {promo.tag && (
              <span className="inline-flex items-center rounded-full bg-[color-mix(in_srgb,var(--surface-card)80%,transparent)] px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-(--text-secondary)">
                {promo.tag}
              </span>
            )}
            {promo.secondaryTag && (
              <span className="inline-flex items-center rounded-full bg-[color-mix(in_srgb,var(--surface-card)75%,transparent)] px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-(--text-secondary)">
                {promo.secondaryTag}
              </span>
            )}
            {formattedPrice && (
              <span className="inline-flex items-center rounded-full bg-[color-mix(in_srgb,var(--surface-strong)60%,transparent)] px-3 py-1 text-[0.7rem] font-semibold text-(--text-primary)">
                {formattedPrice}
              </span>
            )}
            {promo.expiry ? <CountdownBadge expiry={promo.expiry} /> : null}
          </div>

          <h3 className="text-2xl font-semibold leading-tight md:text-3xl">
            {promo.title}
          </h3>
          <p className="max-w-3xl text-sm text-(--text-secondary) md:text-base">
            {promo.body}
          </p>
        </div>

        {/* Image + CTA */}
        <div className="flex flex-col items-start gap-3 md:items-end">
          {imageUrl && (
            <div className="relative h-24 w-40 overflow-hidden rounded-2xl bg-(--surface-card)">
              <CrossfadeImage primary={imageUrl} altSrc={altImage} altText={promo.title} />
            </div>
          )}

          <motion.a
            href={promo.href ?? "/store"}
            className="inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold shadow-md transition will-change-transform"
            style={glassCtaStyle}
            whileHover={{ scale: 1.05 }}
          >
            {promo.ctaLabel ?? "View product"}
          </motion.a>
        </div>
      </div>
    </motion.article>
  );
}

function CountdownBadge({ expiry }: { expiry: number }) {
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    const compute = () => {
      const diffMs = expiry - Date.now();
      if (diffMs <= 0) {
        setLabel("Expired");
        return;
      }
      const totalMinutes = Math.floor(diffMs / 60000);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      setLabel(hours > 0 ? `Ends in ${hours}h ${minutes}m` : `Ends in ${minutes}m`);
    };
    compute();
    const id = setInterval(compute, 30_000);
    return () => clearInterval(id);
  }, [expiry]);

  if (!label) return null;

  return (
    <span className="inline-flex items-center rounded-full bg-[color-mix(in_srgb,var(--accent-primary)25%,transparent)] px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-(--text-primary)">
      {label}
    </span>
  );
}

function CrossfadeImage({
  primary,
  altSrc,
  altText,
}: {
  primary: string;
  altSrc?: string | null;
  altText: string;
}) {
  const [showAlt, setShowAlt] = useState(false);

  useEffect(() => {
    if (!altSrc) return;
    const id = setInterval(() => setShowAlt((s) => !s), 4000);
    return () => clearInterval(id);
  }, [altSrc]);

  return (
    <div className="relative h-full w-full">
      <AnimatePresence mode="wait">
        <motion.div
          key={showAlt && altSrc ? "alt" : "primary"}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <NextImage
            src={showAlt && altSrc ? altSrc : primary}
            alt={altText}
            fill
            className="object-cover will-change-transform will-change-opacity"
            sizes="160px"
            priority
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
