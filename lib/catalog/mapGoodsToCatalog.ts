/**
 * ============================================================
 * 🧩 FILE: /lib/catalog/mapGoodsToCatalog.ts
 * MODULE: Goods → Catalog mapper (PNG-first + auto GLB mapping)
 * ============================================================
 *
 * CONVENTION (no manual URLs):
 *   - Each product has an `asset_key`, e.g. "KITCHEN_BASE_600"
 *   - Files live in:
 *       homefix-catalog/items/{asset_key}/{asset_key}.png
 *       homefix-catalog/items/{asset_key}/{asset_key}.glb  (optional)
 *
 *   - JSON only stores:
 *       asset_key, has_glb
 *     and we derive the URLs here.
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
  badge?: "new" | "bestseller" | "promo" | null | string;
};

const CDN_BASE = process.env.NEXT_PUBLIC_HOMEFIX_CDN || "";

function normalizeBadge(badge?: string | null): CatalogItem["badge"] {
  if (!badge) return null;
  const value = badge.toLowerCase();
  if (value.includes("new")) return "new";
  if (value.includes("best")) return "bestseller";
  if (value.includes("promo") || value.includes("offer")) return "promo";
  return null;
}

export function mapGoodsToCatalog(rows: GoodsRow[]): CatalogItem[] {
  return rows.map((row, idx) => {
    const numericId = Number(row.id);
    const numericPrice = Number(row.price);

    const id = Number.isFinite(numericId) ? numericId : idx;
    const price = Number.isFinite(numericPrice) ? numericPrice : 0;

    const key = row.asset_key;
    const folder = CDN_BASE
      ? `${CDN_BASE}/items/${key}`
      : `/items/${key}`; // dev fallback if CDN_BASE is missing

    const coverUrl = `${folder}/${key}.png`;
    const glbUrl = row.has_glb ? `${folder}/${key}.glb` : null;

    return {
      id,
      title: row.title,
      category: row.category,
      price,
      currency: "INR",
      coverUrl,
      glbUrl,
      badge: normalizeBadge(row.badge),
    };
  });
}
