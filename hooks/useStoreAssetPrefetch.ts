"use client";

import { useEffect } from "react";
import type { CatalogItem } from "@/types/catalog";

/**
 * Prefetch lightweight store thumbnails for the current viewport.
 * Heavy assets (GLBs) are intentionally excluded; they load on PDP.
 */
export function useStoreAssetPrefetch(items: CatalogItem[]) {
  useEffect(() => {
    if (!items || items.length === 0) return;
    if (typeof window === "undefined") return;

    const thumbs = items
      .map((item) => item.coverUrl || item.gallery?.[0])
      .filter(Boolean) as string[];

    const start = () => {
      thumbs.forEach((url) => {
        try {
          const img = new Image();
          img.src = url;
        } catch {
          // ignore individual preload errors
        }
      });
    };

    if ("requestIdleCallback" in window) {
      (window as any).requestIdleCallback(start, { timeout: 1200 });
    } else {
      setTimeout(start, 0);
    }
  }, [items]);
}
