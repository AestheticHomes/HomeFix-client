/**
 * ============================================================
 * 📄 FILE: /app/store/[category]/page.tsx
 * 🧩 MODULE: Category Listing Page (server entry)
 * ------------------------------------------------------------
 * ROUTE: /store/[categorySlug]
 * DATA FLOW: generateMetadata + server params → CategoryPageClient (offline-first)
 * SEO: generateMetadata in this file (App Router)
 * ============================================================
 */

import type { Metadata } from "next";

import CategoryPageClient from "./CategoryPageClient";

import { CANONICAL_ORIGIN } from "@/lib/seoConfig";

const prettify = (slug: string) =>
  slug
    .split("-")
    .map((s) => (s ? s[0].toUpperCase() + s.slice(1) : s))
    .join(" ");

export async function generateMetadata({
  params,
}: {
  params: { category?: string };
}): Promise<Metadata> {
  const categorySlug = params.category ?? "";
  const prettyName = prettify(categorySlug);
  const title = `${prettyName} | HomeFix Store`;
  const description = `Browse ${prettyName} from HomeFix: curated doors, panels, hardware and more with installation included.`;
  const url = `${CANONICAL_ORIGIN}/store/${categorySlug}`;

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

export default function CategoryPage({
  params,
}: {
  params: { category?: string };
}) {
  const categorySlug = String(params.category ?? "");
  return <CategoryPageClient categorySlug={categorySlug} />;
}
