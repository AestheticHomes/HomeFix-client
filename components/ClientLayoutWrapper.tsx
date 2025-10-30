"use client";
/**
 * ClientLayoutWrapper v4.3 — SafeScreen Integration 🧩
 * ----------------------------------------------------
 * - Ensures content sits above mobile NavBar (flush dock)
 * - Hydration-safe mount logic
 * - Auto-hides wrapper on admin & auth routes
 * - Prevents layout shift on SSR hydration
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

  useEffect(() => {
    setMounted(true);
  }, []);

  // Avoid hydration mismatch
  if (!mounted) return null;

  // Exclude special routes from global layout wrappers
  const shouldHideLayout = pathname.startsWith("/profile") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/api");

  if (shouldHideLayout) return <>{children}</>;

  // ✅ Default Safe Screen Wrapper (applies to all user pages)
  return (
    <div className="min-h-full w-full overflow-visible">
      {children}
    </div>
  );
}
