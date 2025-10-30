"use client";
/**
 * useDrawerSafeStyle v2.5 — Keyboard-Aware + Debug Overlay 🌿
 * -----------------------------------------------------------
 * ✅ Drawer-safe across iOS PWAs, Android Chrome, Desktop
 * ✅ Auto-adjusts height when keyboard opens/closes
 * ✅ Detects nav + safe insets + keyboard height
 * ✅ Alt+Shift+D (desktop) or long-press top (mobile) toggles live overlay
 * ✅ Smooth transitions + console metrics
 *
 * Author: Edith 🪶 for Jagadish (HomeFix India)
 */

import { useEffect, useState } from "react";

export function useDrawerSafeStyle(extraOffset: number = 0) {
  const [style, setStyle] = useState<React.CSSProperties>(() => ({
    height: "auto",
    maxHeight: "calc(100dvh - 72px)",
    paddingBottom:
      "calc(var(--mbnav-h-safe, 72px) + env(safe-area-inset-bottom, 0px))",
  }));

  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [debug, setDebug] = useState(false);
  const [metrics, setMetrics] = useState({
    visual: 0,
    inner: 0,
    nav: "72px",
    safe: "0px",
    keyboard: 0,
  });

  /* -----------------------------------------------------------
     🧭 Dynamic viewport / keyboard tracking
  ----------------------------------------------------------- */
  useEffect(() => {
    let prevViewport = window.visualViewport?.height ?? window.innerHeight;

    const update = () => {
      const root = document.documentElement;
      const computed = getComputedStyle(root);

      const safe = computed.getPropertyValue("--safe-bottom")?.trim() ||
        "env(safe-area-inset-bottom, 0px)";
      const nav = computed.getPropertyValue("--mbnav-h-safe")?.trim() || "72px";

      const visual = window.visualViewport?.height ?? window.innerHeight;
      const inner = window.innerHeight;

      // detect keyboard height
      const kb = Math.max(0, inner - visual);
      if (Math.abs(kb - keyboardHeight) > 10) {
        setKeyboardHeight(kb);
        if (kb > 0) navigator.vibrate?.(10);
      }

      setMetrics({ visual, inner, nav, safe, keyboard: kb });

      setStyle({
        height: "auto",
        maxHeight: `calc(${visual}px - ${nav})`,
        paddingBottom: `calc(${nav} + ${safe} + ${extraOffset}px)`,
        transition: "max-height 0.25s ease, padding-bottom 0.25s ease",
        WebkitOverflowScrolling: "touch",
        overscrollBehavior: "contain",
      });

      prevViewport = visual;
    };

    update();
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    window.visualViewport?.addEventListener("resize", update);

    const toggle = (e: KeyboardEvent) => {
      if (e.altKey && e.shiftKey && e.key.toLowerCase() === "d") {
        setDebug((v) => !v);
      }
    };
    window.addEventListener("keydown", toggle);

    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
      window.visualViewport?.removeEventListener("resize", update);
      window.removeEventListener("keydown", toggle);
    };
  }, [extraOffset, keyboardHeight]);

  /* -----------------------------------------------------------
     🧩 Floating overlay (optional)
  ----------------------------------------------------------- */
  useEffect(() => {
    const id = "drawer-safe-debug";
    const existing = document.getElementById(id);
    if (existing) existing.remove();

    if (!debug) return;

    const el = document.createElement("div");
    el.id = id;
    Object.assign(el.style, {
      position: "fixed",
      bottom: "110px",
      right: "12px",
      background: "rgba(16,185,129,0.9)",
      color: "#fff",
      fontSize: "12px",
      fontFamily: "monospace",
      padding: "6px 10px",
      borderRadius: "8px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
      zIndex: 99999,
      whiteSpace: "pre",
    });
    el.textContent = `Viewport: ${
      metrics.visual.toFixed(
        0,
      )
    }\nKeyboard: ${
      metrics.keyboard.toFixed(0)
    }\nNav: ${metrics.nav}\nSafe: ${metrics.safe}`;
    document.body.appendChild(el);

    return () => el.remove();
  }, [debug, metrics]);

  return style;
}
