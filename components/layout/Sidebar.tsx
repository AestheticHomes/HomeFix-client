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
import { useUserProfile } from "@/hooks/useUserProfile";
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
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

const ThemeToggle = dynamic(() => import("@/components/ThemeToggle"), {
  ssr: false,
});

const NAV = [
  { href: "/", label: "Home", Icon: Home },
  { href: "/services", label: "Services", Icon: ClipboardList },
  { href: "/my-bookings", label: "Bookings", Icon: CalendarDays },
  {
    href: "/instant-quote",
    label: "Get Price Estimate",
    Icon: Calculator,
    badge: "Live",
  },
  { href: "/design-lab", label: "Design Lab", Icon: Box, badge: "Coming Soon" },
  { href: "/store", label: "Store", Icon: Store },
  { href: "/cart", label: "Cart", Icon: ShoppingCart },
  { href: "/settings", label: "Settings", Icon: Settings },
];

export default function Sidebar() {
  const { collapsed, setCollapsed } = useSidebar();
  const { logout } = useUser();
  const { user, loggedIn, isLoading } = useUserProfile();
  const router = useRouter();

  const [pinned, setPinned] = useState<boolean>(false);

  const widthPx = collapsed ? 80 : 256;

  /* 🚪 Logout */
  const handleLogout = useCallback(async () => {
    try {
      await logout();
      router.push("/login");
    } catch (err) {
      console.error("💥 [Sidebar Logout Error]:", err);
      router.push("/login");
    }
  }, [logout, router]);

  const displayName =
    (loggedIn && (user?.name || user?.email)) || "Guest";
  const statusLabel = loggedIn ? "Verified profile ✓" : "Not signed in";
  const avatarLetter =
    displayName?.[0]?.toUpperCase() || "G";
  const showLogin = !isLoading && !loggedIn;

  return (
    <motion.aside
      data-theme-transition
      role="complementary"
      layout
      animate={{ width: widthPx }}
      transition={{
        type: "spring",
        stiffness: 150,
        damping: 22,
        mass: 0.8,
      }}
      onMouseEnter={() => {
        if (!pinned) setCollapsed(false);
      }}
      onMouseLeave={() => {
        if (!pinned) setCollapsed(true);
      }}
      style={{
        background: "var(--sidebar-surface)",
        color: "var(--sidebar-text)",
        transition: "background 0.4s ease, color 0.4s ease",
        borderRight: "1px solid var(--border-soft)",
      }}
      className={`
    relative flex flex-col h-full
    overflow-y-hidden overflow-x-hidden
    backdrop-blur-xl transition-all duration-500
  `}
    >
      {/* 🌈 Edith Aura Band */}
      <motion.div
        className="absolute inset-y-0 left-0 w-[4px] rounded-r-full pointer-events-none"
        animate={{
          background: [
            "linear-gradient(to bottom, var(--accent-tertiary), var(--accent-primary), var(--accent-secondary))",
            "linear-gradient(to bottom, var(--accent-secondary), var(--accent-primary), var(--accent-tertiary))",
          ],
          boxShadow: [
            "0 0 16px rgba(155,92,248,0.55)",
            "0 0 26px rgba(236,110,207,0.6)",
          ],
          scaleY: [1, 1.04, 1],
        }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
      />

      {/* ✨ Header */}
      <div
        className="relative flex items-center justify-center px-4 py-4 border-b border-[var(--border-soft)]
                   bg-[var(--sidebar-surface)] backdrop-blur-xl"
      >
        <motion.button
          aria-label="Toggle sidebar"
          aria-pressed={pinned}
          onClick={() =>
            setPinned((prev) => {
              const next = !prev;
              setCollapsed(!next);
              return next;
            })
          }
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 240, damping: 18 }}
          className="absolute -right-3 top-5 z-50 rounded-full 
                     bg-[var(--sidebar-surface)]
                     border border-[var(--border-soft)]
                     shadow-md p-1 hover:border-[var(--accent-tertiary)]/40
                     hover:bg-[var(--edith-surface-hover)]/90 dark:hover:bg-[var(--surface-hover)]
                     transition-all duration-300"
        >
          {collapsed ? (
            <ChevronRight
              size={18}
              className="text-[var(--sidebar-text)]/70"
            />
          ) : (
            <ChevronLeft
              size={18}
              className="text-[var(--sidebar-text)]/70"
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
                         text-[var(--sidebar-text)]
                         hover:bg-gradient-to-r hover:from-[var(--accent-primary)]/10 hover:to-[var(--accent-secondary)]/10
                         hover:shadow-[0_0_10px_rgba(155,92,248,0.25)]
                         transition-all duration-300 ease-out"
            >
              <motion.div
                whileHover={{ y: -1 }}
                className="relative flex items-center"
              >
                <Icon size={18} />
                <span className="absolute inset-0 rounded-full bg-gradient-to-r from-[var(--accent-primary)]/20 to-[var(--accent-secondary)]/20 blur-md opacity-0 group-hover:opacity-60 transition-opacity" />
              </motion.div>

              {!collapsed && (
                <div className="flex items-center justify-between w-full">
                  <span className="text-[15px] font-medium tracking-wide">
                    {label}
                  </span>
                  {badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-md ml-2 ${
                        badge === "Live"
                          ? "bg-[var(--badge-live-bg)] text-[var(--badge-live-text)]"
                          : "bg-[var(--badge-soon-bg)] text-[var(--badge-soon-text)]"
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
      <div className="border-t border-[var(--border-soft)] bg-[var(--sidebar-surface)] backdrop-blur-lg p-4">
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
              className="absolute inset-0 rounded-full bg-gradient-to-r from-[var(--accent-primary)]/40 to-[var(--accent-secondary)]/40 blur-lg"
            />
            <div
              className="relative w-9 h-9 rounded-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)]
                         flex items-center justify-center text-sm font-bold text-white
                         shadow-[0_0_10px_rgba(155,92,248,0.5)] ring-1 ring-white/10"
            >
              {avatarLetter}
            </div>
          </motion.div>

          {!collapsed && (
            <div className="flex items-center justify-between flex-1 ml-3">
              <div className="flex flex-col leading-tight">
                <span className="text-[15px] font-medium">
                  {displayName}
                </span>
                <span className="text-xs text-[var(--text-muted)]">
                  {statusLabel}
                </span>
              </div>
              <ThemeToggle />
            </div>
          )}
        </div>

        {loggedIn ? (
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleLogout}
            className="w-full mt-2 flex items-center gap-2 px-3 py-2 rounded-lg 
                       text-[var(--accent-secondary)] hover:bg-[var(--accent-secondary)]/10 transition-all"
          >
            <LogOut size={16} />
            {!collapsed && <span className="text-sm">Logout</span>}
          </motion.button>
        ) : showLogin ? (
          <Link
            href="/login"
            className="w-full mt-2 flex items-center gap-2 px-3 py-2 rounded-lg
                       text-[var(--accent-primary)] hover:bg-[var(--accent-tertiary)]/10 transition-all"
          >
            <LogIn size={16} />
            {!collapsed && <span className="text-sm">Login</span>}
          </Link>
        ) : null}
      </div>
    </motion.aside>
  );
}
