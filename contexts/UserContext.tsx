"use client";

/**
 * UserContext v10 — Modern Profile-Hydrated Auth Core
 * - Supabase session wins
 * - Profile hydration from user_profiles
 * - Single hydration path (no early returns)
 * - Cross-tab sync (BroadcastChannel + CustomEvent)
 * - isLoaded resolves exactly once
 *
 * Usage: wrap app with <UserProvider> and call useUser()
 */

import { supabase } from "@/lib/supabaseClient";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const DEBUG = process.env.NEXT_PUBLIC_DEBUG_USERCONTEXT === "true" || false;

/* -------------------------
   Types
   ------------------------- */
export interface HomeFixUser {
  id?: string; // optional to stay compatible with legacy call-sites; most flows will set it
  email?: string | null;
  phone?: string | null;
  name?: string | null;
  role?: string | null;
  loggedIn?: boolean;
  email_verified?: boolean;
  phone_verified?: boolean;
  [key: string]: any;
}

interface UserContextType {
  user: HomeFixUser | null;
  isLoaded: boolean;
  isLoggedIn: boolean;
  login: (u: Partial<HomeFixUser>, remember?: boolean) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (u: HomeFixUser | null) => void;
}

/* -------------------------
   Constants & channel
   ------------------------- */
const STORAGE_KEY = "user";
const LOGOUT_MARKER = "hf_logged_out";
const channel =
  typeof window !== "undefined" && "BroadcastChannel" in window
    ? new BroadcastChannel("hf_auth")
    : null;

const UserContext = createContext<UserContextType | undefined>(undefined);

/* -------------------------
   Helpers
   ------------------------- */
