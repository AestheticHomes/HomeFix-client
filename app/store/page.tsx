/**
 * ============================================================
 * 📄 FILE: /app/store/page.tsx
 * 🧩 MODULE: Store (server entry)
 * ------------------------------------------------------------
 * ROUTE: /store
 * DATA FLOW: Static generateMetadata → renders StorePageClient (offline-first)
 * SEO: generateMetadata defined here (App Router)
 * ============================================================
 */

import type { Metadata } from "next";

import StorePageClient from "./StorePageClient";

import { CANONICAL_ORIGIN } from "@/lib/seoConfig";

export async function generateMetadata(): Promise<Metadata> {
  const title = "HomeFix Store | Modular Kitchens, Doors, Panels & Hardware";
  const description =
    "Browse the HomeFix catalogue of modular kitchens, designer doors, wall panels, hardware, lighting and more with installation included.";
  const url = `${CANONICAL_ORIGIN}/store`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default function StorePage() {
  return <StorePageClient />;
}
