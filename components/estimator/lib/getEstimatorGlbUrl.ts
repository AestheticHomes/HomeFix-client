// components/estimator/lib/getEstimatorGlbUrl.ts

/**
 * getEstimatorGlbUrl
 * ------------------
 * Translates the estimator's `kitchen.shape` into a public GLB URL
 * in the `homefix-catalog` Supabase bucket.
 *
 * Env:
 *   NEXT_PUBLIC_HOMEFIX_CDN must point to the *bucket root*:
 *     https://xnubmphixlpkyqfhghup.supabase.co/storage/v1/object/public/homefix-catalog
 *
 * Final URLs look like:
 *   ${NEXT_PUBLIC_HOMEFIX_CDN}/items/<folder>/<file>
 */

import { normalizeShapeKey, shapeAssetsMap } from "./shapeFolderMap";

const HOMEFIX_CDN =
  process.env.NEXT_PUBLIC_HOMEFIX_CDN ??
  "https://xnubmphixlpkyqfhghup.supabase.co/storage/v1/object/public/homefix-catalog";

export function getEstimatorGlbUrl(shape?: string | null): string | null {
  const key = normalizeShapeKey(shape);
  if (!key) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn("[Estimator] Unknown shape key:", shape);
    }
    return null;
  }

  const asset = shapeAssetsMap[key];
  if (!asset) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn(
        "[Estimator] No asset mapping for shape:",
        shape,
        "→ key:",
        key
      );
    }
    return null;
  }

  // ✅ Important: include `/items/` – this matches your working URL
  const url = `${HOMEFIX_CDN}/items/${asset.folder}/${encodeURIComponent(
    asset.file
  )}`;

  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.debug("[Estimator] GLB URL for shape:", shape, "→", url);
  }

  return url;
}
