"use client";

import StudioTipsStrip from "@/components/studio/StudioTipsStrip";
import { Float, Grid, OrbitControls, Stars, Text } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { Canvas, useFrame } from "@react-three/fiber";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import Link from "next/link";
import { FC, Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { MathUtils } from "three";

type Vec3 = [number, number, number];

type Cosmos = {
  space: string;
  fog: string;
};

// ===========================
// Re-usable Primitives (Minimized for brevity, animations retained)
// ===========================

interface CraneProps {
  position?: Vec3;
  isPoweredOn: boolean;
}

const Crane: FC<CraneProps> = ({ position = [0, 0, 0], isPoweredOn }) => {
  const boomRef = useRef<THREE.Group | null>(null);
  const hookRef = useRef<THREE.Group | null>(null);
  const groupRef = useRef<THREE.Group | null>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial | null>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const powerFactor = isPoweredOn ? 1 : 0;

    // Crane & Hook animation logic
    if (boomRef.current) {
      boomRef.current.rotation.z = Math.sin(t * 0.5) * 0.04 * powerFactor;
    }
    if (hookRef.current) {
      hookRef.current.position.z = Math.cos(t * 1.5) * 0.06 * powerFactor;
      hookRef.current.position.y =
        -0.6 - Math.sin(t * 1.2) * 0.18 * powerFactor;
    }

    // Entrance: Drop in
    if (groupRef.current) {
      groupRef.current.position.y = MathUtils.lerp(
        groupRef.current.position.y,
        isPoweredOn ? 0 : -5,
        0.05
      );
    }
    // Pulse
    if (materialRef.current) {
      materialRef.current.emissiveIntensity =
        0.1 + Math.sin(t * 3) * 0.1 * powerFactor;
    }
  });

  // ... (Crane JSX structure remains the same)
  return (
    <group ref={groupRef} position={position}>
      {/* tower */}
      <mesh position={[0, 2.5, 0]}>
        <boxGeometry args={[0.3, 5, 0.3]} />
        <meshStandardMaterial
          ref={materialRef}
          color="#E7C66D"
          roughness={0.5}
          metalness={0.2}
          emissive="#E7C66D"
          emissiveIntensity={0.1}
        />
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
          <meshStandardMaterial
            color="#E7C66D"
            metalness={0.2}
            roughness={0.5}
          />
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
};

interface BulldozerProps {
  position?: Vec3;
  heading?: number;
}
const Bulldozer: FC<BulldozerProps> = ({
  position = [0, 0, 0],
  heading = 0,
}) => {
  const groupRef = useRef<THREE.Group | null>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.z = Math.sin(t * 2) * 0.008;
    }
  });

  // ... (Bulldozer JSX structure remains the same)
  return (
    <group ref={groupRef} position={position} rotation={[0, heading, 0]}>
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
};

interface AnimatedBulldozerProps {
  initialPosition: Vec3;
  heading: number;
  isPoweredOn: boolean;
}

const AnimatedBulldozer: FC<AnimatedBulldozerProps> = ({
  initialPosition,
  heading,
  isPoweredOn,
}) => {
  const dozerRef = useRef<THREE.Group | null>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const powerFactor = isPoweredOn ? 1 : 0;

    if (dozerRef.current) {
      const xOffset = -2 + Math.sin(t * 0.4) * 1.6;

      // Smoother entrance animation (Y-axis drop-in)
      const targetY = initialPosition[1];
      const dropY = MathUtils.lerp(
        dozerRef.current.position.y,
        isPoweredOn ? targetY : targetY - 2,
        0.05
      );

      dozerRef.current.position.set(
        xOffset * powerFactor,
        dropY,
        initialPosition[2]
      );

      dozerRef.current.rotation.y =
        heading + Math.sin(t * 0.4) * 0.05 * powerFactor;
    }
  });

  return (
    <group ref={dozerRef} position={initialPosition}>
      <Bulldozer position={[0, 0, 0]} heading={0} />
    </group>
  );
};

// ... (ConstructionText, Dust, GroundPlate, ScanRing, GlowPillars remain the same)
interface ConstructionTextProps {
  liftingIndex?: number;
}

