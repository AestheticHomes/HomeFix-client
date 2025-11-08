"use client";
/**
 * File: /app/cart/page.tsx
 * Version: v1.0 — HomeFix Cart Page 🚚
 * ------------------------------------------------------------
 * ✅ Displays cart items (from useCartStore or react-use-cart)
 * ✅ Allows quantity adjustments and removal
 * ✅ Shows summary and “Proceed to Checkout” bridge
 * ✅ Mobile-first, responsive, dark/light mode
 */

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";

// import your store
import { useCartStore } from "@/components/store/cartStore"; 
// If you instead choose react-use-cart:
// import { useCart } from "react-use-cart";

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, clearCart, totalItems, totalPrice } = useCartStore();
  // If using react-use-cart:
  // const { items, updateItemQuantity, removeItem, cartTotal, totalItems } = useCart();

  const isEmpty = items.length === 0;

  useEffect(() => {
    if (typeof window !== "undefined") {
      document.title = `Cart (${totalItems}) • HomeFix`;
    }
  }, [totalItems]);

  return (
    <main className="relative flex flex-col min-h-screen max-w-3xl mx-auto px-4 pt-20 pb-32 bg-gradient-to-b from-gray-50 via-gray-100 to-gray-200 dark:from-[#0f0c29] dark:via-[#302b63] dark:to-[#24243e] transition-colors duration-500">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">
        Your Cart
      </h1>

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
              className="mt-4 px-5 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl shadow-md transition active:scale-95"
            >
              Shop Now
            </button>
          </motion.div>
        ) : (
          <div className="flex flex-col space-y-4">
            {items.map((item) => (
              <motion.div
                key={item.id}
                layout
                className="flex items-center justify-between rounded-2xl bg-white/90 dark:bg-slate-900/70 border border-gray-200 dark:border-slate-700 shadow-sm p-4 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-gray-400">
                      🧱
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-800 dark:text-gray-100">
                      {item.title}
                    </span>
                    {item.category && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {item.category}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center border border-gray-200 dark:border-slate-700 rounded-full overflow-hidden">
                    <button
                      onClick={() => {
                        if (item.quantity > 1) {
                          // update quantity logic
                          useCartStore.getState().addItem({ ...item, quantity: -1 });
                        }
                        else {
                          removeItem(item.id);
                        }
                      }}
                      className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 transition"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="px-3 text-sm font-medium text-gray-800 dark:text-gray-100">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => {
                        useCartStore.getState().addItem({ ...item, quantity: 1 });
                      }}
                      className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 transition"
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

      {!isEmpty && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-950/90 backdrop-blur-md border-t border-gray-200 dark:border-slate-800 shadow-lg px-5 py-3 flex justify-between items-center z-50 max-w-3xl mx-auto rounded-t-3xl"
        >
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {totalItems} item{totalItems > 1 ? "s" : ""}
            </p>
            <p className="text-lg font-semibold text-green-600 dark:text-green-400">
              ₹{totalPrice.toLocaleString()}
            </p>
          </div>
          <button
            onClick={() => router.push("/checkout")}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-xl shadow transition active:scale-95"
          >
            Proceed to Checkout <ArrowRight size={18} />
          </button>
        </motion.div>
      )}
    </main>
  );
}
