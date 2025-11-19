"use client";

import { OrbitControls, useGLTF } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";

type SelectedInfo = {
  name: string;
  size?: { x: number; y: number; z: number };
  material?: string;
};

type Props = {
  url: string;
  mode?: "hero-inline" | "hero-fullscreen";
  showFullscreenToggle?: boolean;
};

/* ----------------------------------------------------------
   Helper: pull some metadata from the clicked mesh
---------------------------------------------------------- */
function extractInfo(object: THREE.Object3D): SelectedInfo {
  const name = object.name || "Unnamed component";

  const box = new THREE.Box3().setFromObject(object);
  const sizeVec = new THREE.Vector3();
  box.getSize(sizeVec);

  let materialName: string | undefined;
  const mesh = object as THREE.Mesh;
  const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;

  if (mat) {
    if (Array.isArray(mat)) {
      materialName =
        mat[0]?.name || (mat[0] as any)?.color?.getStyle?.() || mat[0]?.type;
    } else {
      materialName =
        mat.name || (mat as any).color?.getStyle?.() || mat.type || undefined;
    }
  }

  return {
    name,
    size: { x: sizeVec.x, y: sizeVec.y, z: sizeVec.z },
    material: materialName,
  };
}

/* ----------------------------------------------------------
   Scene content: model + lights + selection handlers
---------------------------------------------------------- */
function SceneContent({
  url,
  onSelect,
  onFocus,
}: {
  url: string;
  onSelect: (obj: THREE.Object3D | null) => void;
  onFocus: (obj: THREE.Object3D) => void;
}) {
  const gltf = useGLTF(url);

  const handleClick = useCallback(
    (e: any) => {
      e.stopPropagation();
      onSelect(e.object as THREE.Object3D);
    },
    [onSelect]
  );

  const handleDoubleClick = useCallback(
    (e: any) => {
      e.stopPropagation();
      onFocus(e.object as THREE.Object3D);
    },
    [onFocus]
  );

  return (
    <>
      {/* soft studio lighting */}
      <ambientLight intensity={0.85} />
      <directionalLight position={[6, 10, 6]} intensity={1.2} />
      <directionalLight position={[-4, -6, -2]} intensity={0.4} />

      <primitive
        object={gltf.scene}
        onPointerDown={handleClick}
        onDoubleClick={handleDoubleClick}
      />
    </>
  );
}

/* ----------------------------------------------------------
   Camera + OrbitControls, reacts to selection for focus
---------------------------------------------------------- */
function CameraRig({ selected }: { selected: THREE.Object3D | null }) {
  const controlsRef = useRef<any>(null);
  const { camera, size } = useThree();

  // initial camera pose
  useEffect(() => {
    camera.position.set(12, 10, 16);
    (camera as any).zoom = 70;
    camera.lookAt(0, 3, 0);
    camera.updateProjectionMatrix();
  }, [camera]);

  // focus when selection changes (double-click)
  useEffect(() => {
    if (!selected || !controlsRef.current) return;

    const box = new THREE.Box3().setFromObject(selected);
    const center = new THREE.Vector3();
    const boxSize = new THREE.Vector3();

    box.getCenter(center);
    box.getSize(boxSize);

    const maxDim = Math.max(boxSize.x, boxSize.y, boxSize.z);
    const padding = 1.6;

    // move camera to a clean 3/4th angle
    const distance = maxDim * padding;
    camera.position.set(
      center.x + distance * 0.8,
      center.y + distance * 0.6,
      center.z + distance
    );

    // orthographic zoom fit
    const ortho = camera as THREE.OrthographicCamera;
    const zoom = Math.min(
      size.width / (boxSize.x * padding) || 1,
      size.height / (boxSize.y * padding) || 1
    );
    ortho.zoom = THREE.MathUtils.clamp(zoom, 40, 140);
    ortho.updateProjectionMatrix();

    controlsRef.current.target.copy(center);
    controlsRef.current.update();
  }, [selected, camera, size]);

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      enableDamping
      dampingFactor={0.08}
      maxPolarAngle={Math.PI / 2.2}
      minZoom={40}
      maxZoom={140}
      // smoother scroll
      zoomSpeed={0.6}
      rotateSpeed={0.8}
    />
  );
}

