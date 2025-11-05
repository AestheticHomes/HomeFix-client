"use client";
/**
 * LayoutContent v8.0 — Gemini Continuum Responsive Final 🌌
 * ----------------------------------------------------------
 * ✅ Prevents duplicate Sidebar render
 * ✅ Keeps scroll + alignment stable
 * ✅ Sidebar hides automatically on mobile when bottom NavBar shows
 */

import { motion } from "framer-motion";
import { useSidebar } from "@/contexts/SidebarContext";
import Sidebar from "@/components/Sidebar";
import UniversalHeader from "@/components/ui/UniversalHeader";

import ClientRoot from "@/components/ClientRoot";
import { useEffect, useState } from "react";

export default function LayoutContent({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();
  const [hydrated, setHydrated] = useState(false);

  // 🧠 Ensure client-only render once (avoid pre-hydration duplicate sidebar)
  useEffect(() => setHydrated(true), []);
  if (!hydrated) return null;

  return (
    <div className="relative flex flex-col min-h-screen overflow-hidden bg-transparent">
      {/* 🌈 Fixed Universal Header */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <UniversalHeader />
      </header>

      {/* 🪄 Sidebar + Main Content */}
      <div className="flex flex-row h-screen pt-[64px] overflow-hidden">
        {/* 🧭 Sidebar — Desktop only */}
        <motion.aside
          animate={{ width: collapsed ? 80 : 256 }}
          transition={{ type: "spring", stiffness: 180, damping: 22 }}
          className="hidden md:flex flex-shrink-0 h-[calc(100vh-64px)]"
        >
          <Sidebar />
        </motion.aside>

        {/* 🧱 Main Content */}
        <main
          className="flex-1 overflow-y-auto bg-gradient-to-b from-[#F8F7FF]/40 via-[#F3EEFF]/40 to-[#EEE9FF]/40
                     dark:from-[#0D0A24]/40 dark:via-[#19123A]/40 dark:to-[#221651]/40
                     transition-all duration-700 ease-in-out
                     pb-[var(--mbnav-h,72px)] md:pb-0"
        >
          <ClientRoot>{children}</ClientRoot>
        </main>
      </div>
    </div>
  );
}
