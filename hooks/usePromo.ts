"use client";
/**
 * ============================================================
 * 📦 FILE: hooks/usePromo.ts
 * 🔎 MODULE: Route-aware promo resolver (hook-safe) v2.0
 * ------------------------------------------------------------
 * WHY
 *   Fixes "react-hooks/rules-of-hooks" by calling usePathname()
 *   unconditionally, and moving mapping into a pure function.
 *
 * API
 *   - getPromoForPath(pathname): Promo
 *   - usePromo(explicitPath?): Promo
 *
 * NOTES
 *   - Return an empty title to indicate "no promo" for a route.
 *   - Keep all copy centralized here (no header-local strings).
 * ============================================================
 */

import { usePathname } from "next/navigation";

export type Promo = {
  title: string;
  ctaLabel?: string;
  ctaHref?: string;
};

const EMPTY_PROMO: Promo = { title: "" };

/** Pure resolver — safe to unit-test, no React hooks here. */
export function getPromoForPath(rawPathname: string | null | undefined): Promo {
  const pathname = (rawPathname || "/").split("?")[0];

  // Homepage → handled by ClimateBar, so no promo here
  if (pathname === "/") return EMPTY_PROMO;

  // Store
  if (pathname.startsWith("/store")) {
    return {
      title: "Browse 3D-previewed catalog — book installation in one tap.",
      ctaLabel: "Explore catalog →",
      ctaHref: "/store",
    };
  }

  // Offers
  if (pathname.startsWith("/offers")) {
    return {
      title: "Seasonal offers on modular kitchens & wardrobes.",
      ctaLabel: "View offers →",
      ctaHref: "/offers",
    };
  }

  // Estimator
  if (pathname.startsWith("/estimator")) {
    return {
      title:
        "Price your kitchen in minutes — accurate estimates, instant variants.",
      ctaLabel: "Open estimator →",
      ctaHref: "/estimator",
    };
  }

  // My Space (orders/bookings)
  if (pathname.startsWith("/my-space")) {
    return {
      title: "Track orders and bookings in real time.",
      ctaLabel: "Go to My Space →",
      ctaHref: "/my-space",
    };
  }

  // Profile
  if (pathname.startsWith("/profile")) {
    return {
      title: "Keep your contact details verified for faster scheduling.",
      ctaLabel: "Edit profile →",
      ctaHref: "/profile",
    };
  }

  // Default: no promo
  return EMPTY_PROMO;
}

/** Hook wrapper — always calls usePathname() at top level. */
export function usePromo(explicitPath?: string): Promo {
  const pathname = usePathname(); // ✅ unconditionally called
  return getPromoForPath(explicitPath ?? pathname ?? "/");
}
