"use client";
/**
 * File: /components/InstallFAB.js
 * Purpose: Smart viewport-aware Install PWA FAB — visible only on Home, appears near bottom scroll,
 * hides when scrolling up, and disappears if app is installed.
 */

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, useAnimation } from "framer-motion";
import { Hammer } from "lucide-react";
import PWAPrompt from "@/components/PWAInstallButton";

export default function InstallFAB() {
  const pathname = usePathname();
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [visible, setVisible] = useState(false);
  const hammerControls = useAnimation();

  /* ------------------------------------------------------------
     🎯 Show only on Home Page
  ------------------------------------------------------------ */
  const isHome = pathname === "/";

  /* ------------------------------------------------------------
     ⚙️ Capture install prompt and installed event
  ------------------------------------------------------------ */
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      console.log("✅ HomeFix PWA installed");
      setIsInstalled(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    // Animate hammer loop
    const loop = setInterval(() => {
      hammerControls.start({
        rotate: [-10, -20, 0],
        transition: { duration: 0.4, ease: "easeOut" },
      });
    }, 5000);

    // Detect already installed app (for PWA/standalone mode)
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
      clearInterval(loop);
    };
  }, [hammerControls]);

  /* ------------------------------------------------------------
     📲 Install trigger
  ------------------------------------------------------------ */
  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      setShowPrompt(true);
      return;
    }
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      console.log("🎉 User accepted PWA install");
      setDeferredPrompt(null);
    } else {
      console.log("❌ User dismissed PWA install");
    }
  };

  /* ------------------------------------------------------------
     🎞️ Scroll listener → show FAB when near bottom
  ------------------------------------------------------------ */
  useEffect(() => {
    if (!isHome) return; // only active on homepage
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight;
      const winHeight = window.innerHeight;
      const distanceFromBottom = docHeight - (scrollY + winHeight);

      // Appear when user nears bottom (within 300px)
      if (distanceFromBottom < 300) setVisible(true);
      else setVisible(false);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHome]);

  /* ------------------------------------------------------------
     🚫 Hide conditions
  ------------------------------------------------------------ */
  if (!isHome || isInstalled) return null;

  /* ------------------------------------------------------------
     🧭 FAB render
  ------------------------------------------------------------ */
  return (
    <>
      <motion.button
        onClick={handleInstallClick}
        initial={{ opacity: 0, y: 50 }}
        animate={{
          opacity: visible ? 1 : 0,
          y: visible ? 0 : 50,
        }}
        transition={{ duration: 0.4, ease: "easeOut" }}
whileHover={{ scale: 1.1, boxShadow: "0 0 20px rgba(155,92,248,0.6)" }}
        whileTap={{ scale: 0.95 }}
        className="fixed right-6 z-fab bg-gradient-to-br from-[var(--accent-success)] to-[var(--accent-success-hover)]
                   text-white p-4 rounded-full shadow-lg cursor-pointer
                   flex items-center justify-center"
        style={{
          // ✅ floats clearly above footer / browser chrome
          bottom: "7rem",
        }}
        title="Install HomeFix App"
      >
        <motion.div animate={hammerControls}>
          <Hammer className="w-6 h-6" />
        </motion.div>
      </motion.button>

      {/* optional fallback modal */}
      {showPrompt && <PWAPrompt onClose={() => setShowPrompt(false)} />}
    </>
  );
}
