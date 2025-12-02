"use client";
/** v7.7 — Safe dock, single writer for --mbnav-h (CSS computes safe). */

import { useProductCartStore } from "@/components/store/cartStore";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CalendarDays, Home, Layers3, Settings, Store } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export default function NavBar() {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();
  const { totalItems } = useProductCartStore();
  const navRef = useRef<HTMLDivElement>(null);

  const vibrate = () =>
    typeof navigator !== "undefined" &&
    "vibrate" in navigator &&
    navigator.vibrate(20);

  const tabs = [
    { name: "Home", href: "/", icon: Home },
    { name: "Services", href: "/services", icon: Layers3 },
    { name: "Store", href: "/store", icon: Store },
    { name: "Bookings", href: "/my-bookings", icon: CalendarDays },
    { name: "Settings", href: "/settings", icon: Settings },
  ] as const;

  useEffect(() => {
    const el = navRef.current;
    if (!el) return;

    const update = () => {
      const h = el.getBoundingClientRect().height;
      document.documentElement.style.setProperty("--mbnav-h", `${h}px`);
    };

    const ro = new ResizeObserver(update);
    ro.observe(el);
    update();

    return () => {
      ro.disconnect();
      document.documentElement.style.setProperty("--mbnav-h", "72px");
    };
  }, []);

  return (
    <nav
      ref={navRef}
      role="navigation"
      aria-label="Primary"
      className="fixed bottom-0 left-0 right-0 md:hidden
                 border-t border-border
                 backdrop-blur-2xl transition-all duration-500"
      style={{
        zIndex: "var(--z-navbar)",
        background: "var(--nav-surface)",
        color: "var(--nav-text)",
        WebkitBackdropFilter: "blur(16px)",
        paddingBottom: "env(safe-area-inset-bottom)",
        pointerEvents: "auto",
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
              <AnimatePresence>
                {active && (
                  <motion.span
                    layoutId="nav-active-glow"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-[color-mix(in_srgb,var(--accent-primary)30%,transparent)] to-[color-mix(in_srgb,var(--accent-secondary)30%,transparent)] blur-md"
                    transition={{ type: "spring", stiffness: 240, damping: 20 }}
                  />
                )}
              </AnimatePresence>

              <motion.div
                whileTap={{ scale: prefersReducedMotion ? 1 : 0.9 }}
                whileHover={{ scale: prefersReducedMotion ? 1 : 1.1 }}
                transition={{ type: "spring", stiffness: 300, damping: 18 }}
                className={
                  active ? "text-emerald-500" : "text-[var(--nav-label-color)]"
                }
              >
                <Icon size={20} />
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

              <span
                className={
                  active
                    ? "text-emerald-500 text-[11px] font-medium"
                    : "text-muted text-[11px] font-medium"
                }
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
