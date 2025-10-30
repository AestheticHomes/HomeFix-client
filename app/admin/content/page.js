"use client";
/**
 * File: /app/admin/content/page.js
 * Version: v3.9 — CMS Manager Wrapper 🌿
 * ---------------------------------------
 * ✅ Uses global role guard (admin-only)
 * ✅ Consistent with Admin Dashboard layout
 * ✅ Dark-mode safe + unified loader state
 */

import { Loader2 } from "lucide-react";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import GoodsManager from "./GoodsManager";

export default function ContentManager() {
  const { authorized, loading } = useRoleGuard(["admin"]);

  if (loading)
    return (
      <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-slate-900 text-gray-500">
        <Loader2 className="animate-spin mb-3" size={36} />
        <p className="text-sm font-medium">Verifying your admin access...</p>
      </main>
    );

  if (!authorized)
    return (
      <main className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-slate-900 text-red-500">
        Access denied — redirecting...
      </main>
    );

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-slate-900 p-6">
      <h1 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white">
        Content Management System
      </h1>
      <GoodsManager />
    </main>
  );
}
