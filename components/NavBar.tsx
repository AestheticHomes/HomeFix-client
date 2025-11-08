"use client";
/**
 * ============================================================
 * File: /components/ui/NavBar.tsx
 * Version: v7.0 — HomeFix Aurora Dock 🌈
 * ------------------------------------------------------------
 * ✅ Full route navigation (Home, Services, Store, Bookings, Profile, Settings)
 * ✅ Haptic + Framer Motion spring animations
 * ✅ Aurora blur background + soft gradients
 * ✅ Integrated cart badge (useCartStore)
 * ✅ Dark/light adaptive, iOS safe-area friendly
 * ============================================================
 */

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import dynamic from "next/dynamic";
import { useEffect } from "react";
import {
  Home,
  Layers3,
  ShoppingCart,
  Store,
  CalendarDays,
  User,
  Settings,
} from "lucide-react";
import { useCartStore } from "@/components/store/cartStore";

const ThemeToggle = dynamic(() => import("@/components/ThemeToggle"), {
  ssr: false,
});

export default function NavBar() {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();
  const vibrate = () => globalThis.navigator?.vibrate?.(20);
  const { totalItems } = useCartStore();

  // ✅ Tabs configuration
  const tabs = [
    { name: "Home", href: "/", icon: Home },
    { name: "Services", href: "/services", icon: Layers3 },
    { name: "Store", href: "/store", icon: Store },
    { name: "Bookings", href: "/bookings", icon: CalendarDays },
    { name: "Profile", href: "/profile", icon: User },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  useEffect(() => {
    // reserved for route analytics or dynamic title sync
  }, [pathname]);

  return (
    <nav
      className={`
        fixed bottom-0 left-0 right-0 z-navbar md:hidden
        border-t border-gray-200 dark:border-slate-800
        backdrop-blur-2xl bg-white/70 dark:bg-slate-900/70
        supports-[backdrop-filter]:bg-white/80
        transition-all duration-500
        safe-area-inset-bottom
      `}
      style={{
        height: "var(--mbnav-h, 72px)",
        WebkitBackdropFilter: "blur(16px)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div className="max-w-3xl mx-auto flex justify-around items-center h-full px-3">
        {tabs.map(({ name, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={vibrate}
              aria-current={active ? "page" : undefined}
              className="relative flex flex-col items-center justify-center gap-0.5 w-[60px]"
            >
              {/* 🔆 Active Background Glow */}
              <AnimatePresence>
                {active && (
                  <motion.span
                    layoutId="nav-active-glow"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-accent-mid/25 to-accent-end/25 blur-md"
                    transition={{ type: "spring", stiffness: 240, damping: 20 }}
                  />
                )}
              </AnimatePresence>

              {/* 🌟 Icon */}
              <motion.div
                whileTap={{ scale: prefersReducedMotion ? 1 : 0.9 }}
                whileHover={{ scale: prefersReducedMotion ? 1 : 1.1 }}
                transition={{ type: "spring", stiffness: 300, damping: 18 }}
                className={`relative flex items-center justify-center w-9 h-9 rounded-xl transition-colors duration-300 ${
                  active
                    ? "text-green-600 dark:text-emerald-400 bg-green-100/50 dark:bg-emerald-900/30"
                    : "text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-emerald-400"
                }`}
              >
                <Icon size={20} />

                {/* 🛒 Cart badge */}
                {name === "Store" && totalItems > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 text-[10px] font-semibold bg-green-600 text-white rounded-full w-4 h-4 flex items-center justify-center"
                  >
                    {totalItems}
                  </motion.span>
                )}
              </motion.div>

              {/* 📛 Label */}
              <span
                className={`text-[11px] font-medium ${
                  active
                    ? "text-green-600 dark:text-emerald-400"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
