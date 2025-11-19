"use client";

import { ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import BackgroundWaves from "@/components/chrome/BackgroundWaves";
import SafeViewport from "@/components/layout/SafeViewport";
import UniversalHeader from "@/components/chrome/UniversalHeader";
import AppSidebar from "@/components/chrome/AppSidebar";
import SessionSync from "@/components/SessionSync";
import { EdithToaster } from "@/components/ui/toaster";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { UserProvider } from "@/contexts/UserContext";

export default function RootShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isAdmin = pathname?.startsWith("/admin");
  const isAuth =
    pathname?.startsWith("/login") || pathname?.startsWith("/signup");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const skip = sessionStorage.getItem("skipProfileRedirect");

    if (skip) {
      sessionStorage.removeItem("skipProfileRedirect");
      if (pathname === "/profile") {
        router.replace("/my-orders");
      }
    }
  }, [pathname, router]);

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

        <div className="min-h-screen bg-[var(--surface-base)] text-[var(--text-primary)] relative">
          <BackgroundWaves />

          <div className="relative z-10 flex h-screen w-screen overflow-hidden">
            <AppSidebar />

            <div className="flex min-w-0 flex-1 flex-col">
              {!isAuth && <UniversalHeader />}

              <main className="flex-1 min-h-0 overflow-y-auto md:pl-[256px] pt-[72px]">
                <SafeViewport>{children}</SafeViewport>
              </main>
            </div>
          </div>
        </div>

        <div
          id="edith-toast-safe"
          className="fixed left-0 right-0 z-[120] flex justify-center bottom-6 pointer-events-none pb-4 px-3"
        >
          <div className="w-full max-w-sm">
            <EdithToaster />
          </div>
        </div>
      </UserProvider>
    </SidebarProvider>
  );
}
