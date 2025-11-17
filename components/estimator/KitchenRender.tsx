"use client";
import UniPreviewCanvas, {
  type PreviewModelProps,
} from "@/components/common/UniPreviewCanvas";
import KitchenSvg2D from "@/components/estimator/KitchenSvg2D";
import useEstimator, {
  type Finish,
  type Shape,
  type ViewMode,
} from "@/components/estimator/store/estimatorStore";
import { Environment } from "@react-three/drei";
import { motion } from "framer-motion";
import React from "react";

/* =========================================================
   🔹 Minimal 3D Placeholder Model (fine-line edition)
   ========================================================= */
function KitchenModel3D(_: PreviewModelProps): React.ReactElement {
  return (
    <group>
      {/* Base counter block */}
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[2.4, 0.8, 0.6]} />
        <meshStandardMaterial
          color="#C7C3FF"
          metalness={0.25}
          roughness={0.55}
        />
      </mesh>

      {/* Wall backsplash */}
      <mesh position={[0, 1.0, -0.25]}>
        <boxGeometry args={[2.4, 0.4, 0.05]} />
        <meshStandardMaterial color="#DAD8FF" metalness={0.2} roughness={0.6} />
      </mesh>

      <Environment preset="studio" />
    </group>
  );
}

/* =========================================================
   🔸 MAIN KITCHEN RENDER WRAPPER
   ========================================================= */
export default function KitchenRender(): React.ReactElement {
  const mode = useEstimator((s) => s.mode as ViewMode);
  const setMode = useEstimator((s) => s.setMode);
  const kitchen = useEstimator((s) => s.kitchen);
  const setShape = useEstimator((s) => s.setKitchenShape);
  const setFinish = useEstimator((s) => s.setKitchenFinish);
  const setLength = useEstimator((s) => s.setKitchenLength);

  const shape = kitchen.shape;
  const finish = kitchen.finish;
  const wallA = kitchen.lengths.A ?? 10;
  const wallB = kitchen.lengths.B ?? 10;
  const wallC = kitchen.lengths.C ?? 10;

  return (
    <div className="relative w-full h-full flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3 px-3 py-3 rounded-2xl bg-slate-900/60 border border-slate-700/60">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-300">Shape</span>
          <select
            value={shape}
            onChange={(e) => setShape(e.target.value as Shape)}
            className="bg-slate-900/80 border border-slate-600 rounded-lg px-2 py-1 text-xs text-slate-50"
          >
            <option value="linear">Single wall</option>
            <option value="parallel">Parallel</option>
            <option value="lshape">L-shape</option>
            <option value="u">U-shape</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-300">Walls</span>
          <input
            type="number"
            min={10}
            max={kitchen.perWallMax || 20}
            value={wallA}
            onChange={(e) => setLength("A", Number(e.target.value) || 0)}
            className="w-14 bg-slate-900/80 border border-slate-600 rounded-lg px-2 py-1 text-xs text-slate-50 text-center"
            aria-label="Wall A (ft)"
          />
          {shape !== "linear" && (
            <input
              type="number"
              min={10}
              max={kitchen.perWallMax || 20}
              value={wallB}
              onChange={(e) => setLength("B", Number(e.target.value) || 0)}
              className="w-14 bg-slate-900/80 border border-slate-600 rounded-lg px-2 py-1 text-xs text-slate-50 text-center"
              aria-label="Wall B (ft)"
            />
          )}
          {shape === "u" && (
            <input
              type="number"
              min={10}
              max={kitchen.perWallMax || 20}
              value={wallC}
              onChange={(e) => setLength("C", Number(e.target.value) || 0)}
              className="w-14 bg-slate-900/80 border border-slate-600 rounded-lg px-2 py-1 text-xs text-slate-50 text-center"
              aria-label="Wall C (ft)"
            />
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-300">Finish</span>
          <select
            value={finish}
            onChange={(e) => setFinish(e.target.value as Finish)}
            className="bg-slate-900/80 border border-slate-600 rounded-lg px-2 py-1 text-xs text-slate-50"
          >
            <option value="essential">Essential</option>
            <option value="premium">Premium</option>
            <option value="luxury">Luxury</option>
          </select>
        </div>
      </div>

      <div className="relative w-full h-full flex items-center justify-center">
        <UniPreviewCanvas
          SvgComponent={KitchenSvg2D}
          ModelComponent={KitchenModel3D}
        />
        <motion.div
          className="absolute bottom-3 right-4 px-3 py-1.5 text-xs rounded-full backdrop-blur-sm shadow-sm"
          style={{
            background:
              "color-mix(in srgb, var(--surface-light) 90%, transparent)",
            color: "var(--text-primary)",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.9 }}
          transition={{ duration: 0.6 }}
        >
          {mode === "3d" ? "3D View — Kitchen" : "2D CAD Plan — Kitchen"}
        </motion.div>
      </div>
    </div>
  );
}
