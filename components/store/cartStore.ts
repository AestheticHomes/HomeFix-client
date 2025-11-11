"use client";
/**
 * ============================================================
 * 🛒 HomeFix Edith Cart Core v7.3 — TypeSafe Persistent Build
 * ------------------------------------------------------------
 * ✅ Zustand + persist (typed storage)
 * ✅ Hydration-safe (Next.js 14)
 * ✅ Cross-tab sync
 * ✅ LocalStorage persistence until checkout success
 * ✅ TypeScript clean — zero errors
 * ============================================================
 */

import { create } from "zustand";
import { createJSONStorage, persist, StateStorage } from "zustand/middleware";

/* ------------------------------------------------------------
   🧱 Types
------------------------------------------------------------ */
export interface CartItem {
  id: number;
  title: string;
  price: number;
  quantity: number;
  unit?: string;
  image_url?: string;
  slug?: string;
  category?: string;
  billing_type?: "sqft" | "job" | "unit";
  type?: "product" | "service";
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  increment: (id: number) => void;
  decrement: (id: number) => void;
  removeItem: (id: number) => void;
  clearCart: () => void;
  reset: () => void;
  totalItems: number;
  totalPrice: number;
  recalcTotals: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

/* ------------------------------------------------------------
   🧩 Browser Storage Adapter (TS Safe)
------------------------------------------------------------ */
const safeStorage: StateStorage = {
  getItem: (name: string): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(name);
  },
  setItem: (name: string, value: string): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem(name, value);
  },
  removeItem: (name: string): void => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(name);
  },
};

/* ------------------------------------------------------------
   ⚙️ Zustand Store Implementation
------------------------------------------------------------ */
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,
      totalPrice: 0,

      /* ➕ Add or merge item */
      addItem: (item) => {
        const id = Number(item.id);
        const existing = get().items.find((i) => i.id === id);
        const quantityToAdd = Math.max(item.quantity ?? 1, 1);

        const updated = existing
          ? get().items.map((i) =>
              i.id === id ? { ...i, quantity: i.quantity + quantityToAdd } : i
            )
          : [
              ...get().items,
              {
                ...item,
                id,
                quantity: quantityToAdd,
                type: item.type || "product",
              },
            ];

        set({ items: updated });
        get().recalcTotals();
        navigator.vibrate?.(20);
      },

      /* 🔼 Increment */
      increment: (id) => {
        const updated = get().items.map((i) =>
          i.id === id ? { ...i, quantity: i.quantity + 1 } : i
        );
        set({ items: updated });
        get().recalcTotals();
      },

      /* 🔽 Decrement */
      decrement: (id) => {
        const current = get().items.find((i) => i.id === id);
        if (!current) return;
        if (current.quantity <= 1) return get().removeItem(id);

        const updated = get().items.map((i) =>
          i.id === id ? { ...i, quantity: i.quantity - 1 } : i
        );
        set({ items: updated });
        get().recalcTotals();
      },

      /* ❌ Remove item */
      removeItem: (id) => {
        const updated = get().items.filter((i) => i.id !== id);
        set({ items: updated });
        get().recalcTotals();
        navigator.vibrate?.(10);
      },

      /* 🧹 Clear cart (after successful checkout) */
      clearCart: () => {
        set({ items: [], totalItems: 0, totalPrice: 0 });
        if (typeof window !== "undefined") {
          localStorage.removeItem("homefix-cart");
        }
      },

      /* 🧼 Reset (on logout or failure) */
      reset: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("homefix-cart");
        }
        set({ items: [], totalItems: 0, totalPrice: 0 });
      },

      /* 💰 Totals */
      recalcTotals: () => {
        const valid = get().items.filter((i) => i.quantity > 0);
        const totalItems = valid.reduce((sum, i) => sum + i.quantity, 0);
        const totalPrice = valid.reduce(
          (sum, i) => sum + i.price * i.quantity,
          0
        );
        set({ items: valid, totalItems, totalPrice });
      },

      getTotalItems: () => get().totalItems,
      getTotalPrice: () => get().totalPrice,
    }),

    /* ------------------------------------------------------------
       💾 Persist Options (Safe)
    ------------------------------------------------------------ */
    {
      name: "homefix-cart",
      version: 7,
      storage: createJSONStorage(() => safeStorage),
      skipHydration: false,
      onRehydrateStorage: () => (state) => {
        if (state) {
          requestAnimationFrame(() => {
            state.recalcTotals?.();
            console.log("🛒 [CartStore] Rehydrated from storage (Edith v7.3)");
          });
        }
      },
    }
  )
);

/* ------------------------------------------------------------
   🔁 Multi-Tab Sync
------------------------------------------------------------ */
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === "homefix-cart" && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        if (parsed?.state) {
          useCartStore.setState(parsed.state);
          console.log("🔄 [CartStore] Synced across tabs");
        }
      } catch (err) {
        console.warn("⚠️ [CartStore] Cross-tab sync failed:", err);
      }
    }
  });
}
