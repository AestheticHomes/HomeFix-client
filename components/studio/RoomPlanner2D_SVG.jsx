"use client";

import React, { useState, useCallback, useEffect, useMemo } from "react";

// ---------- Helpers ----------
const dist = (p1, p2) => Math.hypot(p2.x - p1.x, p2.y - p1.y);
const mid = (p1, p2) => ({ x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 });
const toEdge = (pts, i) => [pts[i], pts[(i + 1) % pts.length]];
const clonePts = (pts) => pts.map((p) => ({ ...p }));
const normalize = (x, y) => {
  const len = Math.hypot(x, y) || 1;
  return [x / len, y / len];
};

// Default rectangle
const INITIAL_POINTS = [
  { x: 100, y: 100 },
  { x: 500, y: 100 },
  { x: 500, y: 350 },
  { x: 100, y: 350 },
];

export default function RoomPlanner2D_SVG({
  initialPoints = INITIAL_POINTS,
  gridMinor = 10,
  gridMajor = 100,
  onContinue,
}) {
  const [points, setPoints] = useState(initialPoints);
  const [drag, setDrag] = useState(null);

  const closed = useMemo(() => clonePts(points), [points]);

  // ---------- Drag Handlers ----------
  const startDrag = useCallback(
    (type, index) => (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDrag({
        type,
        index,
        startX: e.clientX,
        startY: e.clientY,
        startPts: clonePts(points),
      });
    },
    [points]
  );

  const moveDrag = useCallback(
    (e) => {
      if (!drag) return;
      const dx = e.clientX - drag.startX;
      const dy = e.clientY - drag.startY;
      const next = clonePts(drag.startPts);

      if (drag.type === "vertex") {
        next[drag.index] = {
          x: drag.startPts[drag.index].x + dx,
          y: drag.startPts[drag.index].y + dy,
        };
      } else if (drag.type === "edge") {
        const [p1, p2] = toEdge(drag.startPts, drag.index);
        const vx = p2.x - p1.x;
        const vy = p2.y - p1.y;
        const [nx, ny] = normalize(-vy, vx);
        const moveAmt = dx * nx + dy * ny;

        next[drag.index].x += nx * moveAmt;
        next[drag.index].y += ny * moveAmt;
        next[(drag.index + 1) % next.length].x += nx * moveAmt;
        next[(drag.index + 1) % next.length].y += ny * moveAmt;
      }
      setPoints(next);
    },
    [drag]
  );

  const endDrag = useCallback(() => setDrag(null), []);

  useEffect(() => {
    window.addEventListener("mousemove", moveDrag);
    window.addEventListener("mouseup", endDrag);
    return () => {
      window.removeEventListener("mousemove", moveDrag);
      window.removeEventListener("mouseup", endDrag);
    };
  }, [moveDrag, endDrag]);

  // ---------- Measurement Edit ----------
  const onEdgeLengthChange = useCallback(
    (i, val) => {
      const newLen = parseFloat(val);
      if (Number.isNaN(newLen) || newLen <= 0) return;

      const next = clonePts(points);
      const [p1, p2] = toEdge(points, i);
      const vx = p2.x - p1.x;
      const vy = p2.y - p1.y;
      const len = dist(p1, p2);
      const sx = vx / len;
      const sy = vy / len;

      next[(i + 1) % points.length] = {
        x: p1.x + sx * newLen,
        y: p1.y + sy * newLen,
      };
      setPoints(next);
    },
    [points]
  );

  // ---------- Render Helpers ----------
  const polyPts = closed.map((p) => `${p.x},${p.y}`).join(" ");

  const EdgeLengthInput = ({ i }) => {
    const [p1, p2] = toEdge(closed, i);
    const len = dist(p1, p2);
    const m = mid(p1, p2);
    const angle = (Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180) / Math.PI;

    return (
      <foreignObject
        x={m.x - 55}
        y={m.y - 16}
        width="110"
        height="32"
        style={{
          transform: `rotate(${angle}deg)`,
          transformOrigin: `${m.x}px ${m.y}px`,
          pointerEvents: "auto",
        }}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            background: "white",
            border: "1px solid #94a3b8",
            borderRadius: 6,
            padding: "1px 4px",
            boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <input
            type="number"
            step="10"
            min="10"
            tabIndex={0}
            value={Math.round(len)}
            onChange={(e) => onEdgeLengthChange(i, e.target.value)}
            style={{
              width: 60,
              fontSize: 12,
              border: "none",
              outline: "none",
              textAlign: "right",
              background: "transparent",
            }}
            onClick={(e) => e.stopPropagation()}
          />
          <span style={{ fontSize: 11, color: "#475569" }}>mm</span>
        </div>
      </foreignObject>
    );
  };

  const EdgeHandle = ({ i }) => {
    const [p1, p2] = toEdge(closed, i);
    const m = mid(p1, p2);
    return (
      <rect
        x={m.x - 14}
        y={m.y - 14}
        width={28}
        height={28}
        fill="transparent"
        onMouseDown={startDrag("edge", i)}
        style={{ cursor: "grab" }}
      />
    );
  };

  const VertexHandle = ({ i }) => {
    const p = closed[i];
    const active = drag?.type === "vertex" && drag.index === i;
    return (
      <circle
        cx={p.x}
        cy={p.y}
        r={7}
        fill={active ? "#ef4444" : "#6366f1"}
        stroke="#fff"
        strokeWidth="1.5"
        onMouseDown={startDrag("vertex", i)}
        style={{ cursor: "grab" }}
      />
    );
  };

  // ---------- Render ----------
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "70vh",
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
        borderRadius: 12,
      }}
    >
      <svg width="100%" height="100%">
        {/* Grid */}
        <defs>
          <pattern id="minor" width={gridMinor} height={gridMinor} patternUnits="userSpaceOnUse">
            <path d={`M ${gridMinor} 0 L 0 0 0 ${gridMinor}`} stroke="#e5e7eb" strokeWidth="0.4" />
          </pattern>
          <pattern id="major" width={gridMajor} height={gridMajor} patternUnits="userSpaceOnUse">
            <rect width={gridMajor} height={gridMajor} fill="url(#minor)" />
            <path d={`M ${gridMajor} 0 L 0 0 0 ${gridMajor}`} stroke="#cbd5e1" strokeWidth="0.8" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#major)" />

        {/* Polygon */}
        <polygon points={polyPts} fill="rgba(99,102,241,0.08)" stroke="#1e293b" strokeWidth="3" />

        {/* Edges + labels */}
        {closed.map((_, i) => (
          <g key={`edge-${i}`}>
            <EdgeHandle i={i} />
            <EdgeLengthInput i={i} />
          </g>
        ))}

        {/* Vertices */}
        {closed.map((_, i) => (
          <VertexHandle key={`v-${i}`} i={i} />
        ))}
      </svg>

      {/* Info Footer */}
      <div
        style={{
          position: "absolute",
          left: 12,
          bottom: 10,
          background: "white",
          border: "1px solid #e2e8f0",
          borderRadius: 8,
          padding: "6px 10px",
          fontSize: 12,
          color: "#475569",
        }}
      >
        💡 Drag <b>corners</b> to change shape • drag <b>edges</b> to move walls •
        click a <b>dimension</b> to type new length • use arrows to nudge values.
      </div>

      {/* Continue button */}
      {onContinue && (
        <button
          onClick={onContinue}
          style={{
            position: "absolute",
            bottom: 10,
            right: 12,
            background: "#9B5CF8",
            color: "white",
            border: "none",
            padding: "8px 14px",
            borderRadius: 8,
            cursor: "pointer",
            boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
          }}
        >
          Continue → 3D
        </button>
      )}
    </div>
  );
}