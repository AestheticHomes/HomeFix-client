"use client";
import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Environment } from "@react-three/drei";
import { motion } from "framer-motion";
import useEstimator from "@/components/estimator/store/estimatorStore";
import UniPreviewCanvas from "@/components/common/UniPreviewCanvas";
import WardrobeSvg2D from "@/components/estimator/WardrobeSvg2D";

/* =========================================================
   🔹 3D PLACEHOLDER MODEL
   ========================================================= */
function WardrobeModel3D() {
  return (
    <group>
      {/* Base wardrobe block */}
      <mesh position={[0, 1.25, 0]}>
        <boxGeometry args={[2.4, 2.6, 0.6]} />
        <meshStandardMaterial
          color="#C9BCFF"
          metalness={0.2}
          roughness={0.5}
        />
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
export default function WardrobeRender() {
  const mode = useEstimator((s) => s.mode); // '2d' or '3d'

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <UniPreviewCanvas
        mode={mode}
        SvgComponent={WardrobeSvg2D}
        ModelComponent={WardrobeModel3D}
      />

      {/* Optional overlay: label or mode indicator */}
      <motion.div
        className="absolute bottom-3 right-4 px-3 py-1.5 text-xs rounded-full bg-black/40 text-white backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.9 }}
        transition={{ duration: 0.6 }}
      >
        {mode === "3d" ? "3D View — Wardrobe" : "2D Elevation — Wardrobe"}
      </motion.div>
    </div>
  );
}
