"use client";
/**
 * ============================================================
 * 🖼️ FILE: /components/catalog/CatalogPreviewCard.tsx
 * 🧩 MODULE: Preview Card (PNG-first, GLB-optional) v2.0
 * ------------------------------------------------------------
 * BEHAVIOR
 *   - If item.glbUrl exists → render 3D mini preview
 *   - Else → render PNG image
 *   - Expand button only appears when 3D is available
 *   - Lazy-loads once visible
 * ============================================================
 */

import type { CatalogItem } from "@/types/catalog";
import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const UniversalPreview = dynamic(
  () => import("@/components/preview/UniversalPreview"),
  { ssr: false }
);

type Props = {
  item: CatalogItem;
  onAdd?: (item: CatalogItem) => void;
};

export default function CatalogPreviewCard({ item, onAdd }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const has3d = !!item.glbUrl;
  const hasImage = !!item.coverUrl;

  // Lazy mount when visible
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) setVisible(true);
      },
      { rootMargin: "300px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="w-full rounded-2xl border border-[var(--border-soft)]
                 bg-[var(--surface-card)] dark:bg-[var(--surface-card-dark)]
                 overflow-hidden shadow-sm hover:shadow transition-shadow"
    >
      {/* Preview region */}
      <div className="relative aspect-[4/3]">
        {visible ? (
          has3d ? (
            <UniversalPreview
              glbUrl={item.glbUrl}
              imageUrl={item.coverUrl}
              mode="mini"
              fullscreen={expanded}
              onToggleFullscreen={(next) => setExpanded(next)}
              enableModeToggle={expanded ? true : false}
              initialMode={expanded ? "auto" : "2d"}
              showFullscreenToggle={expanded}
            />
          ) : hasImage ? (
            <div className="absolute inset-0 flex items-center justify-center bg-[var(--surface-panel)]">
              <Image
                src={item.coverUrl!}
                alt={item.title}
                fill
                sizes="(min-width: 1024px) 240px, (min-width: 640px) 180px, 45vw"
                className="object-contain"
                priority={false}
              />
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-xs text-[var(--text-muted)] bg-[var(--surface-panel)]">
              No preview
            </div>
          )
        ) : (
          <div className="absolute inset-0 animate-pulse bg-[var(--surface-panel)]" />
        )}

        {/* Badge */}
        {item.badge && (
          <span
            className="absolute left-3 top-3 text-[11px] px-2 py-1 rounded-full
                       bg-[color-mix(in_srgb,var(--accent-primary)20%,transparent)]
                       border border-[color-mix(in_srgb,var(--accent-primary)40%,transparent)]
                       text-[var(--accent-primary)]"
          >
            {item.badge}
          </span>
        )}

        {/* Expand button — only when 3D exists */}
        {has3d && (
          <button
            onClick={() => setExpanded(true)}
            className="absolute right-3 top-3 text-xs px-2 py-1 rounded-lg
                       bg-[var(--surface-card)] border border-[var(--border-subtle)]
                       hover:bg-[var(--surface-hover)]"
          >
            Expand
          </button>
        )}
      </div>

      {/* Meta info */}
      <div className="p-3">
        <Link href={`/p/${item.id}`} className="block">
          <div className="font-medium text-[var(--text-primary)] line-clamp-1">
            {item.title}
          </div>
          <div className="text-[12px] text-[var(--text-secondary)]">
            {item.category}
          </div>
        </Link>

        <div className="mt-2 flex items-center justify-between">
          <div className="font-semibold text-[var(--accent-success)]">
            ₹{item.price.toLocaleString("en-IN")}
          </div>

          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => onAdd?.(item)}
            className="inline-flex items-center gap-2 text-white text-sm px-3 py-1.5 rounded-lg
                       bg-[var(--accent-primary)] hover:brightness-110"
          >
            <ShoppingCart size={16} />
            Add
          </motion.button>
        </div>
      </div>
    </div>
  );
}