const ConstructionText: FC<ConstructionTextProps> = ({ liftingIndex = 5 }) => {
  const phrase = "UNDER CONSTRUCTION";
  const letters = useMemo(() => phrase.split(""), []);
  const groupRef = useRef<THREE.Group | null>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(t * 0.5) * 0.02;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0.95, 0]}>
      {letters.map((ch, i) => {
        if (ch === " ") return null;

        const x = -4.6 + i * 0.55 - (i >= 5 ? 0.55 : 0);
        const isLifted = i === liftingIndex;

        return (
          <Float
            key={i}
            speed={isLifted ? 0.5 : 0.3}
            rotationIntensity={isLifted ? 0.3 : 0.1}
            floatIntensity={isLifted ? 0.7 : 0.25}
          >
            <Text
              position={[x, isLifted ? 0.3 : 0, 0]}
              fontSize={0.5}
              letterSpacing={0.02}
              color={isLifted ? "#ec6ecf" : "#5a5df0"}
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.012}
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
};

const Dust: FC = () => (
  <Stars
    radius={30}
    depth={20}
    count={800}
    factor={0.3}
    saturation={0}
    fade
    speed={0.4}
  />
);

const GroundPlate: FC = () => {
  const plateRef = useRef<THREE.Mesh | null>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (plateRef.current) {
      const s = 1 + Math.sin(t * 0.6) * 0.03;
      plateRef.current.scale.set(s, 1, s);
    }
  });

  return (
    <mesh
      ref={plateRef}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -0.001, 0]}
    >
      <circleGeometry args={[5.5, 64]} />
      <meshStandardMaterial
        color="#020617"
        emissive="#4f46e5"
        emissiveIntensity={0.35}
        roughness={0.9}
        metalness={0.1}
      />
    </mesh>
  );
};

const ScanRing: FC = () => {
  const ringRef = useRef<THREE.Mesh | null>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (!ringRef.current) return;

    ringRef.current.rotation.z = t * 0.8;
    const s = 1 + Math.sin(t * 1.4) * 0.05;
    ringRef.current.scale.set(s, 1, s);
  });

  return (
    <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
      <ringGeometry args={[3.4, 3.9, 80]} />
      <meshBasicMaterial
        color="#22d3ee"
        transparent
        opacity={0.5}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

const GlowPillars: FC = () => {
  const groupRef = useRef<THREE.Group | null>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (!groupRef.current) return;
    const s = 1 + Math.sin(t * 1.3) * 0.15;
    groupRef.current.scale.set(1, s, 1);
  });

  const positions: Vec3[] = [
    [-3.2, 0, -2.3],
    [3.1, 0, 2.4],
    [-2.6, 0, 2.1],
  ];

  return (
    <group ref={groupRef}>
      {positions.map(([x, , z], idx) => (
        <mesh key={idx} position={[x, 1.2, z]}>
          <cylinderGeometry args={[0.06, 0.06, 2.4, 16]} />
          <meshStandardMaterial
            color="#1f2937"
            emissive="#6366f1"
            emissiveIntensity={1.7}
            roughness={0.4}
            metalness={0.4}
          />
        </mesh>
      ))}
    </group>
  );
};
// ...

// ===========================
// NEW: Camera Orbit Component
// ===========================

interface CameraOrbitProps {
  // Speed in radians per frame (e.g., 0.005 for a slow orbit)
  speed: number;
}

/**
 * Automatically rotates the OrbitControls around the scene.
 * If the user interacts (drags), the auto-rotation is temporarily stopped.
 */
const CameraOrbit: FC<CameraOrbitProps> = ({ speed }) => {
  useFrame((state, delta) => {
    const controls = state.controls as OrbitControlsImpl | undefined;
    if (!controls) return;

    controls.object.rotation.y += speed * delta * 60;
    controls.update?.();
  });

  return null;
};

/* ===========================
    MAIN SCENE
    =========================== */

interface SiteSceneProps {
  cosmos: Cosmos;
}

