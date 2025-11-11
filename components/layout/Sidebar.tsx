"use client";
/**
 * Sidebar v10.5 — HomeFix Gemini Continuum Unified 🌗
 * ------------------------------------------------------------
 * ✅ Full integration with globals.css v6.1+ palette
 * ✅ True-light / Gemini-dark base with readable text
 * ✅ Smooth spring animation & no overflow flicker
 * ✅ Hover glow retains Edith gradient energy
 */

import { useSidebar } from "@/contexts/SidebarContext";
import { useUser } from "@/contexts/UserContext";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";
import {
  Box,
  Calculator,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Home,
  LogIn,
  LogOut,
  Settings,
  ShoppingCart,
  Store,
} from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

const ThemeToggle = dynamic(() => import("@/components/ThemeToggle"), {
  ssr: false,
});

const NAV = [
  { href: "/", label: "Home", Icon: Home },
  { href: "/services", label: "Services", Icon: ClipboardList },
  { href: "/my-space", label: "Bookings", Icon: CalendarDays },
  {
    href: "/estimator",
    label: "Online Estimator",
    Icon: Calculator,
    badge: "Live",
  },
  { href: "/studio", label: "Studio", Icon: Box, badge: "Coming Soon" },
  { href: "/store", label: "Store", Icon: Store },
  { href: "/cart", label: "Cart", Icon: ShoppingCart },
  { href: "/settings", label: "Settings", Icon: Settings },
];

