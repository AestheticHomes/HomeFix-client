"use client";
// [edith-safe3D][fallback][unified-loader]
import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, Html, useGLTF } from "@react-three/drei";
import { Box3, Vector3 } from "three";

function SafeModel({ url }) {
  try {
    const { scene } = useGLTF(url);
    const box = new Box3().setFromObject(scene);
    const center = new Vector3();
    box.getCenter(center);
    scene.position.sub(center);
    return <primitive object={scene} scale={0.9} />;
  } catch {
    console.warn(`[SafeScene3D] Model not found → fallback cube (${url})`);
    return (
      <mesh>
        <boxGeometry args={[1, 0.3, 1]} />
        <meshStandardMaterial color="#A0A0FF" roughness={0.4} metalness={0.25} />
      </mesh>
    );
  }
}

export default function SafeScene3D({
  modelUrl = "/models/fallback.glb",
  cameraPos = [2.5, 2.5, 2.5],
  bg = "transparent",
}) {
  return (
    <div className="w-full h-[420px]" style={{ background: bg }}>
      <Canvas camera={{ position: cameraPos, fov: 45 }} shadows>
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 5, 2]} intensity={0.9} castShadow />
        <Suspense fallback={<Html center><span>Loading 3D...</span></Html>}>
          <SafeModel url={modelUrl} />
        </Suspense>
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          maxPolarAngle={Math.PI / 2.2}
        />
        <Environment preset="apartment" />
      </Canvas>
    </div>
  );
}

// ─────────────────────────────────────────────
// ✨ Edith Shared 3D Bridge — Fallback cube if GLB missing (404-safe)
// ─────────────────────────────────────────────
