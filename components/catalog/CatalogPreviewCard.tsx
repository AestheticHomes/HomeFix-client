"use client";
/**
 * ============================================================
 * 🖼️ FILE: /components/catalog/CatalogPreviewCard.tsx
 * 🧩 MODULE: Store Preview Card — PNG, Buy-first
 * ------------------------------------------------------------
 * ROLE:
 *   - Big, simple card:
 *       • Large PNG image (no 3D)
 *       • Title
 *       • Price
 *       • Optional badge + promo line
 *   - Image/title click → PDP (/p/[id])
 *   - Bottom-right: Add / + / − to drive checkout directly
 *
 * PROPS:
 *   - item: CatalogItem          // product data
 *   - quantity?: number          // current qty in cart for this item
 *   - onIncrement?: () => void   // called on "Add" or "+"
 *   - onDecrement?: () => void   // called on "-"
 * ============================================================
 */

import type { CatalogItem } from "@/types/catalog";
import { motion } from "framer-motion";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type Props = {
  item: CatalogItem;
  quantity?: number;
  onIncrement?: () => void;
  onDecrement?: () => void;
};

export default function CatalogPreviewCard({
  item,
  quantity = 0,
  onIncrement,
  onDecrement,
}: Props) {
  const hasImage = !!item.coverUrl;
  const inCart = quantity > 0;

  const formattedPrice =
    typeof item.price === "number"
      ? `₹${item.price.toLocaleString("en-IN")}`
      : "Price on request";

  const categorySlug = item.category
    ? item.category.toLowerCase().replace(/\s+/g, "-")
    : "item";

  // Simple promo line – you can extend this based on catalog fields
  const promoText = item.category || "";

  return (
    <article
      className="group relative flex flex-col rounded-3xl
                 border border-[var(--border-soft)]
                 bg-[var(--surface-card)] dark:bg-[var(--surface-card-dark)]
                 shadow-sm hover:shadow-lg hover:border-[var(--accent-primary)]
                 transition-all duration-200 overflow-hidden min-h-[260px]"
    >
      {/* IMAGE AREA → PDP */}
      <Link
        href={`/store/${categorySlug}/${item.id}`}
        className="relative block w-full aspect-[4/3] bg-[var(--surface-panel)]"
      >
        {hasImage ? (
          <Image
            src={item.coverUrl as string}
            alt={item.title}
            fill
            sizes="(min-width: 1280px) 260px, (min-width: 768px) 220px, 50vw"
            className="object-contain transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-[var(--text-muted)]">
            No preview
          </div>
        )}

        {/* Badge (e.g. bestseller / new) */}
        {(item.badge || item.category) && (
          <div className="absolute left-3 top-3 flex flex-row gap-2">
            {item.badge && (
              <span className="rounded-full bg-[var(--accent-primary)] text-white text-[10px] px-2 py-0.5 font-semibold shadow-sm">
                {item.badge}
              </span>
            )}
          </div>
        )}
      </Link>

      {/* TEXT + PRICE + CART CONTROLS */}
      <div className="flex flex-1 flex-col px-3.5 pt-3 pb-3.5 gap-2">
        {/* Title + subtle category → PDP */}
      <Link href={`/store/${categorySlug}/${item.id}`} className="block">
          <h3 className="text-[14px] font-semibold text-[var(--text-primary)] line-clamp-2">
            {item.title}
          </h3>
          {item.category && (
            <p className="mt-0.5 text-[11px] text-[var(--text-secondary)]">
              {item.category}
            </p>
          )}
        </Link>

        {/* Price + promo + controls */}
        <div className="mt-1 flex items-end justify-between gap-2">
          <div className="flex flex-col">
            <span className="text-[14px] font-bold text-[var(--accent-success)]">
              {formattedPrice}
            </span>
            {promoText && (
              <span className="mt-0.5 text-[11px] text-[var(--text-secondary)] line-clamp-1">
                {promoText}
              </span>
            )}
          </div>

          {/* Cart controls */}
          {!inCart ? (
            <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={onIncrement}
              className="inline-flex items-center gap-1.5 rounded-2xl px-3 py-1.5
                         bg-[var(--accent-primary)] text-white text-[11px] font-semibold
                         shadow-sm hover:brightness-110"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Add</span>
            </motion.button>
          ) : (
            <div className="inline-flex items-center rounded-2xl bg-[var(--surface-panel)] px-2 py-1 gap-1.5">
              <motion.button
                type="button"
                whileTap={{ scale: 0.9 }}
                onClick={onDecrement}
                className="flex h-6 w-6 items-center justify-center rounded-full
                           bg-[var(--surface-card)] border border-[var(--border-subtle)]"
              >
                <Minus className="w-3 h-3" />
              </motion.button>
              <span className="min-w-[1.5rem] text-center text-[12px] font-semibold">
                {quantity}
              </span>
              <motion.button
                type="button"
                whileTap={{ scale: 0.9 }}
                onClick={onIncrement}
                className="flex h-6 w-6 items-center justify-center rounded-full
                           bg-[var(--accent-primary)] text-white"
              >
                <Plus className="w-3 h-3" />
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
