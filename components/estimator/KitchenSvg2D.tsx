"use client";
// [edith-cad][fine-line][dim-balance][final-v2025.11-CADLight]

/**
 * KitchenSvg2D
 * ---------------------------------------------------------
 * - Reads kitchen dimensions & shape from the estimator store.
 * - Expands the abstract shape schema into wall rectangles.
 * - Renders a CAD-style 2D plan inside PanZoomViewport.
 *
 * Design rules:
 * - All physical units are in millimetres.
 * - PX is just a mm→px drawing scale; PanZoomViewport still
 *   handles fitting and zooming.
 * - This component is PURELY visual. No side effects, no API.
 */

import { expandShape } from "@/components/estimator/blueprintSchema/interpreter";
import { kitchenShapes } from "@/components/estimator/blueprintSchema/kitchenShapes";
import PanZoomViewport from "@/components/estimator/common/PanZoomViewport";
import useEstimator from "@/components/estimator/store/estimatorStore";
import React, { useMemo } from "react";

/* ---------- Drawing constants ---------- */

/** Base mm→px factor for our internal drawing coordinates. */
const PX = 0.22;
const toPx = (mm: number): number => mm * PX;

// Logical SVG viewBox (px)
const VIEW_W = 1200;
const VIEW_H = 600;

// Units (mm)
const FT = 304.8; // 1 foot in mm
const COUNTER_D = 600;
const APPLIANCE_MARGIN = 60;

/**
 * Palette lives here so we can tune contrast in one place.
 * These rely on Edith CSS custom properties.
 */
const COLORS = {
  counter:
    "color-mix(in srgb, var(--accent-primary) 10%, var(--edith-on-primary) 90%)",
  counterStroke: "var(--accent-primary)",
  sink:
    "color-mix(in srgb, var(--accent-info) 25%, var(--edith-on-primary) 75%)",
  hob: "color-mix(in srgb, var(--accent-danger) 22%, var(--edith-on-primary) 78%)",
  dim: "var(--text-muted)",
  text: "var(--text-muted)",
};

/**
 * Adaptive stroke-width helper so lines stay readable across zoom levels.
 */
const sw = (base: number, scale: number): number =>
  Math.max(0.7, base / (scale * 1.3));

/* ---------- SVG defs & helpers ---------- */

function ArrowDef(): React.ReactElement {
  return (
    <defs>
      <marker
        id="cadArrow"
        viewBox="0 0 10 10"
        refX={8}
        refY={5}
        markerWidth={4.5}
        markerHeight={4.5}
        orient="auto"
      >
        <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.dim} />
      </marker>
      <filter id="textGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feMorphology
          operator="dilate"
          radius={0.35}
          in="SourceAlpha"
          result="D"
        />
        <feGaussianBlur in="D" stdDeviation={0.6} result="B" />
        <feMerge>
          <feMergeNode in="B" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  );
}

/**
 * OuterLeaders
 * ------------
 * Draws the big outer dimension lines (overall width / height).
 */
function OuterLeaders({
  bbox,
  scale,
}: {
  bbox: { x: number; y: number; w: number; h: number };
  scale: number;
}): React.ReactElement {
  const offset = Math.max(300, Math.max(bbox.w, bbox.h) * 0.08);
  const ft = (mm: number) => (mm / FT).toFixed(1) + " ft";

  const items = [
    {
      x1: bbox.x,
      y1: bbox.y - offset,
      x2: bbox.x + bbox.w,
      y2: bbox.y - offset,
      label: ft(bbox.w),
    },
    {
      x1: bbox.x + bbox.w + offset,
      y1: bbox.y,
      x2: bbox.x + bbox.w + offset,
      y2: bbox.y + bbox.h,
      label: ft(bbox.h),
    },
  ];

  return (
    <>
      {items.map((d, i) => (
        <g key={i}>
          <line
            x1={toPx(d.x1)}
            y1={toPx(d.y1)}
            x2={toPx(d.x2)}
            y2={toPx(d.y2)}
            stroke={COLORS.dim}
            strokeWidth={sw(1.2, scale)}
            markerEnd="url(#cadArrow)"
            vectorEffect="non-scaling-stroke"
          />
          <text
            x={toPx((d.x1 + d.x2) / 2)}
            y={toPx((d.y1 + d.y2) / 2) - 12 / scale}
            fontSize={15 / scale}
            fontWeight={600}
            textAnchor="middle"
            fill={COLORS.text}
            filter="url(#textGlow)"
          >
            {d.label}
          </text>
        </g>
      ))}
    </>
  );
}

