"use client";
import SafeScene3D from "./SafeScene3D";

export default function WardrobeScene3D() {
  return (
    <SafeScene3D
      modelUrl="/models/wardrobe.glb"
      cameraPos={[2.2, 2.4, 2.2]}
      bg="transparent"
    />
  );
}

// ✨ WardrobeScene3D — fallback-safe visualizer for wardrobe.glb
