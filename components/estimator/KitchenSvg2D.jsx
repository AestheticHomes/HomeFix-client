"use client";
// [edith-cad][fine-line][dim-balance][final-v2025.11-CADLight]
import React, { useMemo } from "react";
import useEstimator from "@/components/estimator/store/estimatorStore";
import { kitchenShapes } from "@/components/estimator/blueprintSchema/kitchenShapes";
import { expandShape } from "@/components/estimator/blueprintSchema/interpreter";
import PanZoomViewport from "@/components/estimator/common/PanZoomViewport";
// adaptive stroke-width helper
const sw = (base, scale) => Math.max(0.7, base / (scale * 1.3));

const PX = 0.22;
const toPx = (mm) => mm * PX;
const VIEW_W = 1200, VIEW_H = 600;
const FT = 304.8;
const COUNTER_D = 600;
const APPLIANCE_MARGIN = 60;

const COLORS = {
  counter: "color-mix(in srgb, var(--accent-primary) 10%, var(--edith-on-primary) 90%)",
  counterStroke: "var(--accent-primary)",
  sink: "color-mix(in srgb, var(--accent-info) 25%, var(--edith-on-primary) 75%)",
  hob: "color-mix(in srgb, var(--accent-danger) 22%, var(--edith-on-primary) 78%)",
  dim: "var(--text-muted)",
  text: "var(--text-muted)",
};

/* ---------- CAD primitives ---------- */
function ArrowDef() {
  return (
    <defs>
      <marker id="cadArrow" viewBox="0 0 10 10" refX="8" refY="5"
        markerWidth="4.5" markerHeight="4.5" orient="auto">
        <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.dim}/>
      </marker>
      <filter id="textGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feMorphology operator="dilate" radius="0.35" in="SourceAlpha" result="D"/>
        <feGaussianBlur in="D" stdDeviation="0.6" result="B"/>
        <feMerge><feMergeNode in="B"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>
  );
}

function OuterLeaders({ bbox, scale }) {
  const offset = Math.max(300, Math.max(bbox.w, bbox.h) * 0.08);
  const ft = (mm) => (mm / FT).toFixed(1) + " ft";
  const items = [
    { x1: bbox.x, y1: bbox.y - offset, x2: bbox.x + bbox.w, y2: bbox.y - offset, label: ft(bbox.w) },
    { x1: bbox.x + bbox.w + offset, y1: bbox.y, x2: bbox.x + bbox.w + offset, y2: bbox.y + bbox.h, label: ft(bbox.h) },
  ];
  return items.map((d, i) => (
    <g key={i}>
      <line
        x1={toPx(d.x1)} y1={toPx(d.y1)} x2={toPx(d.x2)} y2={toPx(d.y2)}
        stroke={COLORS.dim} strokeWidth={sw(1.2, scale)} markerEnd="url(#cadArrow)"
        vectorEffect="non-scaling-stroke"
      />
      <text
        x={toPx((d.x1 + d.x2) / 2)} y={toPx((d.y1 + d.y2) / 2) - 12/scale}
        fontSize={15/scale} fontWeight="600" textAnchor="middle"
        fill={COLORS.text} filter="url(#textGlow)"
      >
        {d.label}
      </text>
    </g>
  ));
}

/* ---------- Appliance icons ---------- */
function HobIcon({ x, y, w, h, orient, scale }) {
  const m = APPLIANCE_MARGIN;
  const ax = x + m, ay = y + m;
  const aw = Math.max(1, w - 2*m), ah = Math.max(1, h - 2*m);
  const cols = orient === "h" ? [0.3, 0.7] : [0.35, 0.65];
  const rows = orient === "h" ? [0.35, 0.7] : [0.3, 0.7];
  const pts = rows.flatMap(ry => cols.map(cx => [ax + aw*cx, ay + ah*ry]));
  return (
    <g>
      <rect
        x={toPx(ax)} y={toPx(ay)} width={toPx(aw)} height={toPx(ah)} rx={toPx(16)}
        fill={COLORS.hob} stroke={COLORS.counterStroke} strokeWidth={sw(1.2, scale)}

        vectorEffect="non-scaling-stroke"
      />
      {pts.map(([cx, cy], i) => (
        <circle key={i}
          cx={toPx(cx)} cy={toPx(cy)} r={toPx(38)} fill="none"
          stroke={COLORS.counterStroke} strokeWidth={sw(1.2, scale)}

          vectorEffect="non-scaling-stroke"
        />
      ))}
    </g>
  );
}

function SinkIcon({ x, y, w, h, orient, inward, scale }) {
  const m = APPLIANCE_MARGIN;
  const ax = x + m, ay = y + m;
  const aw = Math.max(1, w - 2*m), ah = Math.max(1, h - 2*m);

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
        x={toPx(ax)} y={toPx(ay)} width={toPx(aw)} height={toPx(ah)} rx={toPx(8)}
        fill={COLORS.sink} stroke={COLORS.counterStroke} strokeWidth={sw(1.2, scale)}

        vectorEffect="non-scaling-stroke"
      />
      <circle cx={toPx(ax + aw*0.25)} cy={toPx(ay + ah*0.25)} r={toPx(12)}
              fill={COLORS.counterStroke}/>
    </g>
  );
}

/* ---------- Helpers ---------- */
const within = (host, w, h, pref = "center") => {
  const m = APPLIANCE_MARGIN;
  const ix = host.x + m, iy = host.y + m;
  const iw = Math.max(1, host.w - 2*m), ih = Math.max(1, host.h - 2*m);
  if (host.w >= host.h) {
    const y = iy;
    const x =
      pref === "nearStart" ? ix + COUNTER_D :
      pref === "nearEnd"   ? ix + Math.max(0, iw - w - COUNTER_D) :
                              ix + Math.max(0, (iw - w) / 2);
    return { x, y };
  } else {
    const x = ix;
    const y =
      pref === "nearStart" ? iy + COUNTER_D :
      pref === "nearEnd"   ? iy + Math.max(0, ih - h - COUNTER_D) :
                              iy + Math.max(0, (ih - h) / 2);
    return { x, y };
  }
};

