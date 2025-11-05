// [edith-3d-preload][useGLTF.preload][PWA-cache]
// This module preloads all 3D .glb models once during app load,
// so OrbitControls render instantly when toggled.

"use client";
import { useEffect } from "react";
import { useGLTF } from "@react-three/drei";

const MODELS = [
  "/models/kitchen.glb",
  "/models/wardrobe.glb",
  "/models/fallback.glb",
];

// 🧠 Run once on mount
export default function useModelPreload() {
  useEffect(() => {
    MODELS.forEach((url) => {
      try {
        useGLTF.preload(url);
        console.log(`[HomeFix 3D] Preloaded ${url}`);
      } catch (err) {
        console.warn(`[HomeFix 3D] Failed to preload ${url}`, err);
      }
    });
  }, []);
}
