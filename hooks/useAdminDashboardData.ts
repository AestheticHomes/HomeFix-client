/**
 * File: /hooks/useAdminDashboardData.ts
 * Version: v4.0 — HomeFix Admin Data Hook 🌿
 * ------------------------------------------------------------
 * ✅ Uses centralized query layer (/lib/supabaseQueries/admin)
 * ✅ Strongly typed & normalized data
 * ✅ Clean, modular, maintainable
 * ✅ Auto-refresh ready (manual + realtime compatible)
 */

"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { fetchAdminDashboardData } from "@/lib/supabaseQueries/admin";
import type {
  AdminBooking,
  AdminChartPoint,
  AdminStats,
} from "@/lib/supabaseQueries/admin.types";
import { updateBookingStatus } from "@/lib/supabaseQueries/admin";
import { error, info, warn } from "@/lib/console";
export function useAdminDashboardData() {
  const [stats, setStats] = useState<AdminStats>({
    services: 0,
    bookings: 0,
    users: 0,
  });

  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [chartData, setChartData] = useState<AdminChartPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const { stats, bookings, chartData } = await fetchAdminDashboardData();

      setStats(stats);
      setBookings(bookings);
      setChartData(chartData);

      if (process.env.NODE_ENV === "development") {
        console.log("✅ [AdminDashboard] Data refreshed:", {
          stats,
          bookings,
          chartData,
        });
      }
    } catch (err: any) {
      console.error("❌ [AdminDashboard] loadData failed:", err);
      toast({
        title: "Error loading data",
        description: err.message || "Unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      // 🧩 Always unlock UI even on error
      setLoading(false);
    }
  }, []);

  const handleStatusChange = async (
    id: number,
    newStatus: string,
    serviceTitle?: string,
  ) => {
    info("Dashboard", "Status change requested:", { id, newStatus });

    try {
      const success = await updateBookingStatus(id, newStatus);

      if (success) {
        info("Dashboard", `Booking #${id} updated locally to ${newStatus}`);
        setBookings((prev) =>
          prev.map((b) =>
            b.id === id
              ? {
                ...b,
                status: newStatus,
                service_title: serviceTitle ?? b.service_title,
              }
              : b
          )
        );
      } else {
        warn(
          "Dashboard",
          `Booking #${id} update returned false (no DB change)`,
        );
      }
    } catch (err: any) {
      error("Dashboard", "handleStatusChange() exception:", err);
    }
  };

  // 🚀 Auto-load when dashboard mounts
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Optional: expose manual refresh function for your “Refresh” button
  const refresh = () => loadData();

  return {
    stats,
    bookings,
    chartData,
    loading,
    loadData,
    handleStatusChange,
  };
}
