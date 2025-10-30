"use client";
/**
 * UserProvider v3.2 — HomeFix Global Session Context 🌿
 * -----------------------------------------------------------
 * ✅ Centralized user state (used by AuthDrawer, Bookings, Checkout)
 * ✅ Syncs across tabs (storage event)
 * ✅ Supports local/session persistence ("Remember Me")
 * ✅ Graceful hydration & reactivity
 */

import { createContext, useContext, useEffect, useState } from "react";

interface UserProfile {
  id?: string;
  name?: string;
  phone?: string;
  email?: string;
  email_verified?: boolean;
  loggedOut?: boolean;
  [key: string]: any;
}

interface UserContextType {
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  logout: () => void;
  loaded: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loaded, setLoaded] = useState(false);

  /* -----------------------------------------------------------
     🧭 Initial Load (detect sessionStorage vs localStorage)
  ----------------------------------------------------------- */
  useEffect(() => {
    if (typeof window === "undefined") return;

    const getStoredUser = () => {
      const local = localStorage.getItem("user");
      const session = sessionStorage.getItem("user");
      const parsed = local ? JSON.parse(local) : session ? JSON.parse(session) : null;
      return parsed && !parsed.loggedOut ? parsed : null;
    };

    setUser(getStoredUser());
    setLoaded(true);

    /* 🔄 Listen to cross-tab login/logout changes */
    const handleStorage = () => setUser(getStoredUser());
    window.addEventListener("storage", handleStorage);

    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  /* -----------------------------------------------------------
     🚪 Logout (soft clear + broadcast)
  ----------------------------------------------------------- */
  const logout = () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");
    localStorage.setItem("user", JSON.stringify({ loggedOut: true }));
    setUser(null);
    // broadcast to other tabs
    window.dispatchEvent(new StorageEvent("storage", { key: "user" }));
  };

  return (
    <UserContext.Provider value={{ user, setUser, logout, loaded }}>
      {children}
    </UserContext.Provider>
  );
}

/* -----------------------------------------------------------
   🪶 Custom Hook
----------------------------------------------------------- */
export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx)
    throw new Error("useUser must be used within a <UserProvider />");
  return ctx;
};
