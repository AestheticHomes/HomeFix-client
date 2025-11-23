"use client";
/**
 * ============================================================
 * 🛒 FILE: /app/store/page.tsx
 * 🧩 MODULE: Store (HomePreview-backed) v3.2 — Offline First
 * ------------------------------------------------------------
 * DATA CONTRACT
 *   - Source of truth: JSON in Supabase bucket via CDN
 *     (NEXT_PUBLIC_GOODS_CATALOG_URL)
 *   - Runtime truth: localStorage cache (catalog + timestamp)
 *
 * BEHAVIOR
 *   - On mount:
 *       1) Read cache → instant UI if present
 *       2) Background refresh from CDN → update cache + UI
 *   - If offline and cache exists → still works
 *
 * LAYOUT CONTRACT
 *   - RootShell owns global scroll + padding.
 *   - This page:
 *       - Uses a fixed category rail under the header
 *       - Adds left margin so grid starts AFTER:
 *           main sidebar (80/256) + category rail (96)
 *   - No inner scroll containers for the main product grid.
 * ============================================================
 */

import CatalogPreviewCard from "@/components/catalog/CatalogPreviewCard";
import { useProductCartStore } from "@/components/store/cartStore";
import { useSidebar } from "@/contexts/SidebarContext";
import {
  mapGoodsToCatalog,
  type GoodsRow,
} from "@/lib/catalog/mapGoodsToCatalog";
import type { CatalogItem } from "@/types/catalog";
import { AnimatePresence, motion } from "framer-motion";
import { PackageOpen, Search, Tag } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";

const CATALOG_CACHE_KEY = "edith_goods_catalog_v1";
const CATALOG_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours

type CatalogCachePayload = {
  updatedAt: number;
  items: CatalogItem[];
};

/**
 * Categories rendered in the left rail.
 *
 * IMPORTANT:
 *  - Ensure these names align with `CatalogItem["category"]`
 *    after `mapGoodsToCatalog`, or filtering will show zero results.
 */
const CATEGORY_DEFS: { name: string; icon: ReactNode }[] = [
  { name: "all", icon: <Tag size={20} /> },
  { name: "Doors", icon: <Tag size={20} /> },
  { name: "CNC Elements", icon: <Tag size={20} /> },
  { name: "Wooden Panels", icon: <Tag size={20} /> },
  { name: "Paint Finishes", icon: <Tag size={20} /> },
  { name: "Hardware", icon: <Tag size={20} /> },
  { name: "Lighting", icon: <Tag size={20} /> },
  { name: "Bathroom", icon: <Tag size={20} /> },
];

