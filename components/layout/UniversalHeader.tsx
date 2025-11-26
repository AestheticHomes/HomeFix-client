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

import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

import { ClimateBar } from "@/components/chrome/ClimateBar";
import PromoBar from "@/components/chrome/PromoBar";
import MobileSideNav from "@/components/layout/MobileSideNav";
import HomeFixLogo from "@/components/ui/HomeFixLogo";
import { useHomefixWeather } from "@/hooks/useHomefixWeather";
import { usePromo } from "@/hooks/usePromo";

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
  const { theme, setTheme, systemTheme } = useTheme();
  const promo = usePromo();

  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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
          <Link href="/" aria-label="HomeFix – Home" className="flex items-center gap-3.5">
            <HomeFixLogo size="md" />
          </Link>
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

      {promo && (
        <div
          className="
            mt-1
            w-full
            flex items-center justify-between gap-2
            rounded-2xl
            border border-[var(--border-soft)]
            bg-[color-mix(in_srgb,var(--surface-card)85%,transparent)]
            px-3 py-1.5
            text-[11px]
          "
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <span className="font-medium text-[var(--text-primary)]">
              {promo.headline}
            </span>
            {promo.subline && (
              <span className="text-[var(--text-secondary)] hidden sm:inline">
                {promo.subline}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              // lightweight client-side navigation; do NOT import useRouter if not already present.
              window.location.href = promo.ctaHref;
            }}
            className="
              flex-shrink-0
              inline-flex items-center
              rounded-xl
              px-3 py-1
              text-[11px] font-semibold
              bg-[var(--accent-primary)]
              text-white
              hover:bg-[var(--accent-primary-hover)]
              transition-colors
            "
          >
            {promo.ctaLabel}
          </button>
        </div>
      )}

      {/* Mobile Nav Drawer */}
      <MobileSideNav open={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* ── Secondary bar: homepage climate OR route promo ───── */}
      {isHomepage ? <ClimateSlot /> : <PromoBar />}

    </motion.header>
  );
}
