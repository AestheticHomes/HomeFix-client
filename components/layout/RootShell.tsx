/** RootShell: canonical app shell with scrollable SafeViewport and docked nav as sibling. */
"use client";

import AppSidebar from "@/components/chrome/AppSidebar";
import UniversalHeader from "@/components/chrome/UniversalHeader";
import GlobalParticleField from "@/components/chrome/GlobalParticleField";
import { useProductCartStore, useServiceCartStore } from "@/components/store/cartStore";
import NavBar from "@/components/layout/NavBar";
import SafeViewport from "@/components/layout/SafeViewport";
import SessionSync from "@/components/SessionSync";
import Footer from "@/components/ui/Footer";
import { EdithToaster } from "@/components/ui/toaster";
import { SidebarProvider, useSidebar } from "@/contexts/SidebarContext";
import { UserProvider } from "@/contexts/UserContext";
import { useCatalogWithCache } from "@/hooks/useCatalogWithCache";
import { useOrdersWithCache } from "@/hooks/useOrdersWithCache";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

function RootShellInner({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { collapsed } = useSidebar();

  const [isDesktop, setIsDesktop] = useState(false);

  const isAdmin = pathname?.startsWith("/admin");
  const isAuth =
    pathname?.startsWith("/login") || pathname?.startsWith("/signup") || pathname?.startsWith("/auth");

  const headerPadding = isAuth ? "0px" : "var(--hf-header-height,72px)";
  const toastOffset = isAuth ? "24px" : "calc(var(--mbnav-h,72px) + 24px)";

  // Simple breakpoint watcher so we only pad on desktop
  useEffect(() => {
    const handleResize = () => {
      if (typeof window === "undefined") return;
      setIsDesktop(window.innerWidth >= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Profile redirect guard
  useEffect(() => {
    if (typeof window === "undefined") return;
    const skip = sessionStorage.getItem("skipProfileRedirect");

    if (skip) {
      sessionStorage.removeItem("skipProfileRedirect");
      if (pathname === "/profile") {
        router.replace("/my-bookings");
      }
    }
  }, [pathname, router]);

  // Scroll audit (dev-only)
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    const offenders: string[] = [];
    let el: HTMLElement | null = document.querySelector("#__next");
    while (el) {
      const cs = window.getComputedStyle(el);
      if (
        /(auto|scroll|hidden)/.test(cs.overflowY) &&
        el !== document.body &&
        el !== document.documentElement
      ) {
        offenders.push(
          `overflowY=${cs.overflowY} on ${el.id || el.className || el.tagName}`
        );
      }
      if (
        cs.transform !== "none" ||
        cs.filter !== "none" ||
        cs.perspective !== "none" ||
        cs.backdropFilter !== "none"
      ) {
        offenders.push(
          `transform/filter ancestor on ${el.id || el.className || el.tagName}`
        );
      }
      el = el.parentElement;
    }
    if (offenders.length) {
      // eslint-disable-next-line no-console
      console.warn(
        "[Scroll Audit] Potential offenders:\n" + offenders.join("\n")
      );
    }
  }, []);

  if (isAdmin) {
    return (
      <>
        <BackgroundBootstrap />
        <SessionSync />
        {children}
      </>
    );
  }

  // Dynamic left padding:
  // - mobile: 0 (sidebar overlays)
  // - desktop: 80px when collapsed, 256px when expanded
  const sidebarPaddingLeft =
    !isAuth && isDesktop ? `${collapsed ? 80 : 256}px` : "0px";

  return (
    <UserProvider>
      <BackgroundBootstrap />
      <SessionSync />

      {!isAuth && <UniversalHeader />}

      <div className="relative z-0 bg-[var(--surface-base)] text-[var(--text-primary)] min-h-screen flex flex-col">
        <GlobalParticleField />
        <AppSidebar />

        {/* MAIN scrollable content; SafeViewport manages the padding for the dock */}
        <main
          id="app-scroll-region"
          className="relative flex-1 min-h-0 flex flex-col"
          style={{
            paddingTop: headerPadding,
            paddingLeft: sidebarPaddingLeft,
            scrollbarGutter: "stable",
          }}
        >
          <SafeViewport>
            {children}
            {!isAuth && (
              <div className="mt-6">
                <Footer />
              </div>
            )}
          </SafeViewport>
        </main>
      </div>

      {!isAuth && <NavBar />}

      <div
        id="edith-toast-safe"
        className="fixed left-0 right-0 z-[120] flex justify-center pointer-events-none pb-4 px-3"
        style={{ bottom: toastOffset }}
      >
        <div className="w-full max-w-sm">
          <EdithToaster />
        </div>
      </div>
    </UserProvider>
  );
}

export default function RootShell({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <RootShellInner>{children}</RootShellInner>
    </SidebarProvider>
  );
}

function BackgroundBootstrap() {
  useCatalogWithCache();
  useOrdersWithCache();

  useEffect(() => {
    // Touch persisted cart stores so hydration runs immediately.
    useProductCartStore.getState().items;
    useServiceCartStore.getState().items;
  }, []);

  return null;
}
