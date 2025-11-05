"use client";
import { usePlanner } from "./store/plannerStore";

export default function RoomSummary({ onBack }) {
  const { walls, items } = usePlanner();
  const total = items.length; // hook up pricing later

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold">Plans & images</div>
        <button onClick={onBack} className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200">Back</button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="rounded-xl border p-3 bg-white">Top view (export SVG later)</div>
        <div className="rounded-xl border p-3 bg-white">Front Elevation</div>
        <div className="rounded-xl border p-3 bg-white">Side Elevation</div>
      </div>

      <div className="rounded-xl border bg-white p-3">
        <div className="font-medium mb-2">Items</div>
        <ul className="text-sm space-y-1">
          {items.map(i=>(
            <li key={i.id} className="flex justify-between">
              <span>{i.type}</span>
              <span>{i.size.join(" x ")} m</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 text-sm text-slate-500">Total items: {total}</div>
      </div>
    </div>
  );
}
