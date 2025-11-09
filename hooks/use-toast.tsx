"use client";
/**
 * ============================================================
 * 🪶 FILE: /hooks/use-toast.tsx
 * VERSION: v4.7 — Edith Adaptive Toast Engine 🌙☀️
 * ------------------------------------------------------------
 * ✅ Single-instance toast system (no duplicates)
 * ✅ Dark/Light adaptive background + text color
 * ✅ Always above header (z-[9999])
 * ✅ API: toast.success / toast.error / toast.info
 * ============================================================
 */

import { useCallback, useRef } from "react";
import { toast as sonner, Toaster } from "sonner";

export function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        style: {
          borderRadius: "12px",
          padding: "14px 18px",
          fontSize: "0.95rem",
          zIndex: 9999,
          fontWeight: 500,
          transition: "all 0.3s ease",
        },
        className:
          "shadow-lg dark:bg-zinc-900 dark:text-zinc-100 bg-white text-zinc-900",
      }}
      richColors
      expand
    />
  );
}

export function useToast() {
  // Track last message to prevent duplicate triggers
  const lastToastRef = useRef<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = useCallback(
    (message: string, type: "success" | "error" | "info" = "info") => {
      if (!message) return;

      // 🔁 Prevent duplicate identical messages for 2s
      if (lastToastRef.current === message) return;
      lastToastRef.current = message;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(
        () => (lastToastRef.current = null),
        2000
      );

      // 🎨 Adaptive theme check
      const theme = document.documentElement.classList.contains("dark")
        ? "dark"
        : "light";

      const baseStyle = {
        background: theme === "dark" ? "#18181b" : "#f9fafb",
        color: theme === "dark" ? "#f3f4f6" : "#111827",
        border:
          theme === "dark"
            ? "1px solid rgba(255,255,255,0.08)"
            : "1px solid rgba(0,0,0,0.08)",
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
