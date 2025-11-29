"use client";
/**
 * Client-side PDP (cart + pincode + JSON-LD renderer)
 */

import Link from "next/link";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { useMemo, useState } from "react";

import UniversalPreview from "@/components/preview/UniversalPreview";
import { useProductCartStore } from "@/components/store/cartStore";
import type { CatalogItem } from "@/types/catalog";
import { ArrowLeft, MapPin, Minus, Plus, ShoppingCart } from "lucide-react";

type Props = {
  item: CatalogItem;
};

export default function PDPClient({ item }: Props) {
  const router = useRouter();
  const { items, addItem, decrement } = useProductCartStore();

  const [pincode, setPincode] = useState("");
  const [pincodeOk, setPincodeOk] = useState<boolean | null>(null);

  const quantity = useMemo(() => {
    const cartItem = items.find((i: any) => i.id === item.id);
    return typeof cartItem?.quantity === "number"
      ? cartItem.quantity
      : items.filter((i: any) => i.id === item.id).length;
  }, [items, item.id]);

  const [previewOverride, setPreviewOverride] = useState<string | null>(null);

  const canonical = `https://homefix.co.in/store/${item.categorySlug}/${item.slug}`;
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: item.title,
    image: item.coverUrl || undefined,
    description: item.promoLabel || `${item.title} in ${item.category}`,
    sku: item.id,
    brand: { "@type": "Brand", name: "HomeFix" },
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: item.price,
      availability: "https://schema.org/InStock",
      url: canonical,
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Store",
        item: "https://homefix.co.in/store",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: item.category,
        item: `https://homefix.co.in/store/${item.categorySlug}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: item.title,
        item: canonical,
      },
    ],
  };

  const discount = item.discountPercent;
  const priceLabel = `₹${item.price.toLocaleString("en-IN")}`;

  return (
    <section className="relative pb-24">
      <Script
        id="pdp-product-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <Script
        id="pdp-breadcrumb-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 sm:px-8 pt-4">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-[13px] text-[var(--text-secondary)]"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="hidden sm:flex items-center gap-1 text-[11px] text-[var(--text-muted)]">
          <Link href="/store" className="hover:text-[var(--text-primary)]">
            Store
          </Link>
          <span>›</span>
          <Link
            href={`/store/${item.categorySlug}`}
            className="capitalize hover:text-[var(--text-primary)]"
          >
            {item.category}
          </Link>
          <span>›</span>
          <Link
            href={`/store/${item.categorySlug}/${item.slug}`}
            className="max-w-[16rem] line-clamp-1 hover:text-[var(--text-primary)]"
          >
            {item.title}
          </Link>
        </div>
      </div>

      {/* Main layout */}
      <div className="px-4 sm:px-8 pt-4 grid grid-cols-1 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-6 lg:gap-10">
        {/* LEFT: gallery + preview */}
        <div className="flex flex-col gap-4 lg:flex-row">
          {/* Thumbnails column (from item.gallery when available) */}
          <div className="hidden lg:flex flex-col gap-2 w-20">
            {(item.gallery && item.gallery.length > 0
              ? item.gallery
              : [item.coverUrl].filter(Boolean)
            )
              .slice(0, 4)
              .map((src, i) => (
                <button
                  key={i}
                  type="button"
                  className="aspect-[3/4] rounded-xl overflow-hidden bg-[var(--surface-panel)] border border-[var(--border-soft)] hover:border-[var(--accent-primary)] transition"
                  onClick={() => setPreviewOverride(src as string)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src as string}
                    alt={`${item.title} thumbnail ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
          </div>

          {/* Main canvas */}
          <div className="flex-1 rounded-3xl border border-[var(--border-soft)] bg-[var(--surface-card)] p-3 sm:p-4">
            <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] rounded-2xl overflow-hidden bg-[var(--surface-panel)]">
              <UniversalPreview
                glbUrl={item.glbUrl || undefined}
                imageUrl={previewOverride || item.coverUrl || undefined}
                enableModeToggle={!!item.glbUrl}
                initialMode={item.glbUrl ? "auto" : "2d"}
                fillContainer
                showFullscreenToggle
                mode="hero-inline"
              />
            </div>
          </div>
        </div>

        {/* RIGHT: details */}
        <div className="rounded-3xl border border-[var(--border-soft)] bg-[var(--surface-card)] p-4 sm:p-6 flex flex-col gap-4">
          <div>
            <h1 className="text-lg sm:text-xl font-semibold text-[var(--text-primary)]">
              {item.title}
            </h1>
            <p className="mt-1 text-[12px] text-[var(--text-secondary)] capitalize">
              {item.category}
            </p>

            {/* Mobile breadcrumbs (desktop already has top bar crumbs) */}
            <div className="mt-1 sm:hidden text-[11px] text-[var(--text-muted)]">
              <Link href="/store" className="hover:text-[var(--text-primary)]">
                Store
              </Link>{" "}
              ›{" "}
              <Link
                href={`/store/${item.categorySlug}`}
                className="hover:text-[var(--text-primary)]"
              >
                {item.category}
              </Link>{" "}
              › <span>{item.title}</span>
            </div>
          </div>

          {/* Price block */}
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-[var(--accent-success)]">
                {priceLabel}
              </span>
              {item.mrp && item.mrp > item.price && (
                <span className="text-[12px] line-through text-[var(--text-muted)]">
                  ₹{item.mrp.toLocaleString("en-IN")}
                </span>
              )}
              {discount && (
                <span className="text-[12px] font-semibold text-[var(--accent-success)]">
                  {discount}% OFF
                </span>
              )}
            </div>
            <p className="mt-1 text-[12px] text-[var(--text-secondary)]">
              Inclusive of all taxes • Installation included
            </p>
          </div>

          {/* Pincode check (UX only for now) */}
          <div className="rounded-2xl border border-[var(--border-soft)] p-3 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[var(--accent-primary)]" />
              <span className="text-[12px] text-[var(--text-secondary)]">
                Check delivery & installation availability
              </span>
            </div>
            <div className="flex gap-2 mt-1">
              <input
                value={pincode}
                onChange={(e) => {
                  setPincode(e.target.value);
                  setPincodeOk(null);
                }}
                placeholder="Enter pincode"
                maxLength={6}
                className="flex-1 px-3 py-1.5 rounded-xl border border-[var(--border-soft)] bg-[var(--surface-base)] text-[13px]"
              />
              <button
                onClick={() => setPincodeOk(pincode.length === 6)}
                className="px-3 py-1.5 rounded-xl text-[13px] font-semibold bg-[var(--accent-primary)] text-white"
              >
                Check
              </button>
            </div>
            {pincodeOk === true && (
              <p className="text-[11px] text-[var(--accent-success)] mt-1">
                Available in your area. Expected installation within 5–7 days.
              </p>
            )}
            {pincodeOk === false && (
              <p className="text-[11px] text-red-400 mt-1">
                We’ll need to confirm service availability for this pincode.
              </p>
            )}
          </div>

          {/* Highlights table */}
          {item.highlights && item.highlights.length > 0 && (
            <div>
              <h2 className="text-[13px] font-semibold mb-2">
                Product highlights
              </h2>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[12px] text-[var(--text-secondary)]">
                {item.highlights.map((h, idx) => (
                  <div key={idx} className="flex justify-between gap-2">
                    <span className="font-medium">{h.label}</span>
                    <span className="text-right">{h.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Promises row */}
          <div className="flex flex-wrap gap-2 text-[11px]">
            {(item.promises && item.promises.length > 0
              ? item.promises
              : [
                  "Safe & swift delivery",
                  "Free installation",
                  "Dedicated support",
                ]
            ).map((p, i) => (
              <span
                key={i}
                className="px-3 py-1 rounded-full border border-[var(--border-soft)] bg-[var(--surface-panel)]"
              >
                {p}
              </span>
            ))}
          </div>

          {/* Cart controls */}
          <div className="mt-2 flex items-center gap-3">
            {quantity === 0 ? (
              <button
                onClick={() =>
                  addItem({
                    id: Number(item.id),
                    title: item.title,
                    price: item.price,
                  })
                }
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2 bg-[var(--accent-primary)] text-white text-[13px] font-semibold"
              >
                <ShoppingCart className="w-4 h-4" />
                Add to cart
              </button>
            ) : (
              <div className="inline-flex items-center gap-2 rounded-xl px-3 py-2 bg-[var(--surface-panel)]">
                <button
                  onClick={() => decrement(Number(item.id))}
                  className="w-7 h-7 flex items-center justify-center rounded-full border border-[var(--border-soft)]"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="min-w-[20px] text-center text-[13px] font-semibold">
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    addItem({
                      id: Number(item.id),
                      title: item.title,
                      price: item.price,
                    })
                  }
                  className="w-7 h-7 flex items-center justify-center rounded-full bg-[var(--accent-primary)] text-white"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {quantity > 0 && (
              <button
                onClick={() => router.push("/checkout")}
                className="rounded-xl px-4 py-2 bg-[var(--accent-success)] text-white text-[13px] font-semibold"
              >
                Proceed to checkout
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bottom sticky bar */}
      <div className="fixed left-0 right-0 bottom-0 z-40 bg-[var(--surface-card)] border-t border-[var(--border-soft)] px-4 sm:px-8 py-3 flex items-center justify-between">
        <div className="text-[13px]">
          <span className="font-semibold text-[var(--accent-success)]">
            {priceLabel}
          </span>
          {discount && (
            <span className="ml-2 text-[11px] text-[var(--accent-success)]">
              {discount}% OFF
            </span>
          )}
        </div>
        <button
          onClick={() => {
            if (quantity === 0) {
              addItem({
                id: Number(item.id),
                title: item.title,
                price: item.price,
              });
            }
            router.push("/checkout");
          }}
          className="px-5 py-2 rounded-xl bg-[var(--accent-primary)] text-white text-[13px] font-semibold"
        >
          {quantity === 0 ? "Add & checkout" : "Checkout"}
        </button>
      </div>
    </section>
  );
}
