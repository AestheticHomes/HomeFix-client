"use client";

import React, {
  useRef,
  useState,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stage, Environment } from "@react-three/drei";
import { motion } from "framer-motion";
import useEstimator from "@/components/estimator/store/estimatorStore";

type ResolveModelURL = (path: string) => Promise<string>;

export type PreviewModelProps = {
  resolveModelURL?: ResolveModelURL;
};

type PreviewProps = {
  SvgComponent?: React.ComponentType<Record<string, never>>;
  ModelComponent?: React.ComponentType<PreviewModelProps>;
  title?: string;
  showTitle?: boolean;
};

const SUPABASE_BASE =
  "https://<YOUR-PROJECT-ID>.supabase.co/storage/v1/object/public/models";

const resolveModelURL: ResolveModelURL = async (path) => {
  try {
    const res = await fetch(path, { method: "HEAD" });
    if (res.ok) return path;
  } catch {
    /* noop — fallback below */
  }
  return `${SUPABASE_BASE}${path}`;
};

const PANEL_SURFACE =
  "color-mix(in srgb, var(--surface-panel) 95%, transparent)";

const WATERMARK_COLOR =
  "color-mix(in srgb, var(--accent-primary) 80%, transparent)";

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
        className="relative h-8 w-[118px] rounded-full border border-[var(--border-soft)] bg-[var(--surface-panel)] dark:bg-[var(--surface-panel-dark)] backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.12)] flex items-center justify-between px-4 overflow-hidden transition-colors duration-300"
      >
        <div
          className={`absolute inset-0 rounded-full transition-colors duration-500 ${
            is3d
              ? "bg-[color-mix(in_srgb,var(--accent-secondary)15%,transparent)]"
              : "bg-[color-mix(in_srgb,var(--accent-primary)15%,transparent)]"
          }`}
        />
        <div className="absolute inset-0 rounded-full ring-1 ring-[var(--border-subtle)]" />

        <span
          className="z-10 text-[11px] font-semibold transition-opacity"
          style={{ color: "var(--text-primary)", opacity: is3d ? 0.5 : 1 }}
        >
          2D
        </span>
        <span
          className="z-10 text-[11px] font-semibold transition-opacity"
          style={{ color: "var(--text-primary)", opacity: is3d ? 1 : 0.5 }}
        >
          3D
        </span>

        <motion.div
          className="absolute inset-y-[2px] left-[5px] flex items-center justify-start"
          animate={{ x: is3d ? 52 : 0 }}
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
                ? "linear-gradient(135deg,var(--accent-secondary),var(--accent-tertiary))"
                : "linear-gradient(135deg,var(--accent-primary),var(--accent-tertiary))",
              boxShadow: is3d
                ? "0 0 12px color-mix(in srgb,var(--accent-secondary)80%,transparent), 0 0 2px color-mix(in srgb,var(--accent-secondary)85%,transparent) inset"
                : "0 0 12px color-mix(in srgb,var(--accent-primary)80%,transparent), 0 0 2px color-mix(in srgb,var(--accent-primary)85%,transparent) inset",
            }}
            transition={{
              duration: 1.4,
              repeat: Infinity,
              repeatType: "mirror",
            }}
          />
        </motion.div>

        <motion.div
          key={is3d ? "to3d" : "to2d"}
          className="absolute left-1/2 top-1/2 rounded-full"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 1, 0], scale: [0, 1.2, 0] }}
          transition={{ duration: 0.45, ease: "easeOut", delay: 0.05 }}
          style={{
            background: "var(--accent-primary)",
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

type Transform = { x: number; y: number; z: number };

export default function UniPreviewCanvas({
  SvgComponent,
  ModelComponent,
  title,
  showTitle = false,
}: PreviewProps) {
  const mode = useEstimator((s) => s.mode);
  const is3d = mode === "3d";

  const watermarkTone = useMemo(
    () =>
      is3d
        ? "text-[color-mix(in_srgb,var(--accent-secondary)80%,transparent)]"
        : "text-[color-mix(in_srgb,var(--accent-primary)80%,transparent)]",
    [is3d]
  );

  return (
    <div
      className="relative w-full h-[420px] rounded-2xl overflow-hidden border border-[var(--border-muted)] bg-[var(--surface-panel)] dark:bg-[var(--surface-panel-dark)]"
      style={{
        background: PANEL_SURFACE,
        boxShadow:
          "0 28px 90px color-mix(in srgb, var(--text-primary) 9%, transparent)",
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none -z-10 opacity-20 dark:opacity-55"
        style={{
          background:
            "radial-gradient(circle at 20% 20%, color-mix(in srgb, var(--aura-light) 60%, transparent), transparent 65%), radial-gradient(circle at 80% 0%, color-mix(in srgb, var(--aura-dark) 45%, transparent), transparent 70%)",
        }}
      />

      {showTitle && (
        <div className="absolute top-3 left-3 text-xs font-semibold text-[var(--accent-tertiary)]">
          {title} · {mode.toUpperCase()} Mode
        </div>
      )}

      <EntangledDualityToggle />

      {is3d ? (
        <div className="relative w-full h-full">
          <Canvas
            shadows
            camera={{ position: [4, 3, 6], fov: 45 }}
            style={{ background: PANEL_SURFACE }}
          >
            <ambientLight intensity={0.7} />
            <directionalLight position={[5, 10, 5]} intensity={1.2} castShadow />
            <Environment preset="warehouse" background={false} />
            <Stage
              environment="city"
              intensity={0.5}
              shadows="contact"
              adjustCamera
            >
              {ModelComponent ? (
                <ModelComponent resolveModelURL={resolveModelURL} />
              ) : (
                <mesh position={[0, 0.5, 0]}>
                  <boxGeometry args={[2, 1, 1]} />
                  <meshStandardMaterial
                    color="#B9B9B9"
                    metalness={0.3}
                    roughness={0.6}
                  />
                </mesh>
              )}
            </Stage>
            <OrbitControls
              enableZoom
              enablePan
              enableRotate
              zoomSpeed={0.9}
              panSpeed={1.2}
              rotateSpeed={0.95}
            />
          </Canvas>
          <div
            className="pointer-events-none absolute right-3 bottom-2 text-[11px] font-medium"
            style={{ color: WATERMARK_COLOR }}
          >
            HomeFix Studio • 3D View
          </div>
        </div>
      ) : (
        <div className="absolute inset-0 bg-[var(--surface-panel)] dark:bg-[var(--surface-panel-dark)]">
          {SvgComponent ? (
            <SvgComponent />
          ) : (
            <svg viewBox="0 0 1200 600" className="absolute inset-0 w-full h-full">
              <text x="20" y="30" fontSize="12">
                No 2D View
              </text>
            </svg>
          )}
        </div>
      )}

      <div
        className={`pointer-events-none absolute right-3 bottom-2 text-[11px] font-medium select-none ${watermarkTone}`}
      >
        HomeFix Studio
      </div>
    </div>
  );
}
