// /components/common/useAutoFitSvg.js
import { useMemo } from "react";
import { fitBox } from "@/components/utils/cadFitView";

/**
 * Computes an auto-fitting SVG scale + translation so any mm-based layout
 * fits neatly into a fixed logical viewport (default 1600x900).
 */
export default function useAutoFitSvg(totalW, totalH, options = {}) {
  const {
    viewportW = 1600,
    viewportH = 900,
    paddingRatio = 0.08,
  } = options;

  return useMemo(() => {
    if (!totalW || !totalH) {
      return {
        scale: 1,
        offsetX: 0,
        offsetY: 0,
        vbW: viewportW,
        vbH: viewportH,
      };
    }
    const fit = fitBox(
      viewportW,
      viewportH,
      { x: 0, y: 0, w: totalW, h: totalH },
      paddingRatio
    );
    return {
      scale: fit.scale,
      offsetX: fit.offsetX,
      offsetY: fit.offsetY,
      vbW: viewportW,
      vbH: viewportH,
    };
  }, [totalW, totalH, viewportW, viewportH, paddingRatio]);
}
