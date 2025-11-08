"use client";
/**
 * ClientLayoutWrapper v5.0 — SafeScreen + Route Optimized 🌿
 * ----------------------------------------------------------
 * ✅ Prevents hydration mismatch (SSR-safe)
 * ✅ Auto-hides wrapper on auth/admin pages
 * ✅ Includes new store, cart, and checkout routes
 * ✅ Works perfectly under ClientLayout (with NavBar + Header)
 * ✅ Integrates PWA SafeScreen layout for mobile
 */

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function ClientLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  // 🧠 Mount once to prevent hydration mismatch
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  // 🛡️ Routes where layout (NavBar, Header, etc.) should be hidden
  const excludedRoutes = [
    "/login",
    "/signup",
    "/profile",
    "/admin",
    "/api",
  ];

  const shouldHideLayout = excludedRoutes.some((r) =>
    pathname.startsWith(r)
  );

  if (shouldHideLayout) {
    return <>{children}</>;
  }

  // ✅ Default wrapper for public pages (store, home, services, cart, etc.)
  return (
    <div
      className="safe-screen relative flex flex-col min-h-screen w-full 
        overflow-x-hidden overflow-y-auto
        bg-gradient-to-br from-[#F8F7FF] via-[#F3F0FF] to-[#EAE8FF]
        dark:from-[#0D0B2B] dark:via-[#1B1545] dark:to-[#201A55]
        transition-colors duration-500"
    >
      {children}
    </div>
  );
}
