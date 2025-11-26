"use client";
/**
 * Client-side category listing (offline-first cache + cart)
 */

import CatalogPreviewCard from "@/components/catalog/CatalogPreviewCard";
import { useProductCartStore } from "@/components/store/cartStore";
import {
  mapGoodsToCatalog,
  type GoodsRow,
} from "@/lib/catalog/mapGoodsToCatalog";
import type { CatalogItem } from "@/types/catalog";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import Script from "next/script";
import { useEffect, useMemo, useState } from "react";

const CATALOG_CACHE_KEY = "edith_goods_catalog_v1";
const CATALOG_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours

type CatalogCachePayload = {
  updatedAt: number;
  items: CatalogItem[];
};

type Props = {
  categorySlug: string;
};

export default function CategoryPageClient({ categorySlug }: Props) {
  const { items, addItem, decrement } = useProductCartStore();

  const [all, setAll] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null);
  const [isStale, setIsStale] = useState(false);

  const hasCatalog = all.length > 0;

  const readCache = () => {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.localStorage.getItem(CATALOG_CACHE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as CatalogCachePayload;
      if (!parsed.items || !Array.isArray(parsed.items)) return null;
      return parsed;
    } catch {
      return null;
    }
  };

  const writeCache = (items: CatalogItem[]) => {
    if (typeof window === "undefined") return;
    try {
      const payload: CatalogCachePayload = {
        updatedAt: Date.now(),
        items,
      };
      window.localStorage.setItem(CATALOG_CACHE_KEY, JSON.stringify(payload));
      setLastUpdatedAt(payload.updatedAt);
      setIsStale(false);
    } catch {
      // ignore storage errors
    }
  };

  // Hydrate from cache
  useEffect(() => {
    const cached = readCache();
    if (cached && cached.items?.length) {
      setAll(cached.items);
      setLastUpdatedAt(cached.updatedAt);
      setLoading(false);

      const age = Date.now() - cached.updatedAt;
      if (age > CATALOG_TTL_MS) {
        setIsStale(true);
      }
    } else {
      setLoading(true);
    }
  }, []);

  // Background refresh
  useEffect(() => {
    let live = true;
    const controller = new AbortController();
    const url = process.env.NEXT_PUBLIC_GOODS_CATALOG_URL;

    if (!url) {
      if (!hasCatalog) setLoading(false);
      return;
    }

    (async () => {
      try {
        const res = await fetch(url, { cache: "no-cache", signal: controller.signal });
        if (!res.ok) throw new Error(`Catalog fetch failed: ${res.status}`);
        const rows = (await res.json()) as GoodsRow[];
        const mapped = mapGoodsToCatalog(rows || []);
        if (!live) return;
        setAll(mapped);
        writeCache(mapped);
        setLoading(false);
      } catch (err) {
        if (!live) return;
        if (!hasCatalog) setLoading(false);
        setIsStale(true);
        console.warn("[CategoryPage] Catalog sync failed", err);
      }
    })();

    return () => {
      live = false;
      controller.abort();
    };
  }, [hasCatalog]);

  const products = useMemo(() => {
    const slug = categorySlug.toLowerCase();
    return all.filter((p) => {
      const catSlug = p.categorySlug.toLowerCase();
      const catLabel = p.category.toLowerCase().replace(/\s+/g, "-");
      return catSlug === slug || catLabel === slug;
    });
  }, [all, categorySlug]);

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://homefix.in";

  const breadcrumbJsonLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: siteUrl,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Store",
          item: `${siteUrl}/store`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: categorySlug.replace(/-/g, " "),
          item: `${siteUrl}/store/${categorySlug}`,
        },
      ],
    }),
    [categorySlug, siteUrl]
  );

  return (
    <section className="px-4 sm:px-8 py-6">
      <Script
        id="category-breadcrumb-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Breadcrumbs
        className="mb-2"
        items={[
          { label: "Home", href: "/" },
          { label: "Store", href: "/store" },
          { label: categorySlug.replace(/-/g, " ") },
        ]}
      />
      <h1 className="text-xl font-semibold mb-4 capitalize">
        {categorySlug.replace(/-/g, " ")}
      </h1>

      {lastUpdatedAt && (
        <p className="text-[10px] text-[var(--text-muted)] mb-2">
          Catalog snapshot:{" "}
          {new Date(lastUpdatedAt).toLocaleString("en-IN", { hour12: false })}
          {isStale ? " • may be out of date (using cached copy)" : ""}
        </p>
      )}

      {loading ? (
        <div>Loading...</div>
      ) : products.length === 0 ? (
        <p className="text-sm text-[var(--text-secondary)]">
          No products found in this category.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((item) => {
            const cartItem = items.find((i: any) => i.id === item.id);
            const quantity =
              typeof cartItem?.quantity === "number"
                ? cartItem.quantity
                : items.filter((i: any) => i.id === item.id).length;

            return (
              <CatalogPreviewCard
                key={item.id}
                item={item}
                quantity={quantity}
                onIncrement={() =>
                  addItem({
                    id: Number(item.id),
                    title: item.title,
                    price: item.price,
                  })
                }
                onDecrement={() => decrement(Number(item.id))}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
