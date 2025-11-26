"use client";

import { useEffect, useMemo, useState } from "react";

import {
  getCatalog,
  getCatalogUpdatedAt,
  getCatalogVersion,
  setCatalog,
} from "@/lib/client/catalogCache";
import { mapGoodsToCatalog, type GoodsRow } from "@/lib/catalog/mapGoodsToCatalog";
import type { CatalogItem } from "@/types/catalog";

type CatalogState = {
  items: CatalogItem[];
  isLoading: boolean;
  isStale: boolean;
  error: string | null;
  lastUpdatedAt: number | null;
};

/**
 * useCatalogWithCache
 * ------------------------------------------------------------
 * Offline-first catalog hook:
 *  - Serve cached catalog immediately from IndexedDB (ledgerx-style).
 *  - In parallel, fetch CDN JSON (NEXT_PUBLIC_GOODS_CATALOG_URL).
 *  - If version differs, overwrite cache and mark as fresh.
 *  - Only metadata/URLs are cached (no GLB/image binaries).
 */
export function useCatalogWithCache(): CatalogState {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isStale, setIsStale] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null);

  const endpoint = process.env.NEXT_PUBLIC_GOODS_CATALOG_URL;

  // Hydrate from cache immediately
  useEffect(() => {
    let mounted = true;
    (async () => {
      const cached = await getCatalog();
      const cachedUpdated = await getCatalogUpdatedAt();
      if (!mounted) return;
      if (cached && cached.length) {
        setItems(cached);
        setIsLoading(false);
        setIsStale(true); // until network confirms freshness
        if (cachedUpdated) setLastUpdatedAt(cachedUpdated);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Network refresh + version check
  useEffect(() => {
    if (!endpoint) {
      setIsLoading(false);
      return;
    }

    let live = true;
    const controller = new AbortController();

    (async () => {
      try {
        const currentVersion = await getCatalogVersion();
        const res = await fetch(endpoint, {
          cache: "no-cache",
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`Status ${res.status}`);

        const json = await res.json();
        const version =
          json?.version ||
          json?.meta?.version ||
          (typeof json?.catalog_version === "string"
            ? json.catalog_version
            : null);

        const rows: GoodsRow[] = Array.isArray(json)
          ? json
          : Array.isArray(json?.items)
          ? json.items
          : [];

        const mapped = mapGoodsToCatalog(rows || []);

        if (!live) return;

        if (version !== currentVersion) {
          await setCatalog(mapped, version ?? null);
        } else {
          // Update updatedAt even if version same to bump freshness
          await setCatalog(mapped, version ?? null);
        }

        setItems(mapped);
        setIsLoading(false);
        setIsStale(false);
        setLastUpdatedAt(Date.now());
        setError(null);
      } catch (err: any) {
        if (!live) return;
        setError(err?.message || "Failed to load catalog");
        setIsLoading((prev) => items.length === 0 ? false : prev);
        setIsStale(true);
      }
    })();

    return () => {
      live = false;
      controller.abort();
    };
  }, [endpoint, items.length]);

  return useMemo(
    () => ({ items, isLoading, isStale, error, lastUpdatedAt }),
    [items, isLoading, isStale, error, lastUpdatedAt]
  );
}
