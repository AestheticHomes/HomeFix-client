"use client";
/**
 * ============================================================
 * UniversalHeader v7.0 — Gemini Continuum Edition 🌗
 * ------------------------------------------------------------
 * ✅ Theme-safe hydration (no mismatch)
 * ✅ Fully tokenized colors (no raw hex)
 * ✅ Smooth aura transitions + elevation depth
 * ✅ Enhanced MySpace toggle animation
 * ✅ Production-grade accessibility + UX polish
 * ============================================================
 */

import useEstimator from "@/components/estimator/store/estimatorStore";
import { useCartStore } from "@/components/store/cartStore";
import HomeFixLogo from "@/components/ui/HomeFixLogo";
import clsx from "clsx";
import { motion } from "framer-motion";
import {
  CalendarDays,
  Moon,
  Package,
  RefreshCw,
  ShoppingCart,
  Sun,
} from "lucide-react";
import { useTheme } from "next-themes";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

export default function UniversalHeader(): React.ReactElement {
  const headerRef = useRef<HTMLElement | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme, systemTheme } = useTheme();

  const [mounted, setMounted] = useState(false);
  const [isSyncing, setSyncing] = useState(false);

  const totalItems = useCartStore((s) => s.totalItems);
  const estimatorState = useEstimator.getState?.() || {};
  const step = estimatorState.step || "";
  const setStep = estimatorState.setStep || (() => {});

  const isEstimator = pathname?.startsWith("/estimator");
  const isViewer = pathname?.startsWith("/edith");
  const isMySpace = pathname?.startsWith("/my-space");

  useEffect(() => setMounted(true), []);

  // dynamically set CSS var for layout alignment
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const updateHeight = () =>
      document.documentElement.style.setProperty(
        "--header-h",
        `${el.getBoundingClientRect().height}px`
      );
    const ro = new ResizeObserver(updateHeight);
    ro.observe(el);
    updateHeight();
    return () => ro.disconnect();
  }, []);

  const currentTheme = theme === "system" ? systemTheme : theme;
  const toggleTheme = () =>
    setTheme(currentTheme === "light" ? "dark" : "light");

  async function handleSync() {
    try {
      setSyncing(true);
      const { syncEdithAssets } = await import(
        "@/edith/components/useAssetSync"
      );
      await syncEdithAssets((p: number) =>
        console.log("Sync progress:", Math.round(p * 100) + "%")
      );
    } catch (err) {
      console.error("Sync failed:", err);
    } finally {
      setSyncing(false);
    }
  }

  const pageTitle = pathname?.startsWith("/studio")
    ? "HomeFix Studio"
    : pathname?.startsWith("/store")
    ? "HomeFix Store"
    : pathname?.startsWith("/my-space")
    ? "My Space"
    : pathname?.startsWith("/services")
    ? "Our Services"
    : pathname?.startsWith("/profile")
    ? "Profile Center"
    : isViewer
    ? "Edith Viewer"
    : isEstimator
    ? "HomeFix Estimator"
    : "";

  return (
    <motion.header
      ref={headerRef}
      className="fixed top-0 left-0 right-0 z-[70] flex flex-col select-none
                 border-b border-[var(--border-soft)] backdrop-blur-xl
                 bg-[var(--surface-header)]/80 transition-all duration-500"
      initial={{ opacity: 0, y: -15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* 🌈 Primary Header Bar */}
      <div className="flex flex-wrap items-center justify-between px-4 sm:px-6 py-3 gap-3">
        <div className="flex items-center gap-3">
          <HomeFixLogo size="sm" />
          {mounted && (
            <motion.span
              className="hidden sm:inline text-xs text-[var(--text-muted)] italic"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Build what you wish existed.
            </motion.span>
          )}
        </div>

        {/* 🛒 Cart */}
        <button
          onClick={() => router.push("/cart")}
          className="relative flex items-center justify-center w-8 h-8 rounded-lg
                     border border-[var(--border-soft)] hover:border-[var(--accent-primary)]
                     bg-[var(--surface-card)] transition-colors"
          aria-label="Open Cart"
        >
          <ShoppingCart className="text-[var(--text-primary)]" size={16} />
          {totalItems > 0 && (
            <span
              className="absolute -top-1 -right-1 bg-[var(--accent-primary)]
                             text-white text-[10px] font-semibold w-4 h-4
                             rounded-full flex items-center justify-center"
            >
              {totalItems}
            </span>
          )}
        </button>

        {/* 🧭 Page Title */}
        <motion.h1
          key={pathname}
          className="text-sm sm:text-base font-semibold text-[var(--accent-primary)]
                     dark:text-[var(--accent-secondary)] flex-1 text-center sm:text-left truncate"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {pageTitle}
        </motion.h1>

        {/* ☀️ Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          {isViewer && (
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs md:text-sm
                         bg-[var(--accent-primary)] text-white hover:opacity-90 shadow-md"
            >
              <RefreshCw
                size={14}
                className={isSyncing ? "animate-spin" : ""}
              />
              {isSyncing ? "Syncing" : "Sync"}
            </button>
          )}
          {mounted && (
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center w-8 h-8 rounded-lg
                         border border-[var(--border-soft)]
                         bg-[var(--surface-card)] transition"
              aria-label="Toggle Theme"
            >
              {currentTheme === "light" ? (
                <Moon className="text-[var(--accent-primary)]" size={16} />
              ) : (
                <Sun className="text-[var(--accent-secondary)]" size={16} />
              )}
            </button>
          )}
        </div>
      </div>

      {/* 🔸 Estimator Tabs */}
      {isEstimator && (
        <motion.nav
          className="flex flex-wrap items-center justify-center gap-2 py-2 border-t border-[var(--border-soft)]
                     bg-[var(--surface-header)]"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {["kitchen", "wardrobe", "summary"].map((key, i) => {
            const label = `${i + 1}. ${
              key.charAt(0).toUpperCase() + key.slice(1)
            }`;
            const active = step === key;
            return (
              <button
                key={key}
                onClick={() => setStep(key)}
                className={clsx(
                  "relative px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-[var(--accent-primary)] text-white shadow-md"
                    : "bg-[var(--surface-card)] text-[var(--text-primary)] border border-[var(--border-soft)] hover:border-[var(--accent-primary)]"
                )}
              >
                {label}
              </button>
            );
          })}
        </motion.nav>
      )}

      {/* 🔸 MySpace Compact Toggle Bar — Gemini Glow Enhanced */}
      {isMySpace && (
        <motion.div
          className="flex justify-center items-center py-2 border-t border-[var(--border-soft)]
                     bg-[var(--surface-header)]/80 backdrop-blur-xl
                     sticky top-[calc(var(--header-h))] z-[67]
                     shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <motion.div
            layout
            className="relative inline-flex items-center gap-1 p-1 rounded-full border border-[var(--border-soft)]
                       bg-[var(--surface-card)] dark:bg-[var(--surface-card-dark)]
                       shadow-[inset_0_0_4px_rgba(255,255,255,0.25),0_0_6px_rgba(155,92,248,0.3)]
                       transition-all duration-300"
          >
            {[
              { id: "bookings", label: "Bookings", icon: CalendarDays },
              { id: "orders", label: "Orders", icon: Package },
            ].map((item) => {
              const active = pathname.includes(item.id);
              const Icon = item.icon;
              return (
                <motion.button
                  key={item.id}
                  onClick={() => router.replace(`/my-space?view=${item.id}`)}
                  data-active={active}
                  whileTap={{ scale: 0.97 }}
                  className={clsx(
                    "flex items-center gap-1 px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium relative select-none focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/40 transition-all duration-300",
                    active
                      ? "text-white bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] shadow-[0_0_8px_rgba(155,92,248,0.4)]"
                      : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
                  )}
                >
                  <Icon size={14} />
                  {item.label}
                  {active && (
                    <motion.div
                      layoutId="active-glow"
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-[var(--accent-primary)]/40 to-[var(--accent-secondary)]/40 blur-md -z-10"
                      transition={{
                        type: "spring",
                        stiffness: 120,
                        damping: 20,
                      }}
                    />
                  )}
                </motion.button>
              );
            })}
          </motion.div>
        </motion.div>
      )}
    </motion.header>
  );
}
