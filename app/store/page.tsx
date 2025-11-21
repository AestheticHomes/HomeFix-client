"use client";
/**
 * Store — single-scroll page
 * - Body scroll only
 * - Category rail fixed & scrollable
 * - Grid does NOT create its own scroll
 * - Floating checkout footer hovers above the dock (RootShell pads the scene)
 */

import { useProductCartStore } from "@/components/store/cartStore";
import ProductCard, { Product } from "@/components/store/ProductCard";
import StorePromoStrip from "@/components/store/StorePromoStrip";
import { useSidebar } from "@/contexts/SidebarContext";
import supabase from "@/lib/supabaseClient";
import { AnimatePresence, motion } from "framer-motion";
import { PackageOpen, Search, Tag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function StorePage() {
  const router = useRouter();
  const { collapsed } = useSidebar();
  const { items, totalPrice } = useProductCartStore();
  const cartCount = items.length;

  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [isDesktop, setIsDesktop] = useState(false);

  const categories = useMemo(
    () => [
      { name: "all", icon: <Tag size={20} /> },
      { name: "Doors", icon: <Tag size={20} /> },
      { name: "CNC Elements", icon: <Tag size={20} /> },
      { name: "Wooden Panels", icon: <Tag size={20} /> },
      { name: "Paint Finishes", icon: <Tag size={20} /> },
      { name: "Hardware", icon: <Tag size={20} /> },
      { name: "Lighting", icon: <Tag size={20} /> },
      { name: "Bathroom", icon: <Tag size={20} /> },
    ],
    []
  );

  // Fetch
  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("goods")
        .select("*")
        .returns<Product[]>();
      if (!active) return;
      if (!error) setProducts(data || []);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  // Filter + search
  useEffect(() => {
    const t = setTimeout(() => {
      let list = [...products];
      if (category !== "all") {
        list = list.filter(
          (p) => p.category?.toLowerCase() === category.toLowerCase()
        );
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        list = list.filter((p) => p.title?.toLowerCase().includes(q));
      }
      setFiltered(list);
    }, 120);
    return () => clearTimeout(t);
  }, [search, category, products]);

  // Responsive
  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= 768);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <section
      id="store-safe-zone"
      className="relative flex flex-col w-full mx-auto bg-[var(--surface-base)] transition-colors duration-500"
    >
      <StorePromoStrip />

      {/* Search */}
      <div className="relative flex w-full sm:max-w-md mx-auto mt-4 mb-3 px-4">
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

      <div className="relative flex-1 flex flex-row">
        {/* Category rail (fixed; its own scroll is OK) */}
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
              const isActive = cat.name === category;
              return (
                <motion.button
                  key={cat.name}
                  onClick={() => setCategory(cat.name)}
                  whileTap={{ scale: 0.94 }}
                  className={`relative w-[72px] h-[72px] rounded-2xl flex flex-col items-center justify-center text-[11px] font-medium
                    overflow-hidden transition-all duration-300 text-center
                    ${
                      isActive
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

        {/* Product grid (NO overflow here) */}
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
                className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3 px-1 justify-items-center"
              >
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-[4/5.5] rounded-xl bg-[var(--surface-card)] dark:bg-[var(--surface-card-dark)] animate-pulse w-full"
                  />
                ))}
              </motion.div>
            ) : filtered.length > 0 ? (
              <motion.div
                key="grid"
                layout
                className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3 px-1 justify-items-center"
              >
                {filtered.map(
                  (p) => p?.id && <ProductCard key={p.id} product={p} />
                )}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                className="flex flex-col items-center justify-center h-[50vh] text-[var(--text-secondary)]"
              >
                <PackageOpen className="w-10 h-10 mb-2 text-[var(--text-muted)]" />
                <p>No products found.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>

      {/* Floating Checkout Bar (pinned above mobile dock) */}
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
            style={{
              bottom: "var(--mbnav-h-safe,72px)", // sit above the mobile dock
            }}
          >
            <div className="flex flex-col">
              <span className="text-xs text-[var(--text-secondary)]">
                {cartCount} {cartCount === 1 ? "item" : "items"} in cart
              </span>
              <span className="font-semibold text-[var(--accent-success)] text-lg">
                ₹{totalPrice.toLocaleString()}
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
