"use client";
/**
 * ============================================================
 * LayoutContent v11.0 — Edith Gemini SafeViewport Build 🌗
 * ------------------------------------------------------------
 * ✅ Single global header (no duplication)
 * ✅ RootShell controls the viewport + scroll
 * ✅ Sidebar + main inside safe viewport
 * ✅ No double padding or nested scroll
 * ✅ Smooth layout transitions, theme-aware
 * ============================================================
 */

import { NavBar, Sidebar } from "@/components/layout";
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

  /* ------------------------------------------------------------
     💧 Hydration + responsive detection
  ------------------------------------------------------------ */
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    setHydrated(true);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!hydrated) return null;

  return (
    <div
      className="relative flex flex-col min-h-full overflow-hidden
                 bg-[var(--surface-base)]
                 text-[var(--sidebar-text)] transition-colors duration-500"
    >
      {/* 🧭 Sidebar + Main Section */}
      <div className="flex flex-row w-full min-h-full overflow-hidden">
        {/* 🧩 Sidebar (desktop only) */}
        <motion.aside
          id="universal-sidebar"
          animate={{ width: collapsed ? 80 : 256 }}
          transition={{ type: "spring", stiffness: 180, damping: 22 }}
          className="hidden md:flex flex-shrink-0 fixed left-0 z-[60]
                     overflow-y-auto overflow-x-hidden"
          style={{
            top: "var(--header-h, 72px)",
            height: "calc(100vh - var(--header-h, 72px))",
            background: "var(--sidebar-surface)",
            color: "var(--sidebar-text)",
          }}
        >
          <Sidebar />
        </motion.aside>

        {/* 🧱 Main Content (inside RootShell’s scroll zone) */}
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
                       pt-4 md:pt-6 pb-8"
          >
            {children}
          </div>
        </main>
      </div>

      {/* 📱 Mobile Navbar (fixed bottom) */}
      <footer
        id="hf-mobile-navbar"
        className="md:hidden fixed bottom-0 left-0 right-0 z-[80]
                   border-t border-gray-200/40 dark:border-slate-800/50
                   backdrop-blur-xl transition-all duration-500"
        style={{
          background: "var(--sidebar-surface)",
          color: "var(--sidebar-text)",
          height: "var(--mbnav-h,72px)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        <NavBar />
      </footer>
    </div>
  );
}