/* ---------- Appliance icons ---------- */

function HobIcon(props: {
  x: number;
  y: number;
  w: number;
  h: number;
  orient: "h" | "v";
  scale: number;
}): React.ReactElement {
  const { x, y, w, h, orient, scale } = props;
  const m = APPLIANCE_MARGIN;
  const ax = x + m;
  const ay = y + m;
  const aw = Math.max(1, w - 2 * m);
  const ah = Math.max(1, h - 2 * m);

  const cols = orient === "h" ? [0.3, 0.7] : [0.35, 0.65];
  const rows = orient === "h" ? [0.35, 0.7] : [0.3, 0.7];
  const pts = rows.flatMap((ry) =>
    cols.map((cx) => [ax + aw * cx, ay + ah * ry] as const)
  );

  return (
    <g>
      <rect
        x={toPx(ax)}
        y={toPx(ay)}
        width={toPx(aw)}
        height={toPx(ah)}
        rx={toPx(16)}
        fill={COLORS.hob}
        stroke={COLORS.counterStroke}
        strokeWidth={sw(1.2, scale)}
        vectorEffect="non-scaling-stroke"
      />
      {pts.map(([cx, cy], i) => (
        <circle
          key={i}
          cx={toPx(cx)}
          cy={toPx(cy)}
          r={toPx(38)}
          fill="none"
          stroke={COLORS.counterStroke}
          strokeWidth={sw(1.2, scale)}
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </g>
  );
}

function SinkIcon(props: {
  x: number;
  y: number;
  w: number;
  h: number;
  orient: "h" | "v";
  inward: "left" | "right" | "up" | "down";
  scale: number;
}): React.ReactElement {
  const { x, y, w, h, orient, inward, scale } = props;

  const m = APPLIANCE_MARGIN;
  const ax = x + m;
  const ay = y + m;
  const aw = Math.max(1, w - 2 * m);
  const ah = Math.max(1, h - 2 * m);

  // tap position is just illustrative
  let tapX = ax + aw * 0.5;
  let tapY = ay + ah * 0.15;

  if (orient === "v") {
    tapX = inward === "right" ? ax + aw * 0.8 : ax + aw * 0.2;
    tapY = ay + ah * 0.2;
  } else {
    tapY = inward === "down" ? ay + ah * 0.85 : ay + ah * 0.15;
  }

  return (
    <g>
      <rect
        x={toPx(ax)}
        y={toPx(ay)}
        width={toPx(aw)}
        height={toPx(ah)}
        rx={toPx(8)}
        fill={COLORS.sink}
        stroke={COLORS.counterStroke}
        strokeWidth={sw(1.2, scale)}
        vectorEffect="non-scaling-stroke"
      />
      <circle
        cx={toPx(ax + aw * 0.25)}
        cy={toPx(ay + ah * 0.25)}
        r={toPx(12)}
        fill={COLORS.counterStroke}
      />
    </g>
  );
}

/* ---------- Placement helper ---------- */

/**
 * Places an appliance rect inside a host rect, respecting margin
 * & preference (near start / near end / centered).
 */
const within = (
  host: { x: number; y: number; w: number; h: number },
  w: number,
  h: number,
  pref: "center" | "nearStart" | "nearEnd" = "center"
): { x: number; y: number } => {
  const m = APPLIANCE_MARGIN;
  const ix = host.x + m;
  const iy = host.y + m;
  const iw = Math.max(1, host.w - 2 * m);
  const ih = Math.max(1, host.h - 2 * m);

  if (host.w >= host.h) {
    // horizontal run
    const y = iy;
    const x =
      pref === "nearStart"
        ? ix + COUNTER_D
        : pref === "nearEnd"
          ? ix + Math.max(0, iw - w - COUNTER_D)
          : ix + Math.max(0, (iw - w) / 2);
    return { x, y };
  } else {
    // vertical run
    const x = ix;
    const y =
      pref === "nearStart"
        ? iy + COUNTER_D
        : pref === "nearEnd"
          ? iy + Math.max(0, ih - h - COUNTER_D)
          : iy + Math.max(0, (ih - h) / 2);
    return { x, y };
  }
};

/* ---------- Main component ---------- */

function KitchenSvg2DInner(): React.ReactElement {
  // Narrow Zustand selectors so unrelated kitchen changes don't trigger full redraws.
  const kitchenLengths = useEstimator((s) => s.kitchen.lengths);
  const kitchenShape = useEstimator((s) => s.kitchen.shape);
  const kitchenFinish = useEstimator((s) => s.kitchen.finish);

  // Convert store lengths (in ft) to mm
  const dims = useMemo(
    () => ({
      A: (kitchenLengths?.A ?? 10) * FT,
      B: (kitchenLengths?.B ?? 10) * FT,
      C: (kitchenLengths?.C ?? 10) * FT,
    }),
    [kitchenLengths]
  );

  const shapeKey = ((kitchenShape as string) || "linear").toLowerCase() as keyof typeof kitchenShapes;
  const schema = kitchenShapes[shapeKey] || kitchenShapes.linear;

  // Expand abstract schema → concrete wall / appliance rectangles.
  const { walls, appliances } = expandShape(schema, dims);

  const sorted = [...walls].sort((a, b) => b.w * b.h - a.w * a.h);
  const long = sorted[0];
  const mid = sorted[1];
  const shortW = sorted[sorted.length - 1];

  const verticalWalls = walls
    .filter((w: { x: number; y: number; w: number; h: number }) => w.h > w.w)
    .sort(
      (a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h: number }) =>
        a.x - b.x
    );
  const horizontalWalls = walls
    .filter((w: { x: number; y: number; w: number; h: number }) => w.w >= w.h)
    .sort(
      (a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h: number }) =>
        a.y - b.y
    );

  let hostForHob = long;
  let hostForSink = shortW;
  let hobPref: "center" | "nearStart" | "nearEnd" = "center";
  let sinkPref: "center" | "nearStart" | "nearEnd" = "nearStart";

  // Appliance placement rules by shape
  switch (shapeKey) {
    case "linear":
      hostForHob = walls[0];
      hostForSink = walls[0];
      hobPref = "nearEnd";
      sinkPref = "nearStart";
      break;
    case "lshape":
      hostForSink = verticalWalls[verticalWalls.length - 1] || shortW;
      sinkPref = "nearEnd";
      hostForHob = horizontalWalls[0] || long;
      break;
    case "u":
      hostForHob = horizontalWalls[0] || mid || long;
      hostForSink = verticalWalls[0] || shortW;
      sinkPref = "nearEnd";
      break;
    case "parallel":
      hostForHob = horizontalWalls[0] || long;
      hostForSink = horizontalWalls[1] || shortW || long;
      sinkPref = "center";
      break;
  }

  const hobOrient: "h" | "v" = hostForHob.w >= hostForHob.h ? "h" : "v";
  let sinkOrient: "h" | "v" = hostForSink.w >= hostForSink.h ? "h" : "v";
  if (shapeKey === "lshape" || shapeKey === "u") sinkOrient = "v";

  const hobSize = {
    w: appliances.hob?.w ?? 700,
    h: appliances.hob?.h ?? COUNTER_D - 120,
  };
  let sinkSize = {
    w: appliances.sink?.w ?? 900,
    h: appliances.sink?.h ?? COUNTER_D - 120,
  };
  if (sinkOrient === "v") {
    sinkSize = { w: sinkSize.h, h: sinkSize.w };
  }

  const hobPos = within(hostForHob, hobSize.w, hobSize.h, hobPref);
  const sinkPos = within(hostForSink, sinkSize.w, sinkSize.h, sinkPref);

  // fitKey tells PanZoomViewport when to refit view.
  const fitKey = `${shapeKey}-${dims.A}-${dims.B}-${dims.C}-${kitchenFinish}`;

  // Bounding box for centering + leaders.
  const fitRects = walls.map(
    (w: { x: number; y: number; w: number; h: number }) => ({
      x: w.x,
      y: w.y,
      w: w.w,
      h: w.h,
    })
  );
  const bbox = fitRects.reduce(
    (
      acc: { x: number; y: number; w: number; h: number },
      r: { x: number; y: number; w: number; h: number }
    ) => ({
      x: Math.min(acc.x, r.x),
      y: Math.min(acc.y, r.y),
      w: Math.max(acc.x + acc.w, r.x + r.w) - Math.min(acc.x, r.x),
      h: Math.max(acc.y + acc.h, r.y + r.h) - Math.min(acc.y, r.y),
    }),
    {
      x: fitRects[0]?.x ?? 0,
      y: fitRects[0]?.y ?? 0,
      w: fitRects[0]?.w ?? 0,
      h: fitRects[0]?.h ?? 0,
    }
  );

  let inward: "left" | "right" | "up" | "down" = "right";
  if (sinkOrient === "v") {
    const midX = bbox.x + bbox.w / 2;
    inward =
      hostForSink.x + hostForSink.w / 2 < midX ? "right" : "left";
  } else {
    const midY = bbox.y + bbox.h / 2;
    inward =
      hostForSink.y + hostForSink.h / 2 < midY ? "down" : "up";
  }

  const centerX = bbox.x + bbox.w / 2;
  const centerY = bbox.y + bbox.h / 2;

  return (
    <PanZoomViewport
      sceneWidth={VIEW_W}
      sceneHeight={VIEW_H}
      fitKey={fitKey}
      autoFitOnMount
      autoFitOnFitKeyChange
    >
      {(transform) => {
        const scale = transform.z;
        const tx = transform.x + VIEW_W / 2 - toPx(centerX) * transform.z;
        const ty = transform.y + VIEW_H / 2 - toPx(centerY) * transform.z;

        return (
          <svg
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            preserveAspectRatio="xMidYMid meet"
            className="absolute inset-0 h-full w-full"
          >
            <ArrowDef />
            <g transform={`translate(${tx}, ${ty}) scale(${scale})`}>
              {/* Counters / walls */}
              {walls.map(
                (
                  r: { x: number; y: number; w: number; h: number },
                  i: number
                ) => (
                  <rect
                    key={i}
                    x={toPx(r.x)}
                    y={toPx(r.y)}
                    width={toPx(r.w)}
                    height={toPx(r.h)}
                    rx={toPx(4)}
                    fill={COLORS.counter}
                    stroke={COLORS.counterStroke}
                    strokeWidth={sw(1.2, scale)}
                    vectorEffect="non-scaling-stroke"
                  />
                )
              )}

              {/* Appliances */}
              <HobIcon
                x={hobPos.x}
                y={hobPos.y}
                w={hobSize.w}
                h={hobSize.h}
                orient={hobOrient}
                scale={scale}
              />
              <SinkIcon
                x={sinkPos.x}
                y={sinkPos.y}
                w={sinkSize.w}
                h={sinkSize.h}
                orient={sinkOrient}
                inward={inward}
                scale={scale}
              />

              {/* Overall dimensions */}
              <OuterLeaders bbox={bbox} scale={scale} />
            </g>
          </svg>
        );
      }}
    </PanZoomViewport>
  );
}

// Memoised so shell re-renders don't force redraw unless store inputs change.
const KitchenSvg2D = React.memo(KitchenSvg2DInner);
KitchenSvg2D.displayName = "KitchenSvg2D";

export default KitchenSvg2D;
