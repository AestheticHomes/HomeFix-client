"use client";
/**
 * File: /app/admin/bookings/page.js
 * Version: v5.0 — HomeFix India Admin Dashboard 🌿
 * ------------------------------------------------------------
 * ✅ Uses unified /api/admin/bookings/update route
 * ✅ Normalizes ISO dates before reschedule
 * ✅ Structured Edith logger integration
 * ✅ Auto-refresh & live sync compatible
 */

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays,
  Clock,
  MapPin,
  RefreshCcw,
  Zap,
  Loader2,
  Filter,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import * as c from "@/lib/console";

/* ------------------------------------------------------------
   🎨 Status color mapping
------------------------------------------------------------ */
const statusColor = {
  pending:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  approved:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  "in-progress":
    "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
  completed:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  cancelled:
    "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  rescheduled:
    "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
};

/* ------------------------------------------------------------
   🧩 Component
------------------------------------------------------------ */
export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null);
  const [newDate, setNewDate] = useState("");
  const [liveSync, setLiveSync] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  /* ------------------------------------------------------------
     🔄 Fetch bookings
  ------------------------------------------------------------ */
  const fetchBookings = async () => {
    setLoading(true);
    c.info("AdminBookings", "Fetching bookings via /api/admin/bookings/list...");

    try {
      const res = await fetch("/api/admin/bookings/list", { cache: "no-store" });
      const json = await res.json();

      if (json.success) {
        setBookings([...json.bookings]); // force new reference
        c.log(
          "AdminBookings",
          `✅ Loaded ${json.bookings?.length || 0} bookings from server`
        );
      } else {
        c.warn("AdminBookings", "❌ Fetch failed:", json.error);
      }
    } catch (err) {
      c.error("AdminBookings", "💥 Fetch error:", err.message);
    } finally {
      setLoading(false);
      c.info("AdminBookings", "Fetch complete");
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  /* ------------------------------------------------------------
     ⚡ Supabase realtime listener
  ------------------------------------------------------------ */
  useEffect(() => {
    if (!liveSync) return;
    c.info("AdminBookings", "📡 Subscribing to Supabase realtime changes...");

    const channel = supabase
      .channel("admin-bookings")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookings" },
        (payload) => {
          c.log("AdminBookings", "🔔 Realtime update received:", payload);
          fetchBookings();
        }
      )
      .subscribe();

    return () => {
      c.info("AdminBookings", "📴 Unsubscribing from realtime channel");
      supabase.removeChannel(channel);
    };
  }, [liveSync]);

  /* ------------------------------------------------------------
     🔍 Filtered view
  ------------------------------------------------------------ */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return bookings.filter((b) => {
      const client = b.user_profiles?.name?.toLowerCase() || "";
      const service = b.services?.title?.toLowerCase() || "";
      const addr = b.address?.toLowerCase() || "";
      return (
        (!statusFilter || b.status === statusFilter) &&
        (client.includes(q) || service.includes(q) || addr.includes(q))
      );
    });
  }, [bookings, search, statusFilter]);

  /* ------------------------------------------------------------
     🧰 Update booking status
  ------------------------------------------------------------ */
  const updateBookingStatus = async (id, status) => {
    setSaving(true);
    c.info("AdminBookings", `🧭 Updating booking ${id} → ${status}`);

    try {
      const res = await fetch("/api/admin/bookings/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });

      const json = await res.json();

      if (json.success) {
        c.log("AdminBookings", "✅ Update success:", json.booking);
        setBookings((prev) =>
          prev.map((b) => (b.id === id ? json.booking : b))
        );
      } else {
        c.error("AdminBookings", "❌ API update failed:", json.error);
      }
    } catch (err) {
      c.error("AdminBookings", "💥 API update error:", err.message);
    } finally {
      setSaving(false);
    }
  };

  /* ------------------------------------------------------------
     📅 Reschedule booking
  ------------------------------------------------------------ */
  const rescheduleBooking = async (id) => {
    if (!newDate) return alert("Select a date first");

    // Convert to ISO timestamp
    const isoDate = new Date(newDate).toISOString();
    c.info("AdminBookings", `📅 Rescheduling booking ${id} to ${isoDate}`);

    setSaving(true);
    try {
      const res = await fetch("/api/admin/bookings/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, preferred_date: isoDate, status: "rescheduled" }),
      });

      const json = await res.json();

      if (json.success) {
        c.log("AdminBookings", `✅ Reschedule success:`, json.booking);
        setBookings((prev) =>
          prev.map((b) => (b.id === id ? json.booking : b))
        );
      } else {
        c.error("AdminBookings", "❌ Reschedule API failed:", json.error);
      }
    } catch (err) {
      c.error("AdminBookings", "💥 Reschedule API error:", err.message);
    } finally {
      setEditing(null);
      setNewDate("");
      setSaving(false);
    }
  };

  /* ------------------------------------------------------------
     🧱 UI
  ------------------------------------------------------------ */
  return (
    <main className="p-6 min-h-screen bg-gray-50 dark:bg-slate-900 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-3xl font-semibold text-slate-800 dark:text-gray-50"
        >
          Manage Bookings
        </motion.h1>

        <div className="flex items-center gap-4 flex-wrap">
          <Button
            onClick={fetchBookings}
            disabled={loading || liveSync}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white"
          >
            {loading ? (
              <Loader2 className="animate-spin w-4 h-4" />
            ) : (
              <RefreshCcw size={16} />
            )}
            Refresh
          </Button>

          <div className="flex items-center gap-2">
            <Label
              htmlFor="liveSync"
              className="text-sm text-gray-700 dark:text-gray-300"
            >
              Live Sync
            </Label>
            <Switch
              id="liveSync"
              checked={liveSync}
              onCheckedChange={setLiveSync}
              className="data-[state=checked]:bg-green-600"
            />
            {liveSync && (
              <Zap size={16} className="text-green-500 animate-pulse" />
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <input
          type="text"
          placeholder="Search by client, service, or address…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-80 px-3 py-2 border rounded-md text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-white"
        />

        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-white"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="rescheduled">Rescheduled</option>
          </select>
        </div>
      </div>

      {/* Booking Cards */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loader"
            className="text-center text-gray-500 dark:text-gray-400 py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Loader2 className="animate-spin inline-block mr-2 w-5 h-5" />
            Loading bookings...
          </motion.div>
        ) : filtered.length === 0 ? (
          <motion.p
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-gray-400 dark:text-gray-500 py-16"
          >
            No bookings found.
          </motion.p>
        ) : (
          <motion.div
            key="cards"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {filtered.map((b) => (
              <Card
                key={b.id}
                className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all"
              >
                <CardContent className="p-5 space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-lg text-slate-800 dark:text-gray-100 truncate">
                      {b.user_profiles?.name || "Unnamed Client"}
                    </h3>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${
                        statusColor[b.status] ||
                        "bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-gray-300"
                      }`}
                    >
                      {b.status || "pending"}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1">
                    <MapPin size={14} /> {b.address || "No address provided"}
                  </p>

                  <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1">
                    <CalendarDays size={14} />{" "}
                    {b.preferred_date
                      ? new Date(b.preferred_date).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "No date set"}
                  </p>

                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Clock size={14} /> {b.preferred_slot || "—"}
                  </p>

                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Service:{" "}
                    <span className="font-medium text-green-600 dark:text-green-400">
                      {b.services?.title || "Unknown"}
                    </span>
                  </p>

                  {/* --- Booking Actions --- */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    <select
                      value={b.status || "pending"}
                      onChange={(e) => updateBookingStatus(b.id, e.target.value)}
                      className="border rounded px-2 py-1 text-sm focus:ring-2 focus:ring-green-500 dark:bg-slate-700 dark:text-white"
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="rescheduled">Rescheduled</option>
                    </select>

                    <Button
                      disabled={saving}
                      onClick={() => setEditing(b.id)}
                      className="bg-orange-500 hover:bg-orange-600 text-white flex items-center gap-1"
                    >
                      <CalendarDays size={16} /> Reschedule
                    </Button>
                  </div>

                  <AnimatePresence>
                    {editing === b.id && (
                      <motion.div
                        key="reschedule"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-3 space-y-2"
                      >
                        <input
                          type="date"
                          value={newDate}
                          onChange={(e) => setNewDate(e.target.value)}
                          className="border dark:border-slate-600 rounded px-3 py-2 w-full text-sm dark:bg-slate-700 dark:text-white"
                        />
                        <Button
                          disabled={saving}
                          onClick={() => rescheduleBooking(b.id)}
                          className="bg-green-700 hover:bg-green-800 text-white w-full"
                        >
                          {saving ? (
                            <Loader2 className="animate-spin w-4 h-4 mx-auto" />
                          ) : (
                            "Save New Date"
                          )}
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
