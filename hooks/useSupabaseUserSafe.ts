"use client";

import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

export interface SafeUser {
  id: string;
  email: string | null;
  phone: string | null;
  name: string | null;
  isGuest: boolean;
}

/**
 * useSupabaseUserSafe() — v3 (Jagadish Edition)
 * -------------------------------------------------------
 * ✔ Real Supabase session always wins
 * ✔ Hydrates from user_profiles table (correct source)
 * ✔ Never falls into guest while logged in
 * ✔ Restores last real user after HMR/refresh
 * ✔ Guest fallback ONLY if no session + no cache
 */
export function useSupabaseUserSafe(): SafeUser | null {
  const [safeUser, setSafeUser] = useState<SafeUser | null>(null);

  useEffect(() => {
    let ignore = false;

    async function load() {
      // 1️⃣ Fetch real authenticated session
      const { data: userData } = await supabase.auth.getUser();
      const sessionUser = userData?.user;

      if (sessionUser && !ignore) {
        const userId = sessionUser.id;

        // 🔥 Fetch actual profile from DB (important fix)
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("name, phone")
          .eq("id", userId)
          .maybeSingle();

        const normalized: SafeUser = {
          id: userId,
          email: sessionUser.email ?? null,
          phone: profile?.phone ?? null,
          name: profile?.name ?? null,
          isGuest: false,
        };

        // Store real user for refresh recovery
        localStorage.setItem("hf_last_user", JSON.stringify(normalized));
        setSafeUser(normalized);
        return;
      }

      // 2️⃣ Last known real user (prevents guest override)
      const cachedRaw = localStorage.getItem("hf_last_user");
      if (cachedRaw && !ignore) {
        try {
          const parsed = JSON.parse(cachedRaw);
          if (parsed?.id) {
            setSafeUser({ ...parsed, isGuest: false });
            return;
          }
        } catch {}
      }

      // 3️⃣ TRUE guest fallback
      const guestId =
        localStorage.getItem("hf_guest_id") || `guest-${crypto.randomUUID()}`;
      localStorage.setItem("hf_guest_id", guestId);

      if (!ignore) {
        setSafeUser({
          id: guestId,
          email: null,
          phone: null,
          name: "Guest",
          isGuest: true,
        });
      }
    }

    load();

    // 4️⃣ Auto-refresh on auth events
    const { data: listener } = supabase.auth.onAuthStateChange(() => load());

    return () => {
      ignore = true;
      listener.subscription.unsubscribe();
    };
  }, []);

  return safeUser;
}
