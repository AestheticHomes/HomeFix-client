"use client";
/**
 * ============================================================
 * 🛒 FILE: /app/store/StorePageClient.tsx
 * 🧩 MODULE: Store Client (Offline-first + Cart + JSON-LD)
 * ------------------------------------------------------------
 * ROLE:
 *   - Client-side logic for /store route:
 *       • Offline-first catalog (localStorage cache + CDN refresh)
 *       • Category filter + search
 *       • Cart controls per product
 *   - SEO:
 *       • Emits Store-level JSON-LD via <Script> (schema.org/Store)
 *
 * SERVER ENTRY:
 *   - /app/store/page.tsx is the server entry with generateMetadata
 *   - It should simply render: <StorePageClient />
 * ============================================================
 */

import { AnimatePresence, motion } from "framer-motion";
import { PackageOpen, Search, Tag } from "lucide-react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { useEffect, useMemo, useState, type ReactNode } from "react";

import CatalogPreviewCard from "@/components/catalog/CatalogPreviewCard";
import { useProductCartStore } from "@/components/store/cartStore";
import { useSidebar } from "@/contexts/SidebarContext";
import { normalizeCategory } from "@/lib/catalog/mapGoodsToCatalog";
import { useCatalogWithCache } from "@/hooks/useCatalogWithCache";
import { useStoreAssetPrefetch } from "@/hooks/useStoreAssetPrefetch";
import type { CatalogItem } from "@/types/catalog";

/**
 * Categories rendered in the left rail.
 *
 * IMPORTANT:
 *  - Ensure these names align with CatalogItem["category"]
 *    or normalizeCategory() output, or filtering will show zero results.
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

export default function StorePageClient() {
  const router = useRouter();
  const { collapsed } = useSidebar();
  const { addItem, decrement, items, totalPrice } = useProductCartStore();

  const cartCount = items.length;

  const { items: catalogItems, isLoading, isStale, lastUpdatedAt } =
    useCatalogWithCache();

  // Full catalog (source for search/filter)
  const [all, setAll] = useState<CatalogItem[]>([]);
  // View after search + category filter
  const [view, setView] = useState<CatalogItem[]>([]);
  // Initial load state
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [isDesktop, setIsDesktop] = useState(false);

  const categories = useMemo(() => CATEGORY_DEFS, []);
  // Hydrate from hook output
  useEffect(() => {
    setAll(catalogItems);
    if (!isLoading || catalogItems.length > 0) {
      setLoading(false);
    }
  }, [catalogItems, isLoading]);

  // 3) Filter + search (reactive to catalog, search, category) with a tiny debounce
  useEffect(() => {
    const t = setTimeout(() => {
      const q = search.trim().toLowerCase();

      const filtered = all.filter((p) => {
        const qMatch = !q || p.title.toLowerCase().includes(q);

        if (category === "all") return qMatch;

        const selectedSlug = normalizeCategory(category);
        const productSlug = normalizeCategory(p.categorySlug || p.category);

        const catMatch = selectedSlug === productSlug;
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

  // Prefetch thumbnails for current view
  useStoreAssetPrefetch(view);

  // --- Store-level JSON-LD (schema.org/Store) ---
  const storeJsonLd = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: "HomeFix India",
    url: "https://homefix.in/store",
    description:
      "Premium modular kitchens, doors, panels, and hardware with installation included.",
  };

  return (
    <>
      <Script
        id="store-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(storeJsonLd) }}
      />

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
            className="w-full pl-10 pr-3 py-2 rounded-xl border border-[var(--border-soft)] bg-[var(--surface-card)] dark:bg-[var(--surface-card-dark)] text-sm text-[var(--text-primary)] dark:text-[var(--text-primary-dark)] focus:ring-2 focus:ring-[var(--accent-primary)] outline-none transition"
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
            className="fixed z-[60] border-r border-[var(--edith-border)] bg-[var(--surface-card)] dark:bg-[var(--surface-card-dark)] flex flex-col items-center overflow-y-auto scroll-smooth touch-pan-y backdrop-blur-md"
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
                const categorySlug = normalizeCategory(cat.name);

                return (
                  <motion.button
                    key={cat.name}
                    onClick={() => {
                      setCategory(cat.name);
                      if (categorySlug === "all") {
                        router.push("/store");
                      } else {
                        router.push(`/store/${categorySlug}`);
                      }
                    }}
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
                            id: Number(item.id),
                            title: item.title,
                            price: item.price,
                          })
                        }
                        onDecrement={() => decrement(Number(item.id))}
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
              className="fixed left-0 right-0 z-[70] flex items-center justify-between gap-4 px-5 py-4 bg-[var(--edith-surface)] border-t border-[var(--edith-border)] backdrop-blur-lg rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.1)]"
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
                className="relative px-6 py-2.5 rounded-xl font-semibold text-white overflow-hidden group bg-gradient-to-r from-fuchsia-500 via-indigo-500 to-cyan-400 hover:from-fuchsia-600 hover:to-indigo-600 shadow-[0_0_16px_rgba(147,51,234,0.5)] transition-all"
              >
                <span className="relative z-10">Proceed to Checkout</span>
                <span className="absolute -inset-[2px] rounded-xl bg-gradient-to-r from-fuchsia-500 via-indigo-500 to-cyan-400 blur-md opacity-60 animate-pulse" />
              </button>
            </motion.footer>
          )}
        </AnimatePresence>
      </section>
    </>
  );
}
