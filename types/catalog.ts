/**
 * ============================================================
 * 📦 FILE: /types/catalog.ts
 * 🧩 MODULE: Catalog Types v2.1
 * ------------------------------------------------------------
 * PURPOSE
 *   Shared types for Store + PDP + previews.
 * ============================================================
 */

/**
 * ============================================================
 * 🧩 TYPE: CatalogItem
 * ROLE:
 *   - Canonical product DTO used by Store, Category and PDP.
 *   - All catalog mappers should conform to this shape.
 * ============================================================
 */
export type CatalogId = number;

export type CatalogItem = {
  id: CatalogId;
  title: string;

  // Category + routing
  category: string;
  categorySlug: string;
  slug: string;

  // Media
  coverUrl: string | null;
  glbUrl?: string | null;
  /**
   * Optional gallery of images, first item is used as primary thumbnail.
   * Populated by mapGoodsToCatalog from JSON fields.
   */
  gallery?: string[];

  // Pricing
  price: number;
  mrp?: number | null; // original price (for strike-through)
  discountPercent?: number | null; // derived from mrp/price
  currency?: string | null;

  // Merchandising
  brand?: string | null;
  finishOptions?: { label: string; swatchUrl?: string }[];

  badge?: "new" | "bestseller" | "promo" | string | null;
  promoLabel?: string | null;
  warrantyYears?: number | null;

  // PDP extended props
  highlights?: { label: string; value: string }[];
  promises?: string[];
};
