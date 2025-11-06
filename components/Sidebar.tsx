"use client";
/**
 * Sidebar v9.9 — Gemini Continuum Estimator Launch Edition 🌌
 * ------------------------------------------------------------
 * ✅ Adds Online Estimator + Studio (Coming Soon)
 * ✅ Dynamic icon Cube/Box mapping (fix for "Calculator"/"Box")
 * ✅ Enhanced hover glow, badges & layout polish
 */

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import supabase from "@/lib/supabaseClient";
import { useSidebar } from "@/contexts/SidebarContext";

import {
  Home,
  ClipboardList,
  ShoppingCart,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  LogOut,
  LogIn,
  Settings,
  Palette,
  Store,
  Calculator,
  Box,
} from "lucide-react";

const ThemeToggle = dynamic(() => import("@/components/ThemeToggle"), { ssr: false });

// 🔹 Centralized navigation
const NAV = [
  { href: "/", label: "Home", Icon: Home },
  { href: "/services", label: "Services", Icon: ClipboardList },
  { href: "/bookings", label: "Bookings", Icon: CalendarDays },
  {
    href: "/estimator",
    label: "Online Estimator",
    Icon: Calculator,
    badge: "Live",
  },
  {
    href: "/studio",
    label: "Studio",
    Icon: Box,
    badge: "Coming Soon",
  },
  { href: "/store", label: "Store", Icon: Store },
  { href: "/cart", label: "Cart", Icon: ShoppingCart },
  { href: "/settings", label: "Settings", Icon: Settings },
];

