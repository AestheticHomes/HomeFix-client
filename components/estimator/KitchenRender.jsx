"use client";
import React from "react";
import useEstimator from "@/components/estimator/store/estimatorStore";
import UniPreviewCanvas from "@/components/common/UniPreviewCanvas";
import KitchenSvg2D from "@/components/estimator/KitchenSvg2D";

/* =========================================================
   🔹 KitchenRender — AI/JSON Hybrid Blueprint Edition
   ========================================================= */

/* 3D placeholder — ready for Studio integration */
function KitchenModel3D() {
  return (
    <mesh position={[0, 0.5, 0]}>
      <boxGeometry args={[2, 1, 1]} />
      <meshStandardMaterial color="#b9b9b9" />
    </mesh>
  );
}

/* =========================================================
   🔹 Main Export — UniPreviewCanvas Wrapper
   ========================================================= */
export default function KitchenRender() {
  const mode = useEstimator((s) => s.mode);

  return (
    <UniPreviewCanvas
      mode={mode}
      SvgComponent={() => <KitchenSvg2D asGroup />}
      ModelComponent={KitchenModel3D}
      title="Kitchen"
    />
  );
}
