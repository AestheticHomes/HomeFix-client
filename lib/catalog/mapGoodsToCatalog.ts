/**
 * ============================================================
 * 🧩 FILE: /lib/catalog/mapGoodsToCatalog.ts
 * MODULE: Goods → Catalog mapper (PNG-first + optional GLB)
 * SOURCE: Supabase goods JSON (goods-v1) served via CDN
 * POLICY: Build coverUrl from asset_key (PNG first), attach GLB when present
 * ============================================================
 */

import type { CatalogItem } from "@/types/catalog";

export type GoodsRow = {
  id: number | string;
  title: string;
  category: string;
  price: number | string;
  asset_key: string;
  has_glb?: boolean;
  badge?: string | null;

  // Optional extended merch fields
  mrp?: number | string | null;
  brand?: string | null;
  promo_label?: string | null;
  warranty_years?: number | null;
  category_slug?: string | null;
  slug?: string | null;
  finish_options?: { label: string; swatchUrl?: string }[] | null;

  // Optional PDP / SEO helpers
  gallery?: string[] | null;
  highlights?: { label: string; value: string }[];
  promises?: string[];
};

const CDN_BASE = process.env.NEXT_PUBLIC_HOMEFIX_CDN || "";

export function normalizeCategory(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizeBadge(badge?: string | null): CatalogItem["badge"] {
  if (!badge) return null;
  const v = badge.toLowerCase();
  if (v.includes("new")) return "new";
  if (v.includes("best")) return "bestseller";
  if (v.includes("promo") || v.includes("offer")) return "promo";
  return badge;
}

export function mapGoodsToCatalog(rows: GoodsRow[]): CatalogItem[] {
  return rows.map((row, idx) => {
    const numericId = Number(row.id);
    const numericPrice = Number(row.price);
    const numericMrp =
      row.mrp !== undefined && row.mrp !== null ? Number(row.mrp) : NaN;

    const id = Number.isFinite(numericId) ? numericId : idx;
    const price = Number.isFinite(numericPrice) ? numericPrice : 0;
    const mrp = Number.isFinite(numericMrp) ? numericMrp : null;

    const key = row.asset_key;
    const folder = CDN_BASE ? `${CDN_BASE}/products/${key}` : `/products/${key}`;

    const coverUrl = `${folder}/${key}.png`;
    const glbUrl = row.has_glb ? `${folder}/${key}.glb` : null;

    const categorySlug =
      row.category_slug && row.category_slug.trim().length > 0
        ? normalizeCategory(row.category_slug)
        : normalizeCategory(String(row.category));

    const slug =
      row.slug && row.slug.trim().length > 0
        ? row.slug
        : String(row.title).toLowerCase().replace(/\s+/g, "-");

    let discountPercent: number | null = null;
    if (mrp && mrp > price) {
      discountPercent = Math.round(((mrp - price) / mrp) * 100);
    }

    return {
      id,
      title: row.title,
      category: row.category,
      categorySlug,
      slug,

      coverUrl,
      glbUrl,

      price,
      mrp,
      discountPercent,
      currency: "INR",

      brand: row.brand ?? null,
      finishOptions: row.finish_options ?? [],

      badge: normalizeBadge(row.badge),
      promoLabel: row.promo_label ?? null,
      warrantyYears: row.warranty_years ?? null,

      // Media gallery: prefer explicit gallery, fall back to primary cover
      gallery:
        row.gallery && row.gallery.length > 0
          ? row.gallery.filter(Boolean)
          : [coverUrl].filter(Boolean),

      highlights: row.highlights ?? [],
      promises: row.promises ?? [],
    };
  });
}
