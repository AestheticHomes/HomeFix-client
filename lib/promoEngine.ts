import { type ReactNode } from "react";

export type PromoPayload = {
  id: string;
  headline: string;
  subline?: string;
  ctaLabel: string;
  ctaHref: string;
  icon?: ReactNode;
};

function makeBasePromo(): PromoPayload {
  return {
    id: "home-general",
    headline: "Start with a free consultation and free site visit.",
    subline:
      "We prepare a full 3D visualisation of your home so every inch is planned, waste is reduced, and execution becomes mistake-proof.",
    ctaLabel: "Book Free Consultation",
    ctaHref: "/contact", // keep this, or point to your existing lead/booking page
  };
}

function makeStorePromo(): PromoPayload {
  return {
    id: "store-browse",
    headline: "Not sure what to pick? Start with a free consultation.",
    subline:
      "We’ll help you choose only the materials you actually need, with 3D visualisation to avoid waste and labour mistakes.",
    ctaLabel: "Talk to a Planner",
    ctaHref: "/contact",
  };
}

function makeEstimatorPromo(): PromoPayload {
  return {
    id: "estimator-flow",
    headline: "Turn your plan into a full 3D visualisation.",
    subline:
      "Start with a free consultation and free site visit; most customers use 3D to cut material waste and prevent execution errors.",
    ctaLabel: "Book Free Consultation",
    ctaHref: "/contact",
  };
}

function makeCheckoutPromo(): PromoPayload {
  return {
    id: "checkout-assurance",
    headline: "Free consultation + free site visit are included.",
    subline:
      "Before any work starts, we help you finalise a plan that reduces material wastage and avoids costly labour rework.",
    ctaLabel: "Confirm & Talk to Us",
    ctaHref: "/contact",
  };
}

/**
 * getPromoForPath
 * --------------------------------------------------
 * Given the current pathname, pick ONE promo payload.
 * Simple route-based logic only. No user history, no
 * complex rules – easy to maintain and test.
 */
export function getPromoForPath(
  pathname: string | null | undefined
): PromoPayload | null {
  if (!pathname) return makeBasePromo();

  if (pathname.startsWith("/estimator")) {
    return makeEstimatorPromo();
  }

  if (pathname.startsWith("/checkout") || pathname.startsWith("/cart")) {
    return makeCheckoutPromo();
  }

  if (pathname === "/store" || pathname.startsWith("/store/")) {
    return makeStorePromo();
  }

  // Fallback for all other pages (including "/")
  return makeBasePromo();
}