function safeParse(raw: string | null) {
  try {
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function readCache(): HomeFixUser | null {
  try {
    if (typeof window === "undefined") return null;
    if (localStorage.getItem(LOGOUT_MARKER)) return null;
    const raw =
      localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
    const parsed = safeParse(raw) as HomeFixUser | null;
    if (!parsed) return null;
    const looksLoggedIn =
      !!parsed.id ||
      !!parsed.loggedIn ||
      !!parsed.phone_verified ||
      !!parsed.email_verified;
    if (!looksLoggedIn) return null;
    return { ...parsed, loggedIn: true };
  } catch (err) {
    if (DEBUG) console.warn("[UserContext] readCache failed", err);
    return null;
  }
}

function persistCache(user: HomeFixUser | null, remember = true) {
  try {
    if (typeof window === "undefined") return;
    if (!user) {
      localStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(STORAGE_KEY);
      return;
    }
    const payload = { ...user, loggedIn: true };
    if (remember) localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    else sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (err) {
    if (DEBUG) console.warn("[UserContext] persistCache failed", err);
  }
}

/* -------------------------
   Provider
   ------------------------- */
export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<HomeFixUser | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  /* Single path hydration: Supabase session -> hydrate profile -> fallback to cache -> isLoaded true */
  useEffect(() => {
    let mounted = true;
    (async () => {
      // Attempt to read supabase session and hydrate profile
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const sUser = sessionData?.session?.user ?? null;
        if (sUser) {
          // fetch profile from user_profiles (may return null)
          try {
            const profileRes = await supabase
              .from("user_profiles")
              .select("name, phone, role, phone_verified, email_verified")
              .eq("id", sUser.id)
              .maybeSingle();

            const profile = profileRes?.data ?? null;

            const merged: HomeFixUser = {
              id: sUser.id,
              email: sUser.email ?? null,
              phone: profile?.phone ?? null,
              name: profile?.name ?? null,
              role: profile?.role ?? null,
              phone_verified: !!profile?.phone_verified,
              email_verified: !!profile?.email_verified,
              loggedIn: true,
            };

            if (mounted) {
              setUserState(merged);
              persistCache(merged, true);
              if (DEBUG)
                console.log(
                  "[UserContext] Hydrated from Supabase session",
                  merged.id
                );
            }
            setIsLoaded(true);
            return;
          } catch (err) {
            if (DEBUG)
              console.warn("[UserContext] profile hydration failed", err);
            // If profile fetch fails, still set minimal session user
            const minimal: HomeFixUser = {
              id: sUser.id,
              email: sUser.email ?? null,
              loggedIn: true,
            };
            if (mounted) {
              setUserState(minimal);
              persistCache(minimal, true);
            }
            setIsLoaded(true);
            return;
          }
        }
      } catch (err) {
        if (DEBUG)
          console.warn("[UserContext] supabase.getSession failed", err);
      }

      // Fallback to cache only when no supabase session or supabase unreachable
      try {
        const cached = readCache();
        if (mounted) {
          if (cached) {
            setUserState(cached);
            if (DEBUG)
              console.log(
                "[UserContext] Hydrated from cache",
                cached?.id ?? "(no id)"
              );
          } else {
            setUserState(null);
            if (DEBUG) console.log("[UserContext] No cached user");
          }
        }
      } catch (err) {
        if (DEBUG) console.warn("[UserContext] cache fallback failed", err);
        if (mounted) setUserState(null);
      } finally {
        if (mounted) setIsLoaded(true);
      }
    })();

    return () => {
      mounted = false;
    };
    // run only once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Supabase auth listener — keep state in sync */
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          if (event === "SIGNED_OUT") {
            // sign-out: clear local state & persist logout marker
            await (async () => {
              try {
                localStorage.setItem(LOGOUT_MARKER, "1");
                persistCache(null);
                setUserState(null);
                channel?.postMessage("logout");
                window.dispatchEvent(
                  new CustomEvent("hf:session-sync", { detail: "logged_out" })
                );
                if (DEBUG) console.log("[UserContext] SIGNED_OUT processed");
              } catch (e) {
                if (DEBUG)
                  console.warn("[UserContext] SIGNED_OUT handler error", e);
              }
            })();
            return;
          }

          if (event === "SIGNED_IN" && session?.user) {
            const sUser = session.user;
            // hydrate full profile
            try {
              const profileRes = await supabase
                .from("user_profiles")
                .select("name, phone, role, phone_verified, email_verified")
                .eq("id", sUser.id)
                .maybeSingle();
              const profile = profileRes?.data ?? null;
              const merged: HomeFixUser = {
                id: sUser.id,
                email: sUser.email ?? null,
                phone: profile?.phone ?? null,
                name: profile?.name ?? null,
                role: profile?.role ?? null,
                phone_verified: !!profile?.phone_verified,
                email_verified: !!profile?.email_verified,
                loggedIn: true,
              };
              setUserState(merged);
              persistCache(merged, true);
              try {
                channel?.postMessage({ type: "login", user: merged });
              } catch {}
              window.dispatchEvent(
                new CustomEvent("hf:session-sync", { detail: "logged_in" })
              );
              if (DEBUG)
                console.log("[UserContext] SIGNED_IN processed", merged.id);
            } catch (err) {
              // fallback minimal
              const minimal: HomeFixUser = {
                id: sUser.id,
                email: sUser.email ?? null,
                loggedIn: true,
              };
              setUserState(minimal);
              persistCache(minimal, true);
              try {
                channel?.postMessage({ type: "login", user: minimal });
              } catch {}
              window.dispatchEvent(
                new CustomEvent("hf:session-sync", { detail: "logged_in" })
              );
              if (DEBUG)
                console.log(
                  "[UserContext] SIGNED_IN fallback processed",
                  minimal.id
                );
            }
          }
        } catch (err) {
          if (DEBUG)
            console.warn("[UserContext] onAuthStateChange handler error", err);
        }
      }
    );

    return () => {
      try {
        sub?.subscription?.unsubscribe();
      } catch {}
    };
  }, []);

  /* Cross-tab sync */
  useEffect(() => {
    if (!channel) return;
    const onMessage = (ev: any) => {
      try {
        if (ev === "logout" || ev.data === "logout") {
          localStorage.setItem(LOGOUT_MARKER, "1");
          persistCache(null);
          setUserState(null);
          if (DEBUG) console.log("[UserContext] Broadcast logout received");
        } else if (ev?.data?.type === "login" && ev?.data?.user) {
          // another tab logged in — trust cache
          const cached = readCache();
          if (cached) setUserState(cached);
          if (DEBUG) console.log("[UserContext] Broadcast login received");
        }
      } catch (err) {
        if (DEBUG)
          console.warn("[UserContext] Broadcast channel message error", err);
      }
    };

    channel.onmessage = (e) => onMessage(e.data ?? e);
    const customListener = (e: any) => {
      if (e?.detail === "logged_out") {
        localStorage.setItem(LOGOUT_MARKER, "1");
        persistCache(null);
        setUserState(null);
      }
      if (e?.detail === "logged_in") {
        const cached = readCache();
        if (cached) setUserState(cached);
      }
    };

    window.addEventListener("hf:session-sync", customListener);

    return () => {
      try {
        channel.onmessage = null;
        window.removeEventListener("hf:session-sync", customListener);
      } catch {}
    };
  }, []);

  /* Login: accept partial user payloads (to stay flexible) */
  const login = useCallback((u: Partial<HomeFixUser>, remember = true) => {
    const payload: HomeFixUser = { ...u, loggedIn: true };

    setUserState(payload);
    persistCache(payload, remember);

    // NOTE: guest→user LedgerX migration must be handled inside useLedgerX
    try {
      channel?.postMessage({ type: "login", user: payload });
    } catch {}
    window.dispatchEvent(
      new CustomEvent("hf:session-sync", { detail: "logged_in" })
    );

    if (DEBUG)
      console.log("[UserContext] login called", payload?.id ?? "(no id)");
  }, []);

  /* Logout */
  const logout = useCallback(async () => {
    try {
      // attempt sign out at supabase
      await supabase.auth.signOut().catch(() => {});
    } catch (err) {
      if (DEBUG) console.warn("[UserContext] supabase.signOut failed", err);
    } finally {
      localStorage.setItem(LOGOUT_MARKER, "1");
      persistCache(null);
      setUserState(null);
      try {
        channel?.postMessage("logout");
      } catch {}
      window.dispatchEvent(
        new CustomEvent("hf:session-sync", { detail: "logged_out" })
      );
      if (DEBUG) console.log("[UserContext] logout finished");
    }
  }, []);

  /* Manual refresh: re-fetch supabase session & profile */
  const refreshUser = useCallback(async () => {
    try {
      const { data } = await supabase.auth.getUser();
      const sUser = data?.user ?? null;
      if (!sUser) {
        // no session
        persistCache(null);
        setUserState(null);
        return;
      }

      const profileRes = await supabase
        .from("user_profiles")
        .select("name, phone, role, phone_verified, email_verified")
        .eq("id", sUser.id)
        .maybeSingle();

      const profile = profileRes?.data ?? null;
      const merged: HomeFixUser = {
        id: sUser.id,
        email: sUser.email ?? null,
        phone: profile?.phone ?? null,
        name: profile?.name ?? null,
        role: profile?.role ?? null,
        phone_verified: !!profile?.phone_verified,
        email_verified: !!profile?.email_verified,
        loggedIn: true,
      };
      setUserState(merged);
      persistCache(merged, true);
    } catch (err) {
      if (DEBUG) console.warn("[UserContext] refreshUser failed", err);
    }
  }, []);

  const isLoggedIn = useMemo(() => {
    if (!user) return false;
    // Consider any user with an id OR legacy flags as logged in.
    return Boolean(
      user.id || user.loggedIn || user.phone_verified || user.email_verified
    );
  }, [user]);

  return (
    <UserContext.Provider
      value={{
        user,
        isLoaded,
        isLoggedIn,
        login,
        logout,
        refreshUser,
        setUser: setUserState,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

/* -------------------------
   Hook
   ------------------------- */
export function useUser(): UserContextType {
  const ctx = useContext(UserContext);
  if (!ctx) {
    // defensive fallback to satisfy callers during SSR/isolated imports
    return {
      user: null,
      isLoaded: false,
      isLoggedIn: false,
      login: () => {},
      logout: async () => {},
      refreshUser: async () => {},
      setUser: () => {},
    };
  }
  return ctx;
}
