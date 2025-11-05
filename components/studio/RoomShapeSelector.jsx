"use client";

import React from "react";
import { usePlanner } from "./store/plannerStore";
import { useStudio } from "@/contexts/StudioContext";

const shapes = [
  { id: "rect", name: "Rectangle", size: [4000, 3000] },
  { id: "lshape", name: "L-Shape", size: [4800, 3000] },
  { id: "tshape", name: "T-Shape", size: [4800, 3400] },
];

export default function RoomShapeSelector() {
  const { setRoomShape } = usePlanner(); // should create or reset walls based on shape
  const { setStep, registerAction } = useStudio();

  const handleSelect = (shape) => {
    // Step 1: generate walls for that shape
    setRoomShape(shape.id, shape.size);
    // Step 2: notify Edith (StudioContext) that user acted
    registerAction(`shape:selected:${shape.id}`);
    // Step 3: move to next step (2D define space)
    setStep("define2d");
  };

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 p-8">
      <h2 className="text-xl font-semibold text-slate-800">
        Select your room shape
      </h2>
      <div className="grid grid-cols-3 gap-6">
        {shapes.map((shape) => (
          <button
            key={shape.id}
            onClick={() => handleSelect(shape)}
            className="w-36 h-36 rounded-xl border border-slate-300 hover:border-[#9B5CF8] hover:bg-[#f5f3ff] transition flex items-center justify-center text-slate-600 hover:text-[#9B5CF8]"
          >
            {shape.name}
          </button>
        ))}
      </div>
      <p className="text-xs text-slate-400 mt-4">
        Choose a base shape to begin designing your space.
      </p>
    </div>
  );
}
