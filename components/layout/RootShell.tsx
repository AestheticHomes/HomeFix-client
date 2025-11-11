"use client";
/**
 * ============================================================
 * RootShell v3.8 — Gemini True SafeViewport Sync 🌗
 * ------------------------------------------------------------
 * ✅ One scroll zone (no nested scroll)
 * ✅ Header / MobileNav excluded cleanly
 * ✅ Sidebar + content sync with LayoutContent v11
 * ✅ Works with Safari 17+ & PWAs
 * ============================================================
 */

import { LayoutContent, UniversalHeader } from "@/components/layout";
import SessionSync from "@/components/SessionSync";
import { EdithToaster } from "@/components/ui/toaster";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { UserProvider } from "@/contexts/UserContext";
import { usePathname } from "next/navigation";

export default function RootShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  const isAuth =
    pathname?.startsWith("/login") || pathname?.startsWith("/signup");

  if (isAdmin) {
    return (
      <>
        <SessionSync />
        {children}
      </>
    );
  }

  return (
    <SidebarProvider>
      <UserProvider>
        <SessionSync />

        {/* 🔹 Header (fixed outside scroll) */}
        {!isAuth && <UniversalHeader />}

        {/* 🌗 Safe viewport root */}
        <div
          id="root-safe-viewport"
          className="relative flex flex-col w-full min-h-[100dvh]
                     bg-[var(--surface-light)] dark:bg-[var(--surface-dark)]
                     text-[var(--text-primary-light)] dark:text-[var(--text-primary-dark)]
                     transition-colors duration-500"
        >
          {/* 🧭 Single scroll container */}
          <main
            id="safe-scroll-zone"
            className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth"
            style={{
              paddingTop: "var(--header-h,72px)",
              paddingBottom:
                "calc(var(--mbnav-h,72px) + env(safe-area-inset-bottom))",
              WebkitOverflowScrolling: "touch",
            }}
          >
            <LayoutContent>{children}</LayoutContent>
          </main>

          {/* 🪶 Toasts (above navbar, safe area respected) */}
          <div
            id="edith-toast-safe"
            className="fixed left-0 right-0 z-[120] flex justify-center
                       bottom-[calc(var(--mbnav-h,72px)+env(safe-area-inset-bottom))]
                       pointer-events-none pb-4 px-3"
          >
            <div className="w-full max-w-sm">
              <EdithToaster />
            </div>
          </div>
        </div>
      </UserProvider>
    </SidebarProvider>
  );
}
