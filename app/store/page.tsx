"use client";
/**
 * ============================================================
 * File: /app/store/page.tsx
 * Version: v4.7 — HomeFix Store (Stability + Layer Isolation)
 * ------------------------------------------------------------
 * ✅ Prevents null `product` rendering crash
 * ✅ Z-index fix for visibility above layout overlays
 * ✅ Consistent Gemini theme glow and accent
 * ============================================================
 */

import ProductCard, { Product } from "@/components/store/ProductCard";
import supabase from "@/lib/supabaseClient";
import { AnimatePresence, motion } from "framer-motion";
import { PackageOpen, Search } from "lucide-react";
import { useEffect, useState } from "react";

export default function StorePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const categories = [
    "all",
    "Doors",
    "CNC Elements",
    "Wooden Panels",
    "Paint Finishes",
    "Hardware",
    "Lighting",
    "Bathroom",
  ];

  /* ------------------------------------------------------------
     🔥 Fetch Products from Supabase
  ------------------------------------------------------------ */
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("goods")
        .select("*")
        .not("id", "is", null);
      if (error) console.error("❌ Supabase Fetch Error:", error);
      else setProducts(data as Product[]);
      setLoading(false);
    };
    fetchProducts();
  }, []);

  /* ------------------------------------------------------------
     🎯 Filter + Search Logic
  ------------------------------------------------------------ */
  useEffect(() => {
    let list = products;
    if (category !== "all") list = list.filter((p) => p.category === category);
    if (search.trim())
      list = list.filter((p) =>
        p.title?.toLowerCase().includes(search.toLowerCase())
      );
    setFiltered(list);
  }, [search, category, products]);

  /* ------------------------------------------------------------
     💎 UI Layout
  ------------------------------------------------------------ */
  return (
    <main className="safe-screen relative z-[9100] max-w-7xl mx-auto px-4 sm:px-6 pb-24 pt-24 bg-transparent">
      {/* 🌈 Header */}
      <motion.header
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6"
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-500 to-lime-400 bg-clip-text text-transparent">
          HomeFix Store
        </h1>

        {/* 🔍 Search */}
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-300 dark:border-slate-700
                       bg-white dark:bg-slate-900 text-sm text-gray-800 dark:text-gray-100
                       focus:ring-2 focus:ring-emerald-500 outline-none transition"
          />
        </div>
      </motion.header>

      {/* 🧩 Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-thin">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-4 py-1.5 rounded-full border text-sm font-medium whitespace-nowrap transition-all ${
              category === c
                ? "bg-gradient-to-r from-emerald-600 to-lime-500 text-white shadow-md"
                : "border-gray-300 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* 🌀 Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-64 rounded-2xl bg-gray-200 dark:bg-slate-800 animate-pulse"
            />
          ))}
        </div>
      )}

      {/* 🧱 Product Grid */}
      <AnimatePresence mode="popLayout">
        {!loading && filtered.length > 0 ? (
          <motion.div
            layout
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 relative z-[1]"
          >
            {filtered
              .filter((p) => p && typeof p.id !== "undefined")
              .map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
          </motion.div>
        ) : (
          !loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-[50vh] text-gray-500"
            >
              <PackageOpen className="w-10 h-10 mb-2 text-gray-400" />
              <p>No products found.</p>
            </motion.div>
          )
        )}
      </AnimatePresence>
    </main>
  );
}
