/**
 * File: /lib/supabaseQueries/admin.ts
 * Version: v4.0 — HomeFix Admin Query Core 🌿
 * ------------------------------------------------------------
 * ✅ Centralized Supabase queries for Admin components
 * ✅ Type-safe using /lib/supabaseQueries/admin.types.ts
 * ✅ Returns normalized relational data (services + user_profiles)
 * ✅ Ready for use with hooks like useAdminDashboardData()
 */

"use client";

import { supabase } from "@/lib/supabaseClient";
import type {
  AdminBooking,
  AdminChartPoint,
  AdminStats,
} from "@/lib/supabaseQueries/admin.types";
import { toast } from "@/hooks/use-toast";
import { error, info, log, warn } from "@/lib/console";


/* ------------------------------------------------------------
   🧩 Core: Fetch Admin Dashboard Data
------------------------------------------------------------ */
export async function fetchAdminDashboardData(): Promise<{
  stats: AdminStats;
  bookings: AdminBooking[];
  chartData: AdminChartPoint[];
}> {
  try {
    /* ---------------------------------------
       1️⃣ Aggregate Counts
    ---------------------------------------- */
    const [{ count: sCount }, { count: bCount }, { count: uCount }] =
      await Promise.all([
        supabase.from("services").select("id", { count: "exact", head: true }),
        supabase.from("bookings").select("id", { count: "exact", head: true }),
        supabase.from("user_profiles").select("id", {
          count: "exact",
          head: true,
        }),
      ]);

    const stats: AdminStats = {
      services: sCount || 0,
      bookings: bCount || 0,
      users: uCount || 0,
    };

    /* ---------------------------------------
       2️⃣ Latest Bookings (Normalized)
    ---------------------------------------- */
    const { data: latest, error: bErr } = await supabase
      .from("bookings")
      .select(
        `
          id,
          created_at,
          address,
          status,
          preferred_date,
          preferred_slot,
          email,
          user_profiles ( name, phone, email ),
          services ( title )
        `,
      )
      .order("created_at", { ascending: false })
      .limit(5);

    if (bErr) throw bErr;

    const bookings: AdminBooking[] = latest?.map((b: any) => ({
      id: b.id,
      created_at: b.created_at,
      address: b.address ?? null,
      status: b.status ?? null,
      preferred_date: b.preferred_date ?? null,
      preferred_slot: b.preferred_slot ?? null,
      email: b.email ?? null,
      service_title: Array.isArray(b.services) && b.services.length
        ? b.services[0].title
        : b.services?.title ?? null,
      client_name: Array.isArray(b.user_profiles) && b.user_profiles.length
        ? b.user_profiles[0].name
        : b.user_profiles?.name ?? null,
      client_email: Array.isArray(b.user_profiles) && b.user_profiles.length
        ? b.user_profiles[0].email
        : b.user_profiles?.email ?? null,
      client_phone: Array.isArray(b.user_profiles) && b.user_profiles.length
        ? b.user_profiles[0].phone
        : b.user_profiles?.phone ?? null,
    })) ?? [];

    /* ---------------------------------------
       3️⃣ Booking Trends (Monthly)
    ---------------------------------------- */
    const { data: all, error: cErr } = await supabase
      .from("bookings")
      .select("created_at")
      .order("created_at", { ascending: true });

    if (cErr) throw cErr;

    const grouped = all?.reduce<Record<string, number>>((acc, b) => {
      const month = new Date(b.created_at).toLocaleString("en", {
        month: "short",
      });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {}) ?? {};

    const chartData: AdminChartPoint[] = Object.entries(grouped).map(
      ([month, count]) => ({ month, count }),
    );

    return { stats, bookings, chartData };
  } catch (err: any) {
    console.error("❌ [AdminQueries] fetchAdminDashboardData failed:", err);
    toast({
      title: "Error loading admin data",
      description: err.message || "An unexpected error occurred",
      variant: "destructive",
    });
    throw err;
  }
}

/* ------------------------------------------------------------
   🧰 Utility: Update Booking Status (v4.3 + Edith logging)
------------------------------------------------------------ */
export async function updateBookingStatus(
  id: number,
  newStatus: string,
): Promise<boolean> {
  log("Bookings", `Attempting status update → ${id} → ${newStatus}`);

  try {
    const { data, error: dbError } = await supabase
      .from("bookings")
      .update({ status: newStatus })
      .eq("id", id)
      .select("id, status, updated_at")
      .maybeSingle();

    if (dbError) {
      error("Bookings", "Supabase update error:", dbError.message);
      toast({
        title: "Update failed",
        description: dbError.message,
        variant: "destructive",
      });
      return false;
    }

    if (!data) {
      warn("Bookings", "No rows updated for booking:", id);
      toast({
        title: "Booking not found",
        description: `No record found for ID ${id}`,
        variant: "destructive",
      });
      return false;
    }

    info("Bookings", `✅ Booking #${id} updated →`, newStatus);
    toast({
      title: "Booking Updated",
      description: `Status changed to "${newStatus}".`,
    });

    // Dispatch a global Edith event for the Admin console panel
    try {
      window.dispatchEvent(
        new CustomEvent("edith:bookingUpdate", {
          detail: { id, status: newStatus, ts: Date.now() },
        }),
      );
    } catch (evtErr) {
      warn("Edith", "Failed to dispatch bookingUpdate event:", evtErr);
    }

    return true;
  } catch (err: any) {
    error("Bookings", "Unexpected exception:", err);
    toast({
      title: "Unexpected Error",
      description: err.message || "Could not update booking status",
      variant: "destructive",
    });
    return false;
  }
}
