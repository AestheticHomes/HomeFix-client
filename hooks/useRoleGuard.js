"use client";
/**
 * useRoleGuard v3.7 🌿
 * ------------------------------------------
 * ✅ Combines role + guard logic
 * ✅ Reads from metadata or user_profiles
 * ✅ Supports admin, manager, technician, support, user
 * ✅ Works for both route-guard + UI checks
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabaseClient";
import { useAuth } from "@/lib/useAuth";

export function useRoleGuard({
  roles = [],
  enforce = false,
  redirectTo = "/unauthorized",
  fallbackTo = "/login",
} = {}) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [role, setRole] = useState("guest");
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    const resolveRole = async () => {
      try {
        if (!user) {
          setRole("guest");
          setAuthorized(false);
          if (enforce) router.replace(fallbackTo);
          setLoading(false);
          return;
        }

        // Step 1: metadata read
        const metaRole = user.role || user?.user_metadata?.role ||
          user?.app_metadata?.role;

        if (metaRole) {
          const access = roles.length ? roles.includes(metaRole) : true;
          setRole(metaRole);
          setAuthorized(access);
          if (enforce && !access) router.replace(redirectTo);
          setLoading(false);
          return;
        }

        // Step 2: DB lookup
        const { data, error } = await supabase
          .from("user_profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

        if (error) console.warn("[useRoleGuard] role fetch:", error.message);

        const dbRole = data?.role || "user";
        const access = roles.length ? roles.includes(dbRole) : true;

        setRole(dbRole);
        setAuthorized(access);
        if (enforce && !access) router.replace(redirectTo);
      } catch (err) {
        console.error("[useRoleGuard] Error:", err);
        setRole("guest");
        setAuthorized(false);
        if (enforce) router.replace(redirectTo);
      } finally {
        setLoading(false);
      }
    };

    resolveRole();
  }, [user, authLoading, roles, enforce, redirectTo, router, fallbackTo]);

  return {
    role,
    authorized,
    loading,
    isAdmin: role === "admin",
    isManager: role === "manager",
    isTechnician: role === "technician",
    isSupport: role === "support",
    isUser: role === "user",
    isGuest: role === "guest",
  };
}
