"use client";

/**
 * RootShell v1.1 — Hydration-Safe Wrapper 🌿
 * ------------------------------------------
 * ✅ No extra <body> tags or DOM mismatches
 * ✅ Keeps /admin separate from client routes
 * ✅ Prevents duplicate sidebar renders
 */

import { usePathname } from "next/navigation";
import SessionSync from "@/components/SessionSync";
import PWAPrompt from "@/components/PWAPrompt";
import { SidebarProvider } from "@/contexts/SidebarContext";
import LayoutContent from "@/components/LayoutContent";

export default function RootShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  return (
    <>
      {/* 🧠 Session bridge */}
      <SessionSync />

      {/* 🧭 Route-aware layout switch */}
      {isAdmin ? (
        // 🚀 Admin routes → bypass Gemini layout
        <>{children}</>
      ) : (
        // 🌈 Normal client layout → Sidebar + Header
        <SidebarProvider>
          <LayoutContent>{children}</LayoutContent>
        </SidebarProvider>
      )}

      {/* 📱 PWA install prompt */}
      <PWAPrompt />
    </>
  );
}
