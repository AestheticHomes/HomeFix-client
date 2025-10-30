"use client";

/**
 * NavBar.tsx v5.3 — PWA Aurora Flush Dock 🌊
 * --------------------------------------------
 * ✅ Next.js 14 RouteImpl compatible
 * ✅ Vibrations (Haptics) + Framer Motion
 * ✅ iOS safe-area padding + blur
 * ✅ Typed tab routes
 */

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import dynamic from "next/dynamic";
import type { Route } from "next";
import {
  CalendarDays,
  Home,
  Layers3,
  Settings,
  ShoppingCart,
} from "lucide-react";
import { useEffect } from "react";

const ThemeToggle = dynamic(() => import("@/components/ThemeToggle"), {
  ssr: false,
});

export default function NavBar() {
  const pathname = usePathname();
  const prefersReduced = useReducedMotion();
  const vibrate = () => globalThis.navigator?.vibrate?.(15);

  // ✅ Typed route declarations to satisfy RouteImpl
  const tabs: { name: string; href: Route; icon: any }[] = [
    { name: "Home", href: "/" as Route, icon: Home },
    { name: "Services", href: "/services" as Route, icon: Layers3 },
    { name: "Bookings", href: "/bookings" as Route, icon: CalendarDays },
    { name: "Settings", href: "/settings" as Route, icon: Settings },
  ];

  useEffect(() => {
    // Optional analytics or route restore
  }, [pathname]);

  return (
    <nav
      className="
        fixed bottom-0 left-0 right-0 z-navbar md:hidden
        backdrop-blur-lg supports-[backdrop-filter]:bg-white/80
        bg-white/90 dark:bg-slate-900/90
        border-t border-gray-200 dark:border-slate-800
        shadow-[0_-2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_-2px_8px_rgba(0,0,0,0.25)]
        safe-area-inset-bottom
      "
      style={{
        height: "var(--mbnav-h, 72px)",
        WebkitBackdropFilter: "blur(14px)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div className="max-w-3xl mx-auto relative h-full flex items-center justify-between px-3">
        {/* Left Tabs */}
        <div className="flex gap-1 items-center">
          {tabs.slice(0, 2).map(({ name, href, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={vibrate}
                aria-current={active ? "page" : undefined}
                className={`group flex flex-col items-center justify-center 
                            text-[11px] font-medium min-w-[60px] min-h-[48px] px-3 py-1.5 rounded-lg transition
                            ${
                              active
                                ? "text-green-600 dark:text-emerald-400 bg-green-50/70 dark:bg-emerald-900/25"
                                : "text-gray-400 hover:text-green-600 dark:hover:text-emerald-400"
                            }`}
              >
                <motion.div
                  whileTap={{ scale: prefersReduced ? 1 : 0.94 }}
                  whileHover={{ scale: prefersReduced ? 1 : 1.08 }}
                  className="relative"
                >
                  <Icon className="w-[20px] h-[20px]" />
                </motion.div>
                <span className="mt-0.5">{name}</span>
              </Link>
            );
          })}
        </div>

        {/* 🛒 Floating FAB (Cart) */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-fab">
          <Link href={"/cart" as Route} onClick={vibrate}>
            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 240, damping: 20 }}
              whileTap={{ scale: 0.94 }}
              className="w-[64px] h-[64px] rounded-full bg-green-600 hover:bg-green-700
                         text-white flex items-center justify-center shadow-2xl
                         ring-4 ring-white/60 dark:ring-slate-900/60"
            >
              <ShoppingCart className="w-6 h-6" />
            </motion.button>
          </Link>
        </div>

        {/* Right Tabs */}
        <div className="flex gap-1 items-center">
          {tabs.slice(2).map(({ name, href, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={vibrate}
                aria-current={active ? "page" : undefined}
                className={`group flex flex-col items-center justify-center 
                            text-[11px] font-medium min-w-[60px] min-h-[48px] px-3 py-1.5 rounded-lg transition
                            ${
                              active
                                ? "text-green-600 dark:text-emerald-400 bg-green-50/70 dark:bg-emerald-900/25"
                                : "text-gray-400 hover:text-green-600 dark:hover:text-emerald-400"
                            }`}
              >
                <motion.div
                  whileTap={{ scale: prefersReduced ? 1 : 0.94 }}
                  whileHover={{ scale: prefersReduced ? 1 : 1.08 }}
                  className="relative"
                >
                  <Icon className="w-[20px] h-[20px]" />
                </motion.div>
                <span className="mt-0.5">{name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
