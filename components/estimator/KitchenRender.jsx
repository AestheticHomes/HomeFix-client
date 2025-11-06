"use client";
import React from "react";
import { motion } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Environment } from "@react-three/drei";
import useEstimator from "@/components/estimator/store/estimatorStore";
import UniPreviewCanvas from "@/components/common/UniPreviewCanvas";
import KitchenSvg2D from "@/components/estimator/KitchenSvg2D";

/* =========================================================
   🔹 Minimal 3D Placeholder Model (fine-line edition)
   ========================================================= */
function KitchenModel3D() {
  return (
    <group>
      {/* Base counter block */}
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[2.4, 0.8, 0.6]} />
        <meshStandardMaterial color="#C7C3FF" metalness={0.25} roughness={0.55} />
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
export default function KitchenRender() {
  const mode = useEstimator((s) => s.mode);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <UniPreviewCanvas
        mode={mode}
        SvgComponent={KitchenSvg2D}
        ModelComponent={KitchenModel3D}
      />

      {/* overlay label */}
      <motion.div
        className="absolute bottom-3 right-4 px-3 py-1.5 text-xs rounded-full bg-black/35 text-white/90 backdrop-blur-sm shadow-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.9 }}
        transition={{ duration: 0.6 }}
      >
        {mode === "3d" ? "3D View — Kitchen" : "2D CAD Plan — Kitchen"}
      </motion.div>
    </div>
  );
}
