"use client";
/**
 * Sidebar v9.8 — Gemini Continuum Mount-Trace Edition 🌌
 * ----------------------------------------------------------
 * ✅ Detects duplicate mounts (console output)
 * ✅ No design or logic changes
 */

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
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
} from "lucide-react";
import dynamic from "next/dynamic";
import supabase from "@/lib/supabaseClient";
import { useSidebar } from "@/contexts/SidebarContext";

const ThemeToggle = dynamic(() => import("@/components/ThemeToggle"), { ssr: false });

const NAV = [
  { href: "/", label: "Home", Icon: Home },
  { href: "/services", label: "Services", Icon: ClipboardList },
  { href: "/bookings", label: "Bookings", Icon: CalendarDays },
  { href: "/studio", label: "Studio", Icon: Palette },
  { href: "/store", label: "Store", Icon: Store },
  { href: "/cart", label: "Cart", Icon: ShoppingCart },
  { href: "/settings", label: "Settings", Icon: Settings },
];

export default function Sidebar() {
  const [user, setUser] = useState<{ name?: string } | null>(null);
  const { collapsed, setCollapsed } = useSidebar();
  const widthPx = collapsed ? 80 : 256;

  // 🧠 Mount trace (detect duplicate mounts)
  useEffect(() => {
    console.log("%c[Sidebar mount]", "color:#9B5CF8;font-weight:bold;");
    return () => {
      console.log("%c[Sidebar unmount]", "color:#EC6ECF;font-weight:bold;");
    };
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
      layout
      animate={{ width: widthPx }}
      transition={{ type: "spring", stiffness: 140, damping: 22 }}
      className={`
        relative flex flex-col h-[calc(100vh-64px)]
        overflow-hidden border-r border-[#9B5CF8]/30
        bg-gradient-to-b from-[#F8F7FF] via-[#F3EEFF] to-[#EEE9FF]
        dark:from-[#0D0A24] dark:via-[#19123A] dark:to-[#221651]
        shadow-[inset_0_0_25px_rgba(155,92,248,0.1)]
        backdrop-blur-2xl transition-all duration-500
      `}
    >
      {/* 🌈 Left Edge Energy Flow */}
      <motion.div
        className="absolute inset-y-0 left-0 w-[4px] rounded-r-full"
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
        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
      />

      {/* ✨ Compact Header with Chevron */}
      <div
        className="relative flex items-center justify-center px-4 py-4 border-b border-[#9B5CF8]/25 
                   bg-white/60 dark:bg-[#141026]/40 backdrop-blur-xl
                   shadow-[0_0_10px_rgba(155,92,248,0.08)]"
      >
        <motion.button
          aria-label="Toggle sidebar"
          onClick={() => setCollapsed((prev) => !prev)}
          whileHover={{ scale: 1.15, rotate: collapsed ? 3 : -3 }}
          whileTap={{ scale: 0.92 }}
          transition={{ type: "spring", stiffness: 240, damping: 18 }}
          className="absolute -right-3 top-5 rounded-full bg-white dark:bg-slate-900 border
                     border-slate-300 dark:border-slate-700 shadow-sm p-1 hover:shadow-md
                     hover:border-[#9B5CF8]/40 hover:bg-[#F8F6FF]/80 dark:hover:bg-[#1A143A]/60
                     transition-all duration-300"
        >
          {collapsed ? (
            <ChevronRight size={18} className="text-slate-600 dark:text-slate-300" />
          ) : (
            <ChevronLeft size={18} className="text-slate-600 dark:text-slate-300" />
          )}
        </motion.button>
      </div>

      {/* 🧭 Navigation Section */}
      <div className="flex-1 overflow-y-auto px-2 py-4 space-y-1 relative">
        {NAV.map(({ href, label, Icon }, index) => (
          <motion.div
            key={href}
            whileHover={{ scale: 1.03, x: 5 }}
            transition={{ type: "spring", stiffness: 220, damping: 20 }}
          >
            <Link
              href={href as any}
              className="group flex items-center gap-3 px-3 py-2 rounded-xl
                         text-[#5A5DF0] dark:text-[#EC6ECF]
                         hover:bg-gradient-to-r hover:from-[#5A5DF0]/10 hover:to-[#EC6ECF]/10
                         hover:shadow-[0_0_8px_rgba(155,92,248,0.25)]
                         transition-all duration-300 ease-out"
            >
              <motion.div
                whileHover={{
                  y: -1,
                  rotate: 0.5,
                  transition: { duration: 0.2 },
                }}
                className="relative"
              >
                <Icon size={18} />
                <motion.span
                  layoutId={`nav-glow-${index}`}
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-[#5A5DF0]/30 to-[#EC6ECF]/30 blur-md opacity-0 group-hover:opacity-60 transition-opacity"
                />
              </motion.div>
              {!collapsed && (
                <span className="text-sm font-medium tracking-wide">
                  {label}
                </span>
              )}
            </Link>
          </motion.div>
        ))}
      </div>

      {/* 👤 Footer */}
      <div className="border-t border-[#9B5CF8]/25 bg-white/60 dark:bg-[#1B1635]/40 backdrop-blur-lg p-4 relative">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <motion.div
              whileHover={{ rotate: 2 }}
              className="w-8 h-8 rounded-full bg-gradient-to-r from-[#5A5DF0] to-[#EC6ECF]
                         flex items-center justify-center text-xs font-bold text-white 
                         shadow-[0_0_6px_rgba(155,92,248,0.5)]"
            >
              {user?.name?.[0]?.toUpperCase() || "G"}
            </motion.div>
            {!collapsed && (
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-medium text-[#232056] dark:text-white">
                  {user?.name || "Guest"}
                </span>
                <span className="text-xs text-[#6C6AA8] dark:text-[#A19FCC]">
                  Member
                </span>
              </div>
            )}
          </div>
          <ThemeToggle />
        </div>

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
              href={"/login" as any}
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
