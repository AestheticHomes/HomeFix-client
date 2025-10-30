"use client";
/**
 * Sidebar v6.5 — Aurora Docked Shell + Role-Aware Edition 🌗
 * ----------------------------------------------------------
 * ✅ Type-safe (no implicit any)
 * ✅ Auto-collapse on touch devices
 * ✅ Works with SessionSync (cross-tab logout)
 * ✅ Handles Admin role visibility
 * ✅ PWA + safe-area + framer-motion animation
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
  User,
  LogOut,
  LogIn,
  Settings,
  Shield,
} from "lucide-react";
import dynamic from "next/dynamic";
import supabase from "@/lib/supabaseClient";

const ThemeToggle = dynamic(() => import("@/components/ThemeToggle"), {
  ssr: false,
});

type NavItem = {
  href: string;
  label: string;
  Icon: React.ElementType;
};

const NAV: NavItem[] = [
  { href: "/", label: "Home", Icon: Home },
  { href: "/services", label: "Services", Icon: ClipboardList },
  { href: "/bookings", label: "Bookings", Icon: CalendarDays },
  { href: "/cart", label: "Cart", Icon: ShoppingCart },
  { href: "/settings", label: "Settings", Icon: Settings },
];

export default function Sidebar() {
  const [user, setUser] = useState<{ name?: string } | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  /* 🌿 Load user + check role */
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("user");
      }
    }

    setIsTouch(globalThis.matchMedia?.("(pointer: coarse)").matches ?? false);

    (async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (!data?.user) return;

        const { data: profile } = await supabase
          .from("user_profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();

        setIsAdmin(profile?.role === "admin");
      } catch (err) {
        console.warn("⚠️ [Sidebar] Role check failed:", err);
      }
    })();
  }, []);

  /* 🚪 Logout Handler — synced with SessionSync */
  const handleLogout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem("user");
      setUser(null);
      globalThis.dispatchEvent(
        new CustomEvent("hf:session-sync", { detail: "logged_out" })
      );
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      globalThis.location?.assign("/login");
    }
  }, []);

  const widthPx = collapsed ? 72 : 256;

  return (
    <motion.aside
      layout
      className={`
        fixed top-0 left-0 bottom-0 z-[40]
        flex flex-col justify-between
        border-r border-slate-200 dark:border-slate-800
        bg-gradient-to-b from-white to-gray-50 dark:from-slate-950 dark:to-slate-900
        backdrop-blur-md shadow-inner transition-all duration-300
      `}
      initial={false}
      animate={{ width: widthPx }}
      transition={{ type: "spring", stiffness: 240, damping: 26 }}
      onMouseEnter={() => !isTouch && collapsed && setCollapsed(false)}
      onMouseLeave={() => !isTouch && !collapsed && setCollapsed(true)}
    >
      {/* 🌿 Brand Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-slate-200 dark:border-slate-700 relative">
        <span
          className={`text-2xl font-bold tracking-tight text-green-700 dark:text-green-400 transition-opacity ${
            collapsed ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          HomeFix
        </span>

        <button
          aria-label="Toggle sidebar"
          onClick={() => setCollapsed((v) => !v)}
          className="absolute -right-3 top-8 rounded-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 shadow p-1 hover:shadow-md transition"
        >
          {collapsed ? (
            <ChevronRight
              size={16}
              className="text-slate-600 dark:text-slate-300"
            />
          ) : (
            <ChevronLeft
              size={16}
              className="text-slate-600 dark:text-slate-300"
            />
          )}
        </button>
      </div>

      {/* 🧭 Navigation Links */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-visible">
        {NAV.map(({ href, label, Icon }) => (
          <Link
            key={href}
            href={href as any}
            className="group relative flex items-center gap-3 px-3 py-2 rounded-xl
                       text-slate-700 dark:text-slate-300 hover:bg-green-50 dark:hover:bg-green-900/20
                       hover:text-green-700 dark:hover:text-green-400 transition-all"
          >
            <Icon size={18} />
            {!collapsed && (
              <span className="text-sm font-medium">{label}</span>
            )}
          </Link>
        ))}

        {/* 🛡 Admin Dashboard (visible only for admins) */}
        {isAdmin && (
          <Link
            href={"/profile" as any}
            className="group relative flex items-center gap-3 px-3 py-2 rounded-xl
                       text-emerald-700 dark:text-emerald-300 bg-emerald-50/70 dark:bg-emerald-900/40
                       hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-all mt-3"
          >
            <Shield size={18} />
            {!collapsed && (
              <span className="text-sm font-medium">Admin Dashboard</span>
            )}
          </Link>
        )}
      </nav>

      {/* ⚙️ Footer */}
      <div className="border-t border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/50 backdrop-blur-md p-3 safe-area-inset-bottom">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {user?.name || "Guest"}
            </span>
          )}
          <ThemeToggle />
        </div>

        {user ? (
          <button
            onClick={handleLogout}
            className="w-full mt-3 flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
          >
            <LogOut size={16} />
            {!collapsed && <span className="text-sm">Logout</span>}
          </button>
        ) : (
          <Link
            href={"/login" as any}
            className="w-full mt-3 flex items-center gap-2 px-3 py-2 rounded-lg text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition"
          >
            <LogIn size={16} />
            {!collapsed && <span className="text-sm">Login</span>}
          </Link>
        )}
      </div>
    </motion.aside>
  );
}
