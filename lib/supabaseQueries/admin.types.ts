/**
 * File: /lib/supabaseQueries/admin.types.ts
 * Version: v1.0 — HomeFix Admin Type Library 🌿
 * ------------------------------------------------------------
 * ✅ Centralized shared interfaces for all admin modules
 * ✅ Mirrors live Supabase schema (bookings, services, user_profiles)
 * ✅ Autocomplete-friendly for components, hooks, and Edge Functions
 * ✅ Keeps AdminDashboard.tsx, BookingsTable.tsx, and data hooks aligned
 *
 * Usage:
 *   import type { AdminStats, AdminBooking, AdminChartPoint } from "@/lib/supabaseQueries/admin.types";
 */

export interface AdminStats {
  /** Total number of active services */
  services: number;

  /** Total number of bookings (any status) */
  bookings: number;

  /** Total number of registered users */
  users: number;
}

/* ------------------------------------------------------------
   📘 AdminBooking — normalized from Supabase public.bookings
------------------------------------------------------------ */
export interface AdminBooking {
  /** Unique booking ID */
  id: number;

  /** ISO timestamp when booking was created */
  created_at: string;

  /** Client site/service address */
  address?: string | null;

  /** Booking status — upcoming, in-progress, completed, cancelled, etc. */
  status?: string | null;

  /** User-selected preferred service date */
  preferred_date?: string | null;

  /** User-selected preferred time slot (9 AM / 1 PM / 5 PM / 7 PM) */
  preferred_slot?: string | null;

  /** Booking email contact (may differ from user_profiles.email) */
  email?: string | null;

  /** Linked service title from services table */
  service_title?: string | null;

  /** Linked client name from user_profiles */
  client_name?: string | null;

  /** Linked client email from user_profiles */
  client_email?: string | null;

  /** Linked client phone number from user_profiles */
  client_phone?: string | null;
}

/* ------------------------------------------------------------
   📈 AdminChartPoint — used in Booking Trends (Recharts)
------------------------------------------------------------ */
export interface AdminChartPoint {
  /** Month abbreviation (e.g., Jan, Feb, Mar) */
  month: string;

  /** Total bookings in that month */
  count: number;
}

/* ------------------------------------------------------------
   🧩 AdminHookReturn — unified type for hooks like useAdminDashboardData
------------------------------------------------------------ */
export interface AdminHookReturn {
  stats: AdminStats;
  bookings: AdminBooking[];
  chartData: AdminChartPoint[];
  loading: boolean;
  loadData: () => Promise<void>;
}
