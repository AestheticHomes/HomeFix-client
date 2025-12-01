// components/instant-quote/blueprintSchema/interpreter.js
// ============================================================================
//  Edith CAD Core – Expression Evaluator + Blueprint Expander  (v3.6 final)
//  Search keys: [edith-cad][interpreter][eval][expand]
//  Notes:
//   • Evaluates string math like "A/2 - 350", "-B + 1000", "A - 1200"
//   • Accepts functional schemas (walls/appliances) with {A,B,C} in mm
//   • Safe numerics everywhere (toFinite)
// ============================================================================

/** @constant FT_MM — 1 foot (ft) in millimeters (mm) */
export const FT_MM = 304.8;

/** Coerce any value to finite number (mm). Search: [edith-util][toFinite] */
function toFinite(n, fallback = 0) {
  const v = Number(n);
  return Number.isFinite(v) ? v : fallback;
}

/** Evaluate an expression with given variables. Search: [edith-cad][evaluate] */
export function evaluate(expr, vars) {
  if (expr == null) return 0;
  if (typeof expr === "number") return expr;
  if (typeof expr === "string") {
    try {
      const fn = new Function(...Object.keys(vars), `return (${expr});`);
      const out = fn(...Object.values(vars));
      return toFinite(out, 0);
    } catch (e) {
      console.warn("⚠️ evaluate() failed:", expr, e);
      return 0;
    }
  }
  return toFinite(expr, 0);
}

/**
 * Expand a blueprint schema into absolute rectangles (mm).
 * Accepts:
 *  - schema.walls: Array | (vars)=>Array | ({walls, appliances})
 *  - schema.appliances: Object | (vars)=>Object
 * Search: [edith-cad][expandShape]
 */
export function expandShape(schema, dims) {
  if (!schema) {
    console.warn("⚠️ expandShape: Missing schema");
    return { walls: [], appliances: {} };
  }

  // Ensure mm inputs for A/B/C (UI sends ft; schema helpers already convert ft→mm when needed)
  const vars = {
    A: toFinite(dims?.A, 0),
    B: toFinite(dims?.B, 0),
    C: toFinite(dims?.C, 0),
  };

  let wallsDef = schema.walls;
  let appliancesDef = schema.appliances;
  let wallsArr = [];
  let appliancesObj = {};

  // walls may be function or array or object with {walls, appliances}
  if (typeof wallsDef === "function") {
    const out = wallsDef(vars);
    if (Array.isArray(out)) {
      wallsArr = out;
    } else if (out && Array.isArray(out.walls)) {
      wallsArr = out.walls;
      if (out.appliances) appliancesObj = out.appliances;
    } else {
      console.warn("⚠️ walls() did not return array/object:", out);
    }
  } else if (Array.isArray(wallsDef)) {
    wallsArr = wallsDef;
  } else if (wallsDef != null) {
    console.warn("⚠️ walls is neither array nor function:", wallsDef);
  }

  // appliances from walls() result has priority; else schema.appliances
  if (!Object.keys(appliancesObj).length) {
    if (typeof appliancesDef === "function") {
      appliancesObj = appliancesDef(vars);
    } else {
      appliancesObj = appliancesDef || {};
    }
  }

  // Build wall rectangles
  const walls = wallsArr.map((w, i) => ({
    x: toFinite(evaluate(w.x, vars), 0),
    y: toFinite(evaluate(w.y, vars), 0),
    w: toFinite(evaluate(w.w, vars), 0),
    h: toFinite(evaluate(w.h, vars), 0),
    _i: i + 1,
  }));

  // Build appliances
  const appliances = Object.fromEntries(
    Object.entries(appliancesObj).map(([k, a]) => [
      k,
      {
        x: toFinite(evaluate(a.x, vars), 0),
        y: toFinite(evaluate(a.y, vars), 0),
        w: toFinite(a.w ?? 1000),
        h: toFinite(a.h ?? 500),
      },
    ])
  );

  // Debug logs – Comment out if noisy. Search: [edith-debug][expandShape]
  const FT = FT_MM;
  const name = schema.name || "Unnamed Shape";
  console.group(`🧭 [${name}]`);
  walls.forEach((w) => {
    console.log(
      `Wall ${w._i}: X=${w.x} (${(w.x / FT).toFixed(2)}ft), Y=${w.y} (${(w.y / FT).toFixed(
        2
      )}ft), W=${w.w} (${(w.w / FT).toFixed(2)}ft), H=${w.h} (${(w.h / FT).toFixed(2)}ft)`
    );
  });
  Object.entries(appliances).forEach(([key, a]) => {
    console.log(
      `→ ${key.toUpperCase()}: X=${a.x} (${(a.x / FT).toFixed(2)}ft), Y=${a.y} (${(
        a.y / FT
      ).toFixed(2)}ft), W=${a.w}, H=${a.h}`
    );
  });
  console.groupEnd();

  return { walls, appliances };
}
