"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabaseClient";
import { useAuth } from "@/lib/useAuth";
import PWAInstallButton from "@/components/PWAInstallButton";
import {
  Briefcase,
  ChevronRight,
  Hammer,
  LogOut,
  Shield,
  User,
} from "lucide-react";

const ThemeToggle = dynamic(() => import("@/components/ThemeToggle"), {
  ssr: false,
});

export default function SettingsPage() {
  const { user, setUser, loading } = useAuth();
  const router = useRouter();

  // 🌿 Role states
  const [role, setRole] = useState("user");
  const [loadingRole, setLoadingRole] = useState(true);

  /* ------------------------------------------------------------
     🧠 Role Detection (User Metadata → DB Fallback)
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
          user.role ||
          user?.user_metadata?.role ||
          user?.app_metadata?.role;

        if (metaRole) {
          setRole(metaRole);
          return;
        }

        const { data, error } = await supabase
          .from("user_profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

        if (error) console.warn("[SETTINGS] Role fetch error:", error.message);

        setRole(data?.role || "user");
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
    await supabase.auth.signOut();
    localStorage.removeItem("user");
    setUser(null);
    router.push("/login" as any); // ✅ safely casted
  };

  // ✅ Derived flags
  const isAdmin = role === "admin";
  const isManager = role === "manager";
  const isTechnician = role === "technician";
  const isSupport = role === "support";

  /* ------------------------------------------------------------
     🧱 Page Layout
  ------------------------------------------------------------ */
  return (
    <div className="min-h-[100dvh] bg-gray-50 dark:bg-slate-900 pt-6 pb-28 px-4 md:pb-12">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100"
      >
        Settings
      </motion.h1>

      {!user ? (
        <Link
          href="/login"
          className="block text-center py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition"
        >
          Log in / Sign up
        </Link>
      ) : (
        <>
          {/* 🌿 User Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white/90 dark:bg-slate-800/80 backdrop-blur-lg rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-slate-700 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                <User className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="font-medium text-gray-800 dark:text-gray-100">
                  {user?.name || "Aesthetic Home"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.phone || "720009XXXX"}
                </p>
                {role !== "user" && (
                  <span className="inline-block mt-1 text-[10px] px-2 py-[2px] rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 uppercase">
                    {role}
                  </span>
                )}
              </div>
            </div>
            <ThemeToggle />
          </motion.div>

          {/* 🧭 Settings Actions */}
          <section className="mt-6 space-y-3">
            <Link
              href="/profile"
              className="flex items-center justify-between bg-white/90 dark:bg-slate-800/80 backdrop-blur-md border border-gray-200 dark:border-slate-700 rounded-xl p-3 hover:bg-emerald-50/60 dark:hover:bg-emerald-900/20 transition"
            >
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-gray-800 dark:text-gray-100">
                  Manage Profile
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </Link>

            {/* 🛡 Admin Dashboard */}
            {isAdmin && (
              <motion.button
                onClick={() => router.push("/admin" as any)} // ✅ corrected route
                whileTap={{ scale: 0.97 }}
                className="w-full flex items-center justify-between bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl p-3 shadow-md hover:from-emerald-700 hover:to-emerald-800 transition"
              >
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5" />
                  <span className="text-sm font-medium">Admin Dashboard</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-80" />
              </motion.button>
            )}

            {/* 🧰 Manager Panel */}
            {isManager && (
              <motion.button
                onClick={() => router.push("/manager" as any)} // ✅ type-safe fix
                whileTap={{ scale: 0.97 }}
                className="w-full flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl p-3 shadow-md hover:from-blue-700 hover:to-blue-800 transition"
              >
                <div className="flex items-center gap-3">
                  <Briefcase className="w-5 h-5" />
                  <span className="text-sm font-medium">Manager Panel</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-80" />
              </motion.button>
            )}

            {/* 🔧 Technician Tools */}
            {isTechnician && (
              <motion.button
                onClick={() => router.push("/technician" as any)}
                whileTap={{ scale: 0.97 }}
                className="w-full flex items-center justify-between bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl p-3 shadow-md hover:from-amber-700 hover:to-amber-800 transition"
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

          {/* 🚪 Logout */}
          <motion.button
            onClick={handleLogout}
            whileTap={{ scale: 0.97 }}
            className="w-full flex items-center justify-center gap-2 mt-8 py-3 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-xl shadow-md transition"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </motion.button>
        </>
      )}
    </div>
  );
}
