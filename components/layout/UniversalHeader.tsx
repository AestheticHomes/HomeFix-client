"use client";
/**
 * UniversalHeader — Global shell with rotating promo strip under the nav.
 * The promo strip lives in <PromoCarouselStrip/> and stays layout-only here.
 */

import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";

import MobileSideNav from "@/components/layout/MobileSideNav";
import HomeFixLogo from "@/components/ui/HomeFixLogo";
import { PromoCarouselStrip } from "@/components/layout/PromoCarouselStrip";

export default function UniversalHeader(): React.ReactElement {
  const headerRef = useRef<HTMLElement | null>(null);
  const { theme, setTheme, systemTheme } = useTheme();

  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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

      {/* Mobile Nav Drawer */}
      <MobileSideNav open={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* ── Secondary bar: rotating promos ───── */}
      <PromoCarouselStrip />

    </motion.header>
  );
}
