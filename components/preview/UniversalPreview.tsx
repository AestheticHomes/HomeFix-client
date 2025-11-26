"use client";

/**
 * UniversalPreview (orbit-fixed, legacy-compatible version)
 * ---------------------------------------------------------
 * - 2D: shows SVG or image.
 * - 3D: renders GLB or custom R3F component.
 * - GLB is recentered to origin and auto-framed in view.
 * - Camera orbits around model (OrbitControls target at model center).
 * - Any GLB / WebGL error is contained in a local ErrorBoundary.
 * - If 3D assets are missing or fail (Supabase 400/404/etc),
 *   we fall back to 2D instead of crashing the app.
 */

import { OrbitControls, useGLTF } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import Image from "next/image";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import * as THREE from "three";

export type ViewMode = "2d" | "3d";

type SelectedInfo = {
  name: string;
  size?: { x: number; y: number; z: number };
  material?: string;
};

export type UniversalPreviewProps = {
  glbUrl?: string | null;
  imageUrl?: string | null;
  svgComponent?: React.ComponentType<Record<string, never>>;
  modelComponent?: React.ComponentType<any>;
  enableSelectionOverlay?: boolean;
  mode?: "mini" | "hero-inline" | "hero-fullscreen";
  showFullscreenToggle?: boolean;
  fullscreen?: boolean;
  onToggleFullscreen?: (next: boolean) => void;
  initialMode?: "auto" | "2d" | "3d";
  enableModeToggle?: boolean;
  fillContainer?: boolean;
  showInteractionHint?: boolean;
  forcedViewMode?: ViewMode;
  /**
   * Optional estimator-only hook for X-ray previews.
   * - xrayEnabled must be true to activate any logic.
   * - xrayOn toggles the actual fade of WALL_* meshes.
   * Other contexts leave this undefined to remain unchanged.
   */
  xrayEnabled?: boolean;
  xrayOn?: boolean;
};

/* ------------------------ helpers ------------------------ */

function extractInfo(object: THREE.Object3D): SelectedInfo {
  const name = object.name || "Component";

  const box = new THREE.Box3().setFromObject(object);
  const sizeVec = new THREE.Vector3();
  box.getSize(sizeVec);

  let materialName: string | undefined;
  const mesh = object as THREE.Mesh;
  const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;

  if (mat) {
    if (Array.isArray(mat)) {
      const m = mat[0] as any;
      materialName = m?.name || m?.color?.getStyle?.() || m?.type;
    } else {
      const m = mat as any;
      materialName = m?.name || m?.color?.getStyle?.() || m?.type;
    }
  }

  return {
    name,
    size: { x: sizeVec.x, y: sizeVec.y, z: sizeVec.z },
    material: materialName,
  };
}

/**
 * SceneContent
 * - Loads the GLB
 * - Recenters it so its bounding box center is at the world origin
 * - Notifies parent via onSceneReady
 */
