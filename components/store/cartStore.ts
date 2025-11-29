"use client";
/**
 * ============================================================
 * Dual Cart Stores - Store vs Service (Zustand + persist)
 * ------------------------------------------------------------
 * ? useProductCartStore  -> materials / goods checkout
 * ? useServiceCartStore  -> service bookings (visit-fee model)
 * ? Identical APIs: addItem / increment / decrement / totals
 * ? Independent persistence + cross-tab sync
 * ============================================================
 */

import { create } from "zustand";
import { createJSONStorage, persist, StateStorage } from "zustand/middleware";

export type CartItemType = "product" | "service";

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
  type?: CartItemType;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "type" | "quantity"> & {
    quantity?: number;
    type?: CartItemType;
  }) => void;
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

function createCartStore(storageKey: string, defaultType: CartItemType) {
  return create<CartState>()(
    persist(
      (set, get) => ({
        items: [],
        totalItems: 0,
        totalPrice: 0,

        addItem: (item) => {
          const id = Number(item.id);
          const existing = get().items.find((i) => i.id === id);
          const quantityToAdd = Math.max(item.quantity ?? 1, 1);
          const normalizedType = item.type || defaultType;

          const updated = existing
            ? get().items.map((i) =>
                i.id === id
                  ? { ...i, quantity: i.quantity + quantityToAdd }
                  : i
              )
            : [
                ...get().items,
                {
                  ...item,
                  id,
                  quantity: quantityToAdd,
                  type: normalizedType,
                },
              ];

          set({ items: updated });
          get().recalcTotals();
          navigator.vibrate?.(20);
        },

        increment: (id) => {
          const updated = get().items.map((i) =>
            i.id === id ? { ...i, quantity: i.quantity + 1 } : i
          );
          set({ items: updated });
          get().recalcTotals();
        },

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

        removeItem: (id) => {
          const updated = get().items.filter((i) => i.id !== id);
          set({ items: updated });
          get().recalcTotals();
          navigator.vibrate?.(10);
        },

        clearCart: () => {
          set({ items: [], totalItems: 0, totalPrice: 0 });
          if (typeof window !== "undefined") {
            localStorage.removeItem(storageKey);
          }
        },

        reset: () => {
          if (typeof window !== "undefined") {
            localStorage.removeItem(storageKey);
          }
          set({ items: [], totalItems: 0, totalPrice: 0 });
        },

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
      {
        name: storageKey,
        version: 1,
        storage: createJSONStorage(() => safeStorage),
        skipHydration: false,
        partialize: (state) => ({
          items: state.items,
        }),
        onRehydrateStorage: () => (state) => {
          if (state) {
            requestAnimationFrame(() => {
              state.recalcTotals?.();
            });
          }
        },
      }
    )
  );
}

export const useProductCartStore = createCartStore(
  "homefix-store-cart",
  "product"
);
export const useServiceCartStore = createCartStore(
  "homefix-service-cart",
  "service"
);

function syncFromStorage(event: StorageEvent, storeKey: string) {
  if (event.key !== storeKey || !event.newValue) return;
  try {
    const payload = JSON.parse(event.newValue);
    if (!payload?.state) return;
    if (storeKey === "homefix-store-cart") {
      useProductCartStore.setState(payload.state);
    } else if (storeKey === "homefix-service-cart") {
      useServiceCartStore.setState(payload.state);
    }
  } catch (err) {
    console.warn("🛒 [CartStore] Cross-tab sync failed:", err);
  }
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) =>
    ["homefix-store-cart", "homefix-service-cart"].forEach((key) =>
      syncFromStorage(e, key)
    )
  );
}
