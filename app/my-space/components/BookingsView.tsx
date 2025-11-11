"use client";
/**
 * ============================================================
 * File: /app/my-space/components/BookingsView.tsx
 * Version: v10.2 — HomeFix “Gemini Harmony Polished” 🌗
 * ------------------------------------------------------------
 * ✅ Category bar pinned perfectly below UniversalHeader
 * ✅ Auto-fit pills (no horizontal scrollbar)
 * ✅ Restored booking actions: Reschedule / Cancel
 * ✅ Theme-driven aura + elevation
 * ✅ Fully fluid layout for all screen widths
 * ============================================================
 */

import { useUser } from "@/contexts/UserContext";
import clsx from "clsx";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Calendar, Clock, Loader2, Package } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const STATUS_TABS = [
  { key: "all", label: "All" },
  { key: "upcoming", label: "Upcoming" },
  { key: "in-progress", label: "In Progress" },
  { key: "rescheduled", label: "Rescheduled" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

export default function BookingsView() {
  const { user, isLoaded } = useUser();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  /* 🔥 Fetch Bookings */
  useEffect(() => {
    const cached =
      typeof window !== "undefined"
        ? JSON.parse(localStorage.getItem("user") || "null")
        : null;
    const userId = user?.id || cached?.id;
    if (!userId || !isLoaded) return;

    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/bookings/list?user_id=${userId}`);
        const json = await res.json();
        if (json.success) setBookings(json.bookings || []);
      } catch (err) {
        console.error("💥 Fetch error:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.id, isLoaded]);

  /* 🧩 Filters */
  const normalize = (s = "") => s.toLowerCase().replace(/\s+/g, "-").trim();

  const filtered = useMemo(() => {
    if (activeTab === "all") return bookings;
    return bookings.filter((b) => normalize(b.status) === activeTab);
  }, [bookings, activeTab]);

  const statusCounts = useMemo(() => {
    const map: Record<string, number> = {};
    bookings.forEach((b) => {
      const key = normalize(b.status);
      map[key] = (map[key] || 0) + 1;
    });
    map["all"] = bookings.length;
    return map;
  }, [bookings]);

  if (loading)
    return <CenteredScreen message="Fetching your bookings..." spinner />;

  /* ------------------------------------------------------------
     🌗 Unified Layout — Perfectly aligned category bar
  ------------------------------------------------------------ */
  return (
    <div className="relative flex flex-col items-center w-full transition-colors duration-500">
      {/* ✨ Aura Background (auto-adaptive) */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_20%,var(--aura-light,rgba(56,189,248,0.1)),transparent_70%)] dark:bg-[radial-gradient(circle_at_50%_20%,var(--aura-dark,rgba(34,197,94,0.15)),transparent_70%)]" />

      {/* 🧭 Category Bar — fits screen width, smaller pills */}
      <motion.div
        className="fixed left-0 right-0 z-[68] flex justify-center
                   backdrop-blur-xl bg-[var(--surface-elevated)]/80 dark:bg-[var(--surface-elevated-dark)]/80
                   border-b border-[var(--border-muted)]
                   shadow-[0_4px_14px_rgba(0,0,0,0.06)]
                   transition-all duration-300"
        style={{ top: "calc(var(--header-h) + 0.15rem)" }}
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="flex flex-wrap justify-center gap-1.5 py-2 px-3 max-w-[640px]">
          {STATUS_TABS.map((t) => {
            const active = activeTab === t.key;
            return (
              <motion.button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                whileTap={{ scale: 0.95 }}
                className={clsx(
                  "px-3 py-1 rounded-full text-xs sm:text-sm font-medium border transition-all duration-300",
                  active
                    ? "bg-[var(--accent-primary)] text-white shadow-[0_0_6px_rgba(16,185,129,0.4)] border-transparent"
                    : "border-[var(--border-muted)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]"
                )}
              >
                {t.label}
                {statusCounts[t.key] > 0 && (
                  <span className="ml-1 text-[10px] opacity-80">
                    {statusCounts[t.key]}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* 🪶 Booking Cards */}
      <motion.div
        key="grid"
        layout
        className="w-full max-w-[640px] px-3 sm:px-4 mt-[5rem] pb-28 grid gap-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35 }}
      >
        {filtered.length ? (
          filtered.map((b) => <BookingCard key={b.id} booking={b} />)
        ) : (
          <EmptyState />
        )}
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------
   🪞 Subcomponents
------------------------------------------------------------ */
function BookingCard({ booking }: any) {
  const services = Array.isArray(booking.services)
    ? booking.services
    : [booking.services];
  const statusColor =
    booking.status === "completed"
      ? "emerald"
      : booking.status === "cancelled"
      ? "rose"
      : "blue";

  return (
    <motion.div
      layout
      whileHover={{ y: -2, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 250, damping: 20 }}
      className={clsx(
        "relative p-5 rounded-2xl overflow-hidden border border-[var(--border-subtle)] backdrop-blur-md shadow-[0_2px_12px_rgba(0,0,0,0.08)]",
        "bg-[var(--surface-card)] dark:bg-[var(--surface-card-dark)]"
      )}
    >
      <span
        className={clsx(
          "absolute left-0 top-0 h-full w-[4px] rounded-l-2xl",
          `bg-${statusColor}-500`
        )}
      />
      <div className="flex justify-between items-center mb-2 flex-wrap">
        <h2 className="font-semibold text-base truncate pr-3">
          {services[0]?.name || "Service Booking"}
        </h2>
        <span
          className={clsx(
            "text-xs px-2 py-0.5 rounded-full border capitalize",
            `text-${statusColor}-400 border-${statusColor}-400/40 bg-${statusColor}-500/10`
          )}
        >
          {booking.status}
        </span>
      </div>

      <p className="text-sm flex items-center gap-1 opacity-80">
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

      <p className="text-sm flex items-center gap-1 mt-1 opacity-80">
        <Package className="w-4 h-4" />
        {booking.type === "product"
          ? `Quantity: ${booking.quantity}`
          : "Scheduled service"}
      </p>

      {/* 🔘 Action Buttons */}
      {["upcoming", "rescheduled"].includes(
        booking.status?.toLowerCase?.() || ""
      ) && (
        <div className="flex gap-2 mt-4">
          <button
            className="flex-1 py-1.5 text-xs rounded-lg border border-[var(--border-muted)] hover:bg-[var(--surface-hover)] transition"
            onClick={() => console.log("📅 Reschedule", booking.id)}
          >
            Reschedule
          </button>
          <button
            className="flex-1 py-1.5 text-xs rounded-lg bg-red-500/80 hover:bg-red-600 text-white transition"
            onClick={() => console.log("❌ Cancel", booking.id)}
          >
            Cancel
          </button>
        </div>
      )}

      <div className="flex justify-between items-end mt-3">
        <p className="font-semibold text-green-700 dark:text-green-400">
          ₹{Number(booking.total_price).toLocaleString()}
        </p>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------
   ⏳ Loading / Empty States
------------------------------------------------------------ */
function CenteredScreen({ message, spinner }: any) {
  return (
    <div className="flex justify-center items-center h-[70vh] flex-col text-[var(--text-secondary)]">
      {spinner && <Loader2 className="animate-spin mb-3 w-5 h-5" />}
      <p>{message}</p>
    </div>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center h-[55vh] text-[var(--text-secondary)]"
    >
      <Package className="w-12 h-12 mb-3 opacity-70" />
      <p>No bookings yet</p>
      <p className="text-xs opacity-70 mt-1">
        Start by exploring our services to book your first one ✨
      </p>
    </motion.div>
  );
}
