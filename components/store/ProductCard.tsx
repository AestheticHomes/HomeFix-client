"use client";
/**
 * ============================================================
 * File: /components/store/ProductCard.tsx
 * Version: v3.2 — HomeFix Store Product Card 🌿 (Supabase + QuickView)
 * ------------------------------------------------------------
 * ✅ Supabase `goods` table ready (images[] JSON support)
 * ✅ Blinkit-style responsive product tile
 * ✅ Quick View modal integrated (ProductQuickView)
 * ✅ Safe quantity & out-of-stock guard
 * ✅ Polished transitions + accessibility
 * ============================================================
 */

import { motion } from "framer-motion";
import Image from "next/image";
import { Plus, Minus, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/components/store/cartStore";
import { useState } from "react";
import ProductQuickView from "@/components/store/ProductQuickView";

export interface Product {
  id: number;
  title: string;
  price: number;
  description?: string;
  category?: string;
  stock?: number;
  unit?: string;
  type?: "product" | "service";
  image_url?: string;
  images?: { url: string }[];
}

/* ------------------------------------------------------------
   🧩 Product Card Component
------------------------------------------------------------ */
export default function ProductCard({ product }: { product: Product }) {
  const { items, addItem, removeItem } = useCartStore();
  const [adding, setAdding] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);

  const inCart = items.find((i) => i.id === product.id);
  const quantity = inCart?.quantity || 0;

  // 🖼️ Determine main image
  const imageSrc =
    product.images?.[0]?.url ||
    product.image_url ||
    "/placeholder.png";

  // 🧮 Add item handler
  const handleAdd = () => {
    if (adding || (product.stock && product.stock <= 0)) return;
    setAdding(true);
    addItem({
      id: product.id,
      title: product.title,
      price: product.price,
      image_url: imageSrc,
      quantity: 1,
      type: "product",
      category: product.category,
      billing_type: "unit",
    });
    navigator.vibrate?.(25);
    setTimeout(() => setAdding(false), 300);
  };

  // ➖ Remove
  const handleRemove = () => {
    if (quantity <= 0) return;
    removeItem(product.id);
    navigator.vibrate?.(15);
  };

  const isOutOfStock = product.stock !== undefined && product.stock <= 0;

  return (
    <>
      <motion.div
        layout
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex flex-col rounded-2xl border border-gray-200 dark:border-slate-800
                   bg-white/90 dark:bg-slate-900/70 shadow-md hover:shadow-gemini
                   transition-all duration-300 overflow-hidden cursor-pointer"
      >
        {/* 🖼️ Product Image (click for QuickView) */}
        <div
          className="relative w-full h-40 sm:h-48 overflow-hidden bg-gray-50 dark:bg-slate-800"
          onClick={() => setShowQuickView(true)}
          role="button"
          aria-label={`View details for ${product.title}`}
        >
          <Image
            src={imageSrc}
            alt={product.title || "Product"}
            fill
            sizes="(max-width:768px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 hover:scale-105"
          />
          {isOutOfStock && (
            <span className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded-md">
              Out of Stock
            </span>
          )}
        </div>

        {/* 🧾 Product Details */}
        <div className="flex flex-col flex-1 p-3 sm:p-4">
          <h3 className="text-sm sm:text-base font-medium text-gray-800 dark:text-gray-100 line-clamp-2">
            {product.title}
          </h3>
          {product.category && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {product.category}
            </p>
          )}

          <div className="flex justify-between items-center mt-3">
            {/* 💰 Price */}
            <span className="font-semibold text-green-600 dark:text-green-400">
              ₹{Number(product.price || 0).toLocaleString()}
              {product.unit && (
                <span className="text-xs text-gray-500 ml-1">
                  / {product.unit}
                </span>
              )}
            </span>

            {/* 🧮 Cart Controls */}
            {quantity > 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center border border-green-500 rounded-full overflow-hidden"
              >
                <button
                  onClick={handleRemove}
                  aria-label="Decrease quantity"
                  className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 transition"
                >
                  <Minus size={14} />
                </button>
                <span className="px-3 text-sm font-medium text-gray-800 dark:text-gray-100">
                  {quantity}
                </span>
                <button
                  onClick={handleAdd}
                  aria-label="Increase quantity"
                  disabled={isOutOfStock}
                  className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 transition disabled:opacity-50"
                >
                  <Plus size={14} />
                </button>
              </motion.div>
            ) : (
              <motion.button
                disabled={adding || isOutOfStock}
                onClick={handleAdd}
                whileTap={{ scale: 0.95 }}
                className={`px-3 py-1.5 rounded-xl shadow-sm text-sm font-medium transition-colors ${
                  isOutOfStock
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 text-white"
                }`}
              >
                {isOutOfStock ? "Out" : adding ? "Adding..." : "Add"}
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>

      {/* 🔍 Quick View Modal */}
      <ProductQuickView
        product={product}
        isOpen={showQuickView}
        onClose={() => setShowQuickView(false)}
      />
    </>
  );
}
