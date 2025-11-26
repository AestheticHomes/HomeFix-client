/**
 * ============================================================
 * 📄 FILE: /app/sitemap.ts
 * 🧩 MODULE: Sitemap generator for Store + PDP
 * DATA: Supabase goods JSON → mapGoodsToCatalog → URLs
 * ============================================================
 */

import {
  mapGoodsToCatalog,
  normalizeCategory,
  type GoodsRow,
} from "@/lib/catalog/mapGoodsToCatalog";

const BASE_URL = "https://homefix.in";

export default async function sitemap() {
  const catalogUrl = process.env.NEXT_PUBLIC_GOODS_CATALOG_URL;

  const staticPages = [
    {
      url: `${BASE_URL}/store`,
      lastModified: new Date().toISOString(),
      changeFrequency: "weekly" as const,
      priority: 1,
    },
  ];

  if (!catalogUrl) return staticPages;

  try {
    const res = await fetch(catalogUrl, { cache: "no-store" });
    const rows = (await res.json()) as GoodsRow[];
    const mapped = mapGoodsToCatalog(rows);

    const nowIso = new Date().toISOString();

    const productPages = mapped.map((p) => ({
      url: `${BASE_URL}/store/${p.categorySlug}/${p.slug}`,
      lastModified: nowIso,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    }));

    const categorySlugs = Array.from(
      new Set(
        mapped
          .map((p) => p.categorySlug || normalizeCategory(p.category))
          .filter(Boolean)
      )
    );

    const categoryPages = categorySlugs.map((slug) => ({
      url: `${BASE_URL}/store/${slug}`,
      lastModified: nowIso,
      changeFrequency: "weekly" as const,
      priority: 0.85,
    }));

    return [...staticPages, ...categoryPages, ...productPages];
  } catch (err) {
    console.warn("[sitemap] Failed to build product sitemap", err);
    return staticPages;
  }
}
