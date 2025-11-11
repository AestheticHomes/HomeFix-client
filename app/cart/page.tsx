"use client";
/**
 * ============================================================
 * File: /app/cart/page.tsx
 * Version: v2.1 — HomeFix Cart Page “Gemini SafeViewport Build” 🌗
 * ------------------------------------------------------------
 * ✅ Fully compliant with LayoutContent v10.9 SafeViewport
 * ✅ Auto respects header/footer height tokens
 * ✅ No hardcoded paddings or min-h-screen
 * ✅ Still identical visually and responsive
 * ============================================================
 */

import { useCartStore } from "@/components/store/cartStore";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, totalItems, totalPrice, addItem } = useCartStore();

  const isEmpty = items.length === 0;

  useEffect(() => {
    if (typeof window !== "undefined") {
      document.title = `Cart (${totalItems}) • HomeFix`;
    }
  }, [totalItems]);

  return (
    <section
      id="cart-safe-section"
      className="flex flex-col w-full max-w-3xl mx-auto px-4 sm:px-6 md:px-8
                 pt-safe-top pb-safe-bottom
                 text-[var(--text-primary-light)] dark:text-[var(--text-primary-dark)]
                 bg-[var(--surface-light)] dark:bg-[var(--surface-dark)]
                 transition-colors duration-500"
      style={{
        paddingTop: "var(--header-h,72px)",
        paddingBottom:
          "calc(var(--mbnav-h,72px) + env(safe-area-inset-bottom))",
      }}
    >
      <h1 className="text-2xl font-bold mb-6 mt-2">Your Cart</h1>

      {/* 🪣 Empty State */}
      <AnimatePresence>
        {isEmpty ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center flex-1 text-gray-500 dark:text-gray-400 py-24"
          >
            <ShoppingBag className="w-12 h-12 mb-3 opacity-70" />
            <p className="text-lg font-medium mb-1">Your cart is empty</p>
            <button
              onClick={() => router.push("/store")}
              className="mt-4 px-5 py-2 bg-gradient-to-r from-[#5A5DF0] to-[#EC6ECF]
                         hover:opacity-90 text-white font-semibold rounded-xl shadow-md transition active:scale-95"
            >
              Shop Now
            </button>
          </motion.div>
        ) : (
          <div className="flex flex-col space-y-4 pb-32">
            {items.map((item) => (
              <motion.div
                key={item.id}
                layout
                className="flex items-center justify-between p-4 rounded-2xl border
                           bg-[var(--surface-light)] dark:bg-[var(--surface-dark)]
                           border-gray-200/50 dark:border-white/10
                           shadow-[0_4px_12px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.25)]
                           hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_8px_20px_rgba(0,0,0,0.35)]
                           transition-all duration-300"
              >
                {/* Left Side */}
                <div className="flex items-center gap-3">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-16 h-16 rounded-xl object-cover border border-gray-200 dark:border-slate-700"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-gray-400">
                      🧱
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="font-medium">{item.title}</span>
                    {item.category && (
                      <span className="text-xs opacity-70">
                        {item.category}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right Side */}
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center border border-gray-200 dark:border-slate-700 rounded-full overflow-hidden bg-white/60 dark:bg-slate-900/40 backdrop-blur">
                    <button
                      onClick={() =>
                        item.quantity > 1
                          ? addItem({ ...item, quantity: -1 })
                          : removeItem(item.id)
                      }
                      className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="px-3 text-sm font-medium">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => addItem({ ...item, quantity: 1 })}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition"
                      aria-label="Increase quantity"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1 transition"
                  >
                    <Trash2 size={12} /> Remove
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* 🧾 Bottom Summary Bar */}
      {!isEmpty && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="sticky bottom-[calc(var(--mbnav-h,72px)+env(safe-area-inset-bottom))] 
                     z-50 max-w-3xl mx-auto
                     rounded-t-3xl border-t
                     bg-[var(--surface-light)] dark:bg-[var(--surface-dark)]
                     border-gray-200/50 dark:border-slate-800
                     backdrop-blur-xl shadow-[0_-6px_20px_rgba(0,0,0,0.08)]
                     flex justify-between items-center gap-4 px-5 py-4
                     transition-all duration-500"
        >
          <div>
            <p className="text-sm opacity-70">
              {totalItems} item{totalItems > 1 ? "s" : ""}
            </p>
            <p className="text-lg font-semibold text-green-600 dark:text-green-400">
              ₹{totalPrice.toLocaleString()}
            </p>
          </div>

          <button
            onClick={() => router.push("/checkout")}
            className="flex items-center gap-2 bg-gradient-to-r from-[#5A5DF0] to-[#EC6ECF]
                       hover:opacity-90 text-white font-semibold px-6 py-2 rounded-xl shadow-md
                       active:scale-95 transition"
          >
            Proceed to Checkout <ArrowRight size={18} />
          </button>
        </motion.div>
      )}
    </section>
  );
}
