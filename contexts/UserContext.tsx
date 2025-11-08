"use client";
/**
 * UserContext v6.0 — Quantum Session Authority ⚡
 * ------------------------------------------------------------
 * ✅ Instant Supabase auth sync (via onAuthStateChange)
 * ✅ Fixes stale session hydration (Edge-safe)
 * ✅ Restores user automatically on refresh or tab reopen
 * ✅ Broadcasts `hf:session-sync` events across tabs
 * ✅ Supports both localStorage & sessionStorage (remember toggle)
 * ✅ Compatible with Supabase v2 Auth helpers
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { supabase } from "@/lib/supabaseClient";

/* ------------------------------------------------------------
   🌍 Global Window Flag (runtime sync between tabs)
------------------------------------------------------------ */
declare global {
  interface Window {
    __HF_AUTH_STATE__?: "logged_in" | "logged_out";
  }
}

/* ------------------------------------------------------------
   🧩 Types
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
function readStorage(): HomeFixUser | null {
  try {
    if (localStorage.getItem(LOGOUT_MARKER)) return null;
    const raw = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.loggedIn ? parsed : null;
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------
   🌿 Provider
------------------------------------------------------------ */
export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<HomeFixUser | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  /* ------------------------------------------------------------
     🔄 Restore user from storage or Supabase session
  ------------------------------------------------------------ */
  useEffect(() => {
    (async () => {
      const stored = readStorage();
      if (stored) {
        setUser(stored);
        setIsLoaded(true);
      }

      // Try Supabase session restore (Edge-safe)
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user) {
        const u = data.session.user;
        const supaUser: HomeFixUser = {
          id: u.id,
          email: u.email,
          phone: (u as any).phone,
          email_verified: !!(u as any).email_confirmed_at,
          loggedIn: true,
        };
        setUser((prev) => prev || supaUser);
      }

      setIsLoaded(true);
      console.log("🌱 [UserContext] Session hydrated.");
    })();
  }, []);

  /* ------------------------------------------------------------
     🧭 Supabase auth listener (real-time sync)
  ------------------------------------------------------------ */
  useEffect(() => {
    const {
      data: listener,
    } = supabase.auth.onAuthStateChange(async (event, session) => {
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
    });
    return () => listener?.subscription.unsubscribe();
  }, []);

  /* ------------------------------------------------------------
     🔐 Login
  ------------------------------------------------------------ */
  const handleLogin = useCallback((u: HomeFixUser, remember = true) => {
    localStorage.removeItem(LOGOUT_MARKER);
    const payload = { ...u, loggedIn: true };

    try {
      (remember ? localStorage : sessionStorage).setItem(STORAGE_KEY, JSON.stringify(payload));
      setUser(payload);

      window.__HF_AUTH_STATE__ = "logged_in";
      window.dispatchEvent(new CustomEvent("hf:session-sync", { detail: "logged_in" }));
      console.log("✅ [UserContext] Logged in:", payload);
    } catch (err) {
      console.error("[UserContext] login failed:", err);
    }
  }, []);

/* ------------------------------------------------------------
   🚪 Logout — Edith Secure v3.8
   ------------------------------------------------------------
   ✅ Signs out from Supabase
   ✅ Clears localStorage / sessionStorage safely
   ✅ Retains last phone for re-login autofill
   ✅ Broadcasts logout across tabs
   ✅ Logs events for debugging
------------------------------------------------------------ */
const handleLogout = useCallback(async () => {
  console.log("🚪 [UserContext] Logout initiated...");

  try {
    // 🔐 Step 1 — Supabase session sign-out
    const { error } = await supabase.auth.signOut();
    if (error) console.warn("⚠️ Supabase signOut error:", error);

    // 🧹 Step 2 — Preserve optional data (e.g., phone)
    const lastPhone =
      user?.phone ||
      JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}")?.phone ||
      "";

    // 🧼 Step 3 — Clear all storage
    localStorage.setItem(LOGOUT_MARKER, "1");
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);

    // Optional: keep last used phone for login autofill
    if (lastPhone) {
      localStorage.setItem("hf_last_phone", lastPhone);
      console.log("📱 [UserContext] Cached last phone:", lastPhone);
    }

    // 🚨 Step 4 — Reset runtime state
    setUser(null);
    window.__HF_AUTH_STATE__ = "logged_out";

    // 🛰️ Step 5 — Notify all tabs
    window.dispatchEvent(
      new CustomEvent("hf:session-sync", { detail: "logged_out" })
    );

    console.log("✅ [UserContext] Fully logged out.");
  } catch (err) {
    console.error("🔥 [UserContext] Logout failed:", err);
  }
}, [user]);

  /* ------------------------------------------------------------
     🔁 Manual Refresh
  ------------------------------------------------------------ */
  const refreshUser = useCallback(async () => {
    const { data } = await supabase.auth.getUser().catch(() => ({ data: undefined }));
    if (data?.user) {
      const u: HomeFixUser = {
        id: data.user.id,
        email: data.user.email,
        phone: (data.user as any).phone,
        email_verified: !!(data.user as any).email_confirmed_at,
        loggedIn: true,
      };
      setUser(u);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
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
  if (!ctx) {
    // Safe fallback for SSR or outside Provider
    return {
      user: null,
      setUser: () => {},
      refreshUser: async () => {},
      logout: async () => {},
      login: () => {},
      isLoaded: false,
      isLoggedIn: false,
    };
  }
  return ctx;
}

