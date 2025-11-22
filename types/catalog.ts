/**
 * ============================================================
 * 📦 FILE: /types/catalog.ts
 * 🧩 MODULE: Catalog Types v1.0
 * ------------------------------------------------------------
 * PURPOSE
 *   Shared types for Store + HomePreview-backed catalog cards.
 *
 * CONTRACT
 *   Minimal fields required to render a 3D preview card.
 *   Adjust to match your goods table (see mapper below).
 * ============================================================
 */

export type CatalogId = number;

export interface CatalogItem {
  id: CatalogId;
  title: string;
  category: string;
  price: number; // whole INR only
  currency?: "INR";

  // 3D is optional for now
  glbUrl?: string | null;

  // PNG poster is the baseline requirement for Store
  coverUrl: string;

  badge?: "new" | "bestseller" | "promo" | null;
}
