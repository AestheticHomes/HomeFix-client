"use client";
/**
 * ============================================================
 * 🌐 UniversalHeader v8.1 — Route-Aware Promos + Safe Weather
 * ------------------------------------------------------------
 * GOALS
 *  - Show ClimateBar only on "/" (homepage)
 *  - Show a single, route-specific promo on every other page
 *  - Keep React hooks order safe (no conditional hooks at root)
 *  - Use only design tokens (no hardcoded hex)
 *  - Preserve MySpace toggle + a11y + theme toggle
 *
 * HOW IT WORKS
 *  - <ClimateSlot/> renders (and fetches) weather ONLY on "/"
 *  - <RoutePromoBar/> renders one message chosen by pathname
 *  - Header height keeps writing --hf-header-height for layout
 *
 * EDIT PROMOS
 *  - Update ROUTE_PROMOS below to change copy/CTAs per section.
 * ============================================================
 */

import clsx from "clsx";
import { motion } from "framer-motion";
import { CalendarDays, Moon, Package, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

import { ClimateBar } from "@/components/chrome/ClimateBar";
import PromoBar from "@/components/chrome/PromoBar";
import MobileSideNav from "@/components/layout/MobileSideNav";
import HomeFixLogo from "@/components/ui/HomeFixLogo";
import { useHomefixWeather } from "@/hooks/useHomefixWeather";

// ---------- Route promo config (one line per top-level section) ----------
// ---------- Weather only when mounted on "/" (keeps hooks safe) ----------
function ClimateSlot() {
  const weather = useHomefixWeather();

  return (
    <ClimateBar
      city={weather.cityName ?? "Chennai"}
      tempC={weather.currentTempC ?? 27}
      condition={weather.summary ?? "Mainly clear"}
      highC={weather.todayHighC ?? 29}
      lowC={weather.todayLowC ?? 23}
    />
  );
}

export default function UniversalHeader(): React.ReactElement {
  const headerRef = useRef<HTMLElement | null>(null);
  const pathname = usePathname() || "/";
  const router = useRouter();
  const { theme, setTheme, systemTheme } = useTheme();

  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const isMySpace = pathname?.startsWith("/my-space");
  const isHomepage = pathname === "/";

  useEffect(() => setMounted(true), []);

  // keep CSS vars in sync for SafeViewport math
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const updateHeight = () => {
      const h = `${el.getBoundingClientRect().height}px`;
      document.documentElement.style.setProperty("--header-h", h);
      document.documentElement.style.setProperty("--hf-header-height", h);
    };
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
      className="fixed inset-x-0 top-0 z-[90] flex flex-col select-none border-b border-[var(--border-soft)] bg-[var(--surface-header)]/95 backdrop-blur-md transition-all duration-500"
      initial={{ opacity: 0, y: -15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      role="banner"
    >
      {/* ── Top bar ───────────────────────────────────────────── */}
      <div className="mx-auto flex w-full max-w-[1360px] flex-wrap items-center justify-between px-4 sm:px-6 py-3.5 gap-3">
        <div className="flex items-center gap-3.5">
          <HomeFixLogo size="md" />
          {mounted && (
            <motion.span
              className="hidden sm:inline text-sm text-[var(--text-secondary)] italic"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
            >
              Build what you wish existed.
            </motion.span>
          )}
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          {mounted && (
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center w-9 h-9 rounded-lg border border-[var(--border-soft)] bg-[var(--surface-card)] transition"
              aria-label="Toggle theme"
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
            className="inline-flex items-center justify-center w-10 h-10 rounded-xl
                       bg-[var(--surface-card)] border border-[var(--border-soft)]
                       text-[var(--text-primary)]"
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

      {/* Mobile Nav Drawer */}
      <MobileSideNav open={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* ── Secondary bar: homepage climate OR route promo ───── */}
      {isHomepage ? <ClimateSlot /> : <PromoBar />}

      {/* ── My Space pill toggle ──────────────────────────────── */}
      {isMySpace && (
        <motion.div
          className="flex justify-center items-center py-2 border-t border-[var(--border-soft)]
                     bg-[var(--surface-header)]/80 backdrop-blur-xl sticky top-[calc(var(--header-h))] z-[67]
                     shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <MySpaceSwitcher currentPath={pathname || ""} />
        </motion.div>
      )}
    </motion.header>
  );
}

// ---------- Extracted: keeps the header lean ----------
function MySpaceSwitcher({ currentPath }: { currentPath: string }) {
  const router = useRouter();
  const tabs = [
    { id: "bookings", label: "Bookings", icon: CalendarDays },
    { id: "orders", label: "Orders", icon: Package },
  ];
  return (
    <motion.div
      layout
      className="relative inline-flex items-center gap-1 p-1 rounded-full border border-[var(--border-soft)]
                 bg-[var(--surface-card)] dark:bg-[var(--surface-card-dark)]
                 shadow-[inset_0_0_4px_rgba(255,255,255,0.25),0_0_6px_rgba(155,92,248,0.3)]
                 transition-all duration-300"
      role="tablist"
      aria-label="My Space views"
    >
      {tabs.map(({ id, label, icon: Icon }) => {
        const active = currentPath.includes(id);
        return (
          <motion.button
            key={id}
            role="tab"
            aria-selected={active}
            onClick={() => router.replace(`/my-space?view=${id}`)}
            whileTap={{ scale: 0.97 }}
            className={clsx(
              "flex items-center gap-1 px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium relative select-none focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/40 transition-all duration-300",
              active
                ? "text-white bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] shadow-[0_0_8px_rgba(155,92,248,0.4)]"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
            )}
          >
            <Icon size={14} />
            {label}
            {active && (
              <motion.div
                layoutId="active-glow"
                className="absolute inset-0 rounded-full bg-gradient-to-r from-[var(--accent-primary)]/40 to-[var(--accent-secondary)]/40 blur-md -z-10"
                transition={{ type: "spring", stiffness: 120, damping: 20 }}
              />
            )}
          </motion.button>
        );
      })}
    </motion.div>
  );
}
