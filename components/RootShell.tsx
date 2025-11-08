"use client";

/**
 * RootShell v2.1 — Unified Client Shell 🌿
 * ----------------------------------------
 * ✅ Hydration-safe + clean context stack
 * ✅ UserProvider + SidebarProvider wrapping
 * ✅ UniversalHeader inside user scope only
 * ✅ Admin & Auth routes bypassed cleanly
 * ✅ EdithToaster global mount for all pages
 */

import { usePathname } from "next/navigation";
import SessionSync from "@/components/SessionSync";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { UserProvider } from "@/contexts/UserContext";
import { EdithToaster } from "@/components/ui/toaster";
import LayoutContent from "@/components/LayoutContent";
import UniversalHeader from "@/components/ui/UniversalHeader";

export default function RootShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  const isAuth = pathname?.startsWith("/login") || pathname?.startsWith("/signup");

  return (
    <>
      {/* 🔄 Supabase Session Bridge */}
      <SessionSync />

      {isAdmin ? (
        // 🚀 Admin routes → clean minimal layout
        <>{children}</>
      ) : (
        <SidebarProvider>
          <UserProvider>
            {/* 🧭 Skip header for auth screens */}
            {!isAuth && <UniversalHeader />}

            <LayoutContent>
              <main
                className="relative flex flex-col min-h-[calc(100vh-72px)]
                  pt-[72px] pb-safe-bottom w-full overflow-x-hidden z-0"
              >
                {children}
              </main>

              {/* 🔔 Toast Notifications */}
              <EdithToaster />
            </LayoutContent>
          </UserProvider>
        </SidebarProvider>
      )}
    </>
  );
}