function SceneContent({
  url,
  onSelect,
  onFocus,
  onSceneReady,
  xrayEnabled = false,
  xrayOn = false,
}: {
  url: string;
  onSelect: (obj: THREE.Object3D | null) => void;
  onFocus: (obj: THREE.Object3D) => void;
  onSceneReady?: (root: THREE.Object3D) => void;
  xrayEnabled?: boolean;
  xrayOn?: boolean;
}) {
  const gltf = useGLTF(url);
  const { camera } = useThree();
  const wallMeshes = useRef<THREE.Mesh[]>([]);
  const tempBox = useRef(new THREE.Box3());
  const tempCenter = useRef(new THREE.Vector3());
  const tempSize = useRef(new THREE.Vector3());

  // Collect hideable wall meshes (names starting with "WALL_")
  useEffect(() => {
    wallMeshes.current = [];

    if (!xrayEnabled) return;

    const root = gltf.scene;
    if (!root) return;

    const collected: THREE.Mesh[] = [];

    root.traverse((obj) => {
      if (!(obj instanceof THREE.Mesh)) return;
      if (!obj.name?.startsWith("WALL_")) return;

      const materials = Array.isArray(obj.material)
        ? obj.material
        : [obj.material];

      materials.forEach((mat) => {
        const m = mat as THREE.Material & {
          opacity?: number;
          transparent?: boolean;
        };
        if (typeof m.opacity === "number") {
          m.transparent = true;
          m.opacity = 1;
        }
      });

      collected.push(obj);
    });

    wallMeshes.current = collected;

    return () => {
      wallMeshes.current = [];
    };
  }, [gltf.scene, xrayEnabled]);

  // Frame-loop fade logic: estimator-only X-ray mode.
  // Purpose: give a section view by fading WALL_* meshes when the camera
  // sits too close to them; gated by xrayEnabled so other previews stay unchanged.
  useFrame(() => {
    if (!xrayEnabled) return;

    const walls = wallMeshes.current;
    if (!walls.length) return;

    const smoothing = 0.25;

    const restore = (mesh: THREE.Mesh) => {
      const materials = Array.isArray(mesh.material)
        ? mesh.material
        : [mesh.material];

      materials.forEach((mat) => {
        const m = mat as THREE.Material & {
          opacity?: number;
          transparent?: boolean;
        };
        if (typeof m.opacity === "number") {
          m.transparent = true;
          m.opacity = THREE.MathUtils.lerp(m.opacity, 1, smoothing);
        }
      });

      mesh.visible = true;
    };

    // X-ray off → gently restore walls then bail.
    if (!xrayOn) {
      walls.forEach(restore);
      return;
    }

    const box = tempBox.current;
    const center = tempCenter.current;
    const size = tempSize.current;

    walls.forEach((mesh) => {
      box.setFromObject(mesh);
      box.getCenter(center);
      box.getSize(size);

      const wallSpan = Math.max(size.x, size.y, size.z) || 1;
      const dist = camera.position.distanceTo(center);
      const shouldHide = dist < wallSpan * 1.1;

      const materials = Array.isArray(mesh.material)
        ? mesh.material
        : [mesh.material];

      materials.forEach((mat) => {
        const m = mat as THREE.Material & {
          opacity?: number;
          transparent?: boolean;
        };
        if (typeof m.opacity !== "number") return;

        const target = shouldHide ? 0 : 1;
        m.transparent = true;
        m.opacity = THREE.MathUtils.lerp(m.opacity, target, smoothing);
      });

      if (shouldHide) {
        const visibleOpacity = materials.some((mat) => {
          const m = mat as THREE.Material & { opacity?: number };
          return typeof m.opacity === "number" ? m.opacity > 0.02 : false;
        });
        mesh.visible = visibleOpacity;
      } else {
        mesh.visible = true;
      }
    });
  });

  // Recenter model to origin once & notify parent
  useEffect(() => {
    const root = gltf.scene;
    if (!root) return;

    const box = new THREE.Box3().setFromObject(root);
    const center = new THREE.Vector3();
    box.getCenter(center);

    // Move the whole scene so that its center is at [0,0,0]
    root.position.sub(center);

    onSceneReady?.(root);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gltf, onSceneReady]);

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

/**
 * CameraRig
 * - Always orbits around focusTarget's bounding box center
 * - Auto-frames the model to fit canvas once per focusTarget change
 */
function CameraRig({ focusTarget }: { focusTarget: THREE.Object3D | null }) {
  const controlsRef = useRef<any>(null);
  const { camera, size } = useThree();

  useEffect(() => {
    if (!focusTarget || !controlsRef.current) return;

    const box = new THREE.Box3().setFromObject(focusTarget);
    const sizeVec = new THREE.Vector3();
    const center = new THREE.Vector3();

    box.getSize(sizeVec);
    box.getCenter(center);

    const maxDim = Math.max(sizeVec.x, sizeVec.y, sizeVec.z) || 1;
    const padding = 1.6;

    // Orthographic vs perspective handling
    const isOrtho =
      (camera as any).isOrthographicCamera === true &&
      camera instanceof THREE.OrthographicCamera;

    if (isOrtho) {
      // Place camera on a gentle diagonal
      const distance = maxDim * padding;
      camera.position.set(
        center.x + distance,
        center.y + distance * 0.7,
        center.z + distance
      );

      // Compute zoom so object fits viewport
      const ortho = camera as THREE.OrthographicCamera;
      const desiredHeight = maxDim * padding;
      const zoom = size.height / desiredHeight;
      ortho.zoom = THREE.MathUtils.clamp(zoom, 20, 200);
      ortho.updateProjectionMatrix();
    } else {
      // Perspective camera: compute distance from FOV
      const perspective = camera as THREE.PerspectiveCamera;
      const fov = (perspective.fov * Math.PI) / 180;
      const fitHeightDistance = maxDim / (2 * Math.tan(fov / 2));
      const fitWidthDistance = fitHeightDistance / perspective.aspect;
      const distance = Math.max(fitHeightDistance, fitWidthDistance) * padding;

      const dir = new THREE.Vector3(1, 0.8, 1).normalize();
      const pos = new THREE.Vector3()
        .copy(center)
        .add(dir.multiplyScalar(distance));
      perspective.position.copy(pos);
      perspective.lookAt(center);
      perspective.updateProjectionMatrix();
    }

    controlsRef.current.target.copy(center);
    controlsRef.current.update();
  }, [focusTarget, camera, size]);

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.08}
      enablePan
      zoomSpeed={0.7}
      rotateSpeed={0.8}
      // Safety: default orbit around origin, then effect above refines target
      target={[0, 0, 0]}
    />
  );
}

