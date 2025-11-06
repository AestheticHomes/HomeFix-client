"use client";
//app/stud
import { usePlanner } from "@/components/studio/store/plannerStore";
import RoomShapeSelector from "@/components/studio/RoomShapeSelector";
import RoomPlanner2D from "@/components/studio/RoomPlanner2D_SVG";
import RoomPlanner3D from "@/components/studio/RoomPlanner3D";
import RoomSummary from "@/components/studio/RoomSummary";
import { useEffect } from "react";
import { useStudio } from "@/contexts/StudioContext";

export default function StudioPage() {
  // ✅ get step from StudioContext, not planner
  const { step, setStep } = useStudio();
  //const planner = usePlanner(); // still used for geometry, if needed later

  // Light background for all Studio views
  useEffect(() => {
    document.body.classList.add("bg-slate-50");
    return () => document.body.classList.remove("bg-slate-50");
  }, []);

  return (
    <main className="p-6 space-y-4 transition-all">
      {/* ───── Header Navigation ───── */}
      <header className="flex items-center justify-between">
        <nav className="flex gap-2 flex-wrap">
          {[
            { key: "shape", label: "Room shape" },
            { key: "define2d", label: "Define space" },
            { key: "plan3d", label: "3D view" },
            { key: "summary", label: "Make it happen" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setStep(key)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                step === key
                  ? "bg-[#9B5CF8] text-white shadow"
                  : "bg-white border hover:bg-slate-100"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </header>

      {/* ───── Step-based Rendering ───── */}
      {step === "shape" && (
        <div className="relative h-[72vh] rounded-xl border bg-white shadow-sm">
          <RoomShapeSelector />
        </div>
      )}

      {step === "define2d" && (
        <RoomPlanner2D onContinue={() => setStep("plan3d")} />
      )}

      {step === "plan3d" && (
        <RoomPlanner3D onSummary={() => setStep("summary")} />
      )}

      {step === "summary" && (
        <RoomSummary onBack={() => setStep("plan3d")} />
      )}
    </main>
  );
}
