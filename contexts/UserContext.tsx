"use client";
/**
 * ============================================================
 * UserContext v7.0 — Edith Continuum “Persistent Authority” 🌗
 * ------------------------------------------------------------
 * ✅ No flicker, no rehydration loops
 * ✅ True persistence (only resets on logout)
 * ✅ Instant revalidation on login / logout
 * ✅ Cross-tab sync via BroadcastChannel + CustomEvent
 * ✅ Offline tolerant (uses local cache if Supabase unreachable)
 * ============================================================
 */

import { supabase } from "@/lib/supabaseClient";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

/* ------------------------------------------------------------
   🔖 Types
------------------------------------------------------------ */
export interface HomeFixUser {
  id?: string;
  name?: string;
  phone?: string;
  email?: string;
  email_verified?: boolean;
  phone_verified?: boolean;
  role?: string;
  loggedIn?: boolean;
  [key: string]: any;
}

interface UserContextType {
  user: HomeFixUser | null;
  isLoaded: boolean;
  isLoggedIn: boolean;
  login: (u: HomeFixUser, remember?: boolean) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (u: HomeFixUser | null) => void;
}

/* ------------------------------------------------------------
   ⚙️ Constants
------------------------------------------------------------ */
const STORAGE_KEY = "user";
const LOGOUT_MARKER = "hf_logged_out";
const UserContext = createContext<UserContextType | undefined>(undefined);

/* ------------------------------------------------------------
   🧠 Helpers
------------------------------------------------------------ */
function readLocalUser(): HomeFixUser | null {
  try {
    if (localStorage.getItem(LOGOUT_MARKER)) return null;
    const raw =
      localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.loggedIn ? parsed : null;
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------
   🌍 Broadcast + Event Sync
------------------------------------------------------------ */
const channel =
  typeof window !== "undefined" ? new BroadcastChannel("hf_auth") : null;

/* ------------------------------------------------------------
   🌿 Provider
------------------------------------------------------------ */
export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<HomeFixUser | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  /* ------------------------------------------------------------
     🔄 Startup Hydration (Local-first)
  ------------------------------------------------------------ */
  useEffect(() => {
    (async () => {
      const cached = readLocalUser();
      if (cached) {
        setUser(cached);
        setIsLoaded(true);
        console.log("🌱 [UserContext] Restored from cache:", cached.email);
        return;
      }

      // fallback to Supabase session (only if online)
      try {
        const { data } = await supabase.auth.getSession();
        const u = data?.session?.user;
        if (u) {
          const supaUser: HomeFixUser = {
            id: u.id,
            email: u.email,
            phone: (u as any).phone,
            email_verified: !!(u as any).email_confirmed_at,
            loggedIn: true,
          };
          setUser(supaUser);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(supaUser));
          console.log("🔁 [UserContext] Restored from Supabase session");
        }
      } catch {
        console.warn("⚠️ Offline mode — using cached session");
      }

      setIsLoaded(true);
    })();
  }, []);

  /* ------------------------------------------------------------
     🛰️ Supabase Realtime Listener
  ------------------------------------------------------------ */
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_OUT") {
          await handleLogout();
        }
        if (event === "SIGNED_IN" && session?.user) {
          const u = session.user;
          const supaUser: HomeFixUser = {
            id: u.id,
            email: u.email,
            phone: (u as any).phone,
            email_verified: !!(u as any).email_confirmed_at,
            loggedIn: true,
          };
          handleLogin(supaUser);
        }
      }
    );
    return () => sub?.subscription.unsubscribe();
  }, []);

  /* ------------------------------------------------------------
     🔄 Cross-tab sync via BroadcastChannel + Event
  ------------------------------------------------------------ */
  useEffect(() => {
    if (!channel) return;
    channel.onmessage = (ev) => {
      if (ev.data === "logout") handleLogout();
      if (ev.data.type === "login") handleLogin(ev.data.user);
    };
    window.addEventListener("hf:session-sync", (e: any) => {
      if (e.detail === "logged_out") handleLogout();
      if (e.detail === "logged_in") {
        const cached = readLocalUser();
        if (cached) setUser(cached);
      }
    });
    return () => {
      window.removeEventListener("hf:session-sync", () => {});
      channel.close();
    };
  }, []);

  /* ------------------------------------------------------------
     🔐 Login — Edith Secure Mode
  ------------------------------------------------------------ */
  const handleLogin = useCallback((u: HomeFixUser, remember = true) => {
    try {
      localStorage.removeItem(LOGOUT_MARKER);
      const payload = { ...u, loggedIn: true };
      (remember ? localStorage : sessionStorage).setItem(
        STORAGE_KEY,
        JSON.stringify(payload)
      );
      setUser(payload);

      channel?.postMessage({ type: "login", user: payload });
      window.dispatchEvent(
        new CustomEvent("hf:session-sync", { detail: "logged_in" })
      );

      console.log("✅ [UserContext] Login persisted:", payload.email);
    } catch (err) {
      console.error("🔥 [UserContext] Login failed:", err);
    }
  }, []);

  /* ------------------------------------------------------------
     🚪 Logout — Edith Secure v4.0
  ------------------------------------------------------------ */
  const handleLogout = useCallback(async () => {
    console.log("🚪 [UserContext] Logging out...");
    try {
      const lastPhone =
        user?.phone ||
        JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}")?.phone ||
        "";

      await supabase.auth.signOut().catch(() => {});

      localStorage.setItem(LOGOUT_MARKER, "1");
      localStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(STORAGE_KEY);
      if (lastPhone) localStorage.setItem("hf_last_phone", lastPhone);

      setUser(null);
      channel?.postMessage("logout");
      window.dispatchEvent(
        new CustomEvent("hf:session-sync", { detail: "logged_out" })
      );

      console.log("✅ [UserContext] Fully logged out.");
    } catch (err) {
      console.error("🔥 [UserContext] Logout failed:", err);
    }
  }, [user]);

  /* ------------------------------------------------------------
     🔁 Manual refresh (on-demand)
  ------------------------------------------------------------ */
  const refreshUser = useCallback(async () => {
    try {
      const { data } = await supabase.auth.getUser();
      const u = data?.user;
      if (u) {
        const refreshed: HomeFixUser = {
          id: u.id,
          email: u.email,
          phone: (u as any).phone,
          email_verified: !!(u as any).email_confirmed_at,
          loggedIn: true,
        };
        setUser(refreshed);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(refreshed));
        console.log("🔄 [UserContext] User refreshed.");
      }
    } catch {
      console.warn("⚠️ Could not refresh user (offline?)");
    }
  }, []);

  const isLoggedIn = !!user?.loggedIn;

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        refreshUser,
        logout: handleLogout,
        login: handleLogin,
        isLoaded,
        isLoggedIn,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

/* ------------------------------------------------------------
   🪶 Hook
------------------------------------------------------------ */
export function useUser(): UserContextType {
  const ctx = useContext(UserContext);
  if (!ctx)
    return {
      user: null,
      setUser: () => {},
      refreshUser: async () => {},
      logout: async () => {},
      login: () => {},
      isLoaded: false,
      isLoggedIn: false,
    };
  return ctx;
}
