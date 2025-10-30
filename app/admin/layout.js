"use client";
/**
 * File: /app/admin/layout.js
 * Version: v3.8 — Unified Admin Shell 🌿
 * ---------------------------------------
 * ✅ Single-scroll viewport (no nested scrollbars)
 * ✅ Mobile-safe (safe-area-inset)
 * ✅ Sidebar locks body scroll on mobile
 * ✅ Smooth transitions + dark-mode consistent
 * ✅ Uses role-based guard via useRoleGuard()
 */

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import {
  LayoutDashboard,
  Package,
  CalendarDays,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";


export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { authorized, loading, isAdmin, isManager, isSupport, isTechnician } = useRoleGuard({
    roles: ["admin", "manager", "support", "technician"],
    enforce: true,
    redirectTo: "/unauthorized",
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // 🚫 Prevent background scroll on mobile sidebar open
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [sidebarOpen]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (loading)
    return (
      <main className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-slate-900 text-gray-500">
        <Loader2 className="animate-spin w-6 h-6 mr-2" />
        Verifying admin session…
      </main>
    );

  if (!authorized) return null;

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/profile" },
    { name: "Bookings", icon: CalendarDays, href: "/profile/bookings", show: true },
    { name: "CMS / Goods", icon: Package, href: "/profile/content", show: isAdmin || isManager },
    { name: "Users", icon: Users, href: "/profile/users", show: isAdmin || isSupport },
    { name: "Settings", icon: Settings, href: "/profile/settings", show: isAdmin },
  ].filter((item) => item.show !== false);

  return (
    <div className="flex bg-gray-50 dark:bg-slate-900 text-slate-800 dark:text-gray-100 h-[100dvh] overflow-hidden">
      {/* SIDEBAR */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            key="sidebar"
            initial={{ x: -260 }}
            animate={{ x: 0 }}
            exit={{ x: -260 }}
            transition={{ duration: 0.25 }}
            className="fixed md:static z-40 w-64 h-full bg-white dark:bg-slate-800 shadow-lg border-r border-gray-100 dark:border-slate-700 flex flex-col"
            style={{
              paddingTop: "env(safe-area-inset-top)",
              paddingBottom: "env(safe-area-inset-bottom)",
            }}
          >
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-4 border-b dark:border-slate-700">
              <h2 className="text-lg font-bold text-green-600">HomeFix Admin</h2>
              <button
                className="md:hidden text-gray-600 dark:text-gray-300"
                onClick={() => setSidebarOpen(false)}
              >
                <X size={22} />
              </button>
            </div>

            {/* Sidebar Menu */}
            <nav className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-500/40 dark:scrollbar-thumb-emerald-600/40">
              {menuItems.map(({ name, icon: Icon, href }) => {
                const active = pathname === href;
                return (
                  <button
                    key={name}
                    onClick={() => {
                      setSidebarOpen(false);
                      router.push(href);
                    }}
                    className={`w-full flex items-center gap-3 px-5 py-3 text-sm font-medium text-left transition-colors ${
                      active
                        ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                        : "hover:bg-gray-100 dark:hover:bg-slate-700"
                    }`}
                  >
                    <Icon size={18} />
                    {name}
                  </button>
                );
              })}
            </nav>

            {/* Logout */}
            <div className="border-t dark:border-slate-700 p-4">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700"
              >
                <LogOut size={18} /> Logout
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* MAIN AREA */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="sticky top-0 bg-white dark:bg-slate-800 shadow-sm border-b border-gray-100 dark:border-slate-700 flex items-center justify-between px-6 py-3 z-30">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden text-gray-700 dark:text-gray-200"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu size={22} />
            </button>
            <h1 className="font-semibold text-lg">Admin Panel</h1>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-6 py-6 scrollbar-thin scrollbar-thumb-gray-400/40 dark:scrollbar-thumb-slate-600/50">
          <div className="pb-[env(safe-area-inset-bottom)]">{children}</div>
        </main>
      </div>
    </div>
  );
}
