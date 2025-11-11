"use client";
/**
 * ============================================================
 * File: /components/store/ProductCard.tsx
 * Version: v6.2 — Blinkit Micro Compact 🌿
 * ------------------------------------------------------------
 * ✅ Compact 1.2-inch cards (~85px)
 * ✅ Smooth hover scale + green aura
 * ✅ Edith theme surface variables
 * ✅ Touch-friendly buttons
 * ============================================================
 */

import { useCartStore } from "@/components/store/cartStore";
import { motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export interface Product {
  id: number | string;
  title: string;
  price: number;
  description?: string;
  category?: string | null;
  stock?: number;
  unit?: string;
  type?: "product" | "service";
  image_url?: string;
  images?: { url: string }[];
}

export default function ProductCard({ product }: { product: Product }) {
  const { items, addItem, removeItem } = useCartStore();
  const [adding, setAdding] = useState(false);

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
      title: product.title,
      price: product.price,
      image_url: imageSrc,
      quantity: 1,
      type: "product",
    });
    navigator.vibrate?.(25);
    setTimeout(() => setAdding(false), 200);
  };

  const handleRemove = () => {
    if (quantity > 0) removeItem(productId);
    navigator.vibrate?.(15);
  };

  return (
    <motion.div
      layout
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.96 }}
      className="relative flex flex-col rounded-xl overflow-hidden
                 bg-[var(--surface-card)] dark:bg-[var(--surface-card-dark)]
                 border border-[var(--edith-border)]
                 shadow-sm hover:shadow-[0_0_10px_rgba(0,255,150,0.25)]
                 transition-all duration-300 cursor-pointer select-none"
      style={{
        width: "90px",
        height: "125px", // ✅ slightly taller – vertical photo-frame feel
      }}
    >
      {/* 🖼️ Image */}
      <div
        className="relative w-full aspect-square overflow-hidden
                   bg-gray-100 dark:bg-slate-800"
        onClick={handleAdd}
        role="button"
        aria-label={`Add ${product.title}`}
      >
        <Image
          src={imageSrc}
          alt={product.title || "Product"}
          fill
          sizes="(max-width:768px) 33vw, 15vw"
          className="object-cover transition-transform duration-400 hover:scale-110"
        />
        {isOutOfStock && (
          <span className="absolute top-1 left-1 bg-red-600 text-white text-[10px] px-1 py-[1px] rounded">
            Out
          </span>
        )}
      </div>

      {/* 🧾 Info */}
      <div className="flex flex-col justify-between flex-1 p-1.5 leading-tight">
        <p
          className="font-medium text-[11px] text-[var(--text-primary)]
                     line-clamp-2 h-[28px]"
        >
          {product.title}
        </p>

        <div className="flex items-center justify-between mt-1">
          <span className="font-semibold text-emerald-500 text-[11px]">
            ₹{Number(product.price).toLocaleString()}
          </span>

          {quantity > 0 ? (
            <div className="flex items-center rounded-full border border-emerald-500 overflow-hidden">
              <button
                onClick={handleRemove}
                className="px-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
              >
                <Minus size={12} />
              </button>
              <span className="px-1 text-[10px] font-medium">{quantity}</span>
              <button
                onClick={handleAdd}
                disabled={isOutOfStock}
                className="px-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 disabled:opacity-50"
              >
                <Plus size={12} />
              </button>
            </div>
          ) : (
            <motion.button
              disabled={isOutOfStock}
              onClick={handleAdd}
              whileTap={{ scale: 0.93 }}
              className="px-2 py-[2px] rounded-full text-[10px] font-semibold
                         bg-gradient-to-r from-emerald-600 to-lime-500 text-white
                         hover:from-emerald-700 hover:to-lime-600 shadow-sm"
            >
              Add
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
