"use client";
/**
 * ============================================================
 * Dual Cart View (Store + Services)
 * ------------------------------------------------------------
 * ? Toggle between product cart and service cart
 * ? Enforces separate checkout flows
 * ? Shares SafeViewport-aware layout
 * ============================================================
 */

import {
  useProductCartStore,
  useServiceCartStore,
} from "../../components/store/cartStore";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type CartView = "product" | "service";

const formatInr = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(value);

export default function CartPage() {
  const router = useRouter();
  const params = useSearchParams();

  const storeItems = useProductCartStore((s) => s.items);
  const storeRemove = useProductCartStore((s) => s.removeItem);
  const storeIncrement = useProductCartStore((s) => s.increment);
  const storeDecrement = useProductCartStore((s) => s.decrement);
  const storeTotalItems = useProductCartStore((s) => s.totalItems);
  const storeTotalPrice = useProductCartStore((s) => s.totalPrice);

  const serviceItems = useServiceCartStore((s) => s.items);
  const serviceRemove = useServiceCartStore((s) => s.removeItem);
  const serviceIncrement = useServiceCartStore((s) => s.increment);
  const serviceDecrement = useServiceCartStore((s) => s.decrement);
  const serviceTotalItems = useServiceCartStore((s) => s.totalItems);
  const serviceTotalPrice = useServiceCartStore((s) => s.totalPrice);

  const typeParam = params?.get("type");
  const initialTab =
    (typeParam as CartView | null) ??
    (storeItems.length ? "product" : "service");
  const [view, setView] = useState<CartView>(initialTab);

  useEffect(() => {
    if (storeItems.length && view !== "product") setView("product");
    if (!storeItems.length && serviceItems.length && view !== "service")
      setView("service");
  }, [storeItems.length, serviceItems.length, view]);

  const { items, removeItem, increment, decrement, totalItems, totalPrice } =
    useMemo(() => {
      if (view === "service") {
        return {
          items: serviceItems,
          removeItem: serviceRemove,
          increment: serviceIncrement,
          decrement: serviceDecrement,
          totalItems: serviceTotalItems,
          totalPrice: serviceTotalPrice,
        };
      }
      return {
        items: storeItems,
        removeItem: storeRemove,
        increment: storeIncrement,
        decrement: storeDecrement,
        totalItems: storeTotalItems,
        totalPrice: storeTotalPrice,
      };
    }, [
      view,
      serviceItems,
      serviceRemove,
      serviceIncrement,
      serviceDecrement,
      serviceTotalItems,
      serviceTotalPrice,
      storeItems,
      storeRemove,
      storeIncrement,
      storeDecrement,
      storeTotalItems,
      storeTotalPrice,
    ]);

  const isEmpty = items.length === 0;

  useEffect(() => {
    if (typeof window !== "undefined") {
      document.title = `Cart (${totalItems}) · HomeFix`;
    }
  }, [totalItems]);

  return (
    <section
      id="cart-safe-section"
      className="flex flex-col w-full max-w-3xl mx-auto px-4 sm:px-6 md:px-8
                 pt-safe-top pb-safe-bottom
                 text-[var(--text-primary)]
                 bg-[var(--surface-base)]
                 transition-colors duration-500"
      style={{
        paddingTop: "var(--header-h,72px)",
        paddingBottom:
          "calc(var(--mbnav-h,72px) + env(safe-area-inset-bottom))",
      }}
    >
      <div className="flex items-center justify-between gap-4 mb-6 mt-2">
        <h1 className="text-2xl font-bold">Your Cart</h1>

        <div className="flex rounded-full bg-[var(--surface-card)] dark:bg-[var(--surface-card-dark)] border border-[var(--edith-border)] text-sm">
          <button
            className={`px-4 py-1.5 rounded-full ${
              view === "product"
                ? "bg-[var(--accent-primary)] text-white"
                : "text-[var(--text-secondary)]"
            }`}
            onClick={() => setView("product")}
          >
            Store ({storeTotalItems})
          </button>
          <button
            className={`px-4 py-1.5 rounded-full ${
              view === "service"
                ? "bg-[var(--accent-primary)] text-white"
                : "text-[var(--text-secondary)]"
            }`}
            onClick={() => setView("service")}
          >
            Services ({serviceTotalItems})
          </button>
        </div>
      </div>

      {/* Empty State */}
      <AnimatePresence>
        {isEmpty ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center flex-1 text-[var(--text-secondary)] py-24"
          >
            <ShoppingBag className="w-12 h-12 mb-3 opacity-70" />
            <p className="text-lg font-medium mb-1">
              {view === "product"
                ? "Your store cart is empty"
                : "No service bookings yet"}
            </p>
            <button
              onClick={() =>
                router.push(view === "product" ? "/store" : "/services")
              }
              className="mt-4 px-5 py-2 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)]
                         hover:opacity-95 text-white font-semibold rounded-xl shadow-md transition active:scale-95"
            >
              {view === "product" ? "Shop Now" : "Browse Services"}
            </button>
          </motion.div>
        ) : (
          <div className="flex flex-col space-y-4 pb-32">
            {items.map((item) => (
              <motion.div
                key={`${view}-${item.id}`}
                layout
                className="flex items-center justify-between p-4 rounded-2xl border
                           bg-[var(--surface-card)] dark:bg-[var(--surface-card-dark)]
                           border-[var(--border-soft)]
                           shadow-[0_4px_12px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.25)]
                           hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_8px_20px_rgba(0,0,0,0.35)]
                           transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  {item.image_url ? (
                    <Image
                      src={item.image_url}
                      alt={item.title}
                      width={64}
                      height={64}
                      className="w-16 h-16 rounded-xl object-cover border border-[var(--border-soft)]"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl flex items-center justify-center text-[var(--text-muted)]"
                      style={{ background: "var(--surface-overlay)" }}>
                      🧰
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

                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center border border-[var(--border-soft)] rounded-full overflow-hidden bg-[var(--surface-input)] dark:bg-[var(--surface-input-dark)] backdrop-blur">
                    <button
                      onClick={() => decrement(item.id)}
                      className="p-1.5 text-[var(--accent-primary)] hover:bg-[var(--surface-hover)] transition"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="px-3 text-sm font-medium">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => increment(item.id)}
                      className="p-1.5 text-[var(--accent-primary)] hover:bg-[var(--surface-hover)] transition"
                      aria-label="Increase quantity"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-xs text-[var(--accent-danger)] hover:opacity-80 flex items-center gap-1 transition"
                  >
                    <Trash2 size={12} /> Remove
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Bottom Summary Bar */}
      {!isEmpty && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="sticky bottom-[calc(var(--mbnav-h,72px)+env(safe-area-inset-bottom))]
                     z-50 max-w-3xl mx-auto
                     rounded-t-3xl border-t
                     bg-[var(--surface-elevated)] dark:bg-[var(--surface-elevated-dark)]
                     border-[var(--border-muted)]
                     backdrop-blur-xl shadow-[0_-6px_20px_rgba(0,0,0,0.08)]
                     flex justify-between items-center gap-4 px-5 py-4
                     transition-all duration-500"
        >
          <div>
            <p className="text-sm opacity-70">
              {totalItems} item{totalItems !== 1 ? "s" : ""}
            </p>
            <p className="text-lg font-semibold text-[var(--accent-success)]">
              {formatInr(totalPrice)}
            </p>
          </div>

          <button
            onClick={() =>
              router.push(
                view === "product" ? "/checkout" : "/checkout?type=service"
              )
            }
            className="flex items-center gap-2 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)]
                       hover:opacity-90 text-white font-semibold px-6 py-2 rounded-xl shadow-md
                       active:scale-95 transition"
          >
            {view === "product"
              ? "Proceed to Checkout"
              : "Book Service Visit"}{" "}
            <ArrowRight size={18} />
          </button>
        </motion.div>
      )}
    </section>
  );
}

