"use client";
import React, { useRef, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stage, Environment } from "@react-three/drei";
import { motion } from "framer-motion";
import useEstimator from "@/components/estimator/store/estimatorStore";

/* 🔮 Supabase-ready model URL resolver (future use) */
const SUPABASE_BASE =
  "https://<YOUR-PROJECT-ID>.supabase.co/storage/v1/object/public/models";
const resolveModelURL = async (path) => {
  try {
    const res = await fetch(path, { method: "HEAD" });
    return res.ok ? path : `${SUPABASE_BASE}${path}`;
  } catch {
    return `${SUPABASE_BASE}${path}`;
  }
};

/* ⚛️ Duality Pill Toggle — centered orb, overlaps inactive label */
function EntangledDualityToggle() {
  const mode = useEstimator((s) => s.mode);
  const setMode = useEstimator((s) => s.setMode);
  const is3d = mode === "3d";

  return (
    <div className="absolute top-3 right-3 z-20">
      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={() => setMode(is3d ? "2d" : "3d")}
        aria-label={is3d ? "Switch to 2D Plan" : "Switch to 3D View"}
        className="relative h-8 w-[118px] rounded-full border border-white/20 bg-white/10 backdrop-blur-md shadow-md flex items-center justify-between px-4 overflow-hidden"
      >
        {/* background tint */}
        <div
          className={`absolute inset-0 rounded-full ${
            is3d ? "bg-[#EC6ECF]/10" : "bg-[#5A5DF0]/10"
          }`}
        />
        <div className="absolute inset-0 rounded-full ring-1 ring-white/10" />

        {/* labels */}
        <span
          className={`z-10 text-[11px] font-semibold ${
            is3d ? "text-white/50" : "text-white"
          }`}
        >
          2D
        </span>
        <span
          className={`z-10 text-[11px] font-semibold ${
            is3d ? "text-white" : "text-white/50"
          }`}
        >
          3D
        </span>

        {/* orb track */}
        <motion.div
          className="absolute inset-y-[2px] left-[5px] flex items-center justify-start"
          animate={{
            x: is3d ? 52 : 0,
          }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          style={{
            width: "52px",
            height: "calc(100% - 4px)",
            borderRadius: "9999px",
            pointerEvents: "none",
          }}
        >
          <motion.div
            className="mx-auto flex items-center justify-center"
            animate={{
              width: 14,
              height: 14,
              borderRadius: "9999px",
              background: is3d
                ? "linear-gradient(135deg,#EC6ECF,#B96BFF)"
                : "linear-gradient(135deg,#5A5DF0,#7A7DF7)",
              boxShadow: is3d
                ? "0 0 12px rgba(236,110,207,0.9), 0 0 2px rgba(236,110,207,0.4) inset"
                : "0 0 12px rgba(90,93,240,0.9), 0 0 2px rgba(90,93,240,0.4) inset",
            }}
            transition={{
              duration: 1.4,
              repeat: Infinity,
              repeatType: "mirror",
            }}
          />
        </motion.div>

        {/* tunneling flash */}
        <motion.div
          key={is3d ? "to3d" : "to2d"}
          className="absolute left-1/2 top-1/2 rounded-full"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 1, 0], scale: [0, 1.2, 0] }}
          transition={{ duration: 0.45, ease: "easeOut", delay: 0.05 }}
          style={{
            background: "white",
            width: 18,
            height: 18,
            filter: "blur(3px)",
            pointerEvents: "none",
            transform: "translate(-50%, -50%)",
          }}
        />
      </motion.button>
    </div>
  );
}



