/**
 * HomeFix — PromoBrain (Server-only)
 *
 * Purpose:
 *   - Generate 3–6 store promos from the catalog for the homepage promo rail.
 *   - Uses server-side Supabase client; cached in-memory for 10 minutes.
 *   - Falls back to DEFAULT_PROMOS on error/empty result.
 * Notes:
 *   - Server-only (no "use client"); safe for RLS when using service role.
 */

import { supabaseServer } from "@/lib/supabaseServerClient";

export type Promo = {
  id: number | string;
  title: string;
  body: string;
  tag?: string;
  secondaryTag?: string;
  priceRupees?: number;
  href: string;
  image: string;
  imageAlt?: string;
  auraClass: string;
  expiry?: number;
  ctaLabel?: string;
};

let promoCache: { data: Promo[]; timestamp: number } | null = null;
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

const DEFAULT_PROMOS: Promo[] = [
  {
    id: "default-1",
    title: "Launch offer: vanities with free installation",
    body: "Premium vanity units with soft-close hardware, installed by HomeFix pros.",
    tag: "Store Offer",
    secondaryTag: "Free Installation",
    priceRupees: 14999,
    href: "/store",
    image: "/placeholder/promo-default.jpg",
    imageAlt: "/placeholder/promo-default.jpg",
    auraClass: "from-indigo-300/70 via-sky-300/60 to-emerald-200/50",
    expiry: Date.now() + 36 * 3600 * 1000,
    ctaLabel: "Shop store",
  },
  {
    id: "default-2",
    title: "Tall units & storage ladders",
    body: "Modular tall units with transparent pricing and quick installation.",
    tag: "Hot Deal",
    secondaryTag: "Store only",
    priceRupees: 18999,
    href: "/store",
    image: "/placeholder/promo-default.jpg",
    auraClass: "from-amber-300/70 via-orange-300/60 to-pink-200/50",
    expiry: Date.now() + 48 * 3600 * 1000,
    ctaLabel: "View tall units",
  },
  {
    id: "default-3",
    title: "Bathroom bundles under ₹20k",
    body: "Pre-packed vanity + mirror sets with transparent pricing.",
    tag: "Store Offer",
    secondaryTag: "Free Installation",
    priceRupees: 19999,
    href: "/store",
    image: "/placeholder/promo-default.jpg",
    auraClass: "from-emerald-300/70 via-teal-300/60 to-cyan-200/50",
    expiry: Date.now() + 42 * 3600 * 1000,
    ctaLabel: "Browse bathroom picks",
  },
];

const AURA_BY_CATEGORY: Record<string, string> = {
  bathroom: "from-(--accent-secondary)/70 via-(--accent-primary)/50 to-(--surface-card)/40",
  kitchen: "from-indigo-300/70 via-sky-300/60 to-emerald-200/50",
  storage: "from-emerald-300/70 via-teal-300/60 to-cyan-200/50",
  entryway: "from-amber-300/70 via-orange-300/60 to-pink-200/50",
  default: "from-(--accent-primary)/60 via-(--accent-secondary)/55 to-(--surface-card)/45",
};

function buildBody(item: any) {
  const cat = (item?.category || "").toLowerCase();
  if (cat === "bathroom")
    return "Premium vanity with soft-close hardware, delivered and installed by HomeFix pros.";
  if (cat === "kitchen")
    return "Modular tall unit upgrade with fast installation and transparent pricing.";
  if (cat === "storage")
    return "Space-saving wardrobe/storage module with durable finishes.";
  if (cat === "entryway")
    return "Ready-to-install foyer unit with clutter-free design and hidden storage.";
  return "Expert-installed HomeFix Store unit designed for fast upgrades.";
}

function mapRowToPromo(item: any, idx: number): Promo {
  const price =
    typeof item?.price === "number"
      ? item.price
      : typeof item?.mrp === "number"
      ? item.mrp
      : undefined;
  const cat = (item?.category || "default").toLowerCase();
  return {
    id: item.id ?? idx,
    title: item.name || item.title || "HomeFix Store unit",
    body: item.promoCopy || item.subtitle || buildBody(item),
    tag: item.discount > 0 ? "Hot Deal" : "Store Offer",
    secondaryTag:
      item.free_install ||
      item.freeInstallation ||
      item.includes_installation
        ? "Free Installation"
        : undefined,
    priceRupees: price,
    href: `/store/${item.id ?? ""}`,
    image:
      item.thumbnail ||
      item.primaryImagePath ||
      item.primary_image ||
      "/placeholder/promo-default.jpg",
    imageAlt:
      item.alt_image ||
      item.secondary_image ||
      item.secondaryImagePath ||
      undefined,
    auraClass: AURA_BY_CATEGORY[cat] ?? AURA_BY_CATEGORY.default,
    expiry:
      item.deal_expiry && Number(item.deal_expiry) > Date.now()
        ? Number(item.deal_expiry)
        : Date.now() + 36 * 3600 * 1000,
    ctaLabel: "Buy Now",
  };
}

export async function getPromoDeals(): Promise<Promo[]> {
  const now = Date.now();
  if (promoCache && now - promoCache.timestamp < CACHE_TTL) {
    return promoCache.data;
  }

  try {
    const { data, error } = await supabaseServer
      .from("goods")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(12);

    if (error) {
      console.error("[PromoBrain] Supabase error:", error.message);
      promoCache = { data: DEFAULT_PROMOS, timestamp: now };
      return DEFAULT_PROMOS;
    }

    if (!data || data.length === 0) {
      promoCache = { data: DEFAULT_PROMOS, timestamp: now };
      return DEFAULT_PROMOS;
    }

    const promos = data.slice(0, 6).map(mapRowToPromo);
    promoCache = { data: promos, timestamp: now };
    return promos;
  } catch (err: any) {
    console.error("[PromoBrain] Fatal error:", err?.message || err);
    promoCache = { data: DEFAULT_PROMOS, timestamp: now };
    return DEFAULT_PROMOS;
  }
}
