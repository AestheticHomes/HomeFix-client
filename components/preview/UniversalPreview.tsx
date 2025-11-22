"use client";

/**
 * ============================================================================
 * UniversalPreview
 * ----------------------------------------------------------------------------
 * A single, reusable visual preview widget for HomeFix / Edith:
 *
 * - Can render:
 *   • 3D GLB (via @react-three/fiber + @react-three/drei useGLTF)
 *   • 2D raster (Next.js <Image>)
 *   • 2D SVG / React-based CAD (SvgComponent)
 *
 * - Used by:
 *   • Estimator (kitchen / wardrobe) via `glbUrl` + `svgComponent`
 *   • Store / catalog hero previews (GLB + thumbnail)
 *
 * - Architectural rules:
 *   • Exactly ONE <Canvas> when in 3D mode (no nested viewers).
 *   • GLB errors (404 / 400 / corrupt file) are contained inside this file
 *     via a local ErrorBoundary – calling screens do NOT crash.
 *   • 2D vs 3D mode is decided here via `initialMode`, `enableModeToggle`,
 *     and optional `forcedViewMode`.
 *
 * - External dependencies:
 *   • @react-three/fiber       → Canvas, useThree
 *   • @react-three/drei        → OrbitControls, useGLTF
 *   • next/image               → responsive previews
 *   • three                    → Box3, Vector3, MathUtils, core types
 *
 * Any future AI / human reading only this file should be able to reconstruct:
 *   - Where it sits in the UI stack
 *   - How 3D/2D are chosen
 *   - How GLB failures are handled
 *   - What knobs callers can use (props below)
 * ============================================================================
 */

import { OrbitControls, useGLTF } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
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

/* ---------------------------------------------------------------------------
 * Types: selection metadata + public props
 * ------------------------------------------------------------------------ */

type SelectedInfo = {
  name: string;
  size?: { x: number; y: number; z: number };
  material?: string;
};

export type ViewMode = "2d" | "3d";

export type UniversalPreviewProps = {
  /** Public GLB URL (Supabase CDN, etc.). If missing, 3D will be skipped. */
  glbUrl?: string | null;
  /** Optional raster fallback / hero image URL. */
  imageUrl?: string | null;
  /** Optional SVG / CAD React component (no props). */
  svgComponent?: React.ComponentType<Record<string, never>>;
  /** Optional custom 3D React-three-fiber component (used instead of GLB). */
  modelComponent?: React.ComponentType<any>;
  /** Show overlay with clicked mesh’s name / size / material. */
  enableSelectionOverlay?: boolean;
  /** Styling modes – used by hero / mini cards. */
  mode?: "mini" | "hero-inline" | "hero-fullscreen";
  /** Show expand / collapse button for fullscreen. */
  showFullscreenToggle?: boolean;
  /** Controlled fullscreen state (if caller wants to own it). */
  fullscreen?: boolean;
  /** Controlled fullscreen toggle callback. */
  onToggleFullscreen?: (next: boolean) => void;
  /** Initial auto-mode preference. */
  initialMode?: "auto" | "2d" | "3d";
  /** Show 2D / 3D chip toggle. */
  enableModeToggle?: boolean;
  /** Let the wrapper stretch fully to its parent. */
  fillContainer?: boolean;
  /** Show a transient “drag / scroll” hint. */
  showInteractionHint?: boolean;
  /** Force view mode regardless of internal toggle. */
  forcedViewMode?: ViewMode;
};

/* ---------------------------------------------------------------------------
 * Utility: inspect a THREE.Object3D for overlay info
 * ------------------------------------------------------------------------ */

function extractInfo(object: THREE.Object3D): SelectedInfo {
  const name = object.name || "Component";

  const box = new THREE.Box3().setFromObject(object);
  const sizeVec = new THREE.Vector3();
  box.getSize(sizeVec);

  let materialName: string | undefined;

  const mesh = object as THREE.Mesh;
  const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;

  if (mat) {
    if (Array.isArray(mat) && mat[0]) {
      const m = mat[0] as any;
      materialName =
        m.name || m.color?.getStyle?.() || m.type || "Material (array)";
    } else {
      const m = mat as any;
      materialName =
        m.name || m.color?.getStyle?.() || m.type || "Material (single)";
    }
  }

  return {
    name,
    size: { x: sizeVec.x, y: sizeVec.y, z: sizeVec.z },
    material: materialName,
  };
}

