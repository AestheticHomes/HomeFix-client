"use client";
import React from "react";
import { Environment } from "@react-three/drei";
import { motion } from "framer-motion";
import useEstimator, {
  type ViewMode,
  type Finish,
} from "@/components/estimator/store/estimatorStore";
import UniPreviewCanvas, {
  type PreviewModelProps,
} from "@/components/common/UniPreviewCanvas";
import WardrobeSvg2D from "@/components/estimator/WardrobeSvg2D";

/* =========================================================
   🔹 3D PLACEHOLDER MODEL
   ========================================================= */
function WardrobeModel3D(_: PreviewModelProps): React.ReactElement {
  return (
    <group>
      {/* Base wardrobe block */}
      <mesh position={[0, 1.25, 0]}>
        <boxGeometry args={[2.4, 2.6, 0.6]} />
        <meshStandardMaterial color="#C9BCFF" metalness={0.2} roughness={0.5} />
      </mesh>

      {/* Loft block */}
      <mesh position={[0, 2.9, 0]}>
        <boxGeometry args={[2.4, 0.8, 0.6]} />
        <meshStandardMaterial
          color="#BDAAFF"
          metalness={0.25}
          roughness={0.45}
        />
      </mesh>

      {/* Subtle light glow */}
      <pointLight position={[0, 3.5, 1]} intensity={0.8} color="#D3B8FF" />
      <Environment preset="studio" />
    </group>
  );
}

/* =========================================================
   🔸 MAIN WARDROBE RENDER WRAPPER
   ========================================================= */
export default function WardrobeRender(): React.ReactElement {
  const mode = useEstimator((s) => s.mode as ViewMode);
  const setMode = useEstimator((s) => s.setMode);
  const widthFt = useEstimator((s) => s.wardrobe.widthFt);
  const setWidth = useEstimator((s) => s.setWardrobeWidth);
  const finish = useEstimator((s) => s.wardrobe.finish);
  const setFinish = useEstimator((s) => s.setWardrobeFinish);

  return (
    <div className="relative w-full h-full flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3 px-3 py-3 rounded-2xl bg-slate-900/60 border border-slate-700/60">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-300">Width (ft)</span>
          <input
            type="number"
            min={4}
            max={20}
            value={Number(widthFt) || 0}
            onChange={(e) => setWidth(Number(e.target.value) || 0)}
            className="w-16 bg-slate-900/80 border border-slate-600 rounded-lg px-2 py-1 text-xs text-slate-50 text-center"
            aria-label="Wardrobe width (ft)"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-300">Loft</span>
          <span className="px-2 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-[11px] text-slate-200">
            3 ft default
          </span>
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
          SvgComponent={WardrobeSvg2D}
          ModelComponent={WardrobeModel3D}
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
          {mode === "3d" ? "3D View — Wardrobe" : "2D Elevation — Wardrobe"}
        </motion.div>
      </div>
    </div>
  );
}
