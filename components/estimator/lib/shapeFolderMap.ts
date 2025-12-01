// components/instant-quote/lib/shapeFolderMap.ts

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
 *     estimator/Straight_Kitchen/Straight_Kitchen.glb
 *     estimator/Parallel_Kitchen/Parallel_Kitchen.glb
 *     estimator/Kitchen_L_shape/Kitchen_L_shape.glb
 *     estimator/Kitchen_U_shape/Kitchen_U_shape.glb
 */

export type EstimatorShape = "linear" | "parallel" | "lshape" | "u";

export type ShapeAsset = {
  folder: string;
  file: string;
};

export const shapeFolderMap: Record<EstimatorShape, ShapeAsset> = {
  linear: {
    folder: "estimator/Straight_Kitchen",
    file: "Straight_Kitchen.glb",
  },
  parallel: {
    folder: "estimator/Parallel_Kitchen",
    file: "Parallel_Kitchen.glb",
  },
  lshape: {
    folder: "estimator/Kitchen_L_shape",
    file: "Kitchen_L_shape.glb",
  },
  u: {
    folder: "estimator/Kitchen_U_shape",
    file: "Kitchen_U_shape.glb",
  },
};
