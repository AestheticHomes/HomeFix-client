"use client";
// [edith-bridge3D][fallback-cube][lightweight-safe]
import React, { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, Html, useGLTF } from "@react-three/drei";
import { Box3, Vector3 } from "three";

function SafeModel({ url = "/models/kitchen.glb" }) {
  const gltf = useGLTF(url);
  const scene = useMemo(() => {
    if (!gltf?.scene) return null;
    const clone = gltf.scene.clone();
    const box = new Box3().setFromObject(clone);
    const center = new Vector3();
    box.getCenter(center);
    clone.position.sub(center);
    return clone;
  }, [gltf]);

  if (!scene) {
    return (
      <mesh>
        <boxGeometry args={[1, 0.3, 1]} />
        <meshStandardMaterial color="#A0A0FF" roughness={0.4} metalness={0.2} />
      </mesh>
    );
  }

  return <primitive object={scene} scale={0.9} />;
}

export default function KitchenScene3D() {
  return (
    <div className="w-full h-[420px] bg-transparent">
      <Canvas
        camera={{ position: [2.5, 2.5, 2.5], fov: 45 }}
        shadows
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 5, 2]} intensity={0.9} castShadow />
        <Suspense fallback={<Html center><span>Loading 3D...</span></Html>}>
          <SafeModel url="/models/kitchen.glb" />
        </Suspense>
        <OrbitControls enablePan={false} enableZoom={true} maxPolarAngle={Math.PI / 2.2} />
        <Environment preset="apartment" />
      </Canvas>
    </div>
  );
}

// ─────────────────────────────────────────────
// ✨ Edith Patch v2025.11 — Lightweight fallback 3D connector
// Falls back to cube when /public/models/kitchen.glb missing (404 safe)
// ─────────────────────────────────────────────
