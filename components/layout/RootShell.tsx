"use client";
import { LayoutContent, UniversalHeader } from "@/components/layout";
import SessionSync from "@/components/SessionSync";
import { EdithToaster } from "@/components/ui/toaster";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { UserProvider } from "@/contexts/UserContext";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RootShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isAdmin = pathname?.startsWith("/admin");
  const isAuth =
    pathname?.startsWith("/login") || pathname?.startsWith("/signup");

  /* ------------------------------------------------------------
     🚫 Post-checkout redirect safeguard
     Prevent /profile reroute immediately after payment success
  ------------------------------------------------------------ */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const skip = sessionStorage.getItem("skipProfileRedirect");

    if (skip) {
      console.log("🧭 [RootShell] skipProfileRedirect detected.");
      sessionStorage.removeItem("skipProfileRedirect");

      // If the user somehow gets pushed toward /profile,
      // bring them back to /my-orders immediately.
      if (pathname === "/profile") {
        console.warn("🔁 [RootShell] Canceling profile redirect → /my-orders");
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

        {!isAuth && <UniversalHeader />}

        <div
          id="root-safe-viewport"
          className="relative flex flex-col w-full min-h-[100dvh]
                     bg-[var(--surface-base)]
                     text-[var(--text-primary-light)] dark:text-[var(--text-primary-dark)]
                     transition-colors duration-500"
        >
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
