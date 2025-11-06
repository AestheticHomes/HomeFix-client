// /components/utils/cadFitView.js
// [edith-cadfit][v2025.11 adaptive-zoom-centering]
// Ensures proper fit-to-view scaling & centering for any multi-wall layout.

export function fitToView(rects, viewW, viewH, paddingRatio = 0.08) {
  if (!rects || rects.length === 0) {
    return {
      scale: 1,
      tx: 0,
      ty: 0,
      bbox: { x: 0, y: 0, w: 0, h: 0 },
    };
  }

  // Compute overall bounding box
  const minX = Math.min(...rects.map((r) => r.x));
  const minY = Math.min(...rects.map((r) => r.y));
  const maxX = Math.max(...rects.map((r) => r.x + r.w));
  const maxY = Math.max(...rects.map((r) => r.y + r.h));

  const bbox = {
    x: minX,
    y: minY,
    w: maxX - minX,
    h: maxY - minY,
  };

  // Apply symmetric padding
  const padW = bbox.w * paddingRatio;
  const padH = bbox.h * paddingRatio;
  const fullW = bbox.w + padW * 2;
  const fullH = bbox.h + padH * 2;

  // Scale that fits both width and height
  const scale = Math.min(viewW / fullW, viewH / fullH);

  // Center inside the viewbox
  const tx = (viewW - bbox.w * scale) / 2 - bbox.x * scale;
  const ty = (viewH - bbox.h * scale) / 2 - bbox.y * scale;

  return { scale, tx, ty, bbox };
}
