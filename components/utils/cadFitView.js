// edith-cad-fitview v1.0
// [edith-cad][fitview][scale][center][bbox]
// Compute a transform that centers & fits any set of rects into a target SVG view.
// Inputs & bbox are in the SAME units you draw with (mm in our kitchen flow).
export function fitToView(rects, viewW, viewH, padPct = 0.12) {
  if (!Array.isArray(rects) || rects.length === 0) {
    return { scale: 1, tx: viewW * 0.5, ty: viewH * 0.5, bbox: { x: 0, y: 0, w: 0, h: 0 } };
  }

  const xs = rects.flatMap(r => [r.x, r.x + r.w]);
  const ys = rects.flatMap(r => [r.y, r.y + r.h]);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const bw = Math.max(1, maxX - minX);
  const bh = Math.max(1, maxY - minY);

  // available drawing size after padding (in view units)
  const padW = viewW * padPct;
  const padH = viewH * padPct;
  const availW = Math.max(1, viewW - padW * 2);
  const availH = Math.max(1, viewH - padH * 2);

  const s = Math.min(availW / bw, availH / bh);

  // translate so bbox center lands in the view center
  const cx = minX + bw / 2;
  const cy = minY + bh / 2;
  const tx = viewW / 2 - cx * s;
  const ty = viewH / 2 - cy * s;

  return { scale: s, tx, ty, bbox: { x: minX, y: minY, w: bw, h: bh } };
}
