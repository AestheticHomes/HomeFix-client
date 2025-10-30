"use client";
/**
 * File: /components/RateCard.js
 * Purpose: (auto-added during Portable Cleanup) — add a concise, human-readable purpose for this file.
 * Process: Part of HomeFix portable refactor; no functional changes made by header.
 * Dependencies: Review local imports; ensure single supabase client in /lib when applicable.
 * Note: This header is documentation-only and safe to remove or edit.
 */
import { motion } from "framer-motion";
import { useCart } from "@/components/CartContext";

export default function RateCard({ service }) {
  const { addToCart } = useCart();

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="border rounded-xl p-4 shadow-sm bg-white dark:bg-slate-800 dark:border-slate-700 transition-all"
    >
      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
        {service.name}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
        {service.description || "Reliable home service at your doorstep."}
      </p>

      <p className="text-lg font-semibold text-green-700 dark:text-green-400">
        ₹{service.price}
      </p>

      <motion.button
        onClick={(e) => {
          e.stopPropagation(); // prevent event from bubbling
          addToCart(service);
        }}
        whileTap={{ scale: 0.95 }}
        className="w-full bg-green-600 hover:bg-green-700 text-white rounded-lg py-2 mt-3 text-sm font-semibold active:scale-95 relative z-30"
      >
        Add to Cart
      </motion.button>
    </motion.div>
  );
}