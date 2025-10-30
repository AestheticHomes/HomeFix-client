"use client";
/**
 * File: /components/ClientLayout.js
 * Purpose: (auto-added during Portable Cleanup) — add a concise, human-readable purpose for this file.
 * Process: Part of HomeFix portable refactor; no functional changes made by header.
 * Dependencies: Review local imports; ensure single supabase client in /lib when applicable.
 * Note: This header is documentation-only and safe to remove or edit.
 */

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/NavBar.";
import { CartProvider } from "@/components/CartContext";
import { ThemeProvider } from "next-themes";
import Script from "next/script";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import PWAPrompt from "@/components/PWAInstallButton";

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  // ✅ Capture the install prompt event
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  return (
    <>
      {/* ✅ Google Maps API */}
      <Script
        id="google-maps"
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        strategy="afterInteractive"
        async
        defer
      />

      {/* ✅ Service Worker registration */}
      <Script id="service-worker-register" strategy="afterInteractive">
        {`
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
              navigator.serviceWorker
                .register('/sw.js')
                .then(reg => console.log('✅ Service Worker registered:', reg))
                .catch(err => console.log('❌ Service Worker registration failed:', err));
            });
          }
        `}
      </Script>

      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <CartProvider>
          <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-500">
            {/* ✅ Sidebar (Desktop only) */}
            <aside className="hidden md:block w-64 bg-white dark:bg-slate-800 border-r dark:border-slate-700 shadow-sm relative z-40">
              <Sidebar />
            </aside>

            {/* ✅ Main Content */}
            <div className="flex-1 flex flex-col relative overflow-x-hidden">
              <AnimatePresence mode="wait">
<motion.main
  key={pathname}
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -15 }}
  transition={{ duration: 0.35, ease: "easeOut" }}
  className="flex-1 p-4 md:p-6 pb-24 relative z-10"  // 👈 Added pb-24
>
  {children}
</motion.main>

              </AnimatePresence>

              {/* ✅ Mobile Bottom Navigation */}
              <footer className="md:hidden fixed bottom-0 left-0 right-0 z-50 backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 border-t dark:border-slate-700">
                <motion.div
                  initial={{ y: 80 }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <BottomNav />
                </motion.div>
              </footer>

              {/* ✅ PWA Install Prompt */}
              {showInstallBanner && (
                <PWAPrompt
                  deferredPrompt={deferredPrompt}
                  onClose={() => setShowInstallBanner(false)}
                />
              )}
            </div>
          </div>
        </CartProvider>
      </ThemeProvider>
    </>
  );
}