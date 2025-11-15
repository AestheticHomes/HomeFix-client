"use client";
import { useEffect } from "react";
import { useUser } from "@/contexts/UserContext";

export default function SessionHydrator() {
  const { user, refreshUser, isLoaded } = useUser();

  useEffect(() => {
    if (!isLoaded || !user?.loggedIn) return;
    const interval = setInterval(() => refreshUser().catch(() => {}), 60_000);
    return () => clearInterval(interval);
  }, [isLoaded, user?.loggedIn, refreshUser]);

  useEffect(() => {
    if (!isLoaded || !user?.loggedIn) return;
    const keepCookiesAlive = () => {
      try {
        const u = user ?? JSON.parse(localStorage.getItem("user") || "null");
        if (!u?.loggedIn) return;
        const maxAge = 7 * 24 * 60 * 60;
        const base = `Path=/; Max-Age=${maxAge}; SameSite=Lax`;
        document.cookie = [
          `hf_user_id=${encodeURIComponent(u.id || "")}; ${base}`,
          `hf_user_phone=${encodeURIComponent(u.phone || "")}; ${base}`,
          `hf_user_email=${encodeURIComponent(u.email || "")}; ${base}`,
          `hf_user_verified=${u.email_verified ? "true" : "false"}; ${base}`,
        ].join(", ");
      } catch {}
    };
    keepCookiesAlive();
    const interval = setInterval(keepCookiesAlive, 24 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [isLoaded, user?.loggedIn, user]);

  return null;
}