export default function Sidebar() {
  const [user, setUser] = useState<{ name?: string } | null>(null);
  const { collapsed, setCollapsed } = useSidebar();
  const widthPx = collapsed ? 80 : 256;

  // 🧠 Mount trace
  useEffect(() => {
    console.log("%c[Sidebar mount]", "color:#9B5CF8;font-weight:bold;");
    return () => console.log("%c[Sidebar unmount]", "color:#EC6ECF;font-weight:bold;");
  }, []);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("user");
      }
    }
  }, []);

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("user");
    setUser(null);
    globalThis.location?.assign("/login");
  }, []);

  return (
<motion.aside
  role="complementary"
  aria-expanded={!collapsed}
  layout
  animate={{ width: widthPx }}
  transition={{ type: "spring", stiffness: 140, damping: 22 }}
  onMouseEnter={() => {
    // expand on hover only if currently collapsed
    if (collapsed) setCollapsed(false);
  }}
  onMouseLeave={() => {
    // collapse back when pointer leaves the sidebar area
    setCollapsed(true);
  }}
  className={`
    relative flex flex-col h-[calc(100vh-64px)]
    overflow-hidden border-r border-[#9B5CF8]/30
    bg-gradient-to-b from-[#F8F7FF] via-[#F3EEFF] to-[#EEE9FF]
    dark:from-[#0D0A24] dark:via-[#19123A] dark:to-[#221651]
    shadow-[inset_0_0_25px_rgba(155,92,248,0.1)]
    backdrop-blur-2xl transition-all duration-500
  `}
>
  {/* 🌈 Left Energy Flow Band */}
  <motion.div
    className="absolute inset-y-0 left-0 w-[4px] rounded-r-full pointer-events-none"
    animate={{
      background: [
        "linear-gradient(to bottom, #9B5CF8, #5A5DF0, #EC6ECF)",
        "linear-gradient(to bottom, #EC6ECF, #5A5DF0, #9B5CF8)",
      ],
      boxShadow: [
        "0 0 10px rgba(155,92,248,0.4)",
        "0 0 20px rgba(236,110,207,0.4)",
      ],
    }}
    transition={{ repeat: Infinity, duration: 6, ease: ["easeInOut"] }}
  />

  {/* ✨ Header with Toggle */}
  <div
    className="relative flex items-center justify-center px-4 py-4 border-b border-[#9B5CF8]/25 
               bg-white/60 dark:bg-[#141026]/40 backdrop-blur-xl
               shadow-[0_0_10px_rgba(155,92,248,0.08)]"
  >
    <motion.button
      aria-label="Toggle sidebar"
      aria-pressed={!collapsed}
      onClick={() => setCollapsed((prev) => !prev)}
      whileHover={{ scale: 1.15, rotate: collapsed ? 3 : -3 }}
      whileTap={{ scale: 0.92 }}
      transition={{ type: "spring", stiffness: 240, damping: 18 }}
      className="absolute -right-3 top-5 z-50 rounded-full bg-white dark:bg-slate-900 border
                 border-slate-300 dark:border-slate-700 shadow-sm p-1 hover:shadow-md
                 hover:border-[#9B5CF8]/40 hover:bg-[#F8F6FF]/80 dark:hover:bg-[#1A143A]/60
                 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#9B5CF8]/60
                 transition-all duration-300"
    >
      {collapsed ? (
        <ChevronRight size={18} className="text-slate-600 dark:text-slate-300" />
      ) : (
        <ChevronLeft size={18} className="text-slate-600 dark:text-slate-300" />
      )}
    </motion.button>
  </div>

  {/* 🧭 Navigation */}
  <div className="flex-1 overflow-y-auto px-2 py-4 space-y-1 relative">
    {NAV.map(({ href, label, Icon, badge }, index) => (
      <motion.div
        key={href}
        whileHover={{ scale: 1.03, x: 5 }}
        transition={{ type: "spring", stiffness: 220, damping: 20 }}
      >
        <Link
          href={href}
          className="group flex items-center gap-3 px-3 py-2 rounded-xl
                     text-[#5A5DF0] dark:text-[#EC6ECF]
                     hover:bg-gradient-to-r hover:from-[#5A5DF0]/10 hover:to-[#EC6ECF]/10
                     hover:shadow-[0_0_8px_rgba(155,92,248,0.25)]
                     transition-all duration-300 ease-out"
        >
          <motion.div
            whileHover={{ y: -1, rotate: 0.5, transition: { duration: 0.2 } }}
            className="relative flex items-center"
          >
            <Icon size={18} />
            <motion.span
              layoutId={`nav-glow-${index}`}
              className="absolute inset-0 rounded-full bg-gradient-to-r from-[#5A5DF0]/30 to-[#EC6ECF]/30 blur-md opacity-0 group-hover:opacity-60 transition-opacity"
            />
          </motion.div>

          {!collapsed && (
            <div className="flex items-center justify-between w-full">
              <span className="text-sm font-medium tracking-wide">{label}</span>
              {badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-md ml-2 ${
                    badge === "Live"
                      ? "bg-green-500/20 text-green-300"
                      : "bg-amber-500/20 text-amber-300"
                  }`}
                >
                  {badge}
                </span>
              )}
            </div>
          )}
        </Link>
      </motion.div>
    ))}
  </div>

  {/* 👤 Footer */}
  <div className="border-t border-[#9B5CF8]/25 bg-white/60 dark:bg-[#1B1635]/40 backdrop-blur-lg p-4 relative">
    <div className="flex items-center justify-between mb-2">
      {/* 🔮 Clickable Profile Aura */}
      <motion.div
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => (window.location.href = "/profile")}
        className="relative cursor-pointer group"
      >
        <motion.div
          initial={{ opacity: 0.6, scale: 1 }}
          animate={{ opacity: [0.6, 0.2, 0.6], scale: [1, 1.25, 1] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: ["easeInOut"] }}
          className="absolute inset-0 rounded-full bg-gradient-to-r from-[#5A5DF0]/40 to-[#EC6ECF]/40 blur-lg group-hover:opacity-80"
        />
        <motion.div
          whileHover={{ rotate: 3 }}
          className="relative w-9 h-9 rounded-full bg-gradient-to-r from-[#5A5DF0] to-[#EC6ECF]
                     flex items-center justify-center text-sm font-bold text-white
                     shadow-[0_0_8px_rgba(155,92,248,0.6)] ring-1 ring-white/10"
        >
          {user?.name?.[0]?.toUpperCase() || "G"}
        </motion.div>
      </motion.div>

      {/* User name + theme toggle */}
      {!collapsed && (
        <div className="flex items-center justify-between flex-1 ml-3">
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-medium text-[#232056] dark:text-white">
              {user?.name || "Guest"}
            </span>
            <span className="text-xs text-[#6C6AA8] dark:text-[#A19FCC]">
              Member
            </span>
          </div>
          <ThemeToggle />
        </div>
      )}
    </div>

    {/* Auth buttons */}
    {user ? (
      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={handleLogout}
        className="w-full mt-2 flex items-center gap-2 px-3 py-2 rounded-lg text-[#EC6ECF]
                   hover:bg-[#EC6ECF]/10 transition-all"
      >
        <LogOut size={16} />
        {!collapsed && <span className="text-sm">Logout</span>}
      </motion.button>
    ) : (
      <motion.div whileTap={{ scale: 0.96 }}>
        <Link
          href="/login"
          className="w-full mt-2 flex items-center gap-2 px-3 py-2 rounded-lg
                     text-[#5A5DF0] hover:bg-[#9B5CF8]/10 transition-all"
        >
          <LogIn size={16} />
          {!collapsed && <span className="text-sm">Login</span>}
        </Link>
      </motion.div>
    )}
  </div>
</motion.aside>

  );
}
