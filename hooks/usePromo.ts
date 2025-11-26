"use client";

/**
 * usePromo
 * -----------------------------------------
 * Small client-side hook that converts the
 * current route into a PromoPayload using
 * getPromoForPath.
 */

import { usePathname } from "next/navigation";
import { useMemo } from "react";

import { getPromoForPath, type PromoPayload } from "@/lib/promoEngine";

export function usePromo(): PromoPayload | null {
  const pathname = usePathname();

  const promo = useMemo(() => getPromoForPath(pathname), [pathname]);

  return promo;
}
