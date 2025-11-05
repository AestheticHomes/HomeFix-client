"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStudio } from "@/contexts/StudioContext";

interface EdithBotProps {
  onGenerate?: (data: Record<string, any>) => void;
}

/**
 * 🤖 EdithBot v1.0 — Smart AI Design Assistant for Studio/Viewer
 * --------------------------------------------------------------
 * Guides users through designing spaces (kitchen, wardrobe, etc.)
 * Appears as a floating bubble with adaptive dialogue and actions.
 */
export default function EdithBot({ onGenerate }: EdithBotProps) {
  const { roomData, setRoomData, step, setStep, currentObject, setCurrentObject, mode, setMode, lastAction } =
    useStudio();

  const [isOpen, setIsOpen] = useState(false);
  const [localStep, setLocalStep] = useState("greeting");
  const [selected, setSelected] = useState<Record<string, any>>({});
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [message, setMessage] = useState("");
  const [displayedText, setDisplayedText] = useState("");
const idleTimer = useRef<NodeJS.Timeout | null>(null);


  // Greeting message logic
  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning ☀️";
    if (h < 18) return "Good afternoon 🌤️";
    return "Good evening 🌙";
  };

  // Typing effect
  useEffect(() => {
    let i = 0;
    setDisplayedText("");
    const interval = setInterval(() => {
      if (i < message.length) {
        setDisplayedText((p) => p + message[i]);
        i++;
      } else clearInterval(interval);
    }, 25);
    return () => clearInterval(interval);
  }, [message]);

  // Idle timer — auto open after inactivity
 useEffect(() => {
  if (idleTimer.current) clearTimeout(idleTimer.current);

  idleTimer.current = setTimeout(() => {
    if (!isOpen) {
      setIsOpen(true);
      setLocalStep("assist");
      setMessage("Still here 👋 — want to continue designing?");
    }
  }, 45000);

  return () => {
    if (idleTimer.current) {
      clearTimeout(idleTimer.current);
      idleTimer.current = null;
    }
  };
}, [lastAction]);


  // Step auto-switch after room creation
  useEffect(() => {
    if (roomData && step !== "drawing") {
      setLocalStep("placement");
      setMessage("Your room’s ready! Add furniture or lighting?");
    }
  }, [roomData]);

  // Interaction handlers
  const handleCategorySelect = (type: string) => {
    setSelected({ type });
    setStep("drawing");
    if (type === "kitchen") setLocalStep("kitchenShape");
    else setLocalStep("size");
    setMessage(`Alright! Let’s start your ${type}.`);
  };

  const handleKitchenShapeSelect = (shape: string) => {
    setSelected((p) => ({ ...p, shape }));
    setLocalStep("size");
  };

  const handleConfirm = () => {
    const data = {
      type: selected.type ?? "generic",
      shape: selected.shape ?? "none",
      length: parseFloat(length) || 10,
      width: parseFloat(width) || 10,
      height: 11,
    };
    onGenerate?.(data);
    setRoomData(data);
    setStep("drawing");
    setMode("2D");
    setLocalStep("confirm");
    setMessage("Got it! Now draw your room outline (top-view).");
  };

  const handlePlacementSelect = (obj: string) => {
    setCurrentObject(obj);
    setIsOpen(false);
    setMessage(`Placing ${obj.replace("_", " ")} — click to add.`);
  };

  // Static UI data
  const categories = [
    { label: "🍳 Design a Kitchen", type: "kitchen" },
    { label: "🛏️ Make My Bedroom", type: "bedroom" },
    { label: "🚿 Redesign Bathroom", type: "bathroom" },
    { label: "🖥️ Draw My TV Unit", type: "tv_unit" },
    { label: "👕 Plan My Wardrobe", type: "wardrobe" },
  ];

  const kitchenShapes = [
    { label: "L-Shaped", shape: "l_shape" },
    { label: "U-Shaped", shape: "u_shape" },
    { label: "Parallel", shape: "parallel" },
    { label: "Straight Line", shape: "straight" },
  ];

  const placementOptions = [
    { label: "🧱 Add Wardrobe", obj: "wardrobe" },
    { label: "🪟 Add Window", obj: "window" },
    { label: "🚪 Add Door", obj: "door" },
    { label: "🍽️ Add Kitchen Cabinet", obj: "kitchen_cabinet" },
  ];

  return (
    <>
      {/* 🔘 Floating toggle button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-[#9B5CF8] to-[#EC6ECF] shadow-xl flex items-center justify-center text-white text-2xl font-bold hover:scale-105 transition-transform"
        whileTap={{ scale: 0.9 }}
        title="EdithBot Assistant"
      >
        E
      </motion.button>

      {/* 💬 Interactive dialogue card */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-24 right-6 w-80 bg-white/90 dark:bg-[#1B1545]/80 backdrop-blur-xl shadow-2xl rounded-2xl p-5 text-sm border border-[#9B5CF8]/30 overflow-y-auto max-h-[70vh]"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3 }}
          >
            {localStep === "greeting" && (
              <div className="space-y-4">
                <p className="font-semibold text-[#9B5CF8]">
                  {getGreeting()}, I’m <b>EdithBot</b> 👋
                </p>
                <p className="text-slate-600 dark:text-slate-300">
                  What would you like to design today?
                </p>
                <div className="grid gap-2">
                  {categories.map((c) => (
                    <button
                      key={c.type}
                      onClick={() => handleCategorySelect(c.type)}
                      className="p-2 rounded-lg bg-[#F5F3FF] hover:bg-[#EDE9FE] dark:bg-[#2A225A] dark:hover:bg-[#3B2C7D] text-left transition-all"
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {localStep === "kitchenShape" && (
              <div className="space-y-4">
                <p className="font-semibold text-[#9B5CF8]">Select your kitchen layout:</p>
                <div className="grid grid-cols-2 gap-2">
                  {kitchenShapes.map((k) => (
                    <button
                      key={k.shape}
                      onClick={() => handleKitchenShapeSelect(k.shape)}
                      className="p-2 rounded-lg bg-[#F5F3FF] hover:bg-[#EDE9FE] dark:bg-[#2A225A] dark:hover:bg-[#3B2C7D]"
                    >
                      {k.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {localStep === "size" && (
              <div className="space-y-4">
                <p className="font-semibold text-[#9B5CF8]">Set your room size:</p>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Length (ft)"
                    value={length}
                    onChange={(e) => setLength(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border border-[#9B5CF8]/30 focus:ring-2 focus:ring-[#9B5CF8]"
                  />
                  <input
                    type="number"
                    placeholder="Width (ft)"
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border border-[#9B5CF8]/30 focus:ring-2 focus:ring-[#9B5CF8]"
                  />
                </div>
                <button
                  onClick={handleConfirm}
                  className="w-full py-2 rounded-lg bg-gradient-to-r from-[#9B5CF8] to-[#EC6ECF] text-white font-medium"
                >
                  Draw My Room 🏗️
                </button>
              </div>
            )}

            {localStep === "placement" && (
              <div className="space-y-3">
                <p className="font-semibold text-[#9B5CF8]">{displayedText}</p>
                <div className="grid gap-2">
                  {placementOptions.map((p) => (
                    <button
                      key={p.obj}
                      onClick={() => handlePlacementSelect(p.obj)}
                      className="p-2 rounded-lg bg-[#F5F3FF] hover:bg-[#EDE9FE] dark:bg-[#2A225A] dark:hover:bg-[#3B2C7D]"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {localStep === "assist" && (
              <div className="space-y-3 text-center">
                <p className="font-semibold text-[#9B5CF8]">{displayedText}</p>
                <button
                  onClick={() => {
                    setLocalStep("placement");
                    setIsOpen(true);
                  }}
                  className="px-4 py-2 rounded-lg bg-[#9B5CF8]/20 hover:bg-[#9B5CF8]/30 transition"
                >
                  Let’s continue →
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
