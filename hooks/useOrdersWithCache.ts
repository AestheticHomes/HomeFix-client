"use client";

import { useEffect, useMemo, useState } from "react";
import { mutate } from "swr";

import { useUserProfile } from "@/hooks/useUserProfile";
import {
  getOrdersForUser,
  setOrdersForUser,
  LedgerXDBEntry,
} from "@/lib/client/ledgerxClient";

type OrdersState = {
  orders: LedgerXDBEntry[];
  loading: boolean;
  isStale: boolean;
  error?: string | null;
  refresh: () => Promise<void>;
};

/**
 * Combines /api/bookings-ledger/list with a per-device cache (ledgerx).
 * - Supabase is canonical; cache is overwritten when fresh data arrives.
 */
export function useOrdersWithCache(): OrdersState {
  const { profile, loggedIn, isLoading: loadingProfile } = useUserProfile();
  const userId = profile?.id ?? null;

  const [orders, setOrders] = useState<LedgerXDBEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [isStale, setIsStale] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canRun = loggedIn && !!userId && !loadingProfile;

  const loadCached = useMemo(
    () => async () => {
      if (!userId) return;
      try {
        const cached = await getOrdersForUser(userId);
        if (cached?.length) {
          setOrders(cached);
          setIsStale(true);
        }
      } catch {
        // ignore cache errors
      }
    },
    [userId]
  );

  const fetchFresh = useMemo(
    () => async () => {
      if (!canRun || !userId) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/bookings-ledger/list?user_id=${userId}`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const json = await res.json();
        const next = Array.isArray(json?.data) ? json.data : [];
        setOrders(next);
        setIsStale(false);
        await setOrdersForUser(userId, next);
        mutate("/api/bookings-ledger/list"); // keep SWR consumers in sync if any
      } catch (err: any) {
        setError(err?.message || "Failed to load orders");
        setIsStale(true);
      } finally {
        setLoading(false);
      }
    },
    [canRun, userId]
  );

  useEffect(() => {
    if (!canRun) {
      setOrders([]);
      setIsStale(true);
      setError(null);
      return;
    }
    loadCached();
    fetchFresh();
  }, [canRun, loadCached, fetchFresh]);

  const refresh = async () => {
    await fetchFresh();
  };

  return { orders, loading, isStale, error, refresh };
}
