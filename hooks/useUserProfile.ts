"use client";

import useSWR, { mutate } from "swr";
import { useEffect } from "react";
import { clearLocalUserState } from "@/lib/clearUserState";

type ProfileUser = {
  id?: string;
  name?: string | null;
  full_name?: string | null;
  phone?: string | null;
  email?: string | null;
  email_verified?: boolean | null;
  phone_verified?: boolean | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  role?: string | null;
  loggedOut?: boolean;
  user_metadata?: Record<string, any>;
  app_metadata?: Record<string, any>;
};

const fetcher = async (url: string) => {
  const res = await fetch(url, { credentials: "include" });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.message || "Failed to load profile");
  }
  return json;
};

export function useUserProfile() {
  const { data, error, isLoading, mutate: revalidate } = useSWR(
    "/api/profile",
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  const user = (data?.user as ProfileUser) ?? null;

  // Guard against mismatched cache vs server profile
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!user?.id) return;
    try {
      const cached = JSON.parse(localStorage.getItem("user") || "null");
      if (cached?.id && cached.id !== user.id) {
        clearLocalUserState().then(() => mutate("/api/profile"));
      }
    } catch {
      // ignore parse errors
    }
  }, [user?.id]);

  const loggedIn = !!user?.id;

  return {
    user,
    profile: user,
    loggedIn,
    loading: isLoading,
    isLoading,
    error,
    refresh: () => revalidate(),
  };
}

export function refreshProfileSWR() {
  return mutate("/api/profile");
}
