"use client";
import React from "react";
import { motion } from "framer-motion";
import useEstimator from "@/components/estimator/store/estimatorStore";
import PanZoomViewport from "@/components/estimator/common/PanZoomViewport";

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
  const padBreathing = Math.max(160, moduleCount * 18);
  const padLeft = 180 + labelW * 0.25 + padBreathing * 0.5;
  const padRight = 180 + labelW * 0.25 + padBreathing * 0.5;
  const padTop = 200;
  const padBottom = 260;

  // ---- derived canvas size ----
  const vbW = Math.max(totalW + padLeft + padRight, moduleCount * 520);
  const vbH = totalH + padTop + padBottom;

  const marginX = padLeft;
  const floorY = padTop + totalH;
  const frameX = marginX - 30;
  const frameWidth = totalW + 60;
  const frameHeight = totalH + 60;
  const loftBandHeight = totalH * 0.22;
  const baseBandHeight = totalH - loftBandHeight;
  const plinthHeight = totalH * 0.06;
  const doorGap = Math.max(14, Math.min(42, moduleW * 0.12));

  const fitKey = `${wardrobe.widthFt}-${wardrobe.finish}-${wardrobe.loftH}`;

  return (
    <PanZoomViewport sceneWidth={vbW} sceneHeight={vbH} fitKey={fitKey} autoFitOnMount autoFitOnFitKeyChange>
      {(transform) => (
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${vbW} ${vbH}`}
          preserveAspectRatio="xMidYMid meet"
          className="absolute inset-0 w-full h-full rounded-xl bg-[var(--surface-card)] dark:bg-[var(--surface-card-dark)]"
        >
      {/* defs */}
      <defs>
        <linearGradient id="wallGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity="0.12" />
          <stop offset="100%" stopColor="var(--edith-on-primary)" stopOpacity="0.22" />
        </linearGradient>
        <linearGradient id="floorShadow" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--accent-tertiary)" stopOpacity="0" />
          <stop offset="50%" stopColor="var(--accent-tertiary)" stopOpacity="1" />
          <stop offset="100%" stopColor="var(--accent-tertiary)" stopOpacity="0" />
        </linearGradient>
        <marker id="arrow" markerWidth="12" markerHeight="8" refX="6" refY="4" orient="auto">
          <path d="M0,0 L12,4 L0,8 Z" fill="#93c5fd" />
        </marker>
      </defs>

        {/* centered content */}
        <g transform={`translate(${transform.x},${transform.y}) scale(${transform.z})`}>
        {/* backdrop */}
          <rect
            x={marginX - 80}
            y={padTop - 80}
            width={totalW + 160}
            height={totalH + 200}
            fill="url(#wallGrad)"
            rx="10"
          />

          {/* outer frame */}
          <rect
            x={frameX}
            y={padTop - 10}
            width={frameWidth}
            height={frameHeight + 10}
            fill="none"
            stroke="#a5b4fc"
            strokeWidth={1.6}
            strokeOpacity={0.35}
            vectorEffect="non-scaling-stroke"
            rx={6}
          />
          {/* frame lighting */}
          <line
            x1={frameX}
            y1={padTop - 10}
            x2={frameX + frameWidth}
            y2={padTop - 10}
            stroke="color-mix(in srgb, #a5b4fc 40%, transparent)"
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
          <line
            x1={frameX}
            x2={frameX}
            y1={padTop - 10}
            y2={padTop + frameHeight}
            stroke="color-mix(in srgb, #a5b4fc 40%, transparent)"
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />

          {/* base plinth */}
          <rect
            x={frameX}
            y={floorY + 10}
            width={frameWidth}
            height={plinthHeight}
            fill="color-mix(in srgb, var(--accent-tertiary) 25%, var(--surface-panel) 75%)"
            stroke="var(--accent-tertiary)"
            strokeWidth={1.2}
            vectorEffect="non-scaling-stroke"
          />

          {/* loft carcass */}
          <rect
            x={marginX}
            y={floorY - baseBandHeight - loftBandHeight}
            width={totalW}
            height={loftBandHeight}
            fill="color-mix(in srgb, var(--surface-panel) 90%, transparent)"
            stroke="#a5b4fc"
            strokeWidth={1.2}
            vectorEffect="non-scaling-stroke"
          />

          {/* loft divider */}
          <line
            x1={marginX}
            x2={marginX + totalW}
            y1={floorY - baseBandHeight}
            y2={floorY - baseBandHeight}
            stroke="#a5b4fc"
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />

          {/* base carcass */}
          <rect
            x={marginX}
            y={floorY - baseBandHeight}
            width={totalW}
            height={baseBandHeight}
            fill="var(--surface-panel)"
            stroke="#a5b4fc"
            strokeWidth={1.2}
            vectorEffect="non-scaling-stroke"
          />

        {/* per-module doors */}
        {modules.map((m, i) => {
          const x = marginX + m.x;
          const w = m.w;
          const innerX = x + doorGap * 0.5;
          const innerW = w - doorGap;
          const rightHinge = i % 2 === 0;
          const handleOffset = w * 0.18;
          const handleX = rightHinge ? x + w - handleOffset : x + handleOffset;
          const doorFillA =
            "color-mix(in srgb, var(--surface-card) 90%, transparent)";
          const doorFillB =
            "color-mix(in srgb, var(--surface-panel) 90%, var(--accent-primary) 4%)";
          const doorFill = i % 2 === 0 ? doorFillA : doorFillB;

          return (
            <g key={i}>
              {/* base door leaf */}
              <rect
                x={innerX}
            y={floorY - baseBandHeight}
            width={innerW}
            height={baseBandHeight}
            fill={doorFill}
            stroke="#38bdf8"
            strokeOpacity={0.9}
            strokeWidth={1.05}
            vectorEffect="non-scaling-stroke"
            rx={6}
            ry={6}
          />
          {w > 200 && (
                <line
                  x1={innerX + innerW / 2}
                  y1={floorY - baseBandHeight}
                  x2={innerX + innerW / 2}
                  y2={floorY}
              stroke="#4b5563"
              strokeOpacity={0.45}
              strokeWidth={0.7}
              vectorEffect="non-scaling-stroke"
            />
          )}
          <rect
            x={handleX - 4}
                y={floorY - baseBandHeight * 0.6}
                width={8}
                height={baseBandHeight * 0.3}
                rx={3}
                fill="#38bdf8"
                vectorEffect="non-scaling-stroke"
              />

              {/* loft leaf */}
              <rect
                x={innerX}
                y={floorY - baseBandHeight - loftBandHeight}
            width={innerW}
            height={loftBandHeight}
            fill={doorFill}
            stroke="#38bdf8"
            strokeOpacity={0.9}
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
            rx={4}
            ry={4}
          />
          {w > 200 && (
                <line
                  x1={innerX + innerW / 2}
                  y1={floorY - baseBandHeight - loftBandHeight}
                  x2={innerX + innerW / 2}
                  y2={floorY - baseBandHeight}
              stroke="#4b5563"
              strokeOpacity={0.45}
              strokeWidth={0.7}
              vectorEffect="non-scaling-stroke"
            />
          )}
              <rect
                x={handleX - 3}
                y={floorY - baseBandHeight - loftBandHeight * 0.65}
                width={6}
                height={loftBandHeight * 0.3}
                rx={2.5}
                fill="#38bdf8"
                vectorEffect="non-scaling-stroke"
              />

              {/* module width label */}
              <text
                x={x + w / 2}
                y={floorY - baseBandHeight - loftBandHeight - 14}
                textAnchor="middle"
                fontSize="12"
                fill="var(--text-muted)"
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
        {/* width dimension with background label */}
        <g>
          <line
            x1={marginX}
            x2={marginX + totalW}
            y1={floorY + 70}
            y2={floorY + 70}
            stroke="#93c5fd"
            strokeOpacity={0.55}
            strokeWidth={1}
            markerStart="url(#arrow)"
            markerEnd="url(#arrow)"
            vectorEffect="non-scaling-stroke"
          />
          <rect
            x={marginX + totalW / 2 - 50}
            y={floorY + 78}
            width={100}
            height={24}
            rx={6}
            fill="color-mix(in srgb, var(--surface-panel) 90%, transparent)"
            stroke="#93c5fd"
            strokeOpacity={0.55}
            strokeWidth={0.9}
            vectorEffect="non-scaling-stroke"
          />
          <text
            x={marginX + totalW / 2}
            y={floorY + 94}
            textAnchor="middle"
            fontSize="12"
            fontWeight="600"
            fill="var(--text-primary)"
            vectorEffect="non-scaling-stroke"
          >
            {(totalW / 304.8).toFixed(1)} ft
          </text>
        </g>

        {/* total height dimension */}
        <g>
          <line
            x1={marginX - 70}
            x2={marginX - 70}
            y1={floorY}
            y2={floorY - totalH}
            stroke="#93c5fd"
            strokeOpacity={0.55}
            strokeWidth={1}
            markerStart="url(#arrow)"
            markerEnd="url(#arrow)"
            vectorEffect="non-scaling-stroke"
          />
          <rect
            x={marginX - 130}
            y={floorY - totalH / 2 - 12}
            width={82}
            height={24}
            rx={6}
            fill="color-mix(in srgb, var(--surface-panel) 90%, transparent)"
            stroke="#93c5fd"
            strokeOpacity={0.55}
            strokeWidth={0.9}
            vectorEffect="non-scaling-stroke"
          />
          <text
            x={marginX - 90}
            y={floorY - totalH / 2 + 4}
            textAnchor="end"
            fontSize="12"
            fontWeight="600"
            fill="var(--text-primary)"
            vectorEffect="non-scaling-stroke"
          >
            {(totalH / 304.8).toFixed(1)} ft
          </text>
        </g>
      </g>
        </svg>
      )}
    </PanZoomViewport>
  );
}
