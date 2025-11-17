"use client";

import React, { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, Text, Grid, Float, Stars } from "@react-three/drei";
import { motion } from "framer-motion";
import Link from "next/link";
import { useTheme } from "next-themes";
import StudioTipsStrip from "@/components/studio/StudioTipsStrip";
import { useInitialCategory } from "@/lib/useInitialCategory";

/* ===========================
   3D PRIMITIVES (no GLBs needed)
   =========================== */

// Simple crane made from boxes + cylinder + animated hook
function Crane({ position = [0, 0, 0] }) {
  const boomRef = useRef();
  const hookRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    // gentle boom sway
    if (boomRef.current) boomRef.current.rotation.z = Math.sin(t * 0.5) * 0.04;
    // hook bob
    if (hookRef.current) hookRef.current.position.y = -0.6 - Math.sin(t * 1.2) * 0.12;
  });

  return (
    <group position={position}>
      {/* tower */}
      <mesh position={[0, 2.5, 0]}>
        <boxGeometry args={[0.3, 5, 0.3]} />
        <meshStandardMaterial color="#E7C66D" roughness={0.5} metalness={0.2} />
      </mesh>

      {/* counterweight */}
      <mesh position={[-0.8, 4.5, 0]}>
        <boxGeometry args={[0.6, 0.4, 0.6]} />
        <meshStandardMaterial color="#6b7280" roughness={0.8} />
      </mesh>

      {/* boom */}
      <group ref={boomRef} position={[0, 5, 0]}>
        <mesh position={[1.4, 0, 0]}>
          <boxGeometry args={[3, 0.15, 0.15]} />
          <meshStandardMaterial color="#E7C66D" metalness={0.2} roughness={0.5} />
        </mesh>

        {/* cable */}
        <mesh position={[2.8, -0.4, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.8, 12]} />
          <meshStandardMaterial color="#222" />
        </mesh>

        {/* hook */}
        <group ref={hookRef} position={[2.8, -0.8, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[0.06, 0.02, 12, 24]} />
            <meshStandardMaterial color="#111" />
          </mesh>
          <mesh position={[0, -0.08, 0]}>
            <boxGeometry args={[0.06, 0.12, 0.06]} />
            <meshStandardMaterial color="#111" />
          </mesh>
        </group>
      </group>
    </group>
  );
}

// Simple bulldozer: body + blade + tracks with a tiny wobble
function Bulldozer({ position = [0, 0, 0], heading = 0 }) {
  const g = useRef();
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (g.current) g.current.rotation.z = Math.sin(t * 2) * 0.005;
  });
  return (
    <group ref={g} position={position} rotation={[0, heading, 0]}>
      {/* body */}
      <mesh position={[0, 0.35, 0]}>
        <boxGeometry args={[0.9, 0.4, 0.6]} />
        <meshStandardMaterial color="#facc15" roughness={0.5} metalness={0.1} />
      </mesh>
      {/* cab */}
      <mesh position={[-0.15, 0.6, 0]}>
        <boxGeometry args={[0.4, 0.25, 0.4]} />
        <meshStandardMaterial color="#374151" roughness={0.6} />
      </mesh>
      {/* blade */}
      <mesh position={[0.55, 0.25, 0]}>
        <boxGeometry args={[0.05, 0.25, 0.7]} />
        <meshStandardMaterial color="#9ca3af" roughness={0.8} />
      </mesh>
      {/* tracks */}
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[0.95, 0.12, 0.7]} />
        <meshStandardMaterial color="#111827" />
      </mesh>
    </group>
  );
}

// Animated letter group: builds the phrase with slight per-letter motion
function ConstructionText({ liftingIndex = 5 }) {
  const phrase = "UNDER CONSTRUCTION";
  const letters = useMemo(() => phrase.split(""), []);
  const group = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (group.current) group.current.position.y = Math.sin(t * 0.5) * 0.02;
  });

  return (
    <group ref={group} position={[0, 0.9, 0]}>
      {letters.map((ch, i) => {
        // space between words
        if (ch === " ") return null;

        // grid layout-ish
        const x = -4.6 + i * 0.55 - (i >= 5 ? 0.55 : 0); // compensate for space after "UNDER"
        const isLifted = i === liftingIndex; // crane lifts the "O" in "CONSTRUCTION" (index 6 overall incl space)

        return (
          <Float key={i} speed={isLifted ? 0.5 : 0.3} rotationIntensity={isLifted ? 0.3 : 0.1} floatIntensity={isLifted ? 0.7 : 0.25}>
            <Text
              position={[x, isLifted ? 0.25 : 0, 0]}
              fontSize={0.48}
              letterSpacing={0.02}
              color={isLifted ? "#ec6ecf" : "#5a5df0"}
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.01}
              outlineColor="black"
              outlineOpacity={0.35}
            >
              {ch}
            </Text>
          </Float>
        );
      })}
    </group>
  );
}