/* ---------- Main ---------- */
export default function KitchenSvg2D() {
  const kitchen = useEstimator((s) => s.kitchen);

  const dims = useMemo(() => ({
    A: (kitchen.lengths?.A ?? 10) * FT,
    B: (kitchen.lengths?.B ?? 10) * FT,
    C: (kitchen.lengths?.C ?? 10) * FT,
  }), [kitchen.lengths]);

  const shapeKey = (kitchen.shape || "linear").toLowerCase();
  const schema = kitchenShapes[shapeKey] || kitchenShapes.linear;
  const { walls, appliances } = expandShape(schema, dims);

  const sorted = [...walls].sort((a,b)=>(b.w*b.h)-(a.w*a.h));
  const long = sorted[0], mid = sorted[1], shortW = sorted[sorted.length-1];
  const verticalWalls   = walls.filter(w=>w.h>w.w).sort((a,b)=>a.x-b.x);
  const horizontalWalls = walls.filter(w=>w.w>=w.h).sort((a,b)=>a.y-b.y);

  let hostForHob = long, hostForSink = shortW;
  let hobPref="center", sinkPref="nearStart";

  switch(shapeKey){
    case "linear": hostForHob=walls[0]; hostForSink=walls[0]; hobPref="nearEnd"; sinkPref="nearStart"; break;
    case "lshape": hostForSink=verticalWalls[verticalWalls.length-1]||shortW; sinkPref="nearEnd"; hostForHob=horizontalWalls[0]||long; break;
    case "u": hostForHob=horizontalWalls[0]||mid||long; hostForSink=verticalWalls[0]||shortW; sinkPref="nearEnd"; break;
    case "parallel": hostForHob=horizontalWalls[0]||long; hostForSink=horizontalWalls[1]||shortW||long; sinkPref="center"; break;
  }

  const hobOrient  = hostForHob.w>=hostForHob.h ? "h" : "v";
  let sinkOrient   = hostForSink.w>=hostForSink.h ? "h" : "v";
  if (shapeKey==="lshape"||shapeKey==="u") sinkOrient="v";

  const hobSize  = { w: appliances.hob?.w  ?? 700,  h: appliances.hob?.h  ?? COUNTER_D-120 };
  let sinkSize   = { w: appliances.sink?.w ?? 900,  h: appliances.sink?.h ?? COUNTER_D-120 };
  if(sinkOrient==="v") sinkSize={ w:sinkSize.h, h:sinkSize.w };

  const hobPos  = within(hostForHob, hobSize.w, hobSize.h, hobPref);
  const sinkPos = within(hostForSink, sinkSize.w, sinkSize.h, sinkPref);

  const fitKey = `${kitchen.shape}-${dims.A}-${dims.B}-${dims.C}-${kitchen.finish}`;

  const fitRects = walls.map(w=>({x:w.x,y:w.y,w:w.w,h:w.h}));
  const bbox = fitRects.reduce(
    (acc, r) => ({
      x: Math.min(acc.x, r.x),
      y: Math.min(acc.y, r.y),
      w: Math.max(acc.x + acc.w, r.x + r.w) - Math.min(acc.x, r.x),
      h: Math.max(acc.y + acc.h, r.y + r.h) - Math.min(acc.y, r.y),
    }),
    { x: fitRects[0]?.x ?? 0, y: fitRects[0]?.y ?? 0, w: fitRects[0]?.w ?? 0, h: fitRects[0]?.h ?? 0 }
  );

  let inward="right";
  if(sinkOrient==="v"){
    const midX=bbox.x+bbox.w/2;
    inward=(hostForSink.x+hostForSink.w/2)<midX?"right":"left";
  }else{
    const midY=bbox.y+bbox.h/2;
    inward=(hostForSink.y+hostForSink.h/2)<midY?"down":"up";
  }

  const centerX = bbox.x + bbox.w / 2;
  const centerY = bbox.y + bbox.h / 2;

  return (
    <PanZoomViewport sceneWidth={VIEW_W} sceneHeight={VIEW_H} fitKey={fitKey} autoFitOnMount autoFitOnFitKeyChange>
      {(transform) => {
        const scale = transform.z;
        const tx = transform.x - toPx(centerX);
        const ty = transform.y - toPx(centerY);
        return (
          <svg
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            preserveAspectRatio="xMidYMid meet"
            className="absolute inset-0 w-full h-full"
          >
            <ArrowDef/>
            <g transform={`translate(${tx}, ${ty}) scale(${scale})`}>
              {walls.map((r,i)=>(
                <rect key={i}
                  x={toPx(r.x)} y={toPx(r.y)} width={toPx(r.w)} height={toPx(r.h)} rx={toPx(4)}
                  fill={COLORS.counter} stroke={COLORS.counterStroke}
                  strokeWidth={sw(1.2, scale)} vectorEffect="non-scaling-stroke"
                />
              ))}
              <HobIcon  x={hobPos.x}  y={hobPos.y}  w={hobSize.w}  h={hobSize.h}  orient={hobOrient}  scale={scale}/>
              <SinkIcon x={sinkPos.x} y={sinkPos.y} w={sinkSize.w} h={sinkSize.h} orient={sinkOrient} inward={inward} scale={scale}/>
              <OuterLeaders bbox={bbox} scale={scale}/>
            </g>
          </svg>
        );
      }}
    </PanZoomViewport>
  );
}
