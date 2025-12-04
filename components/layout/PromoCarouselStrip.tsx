// components/layout/PromoCarouselStrip.tsx
/**
 * @deprecated Legacy promo strip, replaced by PromoCarouselShell + PromoCarousel.
 * Client-only demo kept for reference/testing; do not import in production.
 */
"use client";
// NOTE: Legacy component kept only for reference; not used in production.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import NextImage from "next/image";
import type { CSSProperties } from "react";

const ROTATION_INTERVAL_MS = 8000;

// Prefer configuring this in env; fallback is a hard-coded placeholder.
const PROMO_STRIP_BASE_URL =
  process.env.NEXT_PUBLIC_PROMO_STRIP_BASE_URL ??
  "https://<YOUR-SUPABASE-PROJECT>.supabase.co/storage/v1/object/public/promostrip";

export type Promo = {
  id: number | string;
  /** Product / offer title, ideally from catalog. */
  title: string;
  /** Short promo copy, not full description. */
  body: string;
  /** Small pill label, e.g. "Hot deal", "Launch offer". */
  tag?: string;
  /** Optional second-style label, e.g. "Free installation". */
  secondaryTag?: string;
  /** CTA label for button. */
  ctaLabel?: string;
  /** PDP URL – should land directly on store product page. */
  href?: string;
  /** Emoji decoration for category / mood. */
  emoji: string;
  /** Gradient class for aura background. */
  auraClass: string;
  /** Whether this promo should be the first one shown. */
  highlight?: boolean;
  /** Relative path inside the `promostrip` Supabase bucket. */
  imagePath?: string;
  /** Main image URL (alt to imagePath) */
  image?: string;
  /** Optional alt/variant image to crossfade */
  imageAlt?: string;
  /** Optional expiry timestamp (ms) for countdown */
  expiry?: number;
  /** Optional category for gradient mapping */
  category?: "bathroom" | "kitchen" | "storage" | "entryway" | string;
  /** Product price in rupees (for SEO + badges). */
  priceRupees?: number;
  /** Currency code, default: "INR". */
  currency?: string;
};

const AURA_CLASSES = [
  "from-sky-200/80 via-indigo-200/70 to-fuchsia-200/60",
  "from-amber-200/80 via-orange-200/70 to-rose-200/60",
  "from-teal-200/80 via-sky-200/70 to-indigo-200/60",
  "from-fuchsia-200/80 via-purple-200/70 to-sky-200/60",
  "from-emerald-200/80 via-lime-200/70 to-sky-200/60",
  "from-pink-200/80 via-rose-200/70 to-amber-200/60",
];

/**
 * Fallback promos so the strip doesn't break if catalog isn't wired yet.
 * These are still phrased as STORE offers, not interiors brochure.
 */
const DEFAULT_PROMOS: Promo[] = [
  {
    id: 1,
    title: "Launch offer: vanity units",
    body: "Flat pricing on single vanities with free installation across Chennai.",
    tag: "Launch offer",
    secondaryTag: "Free installation",
    ctaLabel: "Shop vanities",
    href: "/store",
    emoji: "🛁",
    auraClass: AURA_CLASSES[0],
    highlight: true,
    priceRupees: 14999,
  },
  {
    id: 2,
    title: "Hot deals on tall units",
    body: "Pantry ladders and tall units as standalone pieces — no full project required.",
    tag: "Hot deal",
    secondaryTag: "Store only",
    ctaLabel: "View tall units",
    href: "/store",
    emoji: "🧰",
    auraClass: AURA_CLASSES[1],
    priceRupees: 18999,
  },
  {
    id: 3,
    title: "Bathroom bundles under ₹20k",
    body: "Pre-packed vanity + mirror sets with transparent pricing and quick install.",
    tag: "Under ₹20k",
    secondaryTag: "Free installation",
    ctaLabel: "Browse bathroom picks",
    href: "/store",
    emoji: "🧼",
    auraClass: AURA_CLASSES[2],
    priceRupees: 19999,
  },
  {
    id: 4,
    title: "Work desks & study units",
    body: "Single-piece study units that can be ordered like a product, not a project.",
    tag: "Online exclusive",
    secondaryTag: "Small upgrades",
    ctaLabel: "Explore study units",
    href: "/store",
    emoji: "✨",
    auraClass: AURA_CLASSES[3],
    priceRupees: 12999,
  },
  {
    id: 5,
    title: "Entryway shoe racks",
    body: "Ready-to-install foyer units with hidden shoe storage and clutter-free design.",
    tag: "Foyer special",
    secondaryTag: "Store pickup",
    ctaLabel: "Shop entryway",
    href: "/store",
    emoji: "🚪",
    auraClass: AURA_CLASSES[4],
    priceRupees: 9999,
  },
  {
    id: 6,
    title: "Free installation on every unit",
    body: "Every HomeFix Store unit — vanities, tall units, ladders, storage — ships with expert installation included.",
    tag: "Free installation",
    secondaryTag: "HomeFix team",
    ctaLabel: "View all units",
    href: "/store",
    emoji: "🎁",
    auraClass: AURA_CLASSES[5],
  },
];

