"use client";
/**
 * ============================================================
 * File: /components/store/ProductQuickView.tsx
 * Version: v1.0 — Blinkit-style Quick View Modal 🍃
 * ------------------------------------------------------------
 * ✅ Reusable for product preview & add-to-cart
 * ✅ Uses framer-motion + Zustand store
 * ✅ Fully theme adaptive (dark/light)
 * ✅ Works with ProductCard + goods Supabase data
 * ============================================================
 */

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { X, Plus, Minus, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/components/store/cartStore";
import { useState, useEffect } from "react";

interface ProductQuickViewProps {
  product: {
    id: number;
    title: string;
    price: number;
    description?: string;
    category?: string;
    stock?: number;
    image_url?: string;
    unit?: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductQuickView({
  product,
  isOpen,
  onClose,
}: ProductQuickViewProps) {
  const { items, addItem, removeItem } = useCartStore();
  const [localQty, setLocalQty] = useState(1);
  const inCart = product ? items.find((i) => i.id === product.id) : null;

  useEffect(() => {
    if (product) setLocalQty(1);
  }, [product]);

  if (!product) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            layout
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 180, damping: 20 }}
            className="relative w-[90%] max-w-md rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-gray-200 dark:border-slate-700 overflow-hidden"
          >
            {/* ✖️ Close button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              aria-label="Close"
            >
              <X size={20} />
            </button>

            {/* 🖼️ Image */}
            <div className="relative w-full h-56 bg-gray-50 dark:bg-slate-800">
              {product.image_url ? (
                <Image
                  src={product.image_url}
                  alt={product.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <ShoppingBag size={32} />
                </div>
              )}
            </div>

            {/* 🧾 Content */}
            <div className="p-5 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                    {product.title}
                  </h3>
                  {product.category && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                      {product.category}
                    </p>
                  )}
                </div>
                <p className="text-green-600 dark:text-green-400 font-semibold text-lg">
                  ₹{product.price.toLocaleString()}
                  {product.unit && (
                    <span className="text-xs text-gray-500 ml-1">
                      / {product.unit}
                    </span>
                  )}
                </p>
              </div>

              {product.description && (
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  {product.description}
                </p>
              )}

              <div className="flex items-center justify-between mt-4">
                {/* Quantity Control */}
                <div className="flex items-center border border-green-500 rounded-full overflow-hidden">
                  <button
                    onClick={() => setLocalQty((q) => Math.max(1, q - 1))}
                    className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 transition"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="px-3 text-sm font-medium text-gray-800 dark:text-gray-100">
                    {localQty}
                  </span>
                  <button
                    onClick={() => setLocalQty((q) => q + 1)}
                    className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 transition"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {/* Add to Cart Button */}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    addItem({
                      id: product.id,
                      title: product.title,
                      price: product.price,
                      image_url: product.image_url,
                      quantity: localQty,
                      type: "product",
                      category: product.category,
                    });
                    onClose();
                  }}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-xl shadow transition"
                >
                  <ShoppingBag size={16} />
                  {inCart ? "Update Cart" : "Add to Cart"}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