/* 🧭 Pan/Zoom wrapper — anchored center, 80–100 % fit */
function PanZoomWrapper({ children }) {
  const ref = useRef(null);
  const [t, setT] = useState({ x: 600, y: 300, z: 1 });
  const fitRef = useRef({ fit: 1, min: 0.05, max: 50 });
  const dragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const fit = Math.min(rect.width / 1200, rect.height / 600);
    const initial = fit * 0.9; // 90 % fill
    fitRef.current = { fit: initial, min: initial * 0.05, max: initial * 50 };
    setT({ x: rect.width / 2, y: rect.height / 2, z: initial });
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onWheel = (e) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const speed = 0.0012;
      const k = Math.exp(-e.deltaY * speed);
      setT((p) => {
        const nextZ = Math.min(fitRef.current.max, Math.max(fitRef.current.min, p.z * k));
        const kz = nextZ / p.z;
        return { x: mx - (mx - p.x) * kz, y: my - (my - p.y) * kz, z: nextZ };
      });
    };
    const onDown = (e) => {
      dragging.current = true;
      last.current = { x: e.clientX, y: e.clientY };
      el.setPointerCapture?.(e.pointerId);
    };
    const onMove = (e) => {
      if (!dragging.current) return;
      const dx = e.clientX - last.current.x;
      const dy = e.clientY - last.current.y;
      last.current = { x: e.clientX, y: e.clientY };
      setT((p) => ({ ...p, x: p.x + dx, y: p.y + dy }));
    };
    const stop = (e) => {
      dragging.current = false;
      el.releasePointerCapture?.(e.pointerId);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", stop);
    el.addEventListener("pointerleave", stop);
    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", stop);
      el.removeEventListener("pointerleave", stop);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="absolute inset-0 overflow-hidden cursor-grab active:cursor-grabbing bg-transparent"
    >
      {children(t)}
    </div>
  );
}

/* 🌌 Main Canvas */
export default function UniPreviewCanvas({
  SvgComponent,
  ModelComponent,
  title,
  showTitle = false,
}) {
  const mode = useEstimator((s) => s.mode);
  const is3d = mode === "3d";

  return (
    <div className="relative w-full h-[420px] rounded-2xl overflow-hidden border border-[#9B5CF8]/20 bg-gradient-to-br from-white/60 to-[#F8F7FF]/50 dark:from-[#0D0B2B]/70 dark:to-[#1B1545]/70">
      {showTitle && (
        <div className="absolute top-3 left-3 text-xs font-semibold text-[#C9A7FF]">
          {title} · {mode.toUpperCase()} Mode
        </div>
      )}

      <EntangledDualityToggle />

      {is3d ? (
        <div className="relative w-full h-full">
          <Canvas shadows camera={{ position: [4, 3, 6], fov: 45 }}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[5, 10, 5]} intensity={1.2} castShadow />
            <Environment preset="warehouse" background={false} />
            <Stage environment="city" intensity={0.5} shadows="contact" adjustCamera>
              {ModelComponent ? (
                <ModelComponent resolveModelURL={resolveModelURL} />
              ) : (
                <mesh position={[0, 0.5, 0]}>
                  <boxGeometry args={[2, 1, 1]} />
                  <meshStandardMaterial color="#B9B9B9" metalness={0.3} roughness={0.6} />
                </mesh>
              )}
            </Stage>
            <OrbitControls enableZoom enablePan enableRotate zoomSpeed={0.9} panSpeed={1.2} rotateSpeed={0.95} />
          </Canvas>
          <div className="pointer-events-none absolute right-3 bottom-2 text-[11px] text-white/75">
            HomeFix Studio • 3D View
          </div>
        </div>
      ) : (
        <PanZoomWrapper>
          {(t) => (
            <svg viewBox="0 0 1200 600" className="absolute inset-0 w-full h-full bg-transparent">
              <g transform={`translate(${t.x}, ${t.y}) scale(${t.z})`}>
                {SvgComponent ? <SvgComponent /> : <text x="0" y="0" fontSize="12">No 2D View</text>}
              </g>
            </svg>
          )}
        </PanZoomWrapper>
      )}

      {/* watermark */}
      <div
        className={`pointer-events-none absolute right-3 bottom-2 text-[11px] font-medium select-none ${
          is3d ? "text-[#EC6ECF]/85" : "text-[#8EA0FF]/85"
        }`}
      >
        HomeFix Studio
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// ✨ Edith Patch — v2025.11  (Alignment Quantum; centered orb + 90 % fit)
// Debug session active — remove footer after final merge
// ─────────────────────────────────────────────