/* ---------------------------------------------------------------------------
 * R3F scene content: loads GLB + attaches click handlers
 * ------------------------------------------------------------------------ */

type SceneContentProps = {
  url: string;
  onSelect: (obj: THREE.Object3D | null) => void;
  onFocus: (obj: THREE.Object3D) => void;
};

function SceneContent({ url, onSelect, onFocus }: SceneContentProps) {
  // ❗ This is the only place we ever call useGLTF for this viewer.
  //    Any loader error will bubble to the local ErrorBoundary, not the app.
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

/* ---------------------------------------------------------------------------
 * CameraRig: keeps an orthographic camera nicely framing the selection
 * ------------------------------------------------------------------------ */

type CameraRigProps = {
  selected: THREE.Object3D | null;
};

function CameraRig({ selected }: CameraRigProps) {
  const controlsRef = useRef<any>(null);
  const { camera, size } = useThree();

  // Initial camera setup on mount
  useEffect(() => {
    camera.position.set(6, 6, 10);
    (camera as any).zoom = 70;
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [camera]);

  // Reframe camera when selection changes
  useEffect(() => {
    if (!selected || !controlsRef.current) return;

    const box = new THREE.Box3().setFromObject(selected);
    const center = new THREE.Vector3();
    const boxSize = new THREE.Vector3();

    box.getCenter(center);
    box.getSize(boxSize);

    const maxDim = Math.max(boxSize.x, boxSize.y, boxSize.z);
    const padding = 1.6;
    const distance = maxDim * padding;

    camera.position.set(
      center.x + distance * 0.8,
      center.y + distance * 0.6,
      center.z + distance
    );

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
      zoomSpeed={0.6}
      rotateSpeed={0.8}
    />
  );
}

/* ---------------------------------------------------------------------------
 * Local ErrorBoundary:
 *  - Contains GLTF / WebGL failures inside this viewer.
 *  - Prevents Next.js app-level error screens on bad GLBs (400/404).
 * ------------------------------------------------------------------------ */

type PreviewErrorBoundaryProps = {
  children: ReactNode;
  fallback?: ReactNode;
};

type PreviewErrorBoundaryState = { hasError: boolean };

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

/* ---------------------------------------------------------------------------
 * Main component: orchestrates 2D/3D, fullscreen, selection overlay
 * ------------------------------------------------------------------------ */

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
}: UniversalPreviewProps) {
  const [selectedObj, setSelectedObj] = useState<THREE.Object3D | null>(null);
  const [selectedInfo, setSelectedInfo] = useState<SelectedInfo | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [internalViewMode, setInternalViewMode] = useState<ViewMode>("2d");
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

  const effectiveViewMode: ViewMode = forcedViewMode ?? internalViewMode;

  // Auto-hide interaction hint after a small delay
  useEffect(() => {
    if (!showInteractionHint) return;
    const t = setTimeout(() => setHintVisible(false), 3000);
    return () => clearTimeout(t);
  }, [showInteractionHint]);

  // Decide initial view mode based on props + asset availability
  useEffect(() => {
    const pickInitial = (): ViewMode => {
      if (initialMode === "3d" && has3d) return "3d";
      if (initialMode === "2d" && has2d) return "2d";
      if (has3d) return "3d";
      return "2d";
    };
    setInternalViewMode(pickInitial());
  }, [initialMode, has2d, has3d]);

  // Dev-only: log effective state so GLB path issues are traceable
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.debug("[UniversalPreview] mode:", {
        effectiveViewMode,
        has3d,
        has2d,
        glbUrl,
        imageUrl,
      });
    }
  }, [effectiveViewMode, has3d, has2d, glbUrl, imageUrl]);

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

  /* -----------------------------------------------------------------------
   * Layout classes
   * -------------------------------------------------------------------- */

  const wrapperBase =
    "relative rounded-[24px] border border-[var(--border-subtle)] bg-[color-mix(in_srgb,var(--surface-panel)90%,transparent)] overflow-hidden shadow-[0_18px_40px_rgba(15,23,42,0.55)]";

  const sizeClass = fillContainer
    ? "w-full h-full"
    : isExternalFullscreen
    ? "w-full h-full"
    : isMini
    ? "w-full h-[180px]"
    : isHeroInline
    ? "w-full min-h-[260px] md:min-h-[320px] lg:min-h-[380px]"
    : "w-full h-[260px]";

  const containerClass = `${wrapperBase} ${sizeClass}`;

  /* -----------------------------------------------------------------------
   * 2D renderer (image or SVG)
   * -------------------------------------------------------------------- */

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
        <div className="absolute inset-0 flex items-center justify-center bg-[var(--surface-panel)] dark:bg-[var(--surface-panel-dark)]">
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

  /* -----------------------------------------------------------------------
   * 3D renderer (Canvas + ErrorBoundary + optional GLB)
   * -------------------------------------------------------------------- */

  const render3d = useCallback(() => {
    if (!has3d) {
      // No 3D assets at all → fall back to 2D surface
      return render2d();
    }

    return (
      <PreviewErrorBoundary>
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
            />
          ) : null}
          <CameraRig selected={selectedObj} />
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
    render2d,
    selectedObj,
  ]);

  /* -----------------------------------------------------------------------
   * Main content selection: choose 2D vs 3D safely
   * -------------------------------------------------------------------- */

  const content = useMemo(() => {
    if (effectiveViewMode === "3d") {
      return render3d();
    }

    // If forced or selected into 2D mode:
    return render2d();
  }, [effectiveViewMode, render2d, render3d]);

  /* -----------------------------------------------------------------------
   * Render
   * -------------------------------------------------------------------- */

  return (
    <>
      {/* Fullscreen dimmer for internal fullscreen mode */}
      {isFullscreen && showFullscreenToggle && !isExternalFullscreen && (
        <div
          className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
          onClick={() => toggleFullscreen(false)}
        />
      )}

      <div className={containerClass}>
        {/* 2D / 3D mode toggle chips */}
        {enableModeToggle && !forcedViewMode && (has3d || has2d) && (
          <div className="absolute top-2 left-2 z-[85] flex items-center gap-1">
            <button
              type="button"
              onClick={() => has2d && setInternalViewMode("2d")}
              disabled={!has2d}
              className={`px-2 py-1 rounded-full text-[11px] border border-[var(--border-soft)] ${
                effectiveViewMode === "2d"
                  ? "bg-[color-mix(in_srgb,var(--accent-primary)20%,transparent)] text-[var(--text-primary)]"
                  : "bg-[var(--surface-card)] text-[var(--text-secondary)]"
              } ${!has2d ? "opacity-40 cursor-not-allowed" : ""}`}
            >
              2D
            </button>
            <button
              type="button"
              onClick={() => has3d && setInternalViewMode("3d")}
              disabled={!has3d}
              className={`px-2 py-1 rounded-full text-[11px] border border-[var(--border-soft)] ${
                effectiveViewMode === "3d"
                  ? "bg-[color-mix(in_srgb,var(--accent-secondary)20%,transparent)] text-[var(--text-primary)]"
                  : "bg-[var(--surface-card)] text-[var(--text-secondary)]"
              } ${!has3d ? "opacity-40 cursor-not-allowed" : ""}`}
            >
              3D
            </button>
          </div>
        )}

        {/* Main preview content */}
        {content}

        {/* Fullscreen toggle button */}
        {showFullscreenToggle && has3d && !isExternalFullscreen && (
          <button
            type="button"
            onClick={() => toggleFullscreen()}
            className="absolute top-2 right-2 z-[80] rounded-full bg-black/50 text-[10px] text-slate-100 px-2 py-1 backdrop-blur border border-white/15 hover:bg-black/70"
          >
            {isFullscreen ? "Close" : "Expand"}
          </button>
        )}

        {/* Selection overlay (mesh info) */}
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

        {/* Interaction hint bubble */}
        {hintVisible && (
          <div className="absolute left-3 bottom-3 z-[70] rounded-full bg-black/55 text-[10px] text-white px-3 py-1.5 backdrop-blur border border-white/10 shadow-sm transition-opacity">
            Drag to orbit · Scroll to zoom
          </div>
        )}
      </div>
    </>
  );
}
