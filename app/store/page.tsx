"use client";
/**
 * ============================================================
 * HomeFix Store — Edith Continuum v10.5 🌿
 * ------------------------------------------------------------
 * ✅ Category rail synced with main Sidebar (expand/collapse)
 * ✅ Respects SafeViewport (no overlap, no leaks)
 * ✅ Smooth framer-motion transitions
 * ✅ Desktop + Mobile parity
 * ============================================================
 */

import ProductCard, { Product } from "@/components/store/ProductCard";
import { useSidebar } from "@/contexts/SidebarContext";
import supabase from "@/lib/supabaseClient";
import { AnimatePresence, motion } from "framer-motion";
import { PackageOpen, Search, Tag } from "lucide-react";
import { useEffect, useState } from "react";

export default function StorePage() {
  const { collapsed } = useSidebar();
  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [isDesktop, setIsDesktop] = useState(false);

  const categories = [
    { name: "all", icon: <Tag size={20} /> },
    { name: "Doors", icon: <Tag size={20} /> },
    { name: "CNC Elements", icon: <Tag size={20} /> },
    { name: "Wooden Panels", icon: <Tag size={20} /> },
    { name: "Paint Finishes", icon: <Tag size={20} /> },
    { name: "Hardware", icon: <Tag size={20} /> },
    { name: "Lighting", icon: <Tag size={20} /> },
    { name: "Bathroom", icon: <Tag size={20} /> },
  ];

  /* 🔥 Fetch from Supabase */
  useEffect(() => {
    let active = true;
    const fetchProducts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("goods")
        .select("*")
        .returns<Product[]>();
      if (active) {
        if (!error) setProducts(data || []);
        setLoading(false);
      }
    };
    fetchProducts();
    return () => {
      active = false;
    };
  }, []);

  /* 🎯 Search + Filter */
  useEffect(() => {
    const timer = setTimeout(() => {
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
    return () => clearTimeout(timer);
  }, [search, category, products]);

  /* 🖥️ Detect desktop for rail positioning */
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* 💎 UI */
  return (
    <section
      id="store-safe-zone"
      className="relative flex flex-col w-full mx-auto
                 overflow-hidden
                 bg-[var(--surface-light)] dark:bg-[var(--surface-dark)]
                 transition-colors duration-500"
      style={{
        minHeight: "calc(100vh - var(--header-h) - var(--mbnav-h,72px))",
      }}
    >
      {/* 🔍 Search */}
      <div className="relative flex w-full sm:max-w-md mx-auto mt-4 mb-3 px-4">
        <Search className="absolute left-6 top-2.5 w-4 h-4 text-gray-400" />
        <input
          id="store-search"
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-3 py-2 rounded-xl border border-gray-300 dark:border-slate-700
                     bg-white dark:bg-slate-900 text-sm text-gray-800 dark:text-gray-100
                     focus:ring-2 focus:ring-emerald-500 outline-none transition"
        />
      </div>

      <div className="relative flex-1 flex flex-row">
        {/* 📁 Category Rail — snaps to Sidebar */}
        <motion.aside
          animate={{
            left: isDesktop ? (collapsed ? 80 : 256) : 0,
          }}
          transition={{ type: "spring", stiffness: 180, damping: 22 }}
          className="fixed z-[60]
                     border-r border-[var(--edith-border)]
                     bg-[var(--surface-light)] dark:bg-[var(--surface-dark)]
                     flex flex-col items-center overflow-y-auto scroll-smooth
                     touch-pan-y backdrop-blur-md"
          style={{
            top: "var(--header-h)",
            bottom: "var(--mbnav-h,72px)",
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
                        ? "bg-gradient-to-b from-emerald-500 to-lime-400 text-white shadow-[0_0_10px_rgba(16,185,129,0.6)]"
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

        {/* 🧩 Product Grid */}
        <section
          className="flex-1 overflow-y-auto px-4 sm:px-8 pb-24 pt-4 transition-all duration-700 ease-in-out"
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
                    className="aspect-[4/5.5] rounded-xl bg-gray-200 dark:bg-slate-800 animate-pulse w-full"
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
                className="flex flex-col items-center justify-center h-[50vh] text-gray-500 dark:text-gray-400"
              >
                <PackageOpen className="w-10 h-10 mb-2 text-gray-400" />
                <p>No products found.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>
    </section>
  );
}
