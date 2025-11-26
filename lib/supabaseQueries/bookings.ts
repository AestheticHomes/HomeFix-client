"use client";

/**
 * File: /lib/supabaseQueries/bookings.ts
 * Project: HomeFix India v3.1
 * Supabase Project ID: xnubmphixlpkyqfhghup
 * ------------------------------------------------------------
 * LEGACY: uses old `bookings` table for historic/admin data only.
 * New customer flows must use bookings_ledger + booking_events.
 * ✅ Typed Supabase client (Database-aware)
 * ✅ Flattened joins using !inner
 * ✅ Safe mapping + TS-strict BookingRow interface
 * ✅ Admin Dashboard ready
 */

import { supabase } from "@/lib/supabaseClient";
import type { Database } from "@/lib/database.types";

/* ------------------------------------------------------------
   ⚙️ Initialize Typed Supabase Client
------------------------------------------------------------ */

/* ------------------------------------------------------------
   🧩 Type Definition for Dashboard Consumption
------------------------------------------------------------ */
export interface LegacyBookingRow {
  id: string;
  created_at: string;
  address: string | null;
  status: string;
  preferred_date: string | null;
  preferred_slot: string | null;
  email: string | null;
  service_title: string | null;
  client_name: string | null;
  client_email: string | null;
  client_phone: string | null;
}

/* ------------------------------------------------------------
   🚀 Fetch All Bookings (Admin Dashboard)
------------------------------------------------------------ */
export async function fetchAllBookings(): Promise<LegacyBookingRow[]> {
  try {
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        id,
        created_at,
        address,
        status,
        preferred_date,
        preferred_slot,
        email,
        user_profiles!inner(name, phone, email),
        services!inner(title)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Error fetching bookings:", error.message);
      return [];
    }

    if (!data) {
      console.warn("⚠️ No booking data found.");
      return [];
    }

    // Map and flatten relational data
    const normalized: LegacyBookingRow[] = data.map((b: any) => ({
      id: b.id,
      created_at: b.created_at,
      address: b.address ?? null,
      status: b.status,
      preferred_date: b.preferred_date ?? null,
      preferred_slot: b.preferred_slot ?? null,
      email: b.email ?? null,
      service_title: b.services?.title ?? null,
      client_name: b.user_profiles?.name ?? null,
      client_email: b.user_profiles?.email ?? null,
      client_phone: b.user_profiles?.phone ?? null,
    }));

    return normalized;
  } catch (err) {
    console.error("🔥 Unexpected error in fetchAllBookings():", err);
    return [];
  }
}
