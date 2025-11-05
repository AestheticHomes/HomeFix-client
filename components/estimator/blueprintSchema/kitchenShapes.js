// components/estimator/blueprintSchema/kitchenShapes.js
// ============================================================================
//  Edith Kitchen Schemas (v5.1 CAD-stable)
//  Search keys: [edith-cad][kitchenShapes][rules][offsets]
//  Notes:
//   • All values in mm. UI passes ft; interpreter converts when needed.
//   • Intersection deductions for cabinet run measurements:
//       - L-Shape: subtract 600 mm on the intersecting leg
//       - U-Shape: subtract 1200 mm (600 mm each inner intersection)
//   • Measurement mode toggle:
//       - ROOM SIZE  (outer) -> no deduction
//       - UNIT SIZE  (cabinet run) -> apply deductions
// ============================================================================

import { FT_MM } from "./interpreter";

// ---------------- Global CAD constants (searchable) ----------------
const D = 600;                 // [edith-const] Base counter depth (mm)
const GAP = 1200;              // [edith-const] Galley gap (mm)
const INSET = 80;              // [edith-const] Appliance inset within counter (mm)
const SINK = { w: 900, h: 520 };   // [edith-const] Sink footprint (mm)
const HOB  = { w: 700, h: 440 };   // [edith-const] Hob footprint (mm)

// ---------------- Measurement Mode (no UI; hardcoded toggle) ----------------
// false => Room Size (outer footprint)
// true  => Unit Measurement (net usable cabinet run)
const USE_UNIT_MEASUREMENT = false; // [edith-flag][measurement-mode]
const L_INTERSECT_DEDUCT = 600;     // [edith-const] L-shape deduction (mm)
const U_INTERSECT_DEDUCT = 1200;    // [edith-const] U-shape deduction (mm) per total

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

// Place centered within a horizontal run
const centerX = (runLen, compW, ratio = 0.5) =>
  clamp(runLen * ratio - compW / 2, INSET, runLen - INSET - compW);

// Place centered within a vertical leg
const centerY = (legLen, compH, ratio = 0.5) =>
  clamp(legLen * ratio - compH / 2, INSET, legLen - INSET - compH);

// mm shortcuts if UI passes ft
const mm = (ftOrMm) => ftOrMm; // schemas receive mm from interpreter (vars are mm)

