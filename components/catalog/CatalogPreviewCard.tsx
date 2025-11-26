"use client";
/**
 * ============================================================
 * 🖼️ FILE: /components/catalog/CatalogPreviewCard.tsx
 * 🧩 MODULE: Store Preview Card — PNG, Buy-first
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

  const categorySlug = item.categorySlug || "store";
  const slug = item.slug || String(item.id);

  const href = `/store/${categorySlug}/${slug}`;

  return (
    <article
      className="group relative flex flex-col rounded-3xl
                 border border-[var(--border-soft)]
                 bg-[var(--surface-card)] dark:bg-[var(--surface-card-dark)]
                 shadow-sm hover:shadow-lg hover:border-[var(--accent-primary)]
                 transition-all duration-200 overflow-hidden min-h-[280px]"
    >
      {/* IMAGE AREA → PDP */}
      <Link
        href={href}
        className="relative block w-full aspect-[4/3] bg-[var(--surface-panel)]"
      >
        {hasImage ? (
          <Image
            src={item.coverUrl as string}
            alt={item.title}
            unoptimized
            fill
            sizes="(min-width: 1280px) 260px, (min-width: 768px) 220px, 50vw"
            className="object-contain transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-[var(--text-muted)]">
            No preview
          </div>
        )}

        {item.badge && (
          <div className="absolute left-3 top-3 flex flex-row gap-2">
            <span className="rounded-full bg-[var(--accent-primary)] text-white text-[10px] px-2 py-0.5 font-semibold shadow-sm">
              {item.badge}
            </span>
          </div>
        )}
      </Link>

      {/* TEXT + PRICE + CART CONTROLS */}
      <div className="flex flex-1 flex-col px-4 pt-3 pb-4 gap-2">
        <Link href={href} className="block">
          <h3 className="text-[15px] font-semibold text-[var(--text-primary)] line-clamp-2">
            {item.title}
          </h3>
          {item.category && (
            <p className="mt-0.5 text-[11px] text-[var(--text-secondary)]">
              {item.category}
            </p>
          )}
        </Link>

        <div className="mt-1 flex items-center justify-between gap-2">
          <span className="text-[15px] font-bold text-[var(--accent-success)]">
            {formattedPrice}
          </span>

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
