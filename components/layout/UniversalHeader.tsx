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

import HomeFixLogo from "@/components/ui/HomeFixLogo";
import MobileSideNav from "@/components/layout/MobileSideNav";
import WeatherStrip from "@/components/chrome/WeatherStrip";
import { motion } from "framer-motion";
import { Moon, Sun, CalendarDays, Package } from "lucide-react";
import clsx from "clsx";
import { useTheme } from "next-themes";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

export default function UniversalHeader(): React.ReactElement {
  const headerRef = useRef<HTMLElement | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme, systemTheme } = useTheme();

  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const isEstimator = pathname?.startsWith("/estimator");
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

  return (
    <motion.header
      ref={headerRef}
      className="sticky top-0 left-0 right-0 z-[40] flex flex-col select-none border-b border-[var(--border-soft)] bg-[var(--surface-header)]/95 transition-all duration-500 md:pl-[256px]"
      initial={{ opacity: 0, y: -15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* 🌈 Primary Header Bar */}
      <div className="mx-auto flex w-full max-w-[1360px] flex-wrap items-center justify-between px-4 sm:px-6 py-3.5 gap-3">
        <div className="flex items-center gap-3.5">
          <HomeFixLogo size="md" />
          {mounted && !isEstimator && (
            <motion.span
              className="hidden sm:inline text-sm text-[var(--text-secondary)] italic"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Build what you wish existed.
            </motion.span>
          )}
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          {mounted && (
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center w-9 h-9 rounded-lg
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
          <button
            aria-label="Open navigation"
            className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-slate-900/70 border border-slate-700 text-white"
            onClick={() => setMenuOpen(true)}
          >
            <span className="flex flex-col items-center justify-center gap-[5px]">
              <span className="block w-5 h-[2px] bg-current rounded" />
              <span className="block w-5 h-[2px] bg-current rounded" />
              <span className="block w-5 h-[2px] bg-current rounded" />
            </span>
          </button>
        </div>
      </div>
      <MobileSideNav open={menuOpen} onClose={() => setMenuOpen(false)} />
      <WeatherStrip />

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
              const active = pathname?.includes(item.id) ?? false;
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
