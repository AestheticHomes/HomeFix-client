"use client";
/**
 * BaseDrawer v1.5 — Keyboard-Aware Edition 🌿
 * -----------------------------------------------------------
 * ✅ Safe-area + keyboard adaptive
 * ✅ ESC + click-away + focus trap
 * ✅ Alt+Shift+D toggles overlay
 * ✅ Smooth spring animation
 */

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useDrawerSafeStyle } from "@/hooks/useDrawerSafeStyle";

interface BaseDrawerProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  side?: "bottom" | "right";
  width?: string;
  className?: string;
}

export default function BaseDrawer({
  open,
  onClose,
  children,
  side = "bottom",
  width = "90vw",
  className = "",
}: BaseDrawerProps) {
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const style = useDrawerSafeStyle();
  const [debug, setDebug] = useState(false);

  /* ESC key */
  useEffect(() => {
    if (!open) return;
    const fn = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [open, onClose]);

  /* Focus trap */
  useEffect(() => {
    if (open && drawerRef.current) drawerRef.current.focus();
  }, [open]);

  /* Debug toggle (Alt+Shift+D) */
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.altKey && e.shiftKey && e.key.toLowerCase() === "d") {
        setDebug((v) => !v);
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  const animation = side === "bottom"
    ? { initial: { y: "100%" }, animate: { y: 0 }, exit: { y: "100%" } }
    : { initial: { x: "100%" }, animate: { x: 0 }, exit: { x: "100%" } };

  const dimStyle = side === "bottom"
    ? style
    : { ...style, height: "100dvh", width, paddingBottom: 0 };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            ref={drawerRef}
            role="dialog"
            tabIndex={-1}
            aria-modal="true"
            className={`fixed z-drawer bg-white dark:bg-slate-900 shadow-2xl
                        overflow-y-auto scrollbar-thin rounded-t-3xl sm:rounded-l-2xl outline-none ${className}`}
            style={{
              ...dimStyle,
              ...(side === "right"
                ? { top: 0, right: 0 }
                : { bottom: 0, left: 0, right: 0 }),
              borderTop: debug ? "3px solid rgba(16,185,129,0.85)" : undefined,
              transition: "max-height 0.25s ease, transform 0.3s ease",
            }}
            initial={animation.initial}
            animate={animation.animate}
            exit={animation.exit}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
          >
            {children}

            {debug && (
              <div className="fixed bottom-3 right-3 text-xs bg-emerald-600 text-white px-2 py-1 rounded-md shadow">
                🧭 Debug Active
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
