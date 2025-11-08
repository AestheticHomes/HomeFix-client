"use client";
/**
 * ============================================================
 * File: /components/store/cartStore.ts
 * Version: v6.0 — HomeFix Blinkit Cart Core 🌿
 * ------------------------------------------------------------
 * ✅ addItem / removeItem / clearCart / reset
 * ✅ auto-persist via localStorage (Zustand + middleware)
 * ✅ unified support for service + product checkout
 * ✅ totalItems + totalPrice live selectors
 * ✅ race-safe hydration with auto total recalculation
 * ============================================================
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

/* ------------------------------------------------------------
   🧱 Types
------------------------------------------------------------ */
export interface CartItem {
  id: number;
  title: string;
  price: number;
  quantity: number;

  // optional metadata
  unit?: string;
  image_url?: string;
  slug?: string;
  category?: string;
  billing_type?: "sqft" | "job" | "unit";

  // helps checkout detect type
  type?: "product" | "service";
}

/* ------------------------------------------------------------
   🧩 Store Shape
------------------------------------------------------------ */
interface CartState {
  items: CartItem[];

  // actions
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  increment: (id: number) => void;
  decrement: (id: number) => void;
  removeItem: (id: number) => void;
  clearCart: () => void;
  reset: () => void;

  // derived
  totalItems: number;
  totalPrice: number;
  recalcTotals: () => void;
}

/* ------------------------------------------------------------
   ⚙️ Store Implementation
------------------------------------------------------------ */
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      /* --------------------------------------------------------
         ➕ Add or merge item
      -------------------------------------------------------- */
      addItem: (item) => {
        const { items } = get();
        const existing = items.find((i) => i.id === item.id);

        const quantityToAdd = item.quantity && item.quantity > 0 ? item.quantity : 1;
        let updated: CartItem[];

        if (existing) {
          updated = items.map((i) =>
            i.id === item.id
              ? { ...i, quantity: i.quantity + quantityToAdd }
              : i
          );
        } else {
          updated = [
            ...items,
            {
              ...item,
              quantity: quantityToAdd,
              type: item.type || "product",
            },
          ];
        }

        set({ items: updated });
        get().recalcTotals();
      },

      /* --------------------------------------------------------
         🔼 Increment item
      -------------------------------------------------------- */
      increment: (id) => {
        const updated = get().items.map((i) =>
          i.id === id ? { ...i, quantity: i.quantity + 1 } : i
        );
        set({ items: updated });
        get().recalcTotals();
      },

      /* --------------------------------------------------------
         🔽 Decrement item
      -------------------------------------------------------- */
      decrement: (id) => {
        const current = get().items.find((i) => i.id === id);
        if (!current) return;
        if (current.quantity <= 1) {
          get().removeItem(id);
          return;
        }
        const updated = get().items.map((i) =>
          i.id === id ? { ...i, quantity: i.quantity - 1 } : i
        );
        set({ items: updated });
        get().recalcTotals();
      },

      /* --------------------------------------------------------
         ❌ Remove item completely
      -------------------------------------------------------- */
      removeItem: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) });
        get().recalcTotals();
      },

      /* --------------------------------------------------------
         🧹 Clear / Reset
      -------------------------------------------------------- */
      clearCart: () => set({ items: [] }),
      reset: () => {
        localStorage.removeItem("homefix-cart");
        set({ items: [], totalItems: 0, totalPrice: 0 });
      },

      /* --------------------------------------------------------
         💰 Derived totals
      -------------------------------------------------------- */
      totalItems: 0,
      totalPrice: 0,

      recalcTotals: () => {
        const items = get().items;
        const totalItems = items.reduce((sum, i) => sum + (i.quantity || 0), 0);
        const totalPrice = items.reduce(
          (sum, i) => sum + (i.price * (i.quantity || 0)),
          0
        );
        set({ totalItems, totalPrice });
      },
    }),
    {
      name: "homefix-cart",
      version: 3,
      onRehydrateStorage: () => (state) => {
        if (state) {
          // ensure totals always correct after hydration
          setTimeout(() => {
            state.recalcTotals?.();
          }, 50);
        }
      },
    }
  )
);