/* ----------------------------------------------------------
   Wrapper shown in Hero card
---------------------------------------------------------- */
export default function HomePreviewModel({
  url,
  mode,
  showFullscreenToggle = true,
}: Props) {
  const [selectedObj, setSelectedObj] = useState<THREE.Object3D | null>(null);
  const [selectedInfo, setSelectedInfo] = useState<SelectedInfo | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const isHeroInline = mode === "hero-inline";
  const isExternalFullscreen = mode === "hero-fullscreen";
  const isFullscreen = fullscreen || isExternalFullscreen;

  const handleSelect = useCallback((obj: THREE.Object3D | null) => {
    if (!obj) {
      setSelectedObj(null);
      setSelectedInfo(null);
      return;
    }
    setSelectedObj(obj);
    setSelectedInfo(extractInfo(obj));
  }, []);

  const handleFocus = useCallback((obj: THREE.Object3D) => {
    setSelectedObj(obj);
    setSelectedInfo(extractInfo(obj));
  }, []);

  const wrapperBase =
    "relative rounded-[24px] border border-[var(--border-subtle)] bg-[color-mix(in_srgb,var(--surface-panel)90%,transparent)] overflow-hidden shadow-[0_18px_40px_rgba(15,23,42,0.55)]";
  const wrapperSize = isExternalFullscreen
    ? "w-full h-full"
    : fullscreen
    ? "fixed inset-3 z-[70]"
    : isHeroInline
    ? "w-full h-full"
    : "w-full h-[180px]";

  return (
    <>
      {fullscreen && showFullscreenToggle && !isExternalFullscreen && (
        <div
          className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
          onClick={() => setFullscreen(false)}
        />
      )}

      <div className={`${wrapperBase} ${wrapperSize}`}>
        <Canvas
          orthographic
          camera={{
            position: [12, 10, 16],
            zoom: isFullscreen ? 80 : 70,
            near: 0.1,
            far: 2000,
          }}
          className="w-full h-full"
        >
          <SceneContent
            url={url}
            onSelect={handleSelect}
            onFocus={handleFocus}
          />
          <CameraRig selected={selectedObj} />
        </Canvas>

        {/* fullscreen toggle */}
        {showFullscreenToggle && !isExternalFullscreen && (
          <button
            type="button"
            onClick={() => setFullscreen((f) => !f)}
            className="absolute top-2 right-2 z-[80] rounded-full bg-black/50 text-[10px] text-slate-100 px-2 py-1 backdrop-blur border border-white/15 hover:bg-black/70"
          >
            {fullscreen ? "Close" : "Expand"}
          </button>
        )}

        {/* selection legend */}
        {selectedInfo && (
          <div className="absolute left-3 bottom-3 z-[75] max-w-[70%] rounded-2xl bg-black/60 text-[11px] text-slate-100 px-3 py-2 backdrop-blur border border-white/10">
            <div className="font-semibold truncate">
              {selectedInfo.name || "Component"}
            </div>
            {selectedInfo.size && (
              <div className="text-[10px] opacity-80">
                Size ~ {selectedInfo.size.x.toFixed(2)} ×{" "}
                {selectedInfo.size.y.toFixed(2)} ×{" "}
                {selectedInfo.size.z.toFixed(2)}
              </div>
            )}
            {selectedInfo.material && (
              <div className="text-[10px] opacity-80 mt-0.5">
                Material: {selectedInfo.material}
              </div>
            )}
            <div className="text-[10px] opacity-60 mt-0.5">
              Tip: click another unit to select · double-click to focus
            </div>
          </div>
        )}
      </div>
    </>
  );
}

useGLTF.preload("/models/l-shape-kitchen.glb");
