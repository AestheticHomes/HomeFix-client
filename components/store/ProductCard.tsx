"use client";
/**
 * ============================================================
 * File: /components/store/ProductCard.tsx
 * Version: v4.5 — HomeFix Store Card (Safe Types + Bright Mode)
 * ------------------------------------------------------------
 * ✅ Fixes TypeScript errors for `id` and ProductQuickView
 * ✅ Locks ID type to number with safe conversion
 * ✅ Maintains perfect visibility under all themes
 * ✅ Edith-Polished gradients + font hierarchy
 * ============================================================
 */

import { useCartStore } from "@/components/store/cartStore";
import ProductQuickView from "@/components/store/ProductQuickView";
import { motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export interface Product {
  id: number | string;
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

export default function ProductCard({ product }: { product: Product }) {
  const { items, addItem, removeItem } = useCartStore();
  const [adding, setAdding] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);

  // 🧩 Ensure numeric ID for cart consistency
  const productId = Number(product.id);
  const inCart = items.find((i) => Number(i.id) === productId);
  const quantity = inCart?.quantity || 0;

  const isOutOfStock = product.stock !== undefined && product.stock <= 0;

  const imageSrc =
    product.images?.[0]?.url || product.image_url || "/placeholder.png";

  const handleAdd = () => {
    if (adding || isOutOfStock) return;
    setAdding(true);
    addItem({
      id: productId,
      title: product.title || "Untitled Product",
      price: product.price || 0,
      image_url: imageSrc,
      quantity: 1,
      type: "product",
      category: product.category || "General",
      billing_type: "unit",
    });
    navigator.vibrate?.(25);
    setTimeout(() => setAdding(false), 300);
  };

  const handleRemove = () => {
    if (quantity <= 0) return;
    removeItem(productId);
    navigator.vibrate?.(15);
  };

  return (
    <>
      <motion.div
        layout
        style={{ isolation: "isolate" }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="product-card relative flex flex-col rounded-2xl overflow-hidden border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md hover:shadow-[0_0_25px_rgba(155,92,248,0.15)] transition-all duration-300 cursor-pointer"
      >
        {/* ✅ Fixed local background isolation */}
        <div className="absolute inset-0 bg-white dark:bg-slate-900 z-0" />

        <div className="relative z-[1] flex flex-col h-full">
          {/* 🖼️ Product Image */}
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
              priority
              className="object-cover brightness-[1.15] contrast-[1.1] transition-transform duration-500 hover:scale-105"
            />
            {isOutOfStock && (
              <span className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded-md">
                Out of Stock
              </span>
            )}
          </div>

          {/* 🧾 Info */}
          <div className="flex flex-col flex-1 p-3 sm:p-4">
            <h3 className="text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-100 line-clamp-2">
              {product.title}
            </h3>
            {product.category && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {product.category}
              </p>
            )}

            <div className="flex justify-between items-center mt-3">
              <span className="font-semibold text-green-600 dark:text-green-400">
                ₹{Number(product.price || 0).toLocaleString()}
                {product.unit && (
                  <span className="text-xs text-gray-500 ml-1">
                    / {product.unit}
                  </span>
                )}
              </span>

              {/* 🧮 Add / Remove Controls */}
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
                  className={`add-btn px-3 py-1.5 rounded-xl shadow-sm text-sm font-medium transition-colors ${
                    isOutOfStock
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-emerald-600 to-lime-500 hover:from-emerald-700 hover:to-lime-600 text-white"
                  }`}
                >
                  {isOutOfStock ? "Out" : adding ? "Adding..." : "Add"}
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* 🔍 Quick View Modal */}
      <ProductQuickView
        product={{
          ...product,
          id: productId,
        }}
        isOpen={showQuickView}
        onClose={() => setShowQuickView(false)}
      />
    </>
  );
}
