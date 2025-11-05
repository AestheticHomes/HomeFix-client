"use client";
/**
 * ClientRoot v2.8 — Gemini Stable 🌿
 * ------------------------------------------------------------
 * ✅ Removes duplicate Sidebar (handled by LayoutContent)
 * ✅ Keeps Providers, Auth Drawer, and Admin FAB intact
 * ✅ Stable for mobile + desktop unified shell
 */

import { useCallback, useEffect, useState } from "react";
import { ThemeProvider } from "next-themes";
import { UserProvider } from "@/contexts/UserContext";
import { CartProvider } from "@/components/CartContext";
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";
import SessionHydrator from "@/components/SessionHydrator";
import NavBar from "@/components/NavBar";
import AdminFAB from "@/components/AdminFAB";
import AuthCenterDrawer from "@/components/AuthCenterDrawer";
import { Loader2 } from "lucide-react";

export const openAuthDrawerEvent = new Event("openAuthDrawer");

export default function ClientRoot({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // 🧠 Session sync listener
  useEffect(() => {
    function onSessionSync(e: CustomEvent) {
      const state = e.detail;
      if (state === "logged_out") window.location.href = "/";
    }
    window.addEventListener("hf:session-sync", onSessionSync as EventListener);
    return () =>
      window.removeEventListener("hf:session-sync", onSessionSync as EventListener);
  }, []);

  // 🔓 Global "openAuthDrawer" event handler
  useEffect(() => {
    const handler = () => setDrawerOpen(true);
    window.addEventListener("openAuthDrawer", handler);
    return () => window.removeEventListener("openAuthDrawer", handler);
  }, []);

  useEffect(() => setMounted(true), []);
  const handleCloseDrawer = useCallback(() => setDrawerOpen(false), []);

  // ⏳ Fallback view before mount
  if (!mounted)
    return (
      <div className="flex flex-col items-center justify-center h-[100dvh] bg-gray-50 dark:bg-slate-900 text-gray-500">
        <Loader2 className="animate-spin w-5 h-5 mb-3" />
        Initializing session...
      </div>
    );

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <UserProvider>
        <CartProvider>
          <ClientLayoutWrapper>
            <SessionHydrator />
            <AdminFAB />

            {/* 🧭 Main Content (Sidebar handled by LayoutContent) */}
            <main
              id="app-content"
              className="relative flex-1 z-[30] overflow-y-auto scrollbar-thin 
                         pb-[var(--mbnav-h-safe)] md:pb-0
                         -webkit-overflow-scrolling-touch"
            >
              {children}
            </main>

            {/* 📱 Mobile Navigation Bar */}
            <footer
              id="hf-mobile-navbar"
              className="md:hidden fixed bottom-0 left-0 right-0 z-[60]
                         bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800
                         backdrop-blur supports-[backdrop-filter]:bg-white/70"
              style={{
                height: "var(--mbnav-h,72px)",
                paddingBottom: "env(safe-area-inset-bottom)",
              }}
            >
              <NavBar />
            </footer>

            {/* 🧩 Global Auth Drawer */}
            <div id="global-overlay" className="fixed inset-0 z-[70] pointer-events-none">
              <AuthCenterDrawer open={drawerOpen} onClose={handleCloseDrawer} />
            </div>
          </ClientLayoutWrapper>
        </CartProvider>
      </UserProvider>
    </ThemeProvider>
  );
}
