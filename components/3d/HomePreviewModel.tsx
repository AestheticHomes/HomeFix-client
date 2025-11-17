"use client";

import { OrbitControls, useGLTF } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

function Model({ url }: { url: string }) {
  const glb = useGLTF(url);
  return <primitive object={glb.scene} scale={1} />;
}

export default function HomePreviewModel({ url }: { url: string }) {
  return (
    <div className="w-full h-[240px] rounded-2xl overflow-hidden">
      <Canvas camera={{ position: [4, 4, 6], fov: 30 }}>
        <ambientLight intensity={0.8} />
        <directionalLight intensity={1} position={[5, 5, 5]} />
        <Model url={url} />
        <OrbitControls enablePan={false} />
      </Canvas>
    </div>
  );
}
