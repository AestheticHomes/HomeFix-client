"use client";
/**
 * LayoutContent v11.1 — single-scroll, RootShell-controlled
 * - No nested scroll containers
 * - Sidebar fixed under header (its own scroll is OK)
 * - Main content uses body scroll only
 */

import { Sidebar } from "@/components/layout";
import { useSidebar } from "@/contexts/SidebarContext";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function LayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { collapsed } = useSidebar();
  const [hydrated, setHydrated] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    setHydrated(true);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!hydrated) return null;

  return (
    <div className="relative flex flex-col min-h-full bg-[var(--surface-base)] text-[var(--sidebar-text)] transition-colors duration-500">
      {/* Row: sidebar (fixed) + main */}
      <div className="flex flex-row w-full min-h-full">
        {/* Sidebar (desktop only) — its own scroll is fine */}
        <motion.aside
          id="universal-sidebar"
          animate={{ width: collapsed ? 80 : 256 }}
          transition={{ type: "spring", stiffness: 180, damping: 22 }}
          className="hidden md:flex fixed left-0 z-[60] overflow-y-auto overflow-x-hidden"
          style={{
            top: "var(--hf-header-height,72px)",
            height: "calc(100vh - var(--hf-header-height,72px))",
            background: "var(--sidebar-surface)",
            color: "var(--sidebar-text)",
          }}
        >
          <Sidebar />
        </motion.aside>

        {/* Main – window scroll only (no overflow here) */}
        <main
          id="safe-main-content"
          className="flex-1 transition-all duration-700 ease-in-out
                     text-[var(--sidebar-text)]"
          style={{
            marginLeft: isMobile ? "0px" : collapsed ? "80px" : "256px",
            transition: "margin-left 0.4s ease",
          }}
        >
          <div
            className="w-full ml-0 mr-0
                       pl-4 sm:pl-6 md:pl-8
                       pr-2 sm:pr-3 md:pr-4
                       pt-4 md:pt-6"
          >
            {children}
          </div>
        </main>
      </div>
      {/* No mobile dock here; RootShell owns it */}
    </div>
  );
}
