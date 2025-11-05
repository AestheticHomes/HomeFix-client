"use client";
// [edith-bridge3D][fallback-cube][lightweight-safe]
import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, Html, useGLTF } from "@react-three/drei";
import { Box3, Vector3 } from "three";

function SafeModel({ url = "/models/kitchen.glb" }) {
  try {
    const { scene } = useGLTF(url);
    // Auto-fit to center
    const box = new Box3().setFromObject(scene);
    const center = new Vector3();
    box.getCenter(center);
    scene.position.sub(center);
    return <primitive object={scene} scale={0.9} />;
  } catch (e) {
    console.warn("[KitchenScene3D] GLB missing, using fallback cube:", e.message);
    return (
      <mesh>
        <boxGeometry args={[1, 0.3, 1]} />
        <meshStandardMaterial color="#A0A0FF" roughness={0.4} metalness={0.2} />
      </mesh>
    );
  }
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
