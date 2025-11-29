/**
 * ============================================================
 * 📄 FILE: /app/store/[category]/[slug]/page.tsx
 * 🧩 MODULE: Product Detail Page (PDP) — Server entry
 * ------------------------------------------------------------
 * ROUTE: /store/[categorySlug]/[slug]
 * DATA FLOW: Fetch catalog JSON (Supabase CDN) → mapGoodsToCatalog → pick item
 * SEO: generateMetadata + JSON-LD (rendered in PDPClient)
 * ============================================================
 */

import type { Metadata } from "next";
import Link from "next/link";

import PDPClient from "./PDPClient";

import {
  mapGoodsToCatalog,
  type GoodsRow,
} from "@/lib/catalog/mapGoodsToCatalog";
import type { CatalogItem } from "@/types/catalog";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://homefix.co.in";

async function getCatalogItem(
  categorySlug: string,
  slug: string
): Promise<CatalogItem | null> {
  const url = process.env.NEXT_PUBLIC_GOODS_CATALOG_URL;
  if (!url) return null;
  const res = await fetch(url, { cache: "no-cache" });
  if (!res.ok) return null;
  const rows = (await res.json()) as GoodsRow[];
  const mapped = mapGoodsToCatalog(rows);
  return (
    mapped.find(
      (p) => p.categorySlug === String(categorySlug) && p.slug === String(slug)
    ) ?? null
  );
}

export async function generateMetadata({
  params,
}: {
  params: { category: string; slug: string };
}): Promise<Metadata> {
  const { category, slug } = params;
  const item = await getCatalogItem(category, slug);

  if (!item) {
    return {
      title: "Product not found | HomeFix",
      description: "We could not find this product in the HomeFix catalog.",
      alternates: {
        canonical: `${SITE_URL}/store/${category}/${slug}`,
      },
    };
  }

  const canonical = `${SITE_URL}/store/${item.categorySlug}/${item.slug}`;
  const title = `${item.title} | ${item.category} | HomeFix`;
  const description = `Buy ${item.title} at ₹${item.price.toLocaleString(
    "en-IN"
  )}. Premium materials, installation included, HomeFix warranty.`;

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      images: item.coverUrl ? [item.coverUrl] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: item.coverUrl ? [item.coverUrl] : undefined,
    },
  };
}

export default async function PDPPage({
  params,
}: {
  params: { category: string; slug: string };
}) {
  const item = await getCatalogItem(params.category, params.slug);

  if (!item) {
    return (
      <section className="h-[70vh] flex flex-col items-center justify-center">
        <p className="text-sm text-[var(--text-secondary)]">
          We couldn’t find this product.
        </p>
        <Link
          href="/store"
          className="mt-3 px-4 py-2 rounded-xl bg-[var(--accent-primary)] text-white text-sm"
        >
          Back to store
        </Link>
      </section>
    );
  }

  return <PDPClient item={item} />;
}
