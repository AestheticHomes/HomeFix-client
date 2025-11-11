"use client";
/**
 * ============================================================
 * SafeViewport v8.8 — Gemini Alignment Edition 🌗
 * ------------------------------------------------------------
 * ✅ Dynamically syncs header / navbar / sidebar offsets
 * ✅ Centers content within max-safe width (no right drift)
 * ✅ Applies fluid clamp width for desktop + mobile
 * ✅ Prevents scroll bleed inside SafeViewport
 * ✅ Fully theme-aware and RootShell-compatible
 * ============================================================
 */

import { useEffect, useState } from "react";

export default function SafeViewport({
  children,
  headerId = "universal-header",
  navbarId = "hf-mobile-navbar",
  sidebarId = "universal-sidebar",
}: {
  children: React.ReactNode;
  headerId?: string;
  navbarId?: string;
  sidebarId?: string;
}) {
  const [offsets, setOffsets] = useState({
    top: 72,
    bottom: 72,
    left: 0,
  });

  /* ------------------------------------------------------------
     🧩 Dynamically measure layout elements
  ------------------------------------------------------------ */
  useEffect(() => {
    const updateOffsets = () => {
      const header = document.getElementById(headerId);
      const navbar = document.getElementById(navbarId);
      const sidebar = document.getElementById(sidebarId);

      requestAnimationFrame(() => {
        setOffsets({
          top: header?.offsetHeight || 72,
          bottom: navbar?.offsetHeight || 72,
          left: sidebar?.offsetWidth || 0,
        });
      });
    };

    updateOffsets();
    window.addEventListener("resize", updateOffsets);
    return () => window.removeEventListener("resize", updateOffsets);
  }, [headerId, navbarId, sidebarId]);

  /* ------------------------------------------------------------
     🌗 SafeViewport Container
  ------------------------------------------------------------ */
  return (
    <main
      id="dynamic-safe-viewport"
      className="relative flex flex-col flex-1 overflow-x-hidden overflow-y-auto
                 transition-colors duration-500 ease-out
                 bg-[var(--surface-light)] dark:bg-[var(--surface-dark)]
                 text-[var(--text-primary-light)] dark:text-[var(--text-primary-dark)]"
      style={{
        paddingTop: offsets.top,
        paddingBottom: offsets.bottom,
        paddingLeft: offsets.left,
        minHeight: "100vh",
      }}
    >
      {/* 🧭 Centered Content Wrapper */}
      <div
        className="relative w-full flex flex-col items-center justify-start
                   px-4 sm:px-6 md:px-8"
        style={{
          width: "clamp(340px, 95vw, 1280px)",
          marginInline: "auto",
          maxWidth: "var(--safe-max-width, 1280px)",
        }}
      >
        {children}
      </div>

      {/* 🔒 Subtle background gradient for safe visual anchoring */}
      <div
        className="pointer-events-none absolute inset-0 z-[-1]
                   bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.05),transparent_65%)]
                   dark:bg-[radial-gradient(circle_at_center,rgba(52,211,153,0.08),transparent_70%)]"
      />
    </main>
  );
}