type PromoCarouselStripProps = {
  /**
   * Optional promos wired from the real store catalog.
   * If empty/undefined, DEFAULT_PROMOS are used.
   */
  promos?: Promo[];
};

const LIGHT_AURAS: Record<string, [string, string, string]> = {
  bathroom: ["color-mix(in srgb,var(--accent-secondary)70%,transparent)", "color-mix(in srgb,var(--accent-primary)55%,transparent)", "color-mix(in srgb,var(--surface-strong)40%,transparent)"],
  kitchen: ["color-mix(in srgb,var(--accent-primary)70%,transparent)", "color-mix(in srgb,var(--accent-tertiary, #38bdf8)60%,transparent)", "color-mix(in srgb,var(--surface-strong)38%,transparent)"],
  storage: ["color-mix(in srgb,var(--accent-success, #22c55e)65%,transparent)", "color-mix(in srgb,var(--accent-secondary)45%,transparent)", "color-mix(in srgb,var(--surface-card)40%,transparent)"],
  entryway: ["color-mix(in srgb,var(--accent-warning, #f59e0b)68%,transparent)", "color-mix(in srgb,var(--accent-primary)55%,transparent)", "color-mix(in srgb,var(--surface-card)38%,transparent)"],
  default: ["color-mix(in srgb,var(--accent-primary)65%,transparent)", "color-mix(in srgb,var(--accent-secondary)55%,transparent)", "color-mix(in srgb,var(--surface-strong)40%,transparent)"],
};

const DARK_AURAS: Record<string, [string, string, string]> = {
  bathroom: ["color-mix(in srgb,var(--accent-secondary)55%,transparent)", "color-mix(in srgb,#7c3aed 45%,transparent)", "color-mix(in srgb,var(--surface-strong)50%,transparent)"],
  kitchen: ["color-mix(in srgb,#6366f1 55%,transparent)", "color-mix(in srgb,#22d3ee 45%,transparent)", "color-mix(in srgb,var(--surface-strong)55%,transparent)"],
  storage: ["color-mix(in srgb,#10b981 60%,transparent)", "color-mix(in srgb,#2dd4bf 45%,transparent)", "color-mix(in srgb,var(--surface-strong)55%,transparent)"],
  entryway: ["color-mix(in srgb,#f59e0b 60%,transparent)", "color-mix(in srgb,#fb7185 45%,transparent)", "color-mix(in srgb,var(--surface-strong)55%,transparent)"],
  default: ["color-mix(in srgb,var(--accent-primary)60%,transparent)", "color-mix(in srgb,#7c3aed 45%,transparent)", "color-mix(in srgb,var(--surface-strong)55%,transparent)"],
};

const STORY_ADVANCE_MS = 4000;