export default function StorePage() {
  const router = useRouter();
  const { collapsed } = useSidebar();
  const { addItem, increment, decrement, items, totalPrice } =
    useProductCartStore();

  const cartCount = items.length;

  // Full catalog (source for search/filter)
  const [all, setAll] = useState<CatalogItem[]>([]);
  // View after search + category filter
  const [view, setView] = useState<CatalogItem[]>([]);
  // Initial load state
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [isDesktop, setIsDesktop] = useState(false);

  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null);
  const [isStale, setIsStale] = useState(false);

  const hasCatalog = all.length > 0;

  const categories = useMemo(() => CATEGORY_DEFS, []);

  // ---- Helpers for cache ----

  const readCache = () => {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.localStorage.getItem(CATALOG_CACHE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as CatalogCachePayload;
      if (!parsed.items || !Array.isArray(parsed.items)) return null;
      return parsed;
    } catch {
      // Corrupted JSON or other error → ignore cache
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
      // Ignore quota / serialization errors
    }
  };

  // 1) Try to hydrate from local cache immediately (offline-first)
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
      // No cache → stay in loading state until network attempt completes
      setLoading(true);
    }
  }, []);

  // 2) Background refresh from Supabase CDN JSON
  useEffect(() => {
    let live = true;
    const controller = new AbortController();

    const url = process.env.NEXT_PUBLIC_GOODS_CATALOG_URL;

    // If env is missing, we can still operate on cache, if any.
    if (!url) {
      console.warn(
        "[StorePage] NEXT_PUBLIC_GOODS_CATALOG_URL is not set. " +
          "Expose your goods catalog JSON via Supabase bucket/CDN."
      );
      if (!hasCatalog) {
        setLoading(false);
      }
      return;
    }

    (async () => {
      try {
        const res = await fetch(url, {
          signal: controller.signal,
          // We control staleness at app level; CDN/browser still help
          cache: "no-cache",
        });

        if (!res.ok) {
          throw new Error(`Catalog fetch failed: ${res.status}`);
        }

        const rows = (await res.json()) as GoodsRow[];
        const mapped = mapGoodsToCatalog(rows || []);

        if (!live) return;

        setAll(mapped);
        writeCache(mapped);
        setLoading(false);
      } catch (err) {
        if (!live) return;

        // If we already have cache, we silently stay on it.
        // If we had nothing, stop loading so UI can show empty state.
        if (!hasCatalog) {
          setLoading(false);
        }
        setIsStale(true);
        console.warn("[StorePage] Catalog sync failed", err);
      }
    })();

    return () => {
      live = false;
      controller.abort();
    };
  }, [hasCatalog]);

  // 3) Filter + search (reactive to catalog, search, category) with a tiny debounce
  useEffect(() => {
    const t = setTimeout(() => {
      const q = search.trim().toLowerCase();

      const filtered = all.filter((p) => {
        const catMatch =
          category === "all" ||
          p.category.toLowerCase() === category.toLowerCase();
        const qMatch = !q || p.title.toLowerCase().includes(q);
        return catMatch && qMatch;
      });

      setView(filtered);
    }, 120);

    return () => clearTimeout(t);
  }, [search, category, all]);

  // 4) Responsive: derive a simple desktop breakpoint
  useEffect(() => {
    const onResize = () => {
      if (typeof window === "undefined") return;
      setIsDesktop(window.innerWidth >= 768);
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <section
      id="store-safe-zone"
      className="relative flex flex-col w-full mx-auto bg-[var(--surface-base)] transition-colors duration-500"
    >
      {/* Search bar (centered, behaves well on mobile) */}
      <div className="relative flex w-full sm:max-w-md mx-auto mt-4 mb-1 px-4">
        <Search className="absolute left-6 top-2.5 w-4 h-4 text-[var(--text-muted)]" />
        <input
          id="store-search"
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-3 py-2 rounded-xl border border-[var(--border-soft)]
                     bg-[var(--surface-card)] dark:bg-[var(--surface-card-dark)]
                     text-sm text-[var(--text-primary)] dark:text-[var(--text-primary-dark)]
                     focus:ring-2 focus:ring-[var(--accent-primary)] outline-none transition"
        />
      </div>

      {/* Tiny stale badge under search */}
      {lastUpdatedAt && (
        <p className="px-6 mb-2 text-[10px] text-[var(--text-muted)]">
          Catalog snapshot:{" "}
          {new Date(lastUpdatedAt).toLocaleString("en-IN", {
            hour12: false,
          })}
          {isStale ? " • may be out of date (using cached copy)" : ""}
        </p>
      )}

      <div className="relative flex-1 flex flex-row">
        {/* Category rail (fixed under header, independent scroll) */}
        <motion.aside
          animate={{ left: isDesktop ? (collapsed ? 80 : 256) : 0 }}
          transition={{ type: "spring", stiffness: 180, damping: 22 }}
          className="fixed z-[60] border-r border-[var(--edith-border)]
                     bg-[var(--surface-card)] dark:bg-[var(--surface-card-dark)]
                     flex flex-col items-center overflow-y-auto scroll-smooth touch-pan-y backdrop-blur-md"
          style={{
            top: "var(--hf-header-height,72px)",
            bottom: "var(--mbnav-h-safe,72px)",
            width: isDesktop ? "96px" : "80px",
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none",
          }}
        >
          <div className="flex flex-col py-3 gap-3 items-center w-full">
            {categories.map((cat) => {
              const active = cat.name === category;
              return (
                <motion.button
                  key={cat.name}
                  onClick={() => setCategory(cat.name)}
                  whileTap={{ scale: 0.94 }}
                  className={`relative w-[72px] h-[72px] rounded-2xl flex flex-col items-center justify-center text-[11px] font-medium
                    overflow-hidden transition-all duration-300 text-center
                    ${
                      active
                        ? "bg-gradient-to-b from-[var(--accent-success)] to-[var(--accent-success-hover)] text-white shadow-[0_0_10px_rgba(16,185,129,0.6)]"
                        : "bg-[var(--surface-card)] dark:bg-[var(--surface-card-dark)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]"
                    }`}
                >
                  <div className="mb-1">{cat.icon}</div>
                  <span className="leading-tight px-1 whitespace-normal break-words text-[10px] font-medium">
                    {cat.name}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </motion.aside>

        {/* Product grid (RootShell owns outer scroll/padding) */}
        <section
          className="flex-1 px-4 sm:px-8 pt-4 transition-all duration-700 ease-in-out bg-[var(--surface-base)]"
          style={{
            marginLeft: isDesktop
              ? `calc(${collapsed ? 80 : 256}px + 96px)`
              : "80px",
          }}
        >
          <AnimatePresence mode="popLayout">
            {loading ? (
              <motion.div
                key="loading"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 px-1"
              >
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-[4/3] rounded-3xl bg-[var(--surface-card)] dark:bg-[var(--surface-card-dark)] animate-pulse"
                  />
                ))}
              </motion.div>
            ) : view.length > 0 ? (
              <motion.div
                key="grid"
                layout
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 px-1"
              >
                {view.map((item) => {
                  // Support both quantity-on-item and duplicate-items cart shapes
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
                          id: item.id,
                          title: item.title,
                          price: item.price,
                        })
                      }
                      onDecrement={() => decrement(item.id)}
                    />
                  );
                })}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                className="flex flex-col items-center justify-center h-[50vh] text-[var(--text-secondary)]"
              >
                <PackageOpen className="w-10 h-10 mb-2 text-[var(--text-muted)]" />
                <p>
                  {isStale
                    ? "No products in cache and can’t reach the live catalog."
                    : "No products found for this filter."}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>

      {/* Floating Checkout Footer */}
      <AnimatePresence>
        {cartCount > 0 && (
          <motion.footer
            key="checkout-footer"
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="fixed left-0 right-0 z-[70] flex items-center justify-between gap-4 px-5 py-4
                       bg-[var(--edith-surface)] border-t border-[var(--edith-border)]
                       backdrop-blur-lg rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.1)]"
            style={{ bottom: "var(--mbnav-h-safe,72px)" }}
          >
            <div className="flex flex-col">
              <span className="text-xs text-[var(--text-secondary)]">
                {cartCount} {cartCount === 1 ? "item" : "items"} in cart
              </span>
              <span className="font-semibold text-[var(--accent-success)] text-lg">
                ₹{totalPrice.toLocaleString("en-IN")}
              </span>
            </div>

            <button
              onClick={() => router.push("/checkout")}
              className="relative px-6 py-2.5 rounded-xl font-semibold text-white overflow-hidden group
                         bg-gradient-to-r from-fuchsia-500 via-indigo-500 to-cyan-400 hover:from-fuchsia-600 hover:to-indigo-600 
                         shadow-[0_0_16px_rgba(147,51,234,0.5)] transition-all"
            >
              <span className="relative z-10">Proceed to Checkout</span>
              <span className="absolute -inset-[2px] rounded-xl bg-gradient-to-r from-fuchsia-500 via-indigo-500 to-cyan-400 blur-md opacity-60 animate-pulse" />
            </button>
          </motion.footer>
        )}
      </AnimatePresence>
    </section>
  );
}
