"use client";
import React from "react";
import { motion } from "framer-motion";
import useEstimator from "@/components/estimator/store/estimatorStore";

export default function WardrobeSvg2D() {
  const wardrobe = useEstimator((s) => s.wardrobe);

  // ---- inputs in mm ----
  const totalW = (wardrobe.widthFt || 9) * 304.8;
  const baseH = (wardrobe.baseH || 7) * 304.8;
  const loftH = (wardrobe.loftH || 3) * 304.8;
  const gapTopBetween = 8;
  const totalH = baseH + loftH + gapTopBetween;

  // ---- module logic ----
  const nominalModule = 450;
  const moduleCount = Math.max(1, Math.round(totalW / nominalModule));
  const moduleW = totalW / moduleCount;
  const modules = Array.from({ length: moduleCount }, (_, i) => ({
    x: i * moduleW,
    w: moduleW,
  }));

  // ---- dynamic padding (adaptive to text width) ----
  const labelW = Math.round(totalW).toString().length * 10;
  const padLeft = 180 + labelW * 0.25;
  const padRight = 120 + labelW * 0.25;
  const padTop = 140;
  const padBottom = 220;

  // ---- derived canvas size ----
  const vbW = totalW + padLeft + padRight;
  const vbH = totalH + padTop + padBottom;

  const marginX = padLeft;
  const floorY = padTop + totalH;

  // ---- center offset for canvas ----
  const offsetX = (vbW - (totalW + padLeft + padRight)) / 2;
  const offsetY = (vbH - (totalH + padTop + padBottom)) / 2;

  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${vbW} ${vbH}`}
      preserveAspectRatio="xMidYMid meet"
      className="w-full h-full rounded-xl bg-[#f8f7ff] dark:bg-[#0d0b2b]"
    >
      {/* defs */}
      <defs>
        <linearGradient id="wallGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#cfd0ff" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.25" />
        </linearGradient>
        <linearGradient id="floorShadow" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#6C6AA8" stopOpacity="0" />
          <stop offset="50%" stopColor="#6C6AA8" stopOpacity="1" />
          <stop offset="100%" stopColor="#6C6AA8" stopOpacity="0" />
        </linearGradient>
        <marker id="arrow" markerWidth="12" markerHeight="8" refX="6" refY="4" orient="auto">
          <path d="M0,0 L12,4 L0,8 Z" fill="#6C6AA8" />
        </marker>
      </defs>

      {/* centered content */}
      <g transform={`translate(${offsetX},${offsetY})`}>
        {/* backdrop */}
        <rect
          x={marginX - 60}
          y={padTop - 60}
          width={totalW + 120}
          height={totalH + 120}
          fill="url(#wallGrad)"
          rx="8"
        />

        {/* loft carcass */}
        <rect
          x={marginX}
          y={floorY - baseH - loftH - gapTopBetween}
          width={totalW}
          height={loftH}
          fill="#D8CFF9"
          stroke="#8B5CF6"
          strokeWidth={1.4}
          vectorEffect="non-scaling-stroke"
        />

        {/* base carcass with quantum aura pulse */}
        <motion.rect
          x={marginX}
          y={floorY - baseH}
          width={totalW}
          height={baseH}
          fill="#EDE9FE"
          stroke="#8B5CF6"
          strokeWidth={1.4}
          vectorEffect="non-scaling-stroke"
          animate={{ opacity: [0.9, 1, 0.9] }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* per-module doors */}
        {modules.map((m, i) => {
          const x = marginX + m.x;
          const w = m.w;
          const rightHinge = i % 2 === 0;
          const handleX = rightHinge ? x + w - 14 : x + 14;
          const hingeX = rightHinge ? x + w - 4 : x + 4;
          const doorFill = i % 2 === 0 ? "#F3EEFF" : "#F8F5FF";

          return (
            <g key={i}>
              {/* base door leaf */}
              <rect
                x={x}
                y={floorY - baseH}
                width={w}
                height={baseH}
                fill={doorFill}
                stroke="#9B5CF8"
                strokeWidth={1.2}
                vectorEffect="non-scaling-stroke"
              />
              {/* hinge marker & handle */}
              <circle
                cx={hingeX}
                cy={floorY - baseH / 2}
                r={2.4}
                fill="#9B5CF8"
                vectorEffect="non-scaling-stroke"
              />
              <line
                x1={handleX - 5}
                y1={floorY - baseH / 2}
                x2={handleX + 5}
                y2={floorY - baseH / 2}
                stroke="#9B5CF8"
                strokeWidth={2}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />

              {/* loft leaf */}
              <rect
                x={x}
                y={floorY - baseH - loftH - gapTopBetween}
                width={w}
                height={loftH}
                fill={doorFill}
                stroke="#9B5CF8"
                strokeWidth={1.2}
                vectorEffect="non-scaling-stroke"
              />
              <line
                x1={handleX - 4}
                y1={floorY - baseH - loftH / 2 - gapTopBetween}
                x2={handleX + 4}
                y2={floorY - baseH - loftH / 2 - gapTopBetween}
                stroke="#9B5CF8"
                strokeWidth={2}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />

              {/* module width label */}
              <text
                x={x + w / 2}
                y={floorY - baseH - loftH - gapTopBetween - 16}
                textAnchor="middle"
                fontSize="12"
                fill="#6C6AA8"
                vectorEffect="non-scaling-stroke"
              >
                {Math.round(w)} mm
              </text>
            </g>
          );
        })}

        {/* ground shadow line */}
        <line
          x1={marginX - 30}
          x2={marginX + totalW + 30}
          y1={floorY + 12}
          y2={floorY + 12}
          stroke="url(#floorShadow)"
          strokeWidth={3}
          opacity="0.35"
          vectorEffect="non-scaling-stroke"
        />

        {/* total width dimension */}
        <g>
          <line
            x1={marginX}
            x2={marginX + totalW}
            y1={floorY + 70}
            y2={floorY + 70}
            stroke="#6C6AA8"
            strokeWidth={1}
            markerStart="url(#arrow)"
            markerEnd="url(#arrow)"
            vectorEffect="non-scaling-stroke"
          />
          <text
            x={marginX + totalW / 2}
            y={floorY + 95}
            textAnchor="middle"
            fontSize="13"
            fill="#6C6AA8"
            vectorEffect="non-scaling-stroke"
          >
            {Math.round(totalW)} mm
          </text>
        </g>

        {/* total height dimension */}
        <g>
          <line
            x1={marginX - 70}
            x2={marginX - 70}
            y1={floorY}
            y2={floorY - totalH}
            stroke="#6C6AA8"
            strokeWidth={1}
            markerStart="url(#arrow)"
            markerEnd="url(#arrow)"
            vectorEffect="non-scaling-stroke"
          />
          <text
            x={marginX - 80}
            y={floorY - totalH / 2}
            textAnchor="end"
            fontSize="13"
            fill="#6C6AA8"
            vectorEffect="non-scaling-stroke"
          >
            {Math.round(totalH)} mm
          </text>
        </g>
      </g>
    </svg>
  );
}
