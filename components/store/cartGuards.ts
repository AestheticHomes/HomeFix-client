"use client";

import {
  useProductCartStore,
  useServiceCartStore,
} from "@/components/store/cartStore";

type CartRealm = "product" | "service";

export function checkCartConflict(target: CartRealm): string | null {
  const otherItems =
    target === "product"
      ? useServiceCartStore.getState().items.length
      : useProductCartStore.getState().items.length;

  if (otherItems === 0) return null;

  return target === "product"
    ? "You have service bookings pending checkout. Please finish or clear them before adding store items."
    : "You have products pending checkout. Please finish or clear them before booking a service.";
}

export function resolveCartConflict(target: CartRealm) {
  const conflict = checkCartConflict(target);
  if (conflict) {
    alert(conflict);
  }
  return !conflict;
}
