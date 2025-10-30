"use client";
/**
 * UserContext v5.5 — Unified Session Authority 🌿
 * ------------------------------------------------------------
 * ✅ Prevents stale hydration after logout (LOGOUT_MARKER)
 * ✅ Uses global runtime flag (__HF_AUTH_STATE__) for sync
 * ✅ Broadcasts `hf:session-sync` events across tabs/pages
 * ✅ Ensures all components (Settings, Bookings, etc.)
 *    react instantly to login/logout transitions
 */

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { supabase } from "@/lib/supabaseClient";

// ------------------------------------------------------------
// 🌿 Global Window Type Extension (for runtime auth sync flag)
// ------------------------------------------------------------
declare global {
  interface Window {
    __HF_AUTH_STATE__?: "logged_in" | "logged_out";
  }
}

/* ------------------------------------------------------------
   🧩 Interfaces
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
  setUser: (u: HomeFixUser | null) => void;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
  login: (u: HomeFixUser, remember?: boolean) => void;
  isLoaded: boolean;
  isLoggedIn: boolean;
}

/* ------------------------------------------------------------
   🧱 Constants
------------------------------------------------------------ */
const STORAGE_KEY = "user";
const LOGOUT_MARKER = "hf_logged_out";
const UserContext = createContext<UserContextType | undefined>(undefined);

/* ------------------------------------------------------------
   🧩 Helpers
------------------------------------------------------------ */
function parseCookies(): Record<string, string> {
  try {
    return Object.fromEntries(
      (document.cookie || "")
        .split("; ")
        .filter(Boolean)
        .map((c) => {
          const i = c.indexOf("=");
          return [c.substring(0, i), decodeURIComponent(c.substring(i + 1))];
        }),
    );
  } catch {
    return {};
  }
}

/* ------------------------------------------------------------
   🌿 Provider
------------------------------------------------------------ */
export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<HomeFixUser | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  /* 🧠 Load user from storage if valid */
  const loadUserFromStorage = useCallback((): HomeFixUser | null => {
    if (typeof window === "undefined") return null;
    if (localStorage.getItem(LOGOUT_MARKER)) return null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY) ||
        sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed?.loggedIn ? parsed : null;
    } catch {
      return null;
    }
  }, []);

  /* 🌿 Hydration */
  useEffect(() => {
    let timeoutHandle: any;
    (async () => {
      if (localStorage.getItem(LOGOUT_MARKER)) {
        console.log("🚫 [UserContext] hydration blocked (logout marker)");
        setIsLoaded(true);
        return;
      }

      const stored = loadUserFromStorage();
      if (stored?.loggedIn) setUser(stored);

      // Try cookies fallback
      const cookies = parseCookies();
      if (
        !stored && cookies.hf_user_id && cookies.hf_user_verified === "true"
      ) {
        const cookieUser: HomeFixUser = {
          id: cookies.hf_user_id,
          phone: cookies.hf_user_phone,
          email: cookies.hf_user_email,
          email_verified: cookies.hf_user_verified === "true",
          loggedIn: true,
        };
        setUser(cookieUser);
      }

      // Supabase async session race-safe check
      const timeout = new Promise<null>(
        (resolve) => (timeoutHandle = setTimeout(() => resolve(null), 1200)),
      );
      const getSession = supabase.auth
        .getSession()
        .then(({ data }) => (data?.session?.user as any) ?? null)
        .catch(() => null);

      const sessionUser = await Promise.race([getSession, timeout]);
      if (sessionUser && !localStorage.getItem(LOGOUT_MARKER)) {
        const supaUser: HomeFixUser = {
          id: sessionUser.id,
          email: sessionUser.email,
          phone: (sessionUser as any).phone,
          email_verified: !!(sessionUser as any).email_confirmed_at,
          loggedIn: true,
        };
        setUser((prev) => prev || supaUser);
      }

      setIsLoaded(true);
      console.log("🌿 [UserContext] hydrated");
    })();

    return () => clearTimeout(timeoutHandle);
  }, [loadUserFromStorage]);

  /* 🚪 logout — writes marker & broadcasts event */
  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch {}

    localStorage.setItem(LOGOUT_MARKER, "1");
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
    setUser(null);

    // Clear cookies
    document.cookie = "hf_user_id=; Path=/; Max-Age=0; SameSite=Lax; " +
      "hf_user_phone=; Path=/; Max-Age=0; SameSite=Lax; " +
      "hf_user_email=; Path=/; Max-Age=0; SameSite=Lax; " +
      "hf_user_verified=; Path=/; Max-Age=0; SameSite=Lax;";

    // 🔔 Global runtime flag + event broadcast
    window.__HF_AUTH_STATE__ = "logged_out";
    window.dispatchEvent(
      new CustomEvent("hf:session-sync", { detail: "logged_out" }),
    );
    window.dispatchEvent(new Event("storage"));
  }, []);

  /* 🔐 login — clears marker & broadcasts event */
  const login = useCallback((u: HomeFixUser, remember = true) => {
    localStorage.removeItem(LOGOUT_MARKER);
    const payload = { ...u, loggedIn: true };

    try {
      (remember ? localStorage : sessionStorage).setItem(
        STORAGE_KEY,
        JSON.stringify(payload),
      );
      setUser(payload);

      // 🔔 Global runtime flag + event broadcast
      window.__HF_AUTH_STATE__ = "logged_in";
      window.dispatchEvent(
        new CustomEvent("hf:session-sync", { detail: "logged_in" }),
      );
    } catch (err) {
      console.error("[UserContext] login failed:", err);
    }
  }, []);

  /* ♻️ optional refresh */
  const refreshUser = useCallback(async () => {
    if (localStorage.getItem(LOGOUT_MARKER)) return;
    const { data } = await supabase.auth.getUser().catch(() => ({
      data: undefined,
    }));
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

  // ✅ Derived reactive flag for consistent page sync
  const isLoggedIn = !!user?.loggedIn;

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        refreshUser,
        logout,
        login,
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
  if (!ctx) throw new Error("useUser() must be used inside <UserProvider />");
  return ctx;
}
