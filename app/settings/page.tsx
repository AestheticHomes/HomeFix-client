"use client";

import { motion } from "framer-motion";
import NextDynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import PWAInstallButton from "@/components/PWAInstallButton";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useUser } from "@/contexts/UserContext";
import {
  Briefcase,
  ChevronRight,
  Hammer,
  LogOut,
  Shield,
  User,
} from "lucide-react";

const ThemeToggle = NextDynamic(() => import("@/components/ThemeToggle"), {
  ssr: false,
});

export default function SettingsPage() {
  // Dynamic page to avoid prerender auth issues
  
  const { user, loggedIn, loading } = useUserProfile();
  const { logout } = useUser();
  const router = useRouter();

  const [role, setRole] = useState("user");
  const [loadingRole, setLoadingRole] = useState(true);

  /* ------------------------------------------------------------
     🧠 Role Detection
  ------------------------------------------------------------ */
  useEffect(() => {
    if (!user) {
      setRole("guest");
      setLoadingRole(false);
      return;
    }

    const checkRole = async () => {
      setLoadingRole(true);
      try {
        const metaRole =
          user.role || user?.user_metadata?.role || user?.app_metadata?.role;

        if (metaRole) {
          setRole(metaRole);
          return;
        }

        setRole(user.role || "user");
      } catch (err) {
        console.error("[SETTINGS] Role check failed:", err);
        setRole("user");
      } finally {
        setLoadingRole(false);
      }
    };

    checkRole();
  }, [user]);

  if (loading || loadingRole) return null;

  /* ------------------------------------------------------------
     🚪 Logout Handler
  ------------------------------------------------------------ */
  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  // Derived flags
  const isAdmin = role === "admin";
  const isManager = role === "manager";
  const isTechnician = role === "technician";

  return (
    <div className="min-h-[100dvh] bg-[var(--surface-base)] pt-6 pb-28 px-4 md:pb-12 transition-colors duration-500">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-xl font-semibold mb-4 text-[var(--text-primary)] dark:text-[var(--text-primary-dark)]"
      >
        Settings
      </motion.h1>

      {!loggedIn ? (
        <Link
          href="/login"
          className="block text-center py-4 rounded-xl bg-[var(--accent-success)] hover:bg-[var(--accent-success-hover)] text-white font-medium transition"
        >
          Log in / Sign up
        </Link>
      ) : (
        <>
          {/* User Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-[var(--surface-card)]/90 dark:bg-[var(--surface-card-dark)]/85 backdrop-blur-lg rounded-2xl p-4 shadow-sm border border-[var(--border-soft)] flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[var(--accent-success)]/12 dark:bg-[var(--accent-success)]/25 flex items-center justify-center">
                <User className="w-6 h-6 text-[var(--accent-success)]" />
              </div>
              <div>
                <p className="font-medium text-[var(--text-primary)] dark:text-[var(--text-primary-dark)]">
                  {user?.name || "Aesthetic Home"}
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  {user?.phone || "720009XXXX"}
                </p>
                {role !== "user" && (
                  <span className="inline-block mt-1 text-[10px] px-2 py-[2px] rounded-full bg-[var(--badge-live-bg)] text-[var(--badge-live-text)] uppercase">
                    {role}
                  </span>
                )}
              </div>
            </div>
            <ThemeToggle />
          </motion.div>

          {/* Settings Actions */}
          <section className="mt-6 space-y-3">
            <Link
              href="/profile"
              className="flex items-center justify-between bg-[var(--surface-card)]/90 dark:bg-[var(--surface-card-dark)]/85 backdrop-blur-md border border-[var(--border-soft)] rounded-xl p-3 hover:bg-[var(--surface-hover)]/80 dark:hover:bg-[var(--surface-hover)]/60 transition"
            >
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-[var(--accent-primary)]" />
                <span className="text-sm text-[var(--text-primary)] dark:text-[var(--text-primary-dark)]">
                  Manage Profile
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </Link>

            {/* Admin */}
            {isAdmin && (
              <motion.button
                onClick={() => router.push("/admin")}
                whileTap={{ scale: 0.97 }}
                className="w-full flex items-center justify-between bg-[var(--accent-success)] text-white rounded-xl p-3 shadow-md hover:bg-[var(--accent-success-hover)] transition"
              >
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5" />
                  <span className="text-sm font-medium">Admin Dashboard</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-80" />
              </motion.button>
            )}

            {/* Manager */}
            {isManager && (
              <motion.button
                onClick={() => router.push("/manager")}
                whileTap={{ scale: 0.97 }}
                className="w-full flex items-center justify-between bg-[var(--accent-info)] text-white rounded-xl p-3 shadow-md hover:brightness-110 transition"
              >
                <div className="flex items-center gap-3">
                  <Briefcase className="w-5 h-5" />
                  <span className="text-sm font-medium">Manager Panel</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-80" />
              </motion.button>
            )}

            {/* Technician */}
            {isTechnician && (
              <motion.button
                onClick={() => router.push("/technician")}
                whileTap={{ scale: 0.97 }}
                className="w-full flex items-center justify-between bg-[var(--accent-warning)] text-white rounded-xl p-3 shadow-md hover:brightness-110 transition"
              >
                <div className="flex items-center gap-3">
                  <Hammer className="w-5 h-5" />
                  <span className="text-sm font-medium">Technician Tools</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-80" />
              </motion.button>
            )}

            <PWAInstallButton />
          </section>

          {/* Logout */}
          <motion.button
            onClick={handleLogout}
            whileTap={{ scale: 0.97 }}
            className="w-full flex items-center justify-center gap-2 mt-8 py-3 text-sm font-medium text-white rounded-xl shadow-md transition"
            style={{ background: "var(--accent-danger)" }}
          >
            <LogOut className="w-4 h-4" />
            Logout
          </motion.button>
        </>
      )}
    </div>
  );
}
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