const SiteScene: FC<SiteSceneProps> = ({ cosmos }) => {
  const [isSceneReady, setIsSceneReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsSceneReady(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* lights */}
      <ambientLight intensity={0.55} />
      <directionalLight
        position={[4, 6, 3]}
        intensity={0.9}
        color={cosmos.space || "#e5e7eb"}
      />
      <spotLight
        position={[-6, 7, 4]}
        intensity={0.55}
        angle={0.45}
        penumbra={0.5}
        castShadow
      />

      {/* ground + grid */}
      <GroundPlate />
      <ScanRing />
      <GlowPillars />

      <Grid
        position={[0, 0, 0]}
        args={[20, 20]}
        cellSize={0.6}
        cellThickness={0.6}
        sectionSize={3}
        sectionThickness={1}
        sectionColor="#4c1d95"
        cellColor="#6d28d9"
        fadeDistance={30}
        fadeStrength={1}
        infiniteGrid
      />

      {/* actors with sequenced animation */}
      <Crane position={[1.6, 0, 0]} isPoweredOn={isSceneReady} />
      <AnimatedBulldozer
        initialPosition={[-2, 0, 0.6]}
        heading={Math.PI / 2}
        isPoweredOn={isSceneReady}
      />
      <ConstructionText liftingIndex={6} />

      {/* ambience */}
      <Dust />
    </>
  );
};

// ... (useCosmosTheme remains the same)
const useCosmosTheme = (): Cosmos => {
  const { resolvedTheme } = useTheme();
  const [cosmos, setCosmos] = useState<Cosmos>({
    space: "#f7f9ff",
    fog: "#e2e8f0",
  });

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
          resolvedTheme === "dark" ? "--cosmos-fog-dark" : "--cosmos-fog-light"
        )
        ?.trim() || (resolvedTheme === "dark" ? "#0c0f2c" : "#e2e8f0");

    setCosmos({ space: spaceToken, fog: fogToken });
  }, [resolvedTheme]);

  return cosmos;
};
/* ===========================
    PAGE
    =========================== */

const uiVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      delay: 1.5,
      duration: 0.8,
      ease: "easeOut",
    },
  },
};

const StudioPageContent: FC = () => {
  const cosmos = useCosmosTheme();

  return (
    <div
      className="relative w-full h-[calc(100vh-64px)] overflow-hidden"
      style={{
        background:
          "radial-gradient(circle at 15% 15%, color-mix(in srgb, var(--aura-light) 65%, transparent), transparent 55%), radial-gradient(circle at 80% 0%, color-mix(in srgb, var(--aura-dark) 45%, transparent), transparent 70%), var(--surface-base)",
      }}
    >
      <StudioTipsStrip />

      <Canvas
        shadows
        camera={{ position: [0, 3.4, 6.8], fov: 45 }}
        gl={{ antialias: true }}
        dpr={[1, 2]}
      >
        <color attach="background" args={[cosmos.space]} />
        <fog attach="fog" args={[cosmos.fog, 12, 30]} />
        <SiteScene cosmos={cosmos} />

        {/* The OrbitControls component must be rendered to control the camera */}
        <OrbitControls
          enablePan
          enableZoom
          enableRotate
          makeDefault
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={(5 * Math.PI) / 6}
          maxDistance={14}
          minDistance={3.5}
          // The control reference is needed by CameraOrbit
        />

        {/* NEW: Component to automatically rotate the camera */}
        <CameraOrbit speed={0.0005} />
      </Canvas>

      {/* Overlay UI with Framer Motion */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-end p-4 sm:p-6">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={uiVariants}
          className="pointer-events-auto w-full max-w-xl"
        >
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-panel)] dark:bg-[var(--surface-panel-dark)] backdrop-blur-md px-4 py-3 shadow-[0_20px_40px_rgba(0,0,0,0.15)]">
            <p className="text-center sm:text-left text-sm text-[var(--text-primary)]">
              🛠️ <span className="font-semibold">HomeFix Studio</span> is under
              construction — crane &amp; dozers at work in a quantum job site.
            </p>
            <Link
              href="/instant-quote"
              className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-md transition bg-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/90"
            >
              Try Online Estimator →
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default function StudioPage() {
  return (
    <Suspense fallback={null}>
      <StudioPageContent />
    </Suspense>
  );
}
