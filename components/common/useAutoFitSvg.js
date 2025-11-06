// /components/common/useAutoFitSvg.js
import { useMemo } from "react";

/**
 * Computes an auto-fitting SVG scale + translation so any mm-based layout
 * fits neatly into a fixed logical viewport (default 1600x900).
 */
export default function useAutoFitSvg(totalW, totalH, options = {}) {
  const {
    viewportW = 1600,
    viewportH = 900,
    fitRatio = 0.75,
    offsetY = 40,
  } = options;

  return useMemo(() => {
    if (!totalW || !totalH) return { scale: 1, offsetX: 0, offsetY: 0, vbW: viewportW, vbH: viewportH };

    const scale = Math.min(
      (viewportW * fitRatio) / totalW,
      (viewportH * (fitRatio + 0.1)) / totalH
    );
    const offsetX = (viewportW - totalW * scale) / 2;
    const offsetYAdj = (viewportH - totalH * scale) / 2 + offsetY;

    return { scale, offsetX, offsetY: offsetYAdj, vbW: viewportW, vbH: viewportH };
  }, [totalW, totalH, viewportW, viewportH, fitRatio, offsetY]);
}
