"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

// 🧩 Global room data definition
export interface RoomData {
  type?: string;
  shape?: string;
  length: number;
  width: number;
  height: number;
}

// 🎯 Studio context contract
interface StudioContextType {
  step: string;
  setStep: (step: string) => void;
  roomData: RoomData | null;
  setRoomData: (data: RoomData | null) => void;
  currentObject: string | null;
  setCurrentObject: (obj: string | null) => void;
  mode: "2D" | "3D";
  setMode: (mode: "2D" | "3D") => void;
  lastAction: number;
  registerAction: (actionName: string, payload?: Record<string, any>) => void;
  isIdle: boolean;

  // 🆕 Edith activity API
  lastActivity?: {
    at: number;
    type: string;
    payload?: Record<string, any>;
  };
  logActivity: (type: string, payload?: Record<string, any>) => void;
}

const StudioContext = createContext<StudioContextType | undefined>(undefined);

export function StudioProvider({ children }: { children: ReactNode }) {
  const [step, setStep] = useState("greeting");
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [currentObject, setCurrentObject] = useState<string | null>(null);
  const [mode, setMode] = useState<"2D" | "3D">("2D");
  const [lastAction, setLastAction] = useState<number>(Date.now());
  const [isIdle, setIsIdle] = useState(false);

  // 🆕 Activity tracker for Edith
  const [lastActivity, setLastActivity] = useState<{
    at: number;
    type: string;
    payload?: Record<string, any>;
  }>();

  // Register simple user activity (used by Edith’s idle logic)
  const registerAction = useCallback((actionName: string, payload?: Record<string, any>) => {
    console.log(`🎯 Action detected: ${actionName}`, payload || "");
    setLastAction(Date.now());
    setIsIdle(false);
    // mirror to activity logger
    setLastActivity({ at: Date.now(), type: actionName, payload });
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("edith:studio:activity", {
          detail: { at: Date.now(), type: actionName, payload },
        })
      );
    }
  }, []);

  // 🪶 Dedicated logActivity helper (alias to registerAction for 3D/2D)
  const logActivity = useCallback(
    (type: string, payload?: Record<string, any>) => registerAction(type, payload),
    [registerAction]
  );

  // 🕒 Idle detection logic
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setIsIdle(now - lastAction > 45000);
    }, 5000);
    return () => clearInterval(interval);
  }, [lastAction]);

  // 🧱 Mode feedback for debugging
  useEffect(() => {
    if (mode === "3D") console.log("🧊 Studio switched to 3D View (open-top room)");
    else console.log("📐 Studio active in 2D wall-drawing mode");
  }, [mode]);

  const value: StudioContextType = {
    step,
    setStep,
    roomData,
    setRoomData,
    currentObject,
    setCurrentObject,
    mode,
    setMode,
    lastAction,
    registerAction,
    isIdle,
    lastActivity,
    logActivity,
  };

  return <StudioContext.Provider value={value}>{children}</StudioContext.Provider>;
}

// 🧩 Hook to consume studio context
export function useStudio() {
  const context = useContext(StudioContext);
  if (!context) throw new Error("useStudio must be used within a StudioProvider");
  return context;
}
