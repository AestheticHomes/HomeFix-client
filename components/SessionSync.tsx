"use client";

import { useEffect } from "react";
import { clearUserCaches } from "@/lib/clearUserCaches";

/**
 * SessionSync v3 — Twilio session sync (no Supabase)
 * - Listens for logout marker/local events to force a clean redirect.
 */
const LOGOUT_MARKER = "edith_logout_marker";

export default function SessionSync() {
  useEffect(() => {
    function onSync(e: Event) {
      const customEvent = e as CustomEvent<string>;
      const detail = customEvent.detail || "";

      if (detail === "logged_out") {
        try {
          clearUserCaches();
        } catch {}
        globalThis.location?.assign("/login");
      }

      if (detail === "logged_in") {
        // No-op; login paths pull fresh profile from /api/profile
      }
    }

    function onStorage(event: StorageEvent) {
      if (event.key === LOGOUT_MARKER && event.newValue) {
        globalThis.location?.assign("/login");
      }
    }

    globalThis.addEventListener("hf:session-sync", onSync as EventListener);
    globalThis.addEventListener("storage", onStorage);

    return () => {
      globalThis.removeEventListener("hf:session-sync", onSync as EventListener);
      globalThis.removeEventListener("storage", onStorage);
    };
  }, []);

  return null; // 🚀 No UI, purely behavioral
}
