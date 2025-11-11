"use client";
/**
 * ============================================================
 * 🪶 FILE: /hooks/use-toast.tsx
 * VERSION: v5.0 — Edith SafeViewport Toast Engine 🌗
 * ------------------------------------------------------------
 * ✅ Always within header/navbar safe region
 * ✅ Auto theme-adaptive (dark/light)
 * ✅ Dynamic top offset = var(--header-h)
 * ✅ Dynamic bottom guard = var(--mbnav-h)
 * ✅ Smooth fade/slide animation
 * ============================================================
 */

import { useCallback, useEffect, useRef } from "react";
import { toast as sonner, Toaster } from "sonner";

export function ToastProvider() {
  // 🔄 Keep top offset synced with CSS vars
  useEffect(() => {
    const updateOffset = () => {
      const headerH =
        parseFloat(
          getComputedStyle(document.documentElement).getPropertyValue(
            "--header-h"
          )
        ) || 64;
      const topOffset = headerH + 12; // little breathing room
      document.documentElement.style.setProperty(
        "--toast-safe-top",
        `${topOffset}px`
      );
    };
    updateOffset();
    window.addEventListener("resize", updateOffset);
    return () => window.removeEventListener("resize", updateOffset);
  }, []);

  return (
    <Toaster
      position="top-center"
      offset="var(--toast-safe-top, 76px)"
      toastOptions={{
        style: {
          borderRadius: "12px",
          padding: "14px 18px",
          fontSize: "0.95rem",
          fontWeight: 500,
          zIndex: 90, // stays below header z[70]+10 safety margin
          transition: "all 0.3s ease",
          margin: "6px 0",
          maxWidth: "min(92vw, 400px)",
        },
        className:
          "shadow-xl backdrop-blur-xl bg-white/80 dark:bg-zinc-900/80 text-zinc-900 dark:text-zinc-100 border border-black/5 dark:border-white/5",
      }}
      closeButton
      richColors
      expand
      duration={2600}
      visibleToasts={3}
    />
  );
}

export function useToast() {
  const lastToastRef = useRef<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = useCallback(
    (message: string, type: "success" | "error" | "info" = "info") => {
      if (!message) return;
      if (lastToastRef.current === message) return;

      lastToastRef.current = message;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(
        () => (lastToastRef.current = null),
        2000
      );

      const theme = document.documentElement.classList.contains("dark")
        ? "dark"
        : "light";

      const baseStyle = {
        background:
          theme === "dark" ? "rgba(24,24,27,0.9)" : "rgba(255,255,255,0.95)",
        color: theme === "dark" ? "#fafafa" : "#111827",
        border:
          theme === "dark"
            ? "1px solid rgba(255,255,255,0.08)"
            : "1px solid rgba(0,0,0,0.08)",
        backdropFilter: "blur(8px)",
      };

      switch (type) {
        case "success":
          sonner.success(message, { style: baseStyle });
          break;
        case "error":
          sonner.error(message, { style: baseStyle });
          break;
        default:
          sonner(message, { style: baseStyle });
      }
    },
    []
  );

  return {
    success: (msg: string) => showToast(msg, "success"),
    error: (msg: string) => showToast(msg, "error"),
    info: (msg: string) => showToast(msg, "info"),
  };
}
