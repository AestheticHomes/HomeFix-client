"use client";

import { clearLocalUserState } from "@/lib/clearUserState";
import { useCallback, useEffect, useState } from "react";
import useSWR, { mutate } from "swr";

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
  try {
    const res = await fetch(url, { credentials: "include" });

    if (res.status === 401) {
      return { user: null, success: false };
    }

    const json = await res.json();

    if (!res.ok) {
      throw new Error(json?.message || "Failed to load profile");
    }

    return json;
  } catch (err) {
    console.error("[useUserProfile] /api/profile fetch failed:", err);
    // Treat network failure as "no profile" so UI doesn't spin forever.
    return { user: null, success: false };
  }
};

export function useUserProfile() {
  const [sessionChecked, setSessionChecked] = useState(false);
  const [mismatchCleared, setMismatchCleared] = useState(false);

  // Mark session as checked immediately; auth is cookie-based via /api/profile.
  useEffect(() => {
    setSessionChecked(true);
  }, []);

  const {
    data,
    error,
    isLoading,
    mutate: revalidate,
  } = useSWR(sessionChecked ? "/api/profile" : null, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateIfStale: false,
    shouldRetryOnError: false,
  });

  // Stable refresh function so callers can safely depend on it.
  const refresh = useCallback(
    () => revalidate(undefined, { revalidate: true }),
    [revalidate]
  );

  const user = (data?.user as ProfileUser) ?? null;

  useEffect(() => {
    setMismatchCleared(false);
  }, [user?.id]);

  // Guard against mismatched cache vs server profile.
  // If local "user" belongs to a different id than the cookie-based profile,
  // clear local state and refetch.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!user?.id) return;
    if (mismatchCleared) return;

    try {
      const cached = JSON.parse(localStorage.getItem("user") || "null");
      if (cached?.id && cached.id !== user.id) {
        setMismatchCleared(true);
        clearLocalUserState().then(() => mutate("/api/profile"));
      }
    } catch {
      // ignore parse errors
    }
  }, [user?.id, mismatchCleared]);

  const loggedIn = !!user?.id;
  const loading = !sessionChecked || isLoading;

  return {
    user,
    profile: user,
    loggedIn,
    loading,
    isLoading: loading,
    error,
    refresh,
  };
}

export function refreshProfileSWR() {
  return mutate("/api/profile");
}
