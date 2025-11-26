"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useUserProfile } from "@/hooks/useUserProfile";

type Role = "user" | "admin" | "sadmin";

type RoleGuardOptions = {
  requiredRole?: Role;
  redirectTo?: string;
};

/**
 * Role-based guard using /api/profile as source of truth.
 * - Uses useUserProfile (SWR) for user + role.
 * - Redirects unauthenticated or insufficient-role users.
 */
export function useRoleGuard(options: RoleGuardOptions = {}) {
  const { requiredRole = "user", redirectTo = "/login" } = options;
  const router = useRouter();
  const { profile, isLoading, error } = useUserProfile();

  useEffect(() => {
    if (isLoading) return;

    if (error || !profile) {
      router.replace(redirectTo);
      return;
    }

    const role: Role = (profile.role as Role) ?? "user";

    const ok =
      requiredRole === "user" ? !!profile.id : role === requiredRole;

    if (!ok) {
      router.replace(redirectTo);
    }
  }, [isLoading, error, profile, requiredRole, redirectTo, router]);

  return { profile, isLoading };
}
