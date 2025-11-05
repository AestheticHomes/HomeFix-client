"use client";
/**
 * File: components/ui/UniversalHeader.tsx
 * EdithHeader v5.0 — Unified Horizon Bar 🌌
 * ---------------------------------------------------------
 * 🧭 Fixed top header shared across all HomeFix modules
 * 🧮 Context-aware navigation (Estimator / Viewer modes)
 * 🌓 Theme toggle + Fullscreen + Sync
 * ✨ Vibrant Edith aesthetic — Horizon gradient + blur
 * 📱 Fully mobile responsive (compact stacked layout)
 */

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import HomeFixLogo from "@/components/ui/HomeFixLogo";
import  useEstimator  from "@/components/estimator/store/estimatorStore";
import { Sun, Moon, Maximize2, RefreshCw } from "lucide-react";

export default function UniversalHeader(): React.ReactElement {
  const pathname = usePathname();
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isSyncing, setSyncing] = useState(false);

  // ✅ Zustand estimator store — safely wrapped
  let setStep: (key: string) => void = () => {};
  let step: string = "";
  try {
    setStep = useEstimator((s: any) => s.setStep);
    step = useEstimator((s: any) => s.step);
  } catch {
    // Non-estimator routes — ignore Zustand errors
  }

  const currentTheme = theme === "system" ? systemTheme : theme;
  useEffect(() => setMounted(true), []);
  if (!mounted) return <></>;

  // 🔹 Route detection
  const isEstimator = pathname?.startsWith("/estimator");
  const isViewer = pathname?.startsWith("/edith");

  const pageTitle =
    pathname?.startsWith("/studio")
      ? "HomeFix Studio"
      : pathname?.startsWith("/store")
      ? "HomeFix Store"
      : pathname?.startsWith("/bookings")
      ? "My Bookings"
      : pathname?.startsWith("/services")
      ? "Our Services"
      : pathname?.startsWith("/profile")
      ? "Profile Center"
      : isViewer
      ? "Edith Viewer"
      : isEstimator
      ? "HomeFix Estimator"
      : "HomeFix India";

  // 🔸 Sync (for Edith Viewer / 3D assets)
  async function handleSync(): Promise<void> {
    try {
      setSyncing(true);
      const { syncEdithAssets } = await import("@/edith/components/useAssetSync");
      await syncEdithAssets((progress: number) =>
        console.log("Sync progress:", Math.round(progress * 100) + "%")
      );
    } catch (err) {
      console.error("Sync failed:", err);
    } finally {
      setSyncing(false);
    }
  }

  // 🔸 Theme toggle
  const toggleTheme = (): void =>
    setTheme(currentTheme === "light" ? "dark" : "light");

  // 🔸 Estimator tabs
  const estimatorTabs = [
    { key: "kitchen", label: "1. Kitchen" },
    { key: "wardrobe", label: "2. Wardrobe" },
    { key: "summary", label: "3. Summary" },
  ];

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-[60] flex flex-col
                 backdrop-blur-xl border-b border-[#9B5CF8]/30
                 bg-gradient-to-r from-[#F8F7FF]/80 to-[#F2F0FF]/60
                 dark:from-[#0D0B2B]/70 dark:to-[#1B1545]/70
                 shadow-sm select-none"
      initial={{ opacity: 0, y: -15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* 🌈 Primary Bar */}
      <div className="flex flex-wrap items-center justify-between px-4 sm:px-6 py-3 gap-3">
        {/* Logo + tagline */}
        <div className="flex items-center gap-3">
          <HomeFixLogo size="sm" />
          <motion.span
            className="hidden sm:inline text-xs text-[#6C6AA8] dark:text-[#A19FCC] italic"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Build what you wish existed.
          </motion.span>
        </div>

        {/* Page Title */}
        <motion.h1
          className="text-sm sm:text-base font-semibold text-[#5A5DF0] dark:text-[#EC6ECF]
                     flex-1 text-center sm:text-left truncate"
          key={pathname}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {pageTitle}
        </motion.h1>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {isViewer && (
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs md:text-sm
                         bg-[#5A5DF0] dark:bg-[#EC6ECF] text-white hover:opacity-90 shadow-md"
            >
              <RefreshCw size={14} className={isSyncing ? "animate-spin" : ""} />
              {isSyncing ? "Syncing" : "Sync"}
            </button>
          )}

          {(isViewer || isEstimator) && (
            <button
              onClick={() =>
                (document.documentElement as unknown as HTMLElement)?.requestFullscreen?.()
              }
              className="hidden sm:flex items-center justify-center px-3 py-1.5 rounded-lg
                         bg-[#EAE8FF]/30 dark:bg-[#2E2270]/40 border border-[#9B5CF8]/20
                         text-[#5A5DF0] dark:text-[#EC6ECF] hover:bg-[#5A5DF0]/10
                         dark:hover:bg-[#EC6ECF]/10"
              title="Fullscreen"
            >
              <Maximize2 size={14} />
            </button>
          )}

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-8 h-8 rounded-lg
                       bg-[#F8F7FF]/70 dark:bg-[#1B1545]/70 border border-[#9B5CF8]/20
                       hover:border-[#9B5CF8]/40 transition"
            aria-label="Toggle Theme"
          >
            {currentTheme === "light" ? (
              <Moon className="text-[#5A5DF0]" size={16} />
            ) : (
              <Sun className="text-[#EC6ECF]" size={16} />
            )}
          </button>
        </div>
      </div>

      {/* 🔸 Secondary — Estimator Tabs */}
      {isEstimator && (
        <motion.nav
          className="flex flex-wrap items-center justify-center gap-2 py-2 border-t border-[#9B5CF8]/20
                     bg-gradient-to-r from-[#F8F7FF]/90 to-[#F2F0FF]/80
                     dark:from-[#0D0B2B]/70 dark:to-[#1B1545]/70"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {estimatorTabs.map((tab) => {
            const active = step === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setStep(tab.key)}
                className={`relative px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200
                  ${
                    active
                      ? "bg-[#5A5DF0] dark:bg-[#EC6ECF] text-white shadow-md"
                      : "bg-white/90 dark:bg-[#1B1545]/60 text-[#5A5DF0] dark:text-[#EC6ECF] border border-[#9B5CF8]/30 hover:border-[#9B5CF8]/60"
                  }`}
              >
                {tab.label}
                {active && (
                  <motion.span
                    layoutId="active-estimator-tab"
                    className="absolute inset-0 rounded-full -z-10 bg-[#5A5DF0] dark:bg-[#EC6ECF]"
                    transition={{ type: "spring", stiffness: 380, damping: 26 }}
                  />
                )}
              </button>
            );
          })}
        </motion.nav>
      )}
    </motion.header>
  );
}
