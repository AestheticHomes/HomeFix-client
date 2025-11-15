"use client";
/**
 * ============================================================
 * File: /components/ui/NavBar.tsx
 * Version: v7.5 — HomeFix Aurora Dock (SafeViewport Sync) 🌈
 * ------------------------------------------------------------
 * ✅ Registers --mbnav-h dynamically via ResizeObserver
 * ✅ Scroll-safe & header-aware viewport integration
 * ✅ Uses same surface + gradient tone as Header
 * ✅ Works in PWA fullscreen + notch safe areas
 * ============================================================
 */

import { useProductCartStore } from "@/components/store/cartStore";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  CalendarDays,
  Home,
  Layers3,
  Settings,
  Store,
  User,
} from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const ThemeToggle = dynamic(() => import("@/components/ThemeToggle"), {
  ssr: false,
});

export default function NavBar() {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();
  const vibrate = () => globalThis.navigator?.vibrate?.(20);
  const { totalItems } = useProductCartStore();
  const navRef = useRef<HTMLDivElement>(null);

  const tabs = [
    { name: "Home", href: "/", icon: Home },
    { name: "Services", href: "/services", icon: Layers3 },
    { name: "Store", href: "/store", icon: Store },
    { name: "Bookings", href: "/my-space", icon: CalendarDays },
    { name: "Profile", href: "/profile", icon: User },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  /* 🧭 Register nav height for safe viewport sync */
  useEffect(() => {
    const el = navRef.current;
    if (!el) return;

    const update = () => {
      const h = el.getBoundingClientRect().height;
      document.documentElement.style.setProperty("--mbnav-h", `${h}px`);
    };

    const resizeObs = new ResizeObserver(update);
    resizeObs.observe(el);
    update();

    return () => resizeObs.disconnect();
  }, []);

  return (
    <nav
      ref={navRef}
      className="fixed bottom-0 left-0 right-0 z-navbar md:hidden
                 border-t border-gray-200 dark:border-slate-800
                 backdrop-blur-2xl transition-all duration-500
                 safe-area-inset-bottom"
      style={{
        background: "var(--nav-surface)",
        color: "var(--nav-text)",
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
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#5A5DF0]/25 to-[#EC6ECF]/25 blur-md"
                    transition={{ type: "spring", stiffness: 240, damping: 20 }}
                  />
                )}
              </AnimatePresence>

              {/* 🌟 Icon */}
              <motion.div
                whileTap={{ scale: prefersReducedMotion ? 1 : 0.9 }}
                whileHover={{ scale: prefersReducedMotion ? 1 : 1.1 }}
                transition={{ type: "spring", stiffness: 300, damping: 18 }}
                className={`text-[11px] font-medium ${
                  active
                    ? "text-green-600 dark:text-emerald-400"
                    : "text-[var(--nav-label-color)]"
                }`}
              >
                <Icon size={20} />

                {/* 🛒 Cart badge */}
                {name === "Store" && totalItems > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 text-[10px] font-semibold
                               bg-green-600 text-white rounded-full w-4 h-4
                               flex items-center justify-center"
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
                    : "text-gray-600 dark:text-gray-400"
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