function getAuraVars(promo: Promo): CSSProperties {
  const key = (promo.category || "default").toLowerCase();
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

function preloadImage(src?: string | null) {
  if (!src || typeof window === "undefined") return;
  const img = new window.Image();
  img.src = src;
}

export function PromoCarouselStrip({ promos }: PromoCarouselStripProps) {
  const effectivePromos = useMemo(
    () => (promos && promos.length > 0 ? promos : DEFAULT_PROMOS),
    [promos]
  );

  const [activeIndex, setActiveIndex] = useState(() => {
    const highlightedIndex = effectivePromos.findIndex((p) => p.highlight);
    return highlightedIndex >= 0 ? highlightedIndex : 0;
  });
  const [storiesMode, setStoriesMode] = useState(false);
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const autoTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const idleHandle = useRef<number | null>(null);
  const lastDirection = useRef<"next" | "prev">("next");

  const handleNavigate = useCallback(
    (dir: "next" | "prev", viaUser = false) => {
      if (viaUser) setIsUserInteracting(true);
      lastDirection.current = dir;
      setActiveIndex((prev) => {
        const len = effectivePromos.length;
        if (len === 0) return prev;
        return dir === "next" ? (prev + 1) % len : (prev - 1 + len) % len;
      });
      if (viaUser) {
        setTimeout(() => setIsUserInteracting(false), 1200);
      }
    },
    [effectivePromos.length]
  );

  // Preload current, prev, next images to prevent flashes.
  useEffect(() => {
    const promo = effectivePromos[activeIndex];
    const prev = effectivePromos[(activeIndex - 1 + effectivePromos.length) % effectivePromos.length];
    const next = effectivePromos[(activeIndex + 1) % effectivePromos.length];
    const resolve = (p?: Promo) =>
      p?.image
        ? p.image
        : p?.imagePath && PROMO_STRIP_BASE_URL
        ? `${PROMO_STRIP_BASE_URL}/${p.imagePath}`
        : null;
    preloadImage(resolve(promo));
    preloadImage(promo?.imageAlt);
    preloadImage(resolve(prev));
    preloadImage(resolve(next));
  }, [activeIndex, effectivePromos]);

  // Auto-rotate primary promo.
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

    if ("requestIdleCallback" in window) {
      idleHandle.current = (window as any).requestIdleCallback(schedule);
    } else {
      schedule();
    }

    return () => {
      if (idleHandle.current && "cancelIdleCallback" in window) {
        (window as any).cancelIdleCallback(idleHandle.current);
      }
      if (autoTimer.current) clearInterval(autoTimer.current);
    };
  }, [effectivePromos.length, isUserInteracting, storiesMode]);

  const primary = effectivePromos[activeIndex];

  const onDragEnd = (_: any, info: any) => {
    const threshold = 80;
    if (info.offset.x < -threshold || info.velocity.x < -600) {
      handleNavigate("next", true);
    } else if (info.offset.x > threshold || info.velocity.x > 600) {
      handleNavigate("prev", true);
    }
  };

  return (
    <section className="relative mx-auto mt-4 mb-8 max-w-6xl space-y-4 px-4 md:px-6">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-(--text-secondary)">
          Cosmic Deals Rail
        </div>
        <button
          type="button"
          onClick={() => setStoriesMode((s) => !s)}
          className="rounded-full border border-(--border-soft) px-3 py-1 text-xs font-semibold text-(--text-secondary) hover:text-(--text-primary) transition"
        >
          {storiesMode ? "Exit stories mode" : "Stories mode"}
        </button>
      </div>

      <div className={storiesMode ? "relative w-full" : "relative"}>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={primary?.id}
            layout
            drag="x"
            dragElastic={0.15}
            onDragStart={() => setIsUserInteracting(true)}
            onDragEnd={onDragEnd}
            onDragTransitionEnd={() => setIsUserInteracting(false)}
            className={`w-full ${storiesMode ? "aspect-3/4 md:aspect-16/6" : ""}`}
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

      {/* Hidden SEO content to expose store offers to crawlers without altering layout */}
      <div className="sr-only">
        <h2>HomeFix Store Offers, Hot Deals and Free Installation</h2>
        <ul>
          <li>
            Hot deals on modular vanity units with free installation in the
            HomeFix Store.
          </li>
          <li>
            Tall units and pantry ladders available as standalone products with
            transparent pricing.
          </li>
          <li>
            Bathroom bundles under fixed price points, including vanities and
            mirrors.
          </li>
          <li>
            Single-piece study desks and interior upgrades that can be ordered
            like normal products.
          </li>
          <li>
            Entryway units and shoe racks designed for clutter-free foyers.
          </li>
          <li>
            Every HomeFix Store unit includes professional installation at no
            extra cost.
          </li>
        </ul>
      </div>

      {/* JSON-LD for search engines (store products + offers) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "HomeFix Store Featured Offers",
            itemListElement: effectivePromos.map((promo, index) => ({
              "@type": "Product",
              position: index + 1,
              name: promo.title,
              description: promo.body,
              offers: {
                "@type": "Offer",
                price: promo.priceRupees
                  ? promo.priceRupees.toString()
                  : "0",
                priceCurrency: promo.currency ?? "INR",
                availability: "https://schema.org/InStock",
                itemCondition: "https://schema.org/NewCondition",
                url: promo.href ?? "/store",
                priceSpecification: {
                  "@type": "UnitPriceSpecification",
                  name: promo.secondaryTag ?? "Installation",
                  price: "0",
                  priceCurrency: promo.currency ?? "INR",
                },
              },
            })),
          }),
        }}
      />
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
  const imageUrl =
    promo.image ||
    (promo.imagePath && PROMO_STRIP_BASE_URL
      ? `${PROMO_STRIP_BASE_URL}/${promo.imagePath}`
      : null);
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
          <button
            aria-label="Previous promo"
            onClick={onPrev}
            className="absolute inset-y-0 left-0 w-1/3"
          />
          <button
            aria-label="Next promo"
            onClick={onNext}
            className="absolute inset-y-0 right-0 w-1/3"
          />
        </div>
      )}
      <div className="flex h-full flex-col gap-4 md:flex-row md:items-center md:gap-6">
        {/* Emoji + aura */}
        <div className="relative flex h-14 w-14 shrink-0 items-center justify-center">
          <span
            className={`absolute inset-1 rounded-2xl bg-linear-to-br ${promo.auraClass} blur-xl`}
          />
          <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-(--surface-card) text-2xl shadow-md">
            {promo.emoji}
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
              <CrossfadeImage
                primary={imageUrl}
                altSrc={altImage}
                altText={promo.title}
              />
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
      setLabel(
        hours > 0
          ? `Ends in ${hours}h ${minutes}m`
          : `Ends in ${minutes}m`
      );
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
