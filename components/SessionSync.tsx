 "use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { clearUserCaches } from "@/lib/clearUserCaches";

/**
 * SessionSync v2.3 — Safe Cross-Tab Sync 🌿
 * ------------------------------------------------------------
 * ✅ Handles login/logout sync across tabs + PWA
 * ✅ Works with Supabase + localStorage
 * ✅ Fully typed, avoids TS 2367
 * ✅ Proper event cleanup
 */
export default function SessionSync() {
  const router = useRouter();

  useEffect(() => {
    // Track user change via cookie → clear caches if switched
    try {
      const cookieUserId =
        document.cookie
          .split(";")
          .map((c) => c.trim())
          .find((c) => c.startsWith("hf_user_id="))
          ?.split("=")[1] || null;
      const lastKey = "hf-last-user-id";
      const last = localStorage.getItem(lastKey);
      if (cookieUserId && last && last !== cookieUserId) {
        clearUserCaches().finally(() => {
          try {
            localStorage.setItem(lastKey, cookieUserId);
          } catch {}
        });
      } else if (cookieUserId) {
        localStorage.setItem(lastKey, cookieUserId);
      }
    } catch {
      // ignore
    }

    // ✅ Explicit CustomEvent<string> typing
    function onSync(e: Event) {
      const customEvent = e as CustomEvent<string>;
      const detail = customEvent.detail || "";

      if (detail === "logged_out") {
        console.log("🚪 [SessionSync] Detected logout — refreshing state");
        try {
          clearUserCaches();
        } catch {}
        globalThis.location?.assign("/login");
      }

      if (detail === "logged_in") {
        console.log("🔐 [SessionSync] Detected login — syncing session");
        router.refresh(); // revalidate data
      }
    }

    // ✅ Storage event handler for multi-tab logout
    function onStorage(event: StorageEvent) {
      if (event.key === "hf_logged_out") {
        console.log("🚪 [SessionSync] Storage logout detected");
        globalThis.location?.assign("/login");
      }
    }

    // Attach listeners
    globalThis.addEventListener("hf:session-sync", onSync as EventListener);
    globalThis.addEventListener("storage", onStorage);

    // Cleanup listeners on unmount
    return () => {
      globalThis.removeEventListener("hf:session-sync", onSync as EventListener);
      globalThis.removeEventListener("storage", onStorage);
    };
  }, [router]);

  return null; // 🚀 No UI, purely behavioral
}
