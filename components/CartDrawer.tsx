"use client";
/**
 * CartDrawer v4.0 — Smart Responsive Edition 🌿
 * ------------------------------------------------------------
 * ✅ Uses shadcn/ui Drawer (BaseDrawer fully removed)
 * ✅ Auto-switch: Bottom drawer on mobile, right drawer on desktop
 * ✅ Clean animated FAB
 * ✅ Works with CartContext / Zustand
 * ✅ Dark-mode & accessibility ready
 */

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, X } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/components/CartContext";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";

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

/* --- Hook: Detect mobile layout --- */
function useIsMobile(threshold = 768) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < threshold);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [threshold]);
  return isMobile;
}

export default function CartDrawer() {
  const { cart, removeFromCart, total } = useCart() as {
    cart: CartItem[];
    removeFromCart: (id: string) => void;
    total: number;
  };

  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <>
      {/* 🛒 Floating Cart FAB */}
      <motion.button
        whileHover={{
          scale: 1.1,
          boxShadow: "0 0 20px rgba(91,146,255,0.4)",
        }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(true)}
        className="fixed right-6 bg-emerald-600 text-white p-3 rounded-full shadow-lg z-[60]"
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

      {/* 🧺 Drawer */}
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent
          className={`bg-white dark:bg-slate-900 ${
            isMobile
              ? "rounded-t-3xl h-[85vh]" // bottom drawer for mobile
              : "rounded-l-3xl fixed right-0 top-0 h-full w-[400px]" // side drawer for desktop
          } transition-all`}
        >
          <DrawerHeader className="border-b border-slate-200 dark:border-slate-700 pb-3 px-5 pt-4 flex justify-between items-center">
            <div>
              <DrawerTitle>Your Cart</DrawerTitle>
              <DrawerDescription>Review and checkout</DrawerDescription>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-slate-500 hover:text-slate-900 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </DrawerHeader>

          <div className="p-5 flex flex-col h-full">
            {/* Items */}
            <div className="flex-1 overflow-y-auto scrollbar-thin">
              {cart.length === 0 ? (
                <p className="text-center text-gray-500 mt-6">No items yet.</p>
              ) : (
                cart.map((item: CartItem) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between mb-3 border-b border-gray-200 dark:border-slate-700 pb-3"
                  >
                    {/* Thumbnail */}
                    <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="bg-gray-100 dark:bg-slate-800 w-full h-full flex items-center justify-center text-gray-400 text-xs">
                          No Img
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 px-3 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {item.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {item.type === "product"
                          ? `Qty: ${item.quantity}`
                          : `${item.date || ""} ${item.slot || ""}`}
                      </p>
                    </div>

                    {/* Price + Remove */}
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
            <div className="border-t border-gray-200 dark:border-slate-700 pt-3 mt-2 space-y-2">
              <p className="text-sm font-medium">
                Total: ₹{total.toLocaleString()}
              </p>
              <Link href="/checkout" onClick={() => setOpen(false)}>
                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  disabled={cart.length === 0}
                >
                  Go to Checkout
                </Button>
              </Link>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
