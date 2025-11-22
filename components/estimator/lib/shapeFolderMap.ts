// components/estimator/lib/shapeFolderMap.ts

/**
 * Shape → GLB asset mapping for the estimator.
 *
 * This file is the SINGLE source of truth for:
 *   - What shapes the estimator understands (linear / parallel / lshape / u)
 *   - Which Supabase folder + file each shape points to
 *
 * Storage layout expectation (Supabase "homefix-catalog" bucket):
 *
 *   homefix-catalog/
 *     items/
 *       Straight_Kitchen/
 *         Straight_Kitchen.glb
 *       Parallel_Kitchen/
 *         Parallel_Kitchen.glb
 *       Kitchen_L_shape/
 *         Kitchen_L_shape.glb
 *       Kitchen_U_shape/
 *         Kitchen_U_shape.glb
 *
 * If you rename folders/files in Supabase, THIS MAP MUST BE UPDATED.
 * No other file should hard-code object paths.
 */

export type ShapeKey = "linear" | "parallel" | "lshape" | "u";

export type ShapeAsset = {
  /** Folder under `items/` in the Supabase bucket */
  folder: string;
  /** File name inside that folder (usually `<folder>.glb`) */
  file: string;
};

/**
 * Normalize any incoming shape string from the estimator store
 * into one of our canonical `ShapeKey`s.
 *
 * Handles:
 *   - case differences ("Linear", "LINEAR")
 *   - extra quotes from weird serialization ("'lshape'")
 *   - a few human aliases ("single wall", "l-shape", etc.)
 */
export function normalizeShapeKey(raw?: string | null): ShapeKey | null {
  if (!raw) return null;

  let s = String(raw).trim().toLowerCase();

  // Strip wrapping single/double quotes if present
  if (
    (s.startsWith("'") && s.endsWith("'")) ||
    (s.startsWith('"') && s.endsWith('"'))
  ) {
    s = s.slice(1, -1).trim();
  }

  // Aliases → canonical keys
  switch (s) {
    case "linear":
    case "single":
    case "single wall":
    case "straight":
    case "straight wall":
    case "one-wall":
      return "linear";

    case "parallel":
    case "parallel wall":
    case "two-wall":
      return "parallel";

    case "lshape":
    case "l-shape":
    case "l shape":
    case "corner":
      return "lshape";

    case "u":
    case "u-shape":
    case "u shape":
    case "ushape":
    case "u-shaped":
      return "u";

    default:
      return null;
  }
}

/**
 * Canonical map used by `getEstimatorGlbUrl`.
 *
 * IMPORTANT:
 *   - `folder` must exactly match the folder in Supabase under `items/`
 *   - `file` must exactly match the `.glb` file name, including case
 */
export const shapeAssetsMap: Record<ShapeKey, ShapeAsset> = {
  linear: {
    folder: "Straight_Kitchen",
    file: "Straight_Kitchen.glb",
  },
  parallel: {
    folder: "Parallel_Kitchen",
    file: "Parallel_Kitchen.glb",
  },
  lshape: {
    folder: "Kitchen_L_shape",
    file: "Kitchen_L_shape.glb",
  },
  u: {
    folder: "Kitchen_U_shape",
    file: "Kitchen_U_shape.glb",
  },
};
