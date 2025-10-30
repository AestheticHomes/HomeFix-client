"use client";
/**
 * File: /app/bookings/page.js
 * Version: v4.8 🌿 HomeFix India
 * Purpose: Reactive, session-secure booking dashboard with “All” tab + counts.
 */

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useUser } from "@/contexts/UserContext";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Calendar, Clock, Package, Settings2 } from "lucide-react";

/* ------------------------------------------------------------
   🕒 Constants
------------------------------------------------------------ */
const SLOTS = [
  { label: "9:00 AM", value: "09:00" },
  { label: "1:00 PM", value: "13:00" },
  { label: "5:00 PM", value: "17:00" },
  { label: "7:00 PM", value: "19:00" },
];

const STATUS_TABS = [
  { key: "all",         label: "All",         color: "gray"   },
  { key: "upcoming",    label: "Upcoming",    color: "green"  },
  { key: "in-progress", label: "In Progress", color: "amber"  },
  { key: "rescheduled", label: "Rescheduled", color: "purple" },
  { key: "completed",   label: "Completed",   color: "blue"   },
  { key: "cancelled",   label: "Cancelled",   color: "red"    },
];

/* ------------------------------------------------------------
   🌿 Component
------------------------------------------------------------ */
export default function MyBookingsPage() {
  const { user, isLoaded: loaded, isLoggedIn } = useUser();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all"); // default to All
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [reschedDate, setReschedDate] = useState(() => new Date());
  const [reschedSlot, setReschedSlot] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  /* ------------------------------------------------------------
     ✅ Fetch bookings only when logged in
  ------------------------------------------------------------ */
  useEffect(() => {
    if (!loaded) return;

    if (!isLoggedIn || !user?.id) {
      setBookings([]);
      setLoading(false);
      return;
    }

    (async () => {
      try {
        setLoading(true);
        console.log("🚀 [Bookings] Fetching for user_id =", user.id);
        const res = await fetch(`/api/bookings/list?user_id=${user.id}`);
        const json = await res.json();
        console.log("📦 [Bookings Response]", json);
        if (json.success) {
          setBookings(json.bookings || []);
        } else {
          console.error("❌ [Bookings] Fetch failed:", json.error);
        }
      } catch (err) {
        console.error("💥 [Bookings Fetch Error]:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [loaded, isLoggedIn, user?.id]);

  /* ------------------------------------------------------------
     🔄 Cross-page auth sync (login/logout)
  ------------------------------------------------------------ */
  useEffect(() => {
    const handleSync = () => {
      // Small debounce to avoid double refresh during hot reload/dev
      setTimeout(() => window.location.reload(), 50);
    };
    window.addEventListener("hf:session-sync", handleSync);
    return () => window.removeEventListener("hf:session-sync", handleSync);
  }, []);

  /* ------------------------------------------------------------
     🧮 Derived data (normalize + filter + counts)
  ------------------------------------------------------------ */
  const normalize = (s = "") => s.toLowerCase().replace(/\s+/g, "-").trim();

  const filtered = useMemo(() => {
    if (!Array.isArray(bookings)) return [];
    if (activeTab === "all") return bookings;
    return bookings.filter((b) => normalize(b.status) === activeTab);
  }, [bookings, activeTab]);

  const statusCounts = useMemo(() => {
    const map = {};
    if (Array.isArray(bookings)) {
      bookings.forEach((b) => {
        const key = normalize(b.status);
        map[key] = (map[key] || 0) + 1;
      });
      map["all"] = bookings.length;
    }
    return map;
  }, [bookings]);

  /* ------------------------------------------------------------
     🧭 Session-Aware UI Screening
  ------------------------------------------------------------ */
  if (!loaded) {
    return <CenteredScreen message="Initializing session..." spinner />;
  }

  if (!isLoggedIn || !user) {
    return (
      <motion.div
        key="login-screen"
        className="fixed inset-0 flex flex-col items-center justify-center text-center backdrop-blur-md bg-black/30 z-[70]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="bg-white/90 dark:bg-slate-900/90 p-8 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-sm relative">
          <motion.div
            className="absolute -z-10 inset-0 rounded-2xl bg-green-500/10 blur-3xl"
            aria-hidden="true"
            initial={{ opacity: 0.6 }}
            animate={{ opacity: 1 }}
          />
          <h2 className="text-2xl font-semibold mb-2 text-slate-800 dark:text-slate-100">
            You’re not logged in
          </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-5">
            Please log in to view and manage your bookings.
          </p>
          <button
            onClick={() => (window.location.href = "/login")}
            className="px-5 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium transition-all"
          >
            Go to Login
          </button>
        </div>
      </motion.div>
    );
  }

  if (loading) {
    return <CenteredScreen message="Fetching your bookings..." spinner />;
  }

  /* ------------------------------------------------------------
     🧱 Bookings UI
  ------------------------------------------------------------ */
  return (
    <main className="max-w-6xl mx-auto p-6 pb-[90px] md:pb-8">
      <h1 className="text-3xl font-bold mb-6">My Bookings</h1>

      {/* Tabs with counts + animated underline */}
<div className="relative border-b border-slate-300 dark:border-slate-700 mb-6">
  {/* Scroll wrapper */}
  <div className="flex overflow-x-auto scrollbar-hide px-1 pb-1 space-x-2 snap-x snap-mandatory">
    {STATUS_TABS.map((t) => {
      const active = activeTab === t.key;
      const count = statusCounts[t.key] || 0;
      const baseColor = t.key === "all" ? "gray" : t.color;

      return (
        <button
          key={t.key}
          onClick={() => setActiveTab(t.key)}
          className={`relative snap-start shrink-0 px-3 py-2 text-sm font-medium capitalize transition flex items-center gap-1 rounded-xl ${
            active
              ? `text-${baseColor}-600 dark:text-${baseColor}-400 bg-${baseColor}-50 dark:bg-${baseColor}-900/20`
              : "text-gray-400 hover:text-gray-600 hover:bg-slate-50 dark:hover:bg-slate-800"
          }`}
        >
          {t.label}
          {count > 0 && (
            <span
              className={`text-xs font-semibold px-2 py-[1px] rounded-full bg-${baseColor}-100 dark:bg-${baseColor}-900/30 text-${baseColor}-700 dark:text-${baseColor}-300`}
            >
              {count}
            </span>
          )}
        </button>
      );
    })}
  </div>

  {/* Gradient fade edges */}
  <div className="pointer-events-none absolute top-0 left-0 h-full w-8 bg-gradient-to-r from-white dark:from-slate-900 to-transparent" />
  <div className="pointer-events-none absolute top-0 right-0 h-full w-8 bg-gradient-to-l from-white dark:from-slate-900 to-transparent" />
</div>


      {/* List */}
      {filtered.length ? (
        <div className="grid gap-4">
          {filtered.map((b) => (
            <BookingCard
              key={b.id}
              booking={b}
              onReschedule={() => {
                setSelected(b);
                setReschedDate(
                  b.preferred_date ? new Date(b.preferred_date) : new Date()
                );
                setReschedSlot(b.preferred_slot || "");
                setOpen(true);
              }}
              onCancel={async () => {
                if (!confirm("Cancel this booking?")) return;
                const { error } = await supabase
                  .from("bookings")
                  .update({ status: "cancelled" })
                  .eq("id", b.id);
                if (!error) {
                  setBookings((prev) =>
                    prev.map((bk) =>
                      bk.id === b.id ? { ...bk, status: "cancelled" } : bk
                    )
                  );
                  setToast("❌ Booking cancelled");
                  setTimeout(() => setToast(""), 2500);
                }
              }}
            />
          ))}
        </div>
      ) : (
        <p className="text-gray-400 text-sm">No bookings found in this tab.</p>
      )}

      {/* Drawer + Toast */}
      <AnimatePresence>
        {open && selected && (
          <RescheduleDrawer
            {...{
              closeDrawer: () => setOpen(false),
              reschedDate,
              setReschedDate,
              reschedSlot,
              setReschedSlot,
              confirmReschedule: async () => {
                if (!selected || !reschedDate || !reschedSlot) {
                  setToast("📅 Pick date & time slot");
                  return;
                }
                setSaving(true);
                const { error } = await supabase
                  .from("bookings")
                  .update({
                    preferred_date: format(reschedDate, "yyyy-MM-dd"),
                    preferred_slot: reschedSlot,
                    status: "upcoming",
                  })
                  .eq("id", selected.id);

                if (error) {
                  setToast("❌ Could not update booking");
                } else {
                  setBookings((prev) =>
                    prev.map((b) =>
                      b.id === selected.id
                        ? {
                            ...b,
                            preferred_date: format(reschedDate, "yyyy-MM-dd"),
                            preferred_slot: reschedSlot,
                          }
                        : b
                    )
                  );
                  setToast("✅ Booking rescheduled");
                  setOpen(false);
                }
                setSaving(false);
                setTimeout(() => setToast(""), 2500);
              },
              saving,
            }}
          />
        )}
      </AnimatePresence>

      {toast && (
        <motion.div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-slate-900 text-white rounded-lg shadow-lg z-[80]"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
        >
          {toast}
        </motion.div>
      )}
    </main>
  );
}

/* ------------------------------------------------------------
   🧩 CenteredScreen helper
------------------------------------------------------------ */
function CenteredScreen({ message, spinner }) {
  return (
    <div className="flex justify-center items-center h-[80vh] text-gray-500 flex-col">
      {spinner && <Loader2 className="animate-spin mb-3 w-5 h-5" />}
      <p>{message}</p>
    </div>
  );
}

/* ------------------------------------------------------------
   📦 Booking Card
------------------------------------------------------------ */
function BookingCard({ booking, onReschedule, onCancel }) {
  const services = Array.isArray(booking.services)
    ? booking.services
    : [booking.services];

  return (
    <motion.div
      layout
      whileHover={{ scale: 1.01 }}
      className="p-4 rounded-xl shadow-sm border bg-white dark:bg-slate-800 dark:border-slate-700 flex flex-col md:flex-row gap-4"
    >
      <div className="flex-1">
        <div className="flex justify-between items-center mb-1">
          <h2 className="font-semibold">
            {services[0]?.name || "Service Booking"}
          </h2>
          <span
            className={`text-xs font-semibold uppercase px-3 py-1 rounded-full ${
              booking.status === "cancelled"
                ? "bg-red-100 text-red-700"
                : booking.status === "completed"
                ? "bg-blue-100 text-blue-700"
                : booking.status === "in-progress"
                ? "bg-amber-100 text-amber-700"
                : booking.status === "rescheduled"
                ? "bg-purple-100 text-purple-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {booking.status}
          </span>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          {booking.preferred_date
            ? format(new Date(booking.preferred_date), "dd MMM yyyy")
            : "No date"}
          {booking.preferred_slot && (
            <>
              <Clock className="w-4 h-4 ml-2" /> {booking.preferred_slot}
            </>
          )}
        </p>

        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-1">
          <Package className="w-4 h-4" />
          {booking.type === "product"
            ? `Quantity: ${booking.quantity}`
            : "Scheduled service"}
        </p>

        <div className="flex justify-between items-end mt-3">
          <p className="font-semibold text-green-700 dark:text-green-400">
            ₹{Number(booking.total_price).toLocaleString()}
          </p>
          <div className="flex gap-2">
            {booking.status !== "cancelled" &&
              booking.status !== "completed" && (
                <>
                  <button
                    onClick={onReschedule}
                    className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-lg hover:bg-blue-200"
                  >
                    <Settings2 className="inline w-3 h-3 mr-1" />
                    Reschedule
                  </button>
                  <button
                    onClick={onCancel}
                    className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-lg hover:bg-red-200"
                  >
                    Cancel
                  </button>
                </>
              )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------
   🗓️ Reschedule Drawer
------------------------------------------------------------ */
function RescheduleDrawer({
  closeDrawer,
  reschedDate,
  setReschedDate,
  reschedSlot,
  setReschedSlot,
  confirmReschedule,
  saving,
}) {
  return (
    <>
      <motion.div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={closeDrawer}
      />
      <motion.div
        className="fixed inset-0 z-[80] flex items-center justify-center"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
      >
        <div className="w-[90%] max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-4">
          <h3 className="text-xl font-semibold text-center">Reschedule Booking</h3>

          <input
            type="date"
            className="w-full border rounded-lg p-2 dark:bg-slate-800 dark:border-slate-600"
            value={format(reschedDate, "yyyy-MM-dd")}
            min={format(new Date(), "yyyy-MM-dd")}
            onChange={(e) => setReschedDate(new Date(e.target.value))}
          />

          <div className="grid grid-cols-2 gap-3">
            {SLOTS.map((s) => (
              <button
                key={s.value}
                onClick={() => setReschedSlot(s.value)}
                className={`rounded-lg px-3 py-2 border text-sm transition ${
                  reschedSlot === s.value
                    ? "border-green-600 bg-green-50 text-green-700 dark:bg-green-900/20"
                    : "border-slate-300 hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-700"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={closeDrawer}
              className="px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600"
            >
              Cancel
            </button>
            <button
              onClick={confirmReschedule}
              disabled={saving}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition disabled:opacity-60"
            >
              {saving ? "Saving..." : "Confirm"}
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
