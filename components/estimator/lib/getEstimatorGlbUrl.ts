// components/estimator/lib/getEstimatorGlbUrl.ts

/**
 * getEstimatorGlbUrl
 * -------------------------------------------------------
 * Given an estimator "shape", return the public GLB URL
 * served from Supabase (or a CDN in front of it).
 *
 * Rules:
 *  - Prefer NEXT_PUBLIC_HOMEFIX_CDN if defined.
 *  - Fallback to the known Supabase public bucket URL.
 *  - Use shapeFolderMap as the single mapping source.
 */

import { shapeFolderMap, type EstimatorShape } from "./shapeFolderMap";

const FALLBACK_CDN_ROOT =
  "https://xnubmphixlpkyqfhghup.supabase.co/storage/v1/object/public/homefix-catalog";

const HOMEFIX_CDN = process.env.NEXT_PUBLIC_HOMEFIX_CDN || FALLBACK_CDN_ROOT;

export function getEstimatorGlbUrl(
  rawShape: string | null | undefined
): string | null {
  if (!HOMEFIX_CDN) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn(
        "[getEstimatorGlbUrl] HOMEFIX_CDN missing; GLB URLs will be null."
      );
    }
    return null;
  }

  const shapeKey = (rawShape ?? "linear").toLowerCase() as EstimatorShape;
  const asset = shapeFolderMap[shapeKey] ?? shapeFolderMap.linear;

  const url = `${HOMEFIX_CDN}/items/${asset.folder}/${encodeURIComponent(
    asset.file
  )}`;

  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.debug(
      "[getEstimatorGlbUrl] shape:",
      rawShape,
      "→",
      shapeKey,
      "url:",
      url
    );
  }

  return url;
}