// Tiny floating dust motes
function Dust() {
  return <Stars radius={30} depth={20} count={800} factor={0.3} saturation={0} fade speed={0.4} />;
}

/* ===========================
   MAIN SCENE
   =========================== */

function SiteScene() {
  // bulldozer small path animation
  const dozerRef = useRef();
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (dozerRef.current) {
      const x = -2 + Math.sin(t * 0.4) * 1.6;
      dozerRef.current.position.x = x;
    }
  });

  return (
    <>
      {/* lights */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[4, 6, 3]} intensity={0.7} />
      <spotLight position={[-6, 7, 4]} intensity={0.45} angle={0.45} penumbra={0.5} castShadow />

      {/* world */}
      <Environment preset="city" />
      <Grid
        position={[0, 0, 0]}
        args={[20, 20]}
        cellSize={0.6}
        cellThickness={0.6}
        sectionSize={3}
        sectionThickness={1}
        sectionColor={"#4338ca"}
        cellColor={"#6d28d9"}
        fadeDistance={35}
        fadeStrength={1}
        infiniteGrid
      />

      {/* actors */}
      <Crane position={[1.6, 0, 0]} />
      <group ref={dozerRef}>
        <Bulldozer position={[-2, 0, 0.6]} heading={Math.PI / 2} />
      </group>
      <ConstructionText liftingIndex={6 /* the 'O' in CONSTRUCTION */} />

      {/* ambience */}
      <Dust />
    </>
  );
}

/* ===========================
   PAGE
   =========================== */

export default function StudioPage() {
  const { resolvedTheme } = useTheme();
  const [cosmos, setCosmos] = useState({
    space: "#f7f9ff",
    fog: "#e2e8f0",
  });
  useInitialCategory();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const root = getComputedStyle(document.documentElement);
    const spaceToken =
      root
        .getPropertyValue(
          resolvedTheme === "dark"
            ? "--cosmos-space-dark"
            : "--cosmos-space-light"
        )
        ?.trim() || (resolvedTheme === "dark" ? "#0e0b2c" : "#f7f9ff");
    const fogToken =
      root
        .getPropertyValue(
          resolvedTheme === "dark"
            ? "--cosmos-fog-dark"
            : "--cosmos-fog-light"
        )
        ?.trim() || (resolvedTheme === "dark" ? "#0c0f2c" : "#e2e8f0");
    setCosmos({ space: spaceToken, fog: fogToken });
  }, [resolvedTheme]);

  return (
    <div
      className="relative w-full h-[calc(100vh-64px)] overflow-hidden"
      style={{
        background:
          "radial-gradient(circle at 15% 15%, color-mix(in srgb, var(--aura-light) 65%, transparent), transparent 55%), radial-gradient(circle at 80% 0%, color-mix(in srgb, var(--aura-dark) 45%, transparent), transparent 70%), var(--surface-base)",
      }}
    >
      <StudioTipsStrip />
      {/* Canvas */}
      <Canvas
        camera={{ position: [0, 3.2, 6.5], fov: 45 }}
        gl={{ antialias: true }}
        dpr={[1, 2]}
      >
        <color attach="background" args={[cosmos.space]} />
        <fog attach="fog" args={[cosmos.fog, 12, 26]} />
        <SiteScene />
        <OrbitControls
          enablePan
          enableZoom
          enableRotate
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={(5 * Math.PI) / 6}
          maxDistance={14}
          minDistance={3.5}
        />
      </Canvas>

      {/* Overlay UI */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-end p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="pointer-events-auto w-full max-w-xl"
        >
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-panel)] dark:bg-[var(--surface-panel-dark)] backdrop-blur-md px-4 py-3 shadow-[0_20px_40px_rgba(0,0,0,0.15)]">
            <p className="text-center sm:text-left text-sm text-[var(--text-primary)]">
              🛠️ <span className="font-semibold">HomeFix Studio</span> is under construction — crane & dozers at work.
            </p>
            <Link
              href="/estimator"
              className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold
                         text-white shadow-md transition
                         bg-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/90"
            >
              Try Online Estimator →
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
