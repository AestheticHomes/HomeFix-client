"use client";

/**
 * PanZoomViewport — Safe, R3F-compatible pannable 2D viewport.
 *
 * Why this file exists:
 * -----------------------------------------------
 * React’s onWheel/onPointerMove use PASSIVE listeners in Chrome.
 * Passive listeners cannot call preventDefault().
 * Our zoom handler needs preventDefault() to stop browser scrolling.
 *
 * When preventDefault() fails, the event bubbles into the <Canvas>
 * used by react-three-fiber → pointer system breaks → WebGL context lost.
 *
 * This version fixes that by attaching wheel + pointer listeners
 * manually with passive:false so preventDefault() is allowed.
 *
 * Dependencies:
 *  - useAutoFitSvg (auto-fitting logic)
 *  - Used only for estimator’s 2D CAD plan.
 *
 * Safe for humans + AI to maintain.
 */

import useAutoFitSvg from "@/components/common/useAutoFitSvg";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

type Transform = { x: number; y: number; z: number };

type Props = {
  sceneWidth: number;
  sceneHeight: number;
  fitKey?: string;
  autoFitOnMount?: boolean;
  autoFitOnFitKeyChange?: boolean;
  children: (transform: Transform) => ReactNode;
};

export default function PanZoomViewport({
  sceneWidth,
  sceneHeight,
  fitKey,
  autoFitOnMount = true,
  autoFitOnFitKeyChange = true,
  children,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [transform, setTransform] = useState<Transform>({
    x: 0,
    y: 0,
    z: 1,
  });

  const isPanning = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const fit = useAutoFitSvg(sceneWidth, sceneHeight, {
    viewportW: sceneWidth,
    viewportH: sceneHeight,
    paddingRatio: 0.1,
  });

  const fitToViewport = useCallback(() => {
    setTransform({
      x: fit.offsetX,
      y: fit.offsetY,
      z: fit.scale,
    });
  }, [fit.offsetX, fit.offsetY, fit.scale]);

  // Auto-fit on mount + resize
  useEffect(() => {
    if (autoFitOnMount) fitToViewport();

    const el = containerRef.current;
    if (!el) return;

    const ro = new ResizeObserver(() => fitToViewport());
    ro.observe(el);
    return () => ro.disconnect();
  }, [autoFitOnMount, fitToViewport]);

  // Auto-fit when "fit key" changes (wall length, shape, etc.)
  useEffect(() => {
    if (autoFitOnFitKeyChange) fitToViewport();
  }, [fitKey, autoFitOnFitKeyChange, fitToViewport]);

  /** --------------------------
   * SAFE ZOOM HANDLER
   * -------------------------- */
  const wheelHandler = useCallback(
    (event: WheelEvent) => {
      event.preventDefault(); // allowed now because passive:false

      const el = containerRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const cursorX =
        ((event.clientX - rect.left) / el.clientWidth) * sceneWidth;
      const cursorY =
        ((event.clientY - rect.top) / el.clientHeight) * sceneHeight;

      const zoomFactor = Math.exp(-event.deltaY * 0.001);

      setTransform((prev) => {
        const newZ = Math.min(Math.max(prev.z * zoomFactor, 0.2), 10);
        const dx = cursorX - prev.x;
        const dy = cursorY - prev.y;
        return {
          x: cursorX - (dx * newZ) / prev.z,
          y: cursorY - (dy * newZ) / prev.z,
          z: newZ,
        };
      });
    },
    [sceneWidth, sceneHeight]
  );

  /** --------------------------
   * SAFE PAN HANDLER
   * -------------------------- */
  const pointerDown = useCallback((event: PointerEvent) => {
    isPanning.current = true;
    lastPos.current = { x: event.clientX, y: event.clientY };
  }, []);

  const pointerMove = useCallback(
    (event: PointerEvent) => {
      if (!isPanning.current) return;

      const el = containerRef.current;
      if (!el) return;

      const dxPx = event.clientX - lastPos.current.x;
      const dyPx = event.clientY - lastPos.current.y;

      const dx = ((dxPx / el.clientWidth) * sceneWidth) / transform.z;
      const dy = ((dyPx / el.clientHeight) * sceneHeight) / transform.z;

      lastPos.current = { x: event.clientX, y: event.clientY };

      setTransform((prev) => ({
        ...prev,
        x: prev.x + dx,
        y: prev.y + dy,
      }));
    },
    [sceneWidth, sceneHeight, transform.z]
  );

  const pointerUp = useCallback(() => {
    isPanning.current = false;
  }, []);

  /** ------------------------------------
   * MANUAL EVENT ATTACHMENT (passive:false)
   * ------------------------------------ */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    el.addEventListener("wheel", wheelHandler, { passive: false });
    el.addEventListener("pointerdown", pointerDown, { passive: false });
    el.addEventListener("pointermove", pointerMove, { passive: false });
    el.addEventListener("pointerup", pointerUp, { passive: false });
    el.addEventListener("pointerleave", pointerUp, { passive: false });

    return () => {
      el.removeEventListener("wheel", wheelHandler);
      el.removeEventListener("pointerdown", pointerDown);
      el.removeEventListener("pointermove", pointerMove);
      el.removeEventListener("pointerup", pointerUp);
      el.removeEventListener("pointerleave", pointerUp);
    };
  }, [wheelHandler, pointerDown, pointerMove, pointerUp]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden"
      style={{
        touchAction: "none",
        cursor: isPanning.current ? "grabbing" : "grab",
      }}
    >
      {children(transform)}
    </div>
  );
}