/* ---------------- local error boundary ------------------- */

type PreviewErrorBoundaryProps = {
  children: ReactNode;
  fallback?: ReactNode;
};

type PreviewErrorBoundaryState = {
  hasError: boolean;
};

class PreviewErrorBoundary extends React.Component<
  PreviewErrorBoundaryProps,
  PreviewErrorBoundaryState
> {
  state: PreviewErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): PreviewErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.error("[UniversalPreview] 3D preview error:", error);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-[var(--text-muted)] bg-[var(--surface-panel)]">
            3D preview unavailable
          </div>
        )
      );
    }
    return this.props.children;
  }
}

/* ---------------------- main component ------------------- */

export default function UniversalPreview({
  glbUrl,
  imageUrl,
  svgComponent: SvgComponent,
  modelComponent: ModelComponent,
  enableSelectionOverlay,
  mode,
  showFullscreenToggle = true,
  fullscreen: fullscreenProp,
  onToggleFullscreen,
  initialMode = "auto",
  enableModeToggle = false,
  fillContainer = false,
  showInteractionHint = false,
  forcedViewMode,
  xrayEnabled = false,
  xrayOn = false,
}: UniversalPreviewProps) {
  const [selectedObj, setSelectedObj] = useState<THREE.Object3D | null>(null);
  const [sceneRoot, setSceneRoot] = useState<THREE.Object3D | null>(null);
  const [selectedInfo, setSelectedInfo] = useState<SelectedInfo | null>(null);
  const [focusObj, setFocusObj] = useState<THREE.Object3D | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("2d");
  const [hintVisible, setHintVisible] = useState(showInteractionHint);

  const isHeroInline = mode === "hero-inline";
  const isExternalFullscreen = mode === "hero-fullscreen";
  const isMini = mode === "mini";
  const isControlled = typeof fullscreenProp === "boolean";
  const isFullscreen =
    isExternalFullscreen || (isControlled ? fullscreenProp : fullscreen);

  const hasGlb = !!glbUrl;
  const hasImage = !!imageUrl;
  const hasSvg = !!SvgComponent;
  const has3d = hasGlb || !!ModelComponent;
  const has2d = hasImage || hasSvg;

  const effectiveViewMode: ViewMode = forcedViewMode ?? viewMode;

  useEffect(() => {
    if (!showInteractionHint) return;
    const t = setTimeout(() => setHintVisible(false), 3000);
    return () => clearTimeout(t);
  }, [showInteractionHint]);

  // Decide initial 2D/3D
  useEffect(() => {
    const pickInitial = (): ViewMode => {
      if (initialMode === "3d" && has3d) return "3d";
      if (initialMode === "2d" && has2d) return "2d";
      if (has3d) return "3d";
      return "2d";
    };
    setViewMode(pickInitial());
  }, [initialMode, has2d, has3d]);

  useEffect(() => {
    if (sceneRoot) {
      setFocusObj(sceneRoot);
    }
  }, [sceneRoot]);

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
    setFocusObj(obj);
  }, []);

  const toggleFullscreen = useCallback(
    (next?: boolean) => {
      const target =
        typeof next === "boolean"
          ? next
          : isControlled
          ? !fullscreenProp
          : !fullscreen;

      if (isControlled) {
        onToggleFullscreen?.(target ?? false);
      } else {
        setFullscreen(target ?? false);
      }
    },
    [fullscreen, fullscreenProp, isControlled, onToggleFullscreen]
  );

  const wrapperBase =
    "relative rounded-[24px] border border-[var(--border-subtle)] bg-[color-mix(in_srgb,var(--surface-panel)90%,transparent)] overflow-hidden shadow-[0_18px_40px_rgba(15,23,42,0.55)]";

  const wrapperSize = isExternalFullscreen
    ? "w-full h-full"
    : fillContainer
    ? "w-full h-full"
    : isFullscreen
    ? "fixed inset-3 z-[70]"
    : isHeroInline || isMini
    ? "w-full h-full"
    : "w-full h-[180px]";

  /* ---------------- 2D renderer ---------------- */

  const render2d = useCallback(() => {
    if (hasImage && imageUrl) {
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-[var(--surface-panel)]">
          <Image
            src={imageUrl}
            alt="Preview"
            fill
            sizes="(min-width: 1024px) 240px, (min-width: 640px) 180px, 45vw"
            className="object-contain"
          />
        </div>
      );
    }
    if (SvgComponent) {
      return (
        <div className="absolute inset-0 bg-[var(--surface-panel)] dark:bg-[var(--surface-panel-dark)]">
          <SvgComponent />
        </div>
      );
    }
    return (
      <div className="absolute inset-0 flex items-center justify-center text-xs text-[var(--text-muted)] bg-[var(--surface-panel)]">
        No preview
      </div>
    );
  }, [SvgComponent, hasImage, imageUrl]);

  /* ---------------- 3D renderer ---------------- */

  const render3d = useCallback(() => {
    if (!has3d) {
      // No 3D assets at all → gracefully fall back to 2D UI
      return render2d();
    }

    const focusTarget = focusObj || sceneRoot; // selectedObj drives overlay; focusObj drives camera framing

    return (
      <PreviewErrorBoundary fallback={render2d()}>
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
          {ModelComponent ? (
            <ModelComponent />
          ) : glbUrl ? (
            <SceneContent
              url={glbUrl}
              onSelect={handleSelect}
              onFocus={handleFocus}
              onSceneReady={setSceneRoot}
              xrayEnabled={xrayEnabled}
              xrayOn={xrayOn}
            />
          ) : null}
          <CameraRig focusTarget={focusTarget} />
        </Canvas>
      </PreviewErrorBoundary>
    );
  }, [
    ModelComponent,
    glbUrl,
    handleFocus,
    handleSelect,
    has3d,
    isFullscreen,
    focusObj,
    xrayEnabled,
    xrayOn,
    render2d,
    sceneRoot,
  ]);

  /* ---------------- choose 2D / 3D ---------------- */

  const content = useMemo(() => {
    if (effectiveViewMode === "3d") {
      return render3d();
    }
    return render2d();
  }, [effectiveViewMode, render2d, render3d]);

  /* ---------------- render shell ---------------- */

  return (
    <>
      {isFullscreen && showFullscreenToggle && !isExternalFullscreen && (
        <div
          className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
          onClick={() => toggleFullscreen(false)}
        />
      )}

      <div className={`${wrapperBase} ${wrapperSize}`}>
        {enableModeToggle && !forcedViewMode && (has3d || has2d) && (
          <div className="absolute top-2 left-2 z-[85] flex items-center gap-1">
            <button
              type="button"
              onClick={() => has2d && setViewMode("2d")}
              disabled={!has2d}
              className={`px-2 py-1 rounded-full text-[11px] border border-[var(--border-soft)] ${
                viewMode === "2d"
                  ? "bg-[color-mix(in_srgb,var(--accent-primary)20%,transparent)] text-[var(--text-primary)]"
                  : "bg-[var(--surface-card)] text-[var(--text-secondary)]"
              } ${!has2d ? "opacity-40 cursor-not-allowed" : ""}`}
            >
              2D
            </button>
            <button
              type="button"
              onClick={() => has3d && setViewMode("3d")}
              disabled={!has3d}
              className={`px-2 py-1 rounded-full text-[11px] border border-[var(--border-soft)] ${
                viewMode === "3d"
                  ? "bg-[color-mix(in_srgb,var(--accent-secondary)20%,transparent)] text-[var(--text-primary)]"
                  : "bg-[var(--surface-card)] text-[var(--text-secondary)]"
              } ${!has3d ? "opacity-40 cursor-not-allowed" : ""}`}
            >
              3D
            </button>
          </div>
        )}

        {content}

        {showFullscreenToggle && has3d && !isExternalFullscreen && (
          <button
            type="button"
            onClick={() => toggleFullscreen()}
            className="absolute top-2 right-2 z-[80] rounded-full bg-black/50 text-[10px] text-slate-100 px-2 py-1 backdrop-blur border border-white/15 hover:bg-black/70"
          >
            {isFullscreen ? "Close" : "Expand"}
          </button>
        )}

        {enableSelectionOverlay && selectedInfo && (
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

        {hintVisible && (
          <div className="absolute left-3 bottom-3 z-[70] rounded-full bg-black/55 text-[10px] text-white px-3 py-1.5 backdrop-blur border border-white/10 shadow-sm transition-opacity">
            Drag to orbit · Scroll to zoom
          </div>
        )}
      </div>
    </>
  );
}
