"use client";
import React from "react";
import useEstimator from "@/components/estimator/store/estimatorStore";
import UniPreviewCanvas from "@/components/common/UniPreviewCanvas";

/* =========================================================
   🔹 WARDROBE RENDER — Front Elevation (SVG + 3D placeholder)
   ========================================================= */
function WardrobeSvg2D() {
  const wardrobe = useEstimator((s) => s.wardrobe);
  const PX = 0.22;
  const totalW = (wardrobe.widthFt || 9) * 304.8; // ft→mm
  const bottomH = (wardrobe.baseH || 7) * 304.8;
  const loftH = (wardrobe.loftH || 3) * 304.8;
  const module = 450;

  const toPx = (mm) => mm * PX;
  const moduleCount = Math.max(1, Math.round(totalW / module));
  const moduleW = totalW / moduleCount;
  const modules = Array.from({ length: moduleCount }, (_, i) => ({ x: i * moduleW, w: moduleW }));

  return (
    <svg viewBox="0 0 1200 600" className="w-full h-[400px] bg-[#f8f7ff] dark:bg-[#0d0b2b] rounded-xl border">
      {/* Base carcass */}
      <rect x={200} y={200} width={toPx(totalW)} height={toPx(bottomH)} fill="#EDE9FE" stroke="#9B5CF8" />
      {/* Loft carcass */}
      <rect x={200} y={200 - toPx(loftH) - 8} width={toPx(totalW)} height={toPx(loftH)} fill="#D6CCF8" stroke="#9B5CF8" />

      {/* Door panels per module */}
      {modules.map((m, i) => {
        const x = 200 + toPx(m.x);
        const w = toPx(m.w);
        const side = i % 2 === 0 ? "right" : "left";
        const handleX = side === "left" ? x + toPx(20) : x + w - toPx(20);

        return (
          <g key={i}>
            <rect x={x} y={200} width={w} height={toPx(bottomH)} fill="none" stroke="#9B5CF8" strokeWidth={1.5} />
            <line x1={handleX - 8} y1={200 + toPx(bottomH) / 2} x2={handleX + 8} y2={200 + toPx(bottomH) / 2} stroke="#9B5CF8" strokeWidth={2} />
            <rect x={x} y={200 - toPx(loftH) - 8} width={w} height={toPx(loftH)} fill="none" stroke="#9B5CF8" strokeWidth={1.5} />
            <line x1={handleX - 8} y1={200 - toPx(loftH) / 2} x2={handleX + 8} y2={200 - toPx(loftH) / 2} stroke="#9B5CF8" strokeWidth={2} />
            <text x={x + w / 2} y={190 - toPx(loftH)} textAnchor="middle" fontSize="10" fill="#6C6AA8">{Math.round(m.w)} mm</text>
          </g>
        );
      })}

      <text x="50%" y="580" textAnchor="middle" fontSize="12" fill="#6C6AA8">Wardrobe (Elevation View)</text>
    </svg>
  );
}

function WardrobeModel3D() {
  return (
    <mesh position={[0, 0.5, 0]}>
      <boxGeometry args={[2, 2.5, 0.6]} />
      <meshStandardMaterial color="#B9B9B9" metalness={0.3} roughness={0.6} />
    </mesh>
  );
}

export default function WardrobeRender() {
  const mode = useEstimator((s) => s.mode);
  return <UniPreviewCanvas mode={mode} SvgComponent={WardrobeSvg2D} ModelComponent={WardrobeModel3D} />;
}
