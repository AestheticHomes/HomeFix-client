"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import useAutoFitSvg from "@/components/common/useAutoFitSvg";

type Transform = { x: number; y: number; z: number };

type PanZoomViewportProps = {
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
}: PanZoomViewportProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [transform, setTransform] = useState<Transform>({ x: 0, y: 0, z: 1 });
  const isPanningRef = useRef(false);
  const lastPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const fit = useAutoFitSvg(sceneWidth, sceneHeight, {
    viewportW: sceneWidth,
    viewportH: sceneHeight,
    paddingRatio: 0.1,
  });

  const fitToViewport = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    setTransform({
      x: fit.offsetX,
      y: fit.offsetY,
      z: fit.scale,
    });
  }, [fit.offsetX, fit.offsetY, fit.scale]);

  useEffect(() => {
    if (autoFitOnMount) fitToViewport();
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(fitToViewport);
    observer.observe(el);
    return () => observer.disconnect();
  }, [autoFitOnMount, fitToViewport]);

  useEffect(() => {
    if (autoFitOnFitKeyChange) fitToViewport();
  }, [fitKey, autoFitOnFitKeyChange, fitToViewport]);

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    const el = containerRef.current;
    if (!el) return;
    const { clientWidth, clientHeight } = el;
    const rect = el.getBoundingClientRect();
    const cursorX = ((event.clientX - rect.left) / clientWidth) * sceneWidth;
    const cursorY = ((event.clientY - rect.top) / clientHeight) * sceneHeight;
    const zoomFactor = Math.exp(-event.deltaY * 0.001);
    setTransform((prev) => {
      const newZ = Math.max(0.2, Math.min(prev.z * zoomFactor, 10));
      const dx = cursorX - prev.x;
      const dy = cursorY - prev.y;
      return {
        x: cursorX - dx * (newZ / prev.z),
        y: cursorY - dy * (newZ / prev.z),
        z: newZ,
      };
    });
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    isPanningRef.current = true;
    lastPosRef.current = { x: event.clientX, y: event.clientY };
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isPanningRef.current) return;
    const el = containerRef.current;
    if (!el) return;
    const { clientWidth, clientHeight } = el;
    const dxPx = event.clientX - lastPosRef.current.x;
    const dyPx = event.clientY - lastPosRef.current.y;
    const dx = (dxPx / clientWidth) * sceneWidth / transform.z;
    const dy = (dyPx / clientHeight) * sceneHeight / transform.z;
    lastPosRef.current = { x: event.clientX, y: event.clientY };
    setTransform((prev) => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    isPanningRef.current = false;
    (event.target as HTMLElement).releasePointerCapture(event.pointerId);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden"
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      style={{
        touchAction: "none",
        cursor: isPanningRef.current ? "grabbing" : "grab",
      }}
    >
      {children(transform)}
    </div>
  );
}