export default function Sidebar() {
  const { collapsed, setCollapsed } = useSidebar();
  const { user: contextUser } = useUser();
  const [user, setUser] = useState<{ name?: string; phone?: string } | null>(
    null
  );
  const widthPx = collapsed ? 80 : 256;

  /* 🧠 Hydrate user */
  useEffect(() => {
    const cached = localStorage.getItem("user");
    if (contextUser) setUser(contextUser);
    else if (cached)
      try {
        setUser(JSON.parse(cached));
      } catch {
        localStorage.removeItem("user");
      }
  }, [contextUser]);

  /* 🚪 Logout */
  const handleLogout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem("user");
      setUser(null);
      window.dispatchEvent(new CustomEvent("profile-updated"));
      setTimeout(() => (window.location.href = "/login"), 300);
    } catch (err) {
      console.error("💥 [Sidebar Logout Error]:", err);
      window.location.href = "/login";
    }
  }, []);

  const avatarLetter = user?.name?.[0]?.toUpperCase() || "G";

  return (
    <motion.aside
      data-theme-transition
      role="complementary"
      aria-expanded={!collapsed}
      layout
      animate={{ width: widthPx }}
      transition={{
        type: "spring",
        stiffness: 150,
        damping: 22,
        mass: 0.8,
      }}
      onMouseEnter={() => collapsed && setCollapsed(false)}
      onMouseLeave={() => setCollapsed(true)}
      style={{
        background: "var(--sidebar-surface)",
        color: "var(--sidebar-text)",
        transition: "background 0.4s ease, color 0.4s ease",
      }}
      className={`
    relative flex flex-col h-[calc(100vh-64px)]
    overflow-y-auto overflow-x-hidden
    border-r border-[#9B5CF8]/25
    shadow-[inset_0_0_20px_rgba(155,92,248,0.08)]
    backdrop-blur-xl transition-all duration-500
  `}
    >
      {/* 🌈 Energy Glow Band */}
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
        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
      />

      {/* ✨ Header */}
      <div
        className="relative flex items-center justify-center px-4 py-4 border-b border-[#9B5CF8]/20 
                   bg-surface-light/80 dark:bg-surface-dark/70 backdrop-blur-xl"
      >
        <motion.button
          aria-label="Toggle sidebar"
          aria-pressed={!collapsed}
          onClick={() => setCollapsed((prev) => !prev)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 240, damping: 18 }}
          className="absolute -right-3 top-5 z-50 rounded-full 
                     bg-surface-light dark:bg-surface-dark 
                     border border-slate-200 dark:border-slate-700 
                     shadow-md p-1 hover:border-[#9B5CF8]/40
                     hover:bg-[#F4F2FF]/80 dark:hover:bg-[#1A143A]/60
                     transition-all duration-300"
        >
          {collapsed ? (
            <ChevronRight
              size={18}
              className="text-gray-600 dark:text-gray-300"
            />
          ) : (
            <ChevronLeft
              size={18}
              className="text-gray-600 dark:text-gray-300"
            />
          )}
        </motion.button>
      </div>

      {/* 🧭 Navigation */}
      <div className="flex-1 px-2 py-4 space-y-1 relative select-none">
        {NAV.map(({ href, label, Icon, badge }) => (
          <motion.div
            key={href}
            whileHover={{ scale: 1.03, x: 3 }}
            transition={{ type: "spring", stiffness: 220, damping: 18 }}
          >
            <Link
              href={href}
              className="group flex items-center gap-3 px-3 py-2 rounded-xl
                         text-primary-light dark:text-primary-dark
                         hover:bg-gradient-to-r hover:from-[#5A5DF0]/10 hover:to-[#EC6ECF]/10
                         hover:shadow-[0_0_10px_rgba(155,92,248,0.25)]
                         transition-all duration-300 ease-out"
            >
              <motion.div
                whileHover={{ y: -1 }}
                className="relative flex items-center"
              >
                <Icon size={18} />
                <span className="absolute inset-0 rounded-full bg-gradient-to-r from-[#5A5DF0]/20 to-[#EC6ECF]/20 blur-md opacity-0 group-hover:opacity-60 transition-opacity" />
              </motion.div>

              {!collapsed && (
                <div className="flex items-center justify-between w-full">
                  <span className="text-sm font-medium tracking-wide">
                    {label}
                  </span>
                  {badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-md ml-2 ${
                        badge === "Live"
                          ? "bg-green-500/20 text-green-700 dark:text-green-300"
                          : "bg-amber-500/20 text-amber-700 dark:text-amber-300"
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
      <div className="border-t border-[#9B5CF8]/20 bg-surface-light/80 dark:bg-surface-dark/70 backdrop-blur-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <motion.div
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => (window.location.href = "/profile")}
            className="relative cursor-pointer group"
          >
            <motion.div
              initial={{ opacity: 0.5 }}
              animate={{ opacity: [0.4, 0.1, 0.4], scale: [1, 1.15, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 rounded-full bg-gradient-to-r from-[#5A5DF0]/40 to-[#EC6ECF]/40 blur-lg"
            />
            <div
              className="relative w-9 h-9 rounded-full bg-gradient-to-r from-[#5A5DF0] to-[#EC6ECF]
                         flex items-center justify-center text-sm font-bold text-white
                         shadow-[0_0_10px_rgba(155,92,248,0.5)] ring-1 ring-white/10"
            >
              {avatarLetter}
            </div>
          </motion.div>

          {!collapsed && (
            <div className="flex items-center justify-between flex-1 ml-3">
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-medium">
                  {user?.name || "Guest"}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Member
                </span>
              </div>
              <ThemeToggle />
            </div>
          )}
        </div>

        {user ? (
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleLogout}
            className="w-full mt-2 flex items-center gap-2 px-3 py-2 rounded-lg 
                       text-[#EC6ECF] hover:bg-[#EC6ECF]/10 transition-all"
          >
            <LogOut size={16} />
            {!collapsed && <span className="text-sm">Logout</span>}
          </motion.button>
        ) : (
          <Link
            href="/login"
            className="w-full mt-2 flex items-center gap-2 px-3 py-2 rounded-lg
                       text-[#5A5DF0] hover:bg-[#9B5CF8]/10 transition-all"
          >
            <LogIn size={16} />
            {!collapsed && <span className="text-sm">Login</span>}
          </Link>
        )}
      </div>
    </motion.aside>
  );
}
