"use client";

import UniversalPreview from "@/components/preview/UniversalPreview";
import { useProductCartStore } from "@/components/store/cartStore";
import { GoodsRow, mapGoodsToCatalog } from "@/lib/catalog/mapGoodsToCatalog";
import type { CatalogItem } from "@/types/catalog";
import { ArrowLeft, Loader2, Minus, Plus, ShoppingCart } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function PDP() {
  const params = useParams<{ category?: string; slug?: string }>();
  const category = params?.category;
  const slug = params?.slug;
  const router = useRouter();

  const { items, addItem, decrement } = useProductCartStore();

  const [item, setItem] = useState<CatalogItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_GOODS_CATALOG_URL;
    if (!url) {
      console.warn("[PDP] NEXT_PUBLIC_GOODS_CATALOG_URL missing");
      setLoading(false);
      return;
    }

    const load = async () => {
      const rows = (await (await fetch(url)).json()) as GoodsRow[];
      const mapped = mapGoodsToCatalog(rows);

      const idFromSlug = Number(slug);
      const found =
        mapped.find((p) => p.id === idFromSlug) ||
        mapped.find(
          (p) =>
            p.title.toLowerCase().replace(/\s+/g, "-") ===
              String(slug ?? "").toLowerCase() &&
            (category ? p.category.toLowerCase() === category.toLowerCase() : true)
        );

      setItem(found || null);
      setLoading(false);
    };

    load();
  }, [category, slug]);

  const quantity = useMemo(() => {
    if (!item) return 0;
    const cartItem = items.find((i) => i.id === item.id);
    return cartItem?.quantity ?? 0;
  }, [items, item]);

  if (loading) {
    return (
      <div className="h-[70vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[var(--text-muted)]" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center">
        <p className="text-sm text-[var(--text-secondary)]">
          Product not found.
        </p>
        <button
          onClick={() => router.push("/store")}
          className="mt-3 rounded-lg px-4 py-2 bg-[var(--accent-primary)] text-white"
        >
          Back to Store
        </button>
      </div>
    );
  }

  return (
    <section className="px-4 sm:px-8 pb-24 pt-6">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)]"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {/* === Main Layout === */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-10 mt-6">
        {/* LEFT: Canvas */}
        <div className="rounded-3xl border border-[var(--border-soft)] p-4 bg-[var(--surface-card)]">
          <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden bg-[var(--surface-panel)]">
            <UniversalPreview
              glbUrl={item.glbUrl ?? undefined}
              imageUrl={item.coverUrl ?? undefined}
              enableModeToggle={!!item.glbUrl}
              initialMode={item.glbUrl ? "auto" : "2d"}
              fillContainer
              showFullscreenToggle
              mode="hero-inline"
            />
          </div>
        </div>

        {/* RIGHT: Details */}
        <div className="rounded-3xl border border-[var(--border-soft)] p-6 bg-[var(--surface-card)] flex flex-col gap-6">
          <div>
            <h1 className="text-xl font-semibold">{item.title}</h1>
            <p className="text-[12px] text-[var(--text-secondary)] mt-1 capitalize">
              {item.category}
            </p>
          </div>

          <div>
          <div className="text-3xl font-bold text-[var(--accent-success)]">
            ₹{item.price?.toLocaleString("en-IN")}
          </div>
          <div className="text-[13px] text-[var(--text-secondary)] mt-1">
            EMI available • Installation included
            </div>
          </div>

          {/* Cart controls */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-[var(--surface-panel)]">
            {quantity === 0 ? (
              <button
                onClick={() =>
                  addItem({ id: item.id, title: item.title, price: item.price })
                }
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2 bg-[var(--accent-primary)] text-white"
              >
                <ShoppingCart className="w-4 h-4" />
                Add to cart
              </button>
            ) : (
              <div className="inline-flex items-center gap-2 bg-[var(--surface-card)] px-3 py-2 rounded-xl">
                <button
                  onClick={() => decrement(item.id)}
                  className="w-7 h-7 flex items-center justify-center rounded-full border"
                >
                  <Minus className="w-4 h-4" />
                </button>

                <span className="min-w-[20px] text-center">{quantity}</span>

                <button
                  onClick={() =>
                    addItem({
                      id: item.id,
                      title: item.title,
                      price: item.price,
                    })
                  }
                  className="w-7 h-7 flex items-center justify-center rounded-full bg-[var(--accent-primary)] text-white"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            )}

            {quantity > 0 && (
              <button
                onClick={() => router.push("/checkout")}
                className="rounded-xl px-4 py-2 bg-[var(--accent-success)] text-white"
              >
                Checkout
              </button>
            )}
          </div>

          {/* Description / specs */}
          <div>
            <h2 className="text-sm font-semibold mb-2">Specifications</h2>
            <ul className="text-[13px] text-[var(--text-secondary)] space-y-1">
              <li>Durable build for Indian homes</li>
              <li>Professional installation included</li>
              <li>Warranty: 5 years</li>
              <li>Site measurement available</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
