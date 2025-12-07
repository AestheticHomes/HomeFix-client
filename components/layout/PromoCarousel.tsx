/**
 * HomeFix — PromoCarousel (Client Component)
 *
 * What: Slim Cosmic Deals rail with swipe + timer rotation.
 * Where: Rendered only via PromoCarouselShell on the homepage; expects server-fed promos.
 * Layout/SEO: One-line, non-overlapping CTA with compact height (~1") and no story/category pills; keeps image preload + countdowns.
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

const ROTATION_INTERVAL_MS = 2000;

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
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const lastDirection = useRef<"next" | "prev">("next");
  const userPauseHandle = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (userPauseHandle.current) clearTimeout(userPauseHandle.current);
    },
    []
  );

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
      if (viaUser) {
        setIsUserInteracting(true);
        if (userPauseHandle.current) clearTimeout(userPauseHandle.current);
        userPauseHandle.current = setTimeout(() => setIsUserInteracting(false), 2200);
      }
      lastDirection.current = dir;
      setActiveIndex((prev) => {
        const len = effectivePromos.length || 1;
        return dir === "next" ? (prev + 1) % len : (prev - 1 + len) % len;
      });
    },
    [effectivePromos.length]
  );

  // Auto-rotate
  useEffect(() => {
    if (effectivePromos.length <= 1) return;
    const id = setInterval(() => {
      if (isUserInteracting) return;
      lastDirection.current = "next";
      setActiveIndex((prev) => (prev + 1) % effectivePromos.length);
    }, ROTATION_INTERVAL_MS);
    return () => clearInterval(id);
  }, [effectivePromos.length, isUserInteracting]);

  if (effectivePromos.length === 0) {
    return null;
  }

  const primary = effectivePromos[activeIndex];

  const onDragEnd = (_: any, info: any) => {
    const threshold = 60;
    if (info.offset.x < -threshold || info.velocity.x < -500) {
      handleNavigate("next", true);
    } else if (info.offset.x > threshold || info.velocity.x > 500) {
      handleNavigate("prev", true);
    }
  };

  if (!primary) return null;

  return (
    <div className="relative mx-auto mt-3 w-full max-w-[1360px] px-3 sm:px-4 lg:px-8 xl:px-12">
      <div className="relative h-40 w-full overflow-hidden sm:h-48">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={primary.id}
            layout
            drag="x"
            dragElastic={0.12}
            onDragStart={() => setIsUserInteracting(true)}
            onDragEnd={onDragEnd}
            onDragTransitionEnd={() => setIsUserInteracting(false)}
            className="h-full w-full"
            transition={{ type: "spring", stiffness: 280, damping: 30 }}
          >
            <PrimaryBanner
              promo={primary}
              direction={lastDirection.current}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function PrimaryBanner({
  promo,
  direction,
}: {
  promo: Promo;
  direction: "next" | "prev";
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
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    border: "1px solid rgba(255,255,255,0.4)",
    color: "var(--accent-primary)",
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, x: direction === "next" ? 20 : -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: direction === "next" ? -20 : 20 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      style={{
        ...auraVars,
        backgroundImage:
          "linear-gradient(98deg, color-mix(in srgb, var(--surface-card) 92%, var(--promo-aura-light-3)), color-mix(in srgb, var(--surface-strong) 90%, var(--promo-aura-light-2)))",
      }}
      className="relative h-full w-full overflow-hidden rounded-2xl border border-(--border-soft) p-3 shadow-[0_14px_30px_rgba(0,0,0,0.12)] sm:p-4"
    >
      <div className="flex h-full items-center gap-3 sm:gap-5">
        {/* Left: Icon + Content */}
        <div className="flex flex-1 flex-col justify-between h-full py-1">
          <div className="flex items-start gap-3">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center sm:h-12 sm:w-12">
              <span
                className={`absolute inset-1 rounded-2xl bg-linear-to-br ${promo.auraClass} blur-xl`}
                aria-hidden="true"
              />
              <span className="relative flex h-full w-full items-center justify-center rounded-2xl bg-(--surface-card) text-xl shadow-md sm:text-2xl">
                {(promo as any).emoji ?? "✨"}
              </span>
            </div>

            <div className="flex flex-col gap-0.5 pt-0.5">
              <h3 className="line-clamp-1 text-sm font-semibold leading-tight text-(--text-primary) sm:text-base">
                {promo.title}
              </h3>
              <p className="line-clamp-1 text-[11px] text-(--text-secondary) sm:text-[13px]">
                {promo.body}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-auto">
            {promo.tag && (
              <span className="inline-flex items-center rounded-full border border-(--border-soft) bg-[color-mix(in_srgb,var(--surface-card)85%,transparent)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-(--text-secondary)">
                {promo.tag}
              </span>
            )}
            {formattedPrice && (
              <span className="inline-flex items-center rounded-full bg-[color-mix(in_srgb,var(--accent-primary)18%,transparent)] px-2 py-0.5 text-[11px] font-semibold text-(--text-primary)">
                {formattedPrice}
              </span>
            )}
            {promo.expiry ? <CountdownBadge expiry={promo.expiry} /> : null}
          </div>
        </div>

        {/* Right: Image + CTA */}
        <div className="flex h-full flex-col items-end justify-between gap-2 w-[100px] sm:w-[140px] shrink-0">
          {imageUrl && (
            <div className="relative h-full w-full flex-1 overflow-hidden rounded-xl border border-(--border-soft) bg-(--surface-card)">
              <CrossfadeImage primary={imageUrl} altSrc={altImage} altText={promo.title} />
            </div>
          )}

          <motion.a
            href={promo.href ?? "/store"}
            className="inline-flex w-full items-center justify-center rounded-full py-1.5 text-[11px] font-semibold shadow-sm transition will-change-transform sm:text-xs"
            style={glassCtaStyle}
            whileHover={{ scale: 1.04 }}
          >
            {promo.ctaLabel ?? "View"}
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
    <span className="inline-flex items-center rounded-full bg-[color-mix(in_srgb,var(--accent-primary)18%,transparent)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-(--text-primary)">
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
    const id = setInterval(() => setShowAlt((s) => !s), 3200);
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
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          <NextImage
            src={showAlt && altSrc ? altSrc : primary}
            alt={altText}
            fill
            className="object-cover"
            sizes="200px"
            priority
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
