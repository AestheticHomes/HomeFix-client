"use client";
//components/store/plannerStore.js
import { create } from "zustand";

const uid = () => Math.random().toString(36).slice(2, 9);
const ft = (mm) => Math.round((mm / 304.8) * 100) / 100; // mm → ft (2 d.p.)
const mm = (ftVal) => Math.round(ftVal * 304.8);         // ft → mm

// ==================== ROOM TEMPLATES ====================
const ROOM_TEMPLATES = {
  rectangle: () => [
    { id: uid(), a: [0, 0], b: [4000, 0] },
    { id: uid(), a: [4000, 0], b: [4000, 3000] },
    { id: uid(), a: [4000, 3000], b: [0, 3000] },
    { id: uid(), a: [0, 3000], b: [0, 0] },
  ],
  l_shape: () => [
    { id: uid(), a: [0, 0], b: [5500, 0] },
    { id: uid(), a: [5500, 0], b: [5500, 2000] },
    { id: uid(), a: [5500, 2000], b: [4000, 2000] },
    { id: uid(), a: [4000, 2000], b: [4000, 5000] },
    { id: uid(), a: [4000, 5000], b: [0, 5000] },
    { id: uid(), a: [0, 5000], b: [0, 0] },
  ],
  chamfer: () => [
    { id: uid(), a: [0, 0], b: [4800, 0] },
    { id: uid(), a: [4800, 0], b: [4800, 2400] },
    { id: uid(), a: [4800, 2400], b: [3800, 3400] },
    { id: uid(), a: [3800, 3400], b: [0, 3400] },
    { id: uid(), a: [0, 3400], b: [0, 0] },
  ],
};

// ==================== PLANNER STORE ====================
export const usePlanner = create((set, get) => ({
  ceiling: 2500, // mm
  walls: ROOM_TEMPLATES.rectangle(),
  doors: [],
  windows: [],
  items: [],

  // 🔹 Load a new room template
  loadTemplate: (key) =>
    set({
      walls: ROOM_TEMPLATES[key](),
      doors: [],
      windows: [],
      items: [],
    }),

  // 🔹 Set shape (used by RoomShapeSelector)
  setRoomShape: (shapeKey) => {
    if (!ROOM_TEMPLATES[shapeKey]) {
      console.warn(`⚠️ Unknown room shape: ${shapeKey}`);
      return;
    }
    set({
      walls: ROOM_TEMPLATES[shapeKey](),
      doors: [],
      windows: [],
    });
    console.log(`🏗️ Loaded room shape: ${shapeKey}`);
  },

  // ========== 2D Editing ==========

  // Move an entire wall by dragging along its normal
  nudgeWall: (wallId, delta) => {
    const W = structuredClone(get().walls);
    const idx = W.findIndex((w) => w.id === wallId);
    if (idx < 0) return;
    const w = W[idx];
    const vx = w.b[0] - w.a[0];
    const vy = w.b[1] - w.a[1];
    const len = Math.hypot(vx, vy) || 1;
    const nx = +(vy / len),
      ny = +(-(vx / len));
    const dx = Math.round(nx * delta),
      dy = Math.round(ny * delta);

    // shift endpoints
    w.a = [w.a[0] + dx, w.a[1] + dy];
    w.b = [w.b[0] + dx, w.b[1] + dy];

    // keep polygon closed
    const prev = W[(idx - 1 + W.length) % W.length];
    const next = W[(idx + 1) % W.length];
    prev.b = w.a;
    next.a = w.b;

    set({ walls: W });
  },

  // Resize one end of a wall
  stretchWallEnd: (wallId, whichEnd, delta) => {
    const W = structuredClone(get().walls);
    const idx = W.findIndex((w) => w.id === wallId);
    if (idx < 0) return;
    const w = W[idx];
    const axisX =
      Math.abs(w.a[0] - w.b[0]) >= Math.abs(w.a[1] - w.b[1]); // horizontal?
    const sign = whichEnd === "a" ? -1 : +1;
    if (axisX) {
      w[whichEnd][0] += Math.round(sign * delta);
    } else {
      w[whichEnd][1] += Math.round(sign * delta);
    }
    const prev = W[(idx - 1 + W.length) % W.length];
    const next = W[(idx + 1) % W.length];
    prev.b = w.a;
    next.a = w.b;
    set({ walls: W });
  },

  // ========== Openings (doors/windows) ==========
  addDoor: (wallId, offset = 900, width = 900) =>
    set({
      doors: [
        ...get().doors,
        { id: uid(), wallId, offset, width },
      ],
    }),

  addWindow: (wallId, offset = 1200, width = 1200, sillH = 900, height = 1200) =>
    set({
      windows: [
        ...get().windows,
        { id: uid(), wallId, offset, width, sillH, height },
      ],
    }),

  moveOpening: (type, id, patch) =>
    set({
      [type]: get()[type].map((o) =>
        o.id === id ? { ...o, ...patch } : o
      ),
    }),

  removeOpening: (type, id) =>
    set({
      [type]: get()[type].filter((o) => o.id !== id),
    }),

  // ========== 3D items ==========
  addItem: (it) =>
    set({
      items: [...get().items, { ...it, id: uid() }],
    }),
  updateItem: (id, patch) =>
    set({
      items: get().items.map((i) =>
        i.id === id ? { ...i, ...patch } : i
      ),
    }),
  removeItem: (id) =>
    set({
      items: get().items.filter((i) => i.id !== id),
    }),
}));

export const helpers = { uid, ft, mm, ROOM_TEMPLATES };
