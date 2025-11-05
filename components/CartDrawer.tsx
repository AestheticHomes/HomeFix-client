"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, X } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/components/CartContext";
import { Button } from "@/components/ui/button";
import BaseDrawer from "@/components/BaseDrawer";

/* --- Shared cart item type --- */
interface CartItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  type: "product" | "service";
  image_url?: string | null;
  date?: string | null;
  slot?: string | null;
}

export default function CartDrawer() {
  const { cart, removeFromCart, total } = useCart() as {
    cart: CartItem[];
    removeFromCart: (id: string) => void;
    total: number;
  };

  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating FAB */}
      <motion.button
whileHover={{ scale: 1.1, boxShadow: "0 0 20px rgba(155,92,248,0.6)" }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(true)}
        className="fixed right-6 bg-primary text-white p-3 rounded-full shadow-lg z-fab"
        style={{
          bottom: "calc(var(--mbnav-h-safe) + 1rem)",
        }}
        aria-label="Open cart"
      >
        <ShoppingCart className="w-6 h-6" />
        {cart.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-xs text-white px-1 rounded-full">
            {cart.length}
          </span>
        )}
      </motion.button>

      {/* Drawer */}
      <BaseDrawer
        open={open}
        onClose={() => setOpen(false)}
        side="right"
        width="22rem"
      >
        <div className="p-4 flex flex-col h-full">
          {/* Header */}
          <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-200 dark:border-slate-700">
            <h2 className="font-semibold text-lg">Your Cart</h2>
            <button
              onClick={() => setOpen(false)}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {cart.length === 0
              ? <p className="text-center text-gray-500 mt-6">No items yet.</p>
              : (
                cart.map((item: CartItem) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between mb-2 border-b border-gray-200 dark:border-slate-700 pb-2"
                  >
                    <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0">
                      {item.image_url
                        ? (
                          <img
                            src={item.image_url}
                            alt={item.title}
                            className="object-cover w-full h-full"
                          />
                        )
                        : (
                          <div className="bg-gray-100 dark:bg-slate-800 w-full h-full flex items-center justify-center text-gray-400 text-xs">
                            No Img
                          </div>
                        )}
                    </div>

                    <div className="flex-1 px-2 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {item.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {item.type === "product"
                          ? `Qty: ${item.quantity}`
                          : `${item.date || ""} ${item.slot || ""}`}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-semibold text-sm">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </p>
                      <button
                        className="text-xs text-red-500 mt-1 hover:text-red-700 dark:hover:text-red-400"
                        onClick={() => removeFromCart(item.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 dark:border-slate-700 pt-3 mt-4 space-y-2">
            <p className="text-sm font-medium">
              Total: ₹{total.toLocaleString()}
            </p>
            <Link href="/checkout" onClick={() => setOpen(false)}>
              <Button
                className="w-full"
                disabled={cart.length === 0}
                aria-disabled={cart.length === 0}
              >
                Go to Checkout
              </Button>
            </Link>
          </div>
        </div>
      </BaseDrawer>
    </>
  );
}