export const kitchenShapes = {
  // ----------------------------------------------------------------
  // LINEAR — hob & sink on same wall (exception to one-per-wall rule)
  // ----------------------------------------------------------------
  linear: {
    name: "Single Wall (Linear)",
    walls: ({ A = 10 * FT_MM }) => [
      { x: 0, y: 0, w: mm(A), h: D },
    ],
    appliances: ({ A = 10 * FT_MM }) => {
      const runA = mm(A);
      const hobX = centerX(runA, HOB.w, 0.35);
      const sinkX = centerX(runA, SINK.w, 0.7);
      return {
        hob:  { x: hobX,  y: INSET, w: HOB.w,  h: HOB.h },
        sink: { x: sinkX, y: INSET, w: SINK.w, h: SINK.h },
      };
    },
  },

  // ----------------------------------------------------------------
  // L-SHAPE — bottom run A + left leg B
  //  Rule: hob on A (horizontal), sink on B (vertical, far from corner)
  //  Unit Measurement ⇒ deduct 600 mm on leg B
  // ----------------------------------------------------------------
  lshape: {
    name: "L-Shape Kitchen",
    walls: ({ A = 10 * FT_MM, B = 8 * FT_MM }) => {
      const runA = mm(A);
      const legB = USE_UNIT_MEASUREMENT ? Math.max(0, mm(B) - L_INTERSECT_DEDUCT) : mm(B);
      return [
        { x: 0,      y: legB - D, w: runA, h: D }, // bottom
        { x: 0,      y: 0,        w: D,    h: legB }, // left leg up
      ];
    },
    appliances: ({ A = 10 * FT_MM, B = 8 * FT_MM }) => {
      const runA = mm(A);
      const legB = USE_UNIT_MEASUREMENT ? Math.max(0, mm(B) - L_INTERSECT_DEDUCT) : mm(B);

      // Hob (horizontal wall)
      const hobX = centerX(runA, HOB.w, 0.50);
      // Sink (vertical leg) near the far end from the corner
      const sinkY = centerY(legB, SINK.h, 0.70);

      return {
        hob:  { x: hobX, y: legB - D + INSET, w: HOB.w,  h: HOB.h },
        sink: { x: INSET, y: sinkY,            w: SINK.w, h: SINK.h },
      };
    },
  },

  // ----------------------------------------------------------------
  // PARALLEL — two horizontal runs A (top), B (bottom), centered opposite
  // ----------------------------------------------------------------
  parallel: {
    name: "Galley (Parallel)",
    walls: ({ A = 10 * FT_MM, B = 8 * FT_MM }) => [
      { x: 0, y: 0,          w: mm(A), h: D },            // top
      { x: 0, y: D + GAP,    w: mm(B), h: D },            // bottom
    ],
    appliances: ({ A = 10 * FT_MM, B = 8 * FT_MM }) => {
      const runA = mm(A);
      const runB = mm(B);
      return {
        hob:  { x: centerX(runA, HOB.w, 0.50),  y: INSET,           w: HOB.w,  h: HOB.h },
        sink: { x: centerX(runB, SINK.w, 0.50), y: D + GAP + INSET, w: SINK.w, h: SINK.h },
      };
    },
  },

  // ----------------------------------------------------------------
  // U-SHAPE — top run A + two legs B (left) & C (right)
  //  Rule: hob top center, sink on longer leg, vertical & away from corner
  //  Unit Measurement ⇒ deduct 1200 mm (600 each inner intersection):
  //     • top inner run becomes (A - 2*600) – used for center placement
  //     • each leg deducts 600 mm from the segment touching the top
  // ----------------------------------------------------------------
  u: {
    name: "U-Shape Kitchen",
    walls: ({ A = 10 * FT_MM, B = 8 * FT_MM, C = 10 * FT_MM }) => {
      const rawA = mm(A), rawB = mm(B), rawC = mm(C);
      const innerA = USE_UNIT_MEASUREMENT ? Math.max(0, rawA - U_INTERSECT_DEDUCT) : rawA;
      const legB   = USE_UNIT_MEASUREMENT ? Math.max(0, rawB - L_INTERSECT_DEDUCT) : rawB;
      const legC   = USE_UNIT_MEASUREMENT ? Math.max(0, rawC - L_INTERSECT_DEDUCT) : rawC;

      // Draw outer geometry (visual), top spans rawA, legs span rawB/rawC from top
      return [
        { x: 0,      y: 0, w: rawA, h: D }, // top
        { x: 0,      y: 0, w: D,    h: rawB }, // left leg
        { x: rawA - D, y: 0, w: D,  h: rawC }, // right leg
      ];
    },
    appliances: ({ A = 10 * FT_MM, B = 8 * FT_MM, C = 10 * FT_MM }) => {
      const rawA = mm(A), rawB = mm(B), rawC = mm(C);
      const innerA = USE_UNIT_MEASUREMENT ? Math.max(0, rawA - U_INTERSECT_DEDUCT) : rawA;
      const legB   = USE_UNIT_MEASUREMENT ? Math.max(0, rawB - L_INTERSECT_DEDUCT) : rawB;
      const legC   = USE_UNIT_MEASUREMENT ? Math.max(0, rawC - L_INTERSECT_DEDUCT) : rawC;

      // Hob centered on the inner run of top
      const hobInnerX = centerX(innerA, HOB.w, 0.50);
      // Convert inner run coordinate to outer coordinate (offset by 600 on left if unit mode)
      const hobOuterX = USE_UNIT_MEASUREMENT ? (600 + hobInnerX) : hobInnerX;

      // Sink on the longer leg, vertical and away from corner
      const rightIsLonger = rawC >= rawB;
      const sinkLegH = rightIsLonger ? legC : legB;
      const sinkY = centerY(sinkLegH, SINK.h, 0.70);

      return {
        hob:  { x: hobOuterX, y: INSET, w: HOB.w,  h: HOB.h },
        sink: rightIsLonger
          ? { x: rawA - D + INSET, y: sinkY, w: SINK.w, h: SINK.h }     // right leg
          : { x: INSET,            y: sinkY, w: SINK.w, h: SINK.h },     // left leg
      };
    },
  },
};
