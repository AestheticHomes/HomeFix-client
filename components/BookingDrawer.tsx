"use client";
/**
 * BookingDrawer v3.1 — Reschedule wired to Supabase Edge Function 🌿
 * -----------------------------------------------------------
 * ✅ Built on <BaseDrawer>
 * ✅ Safe-area + NavBar aware
 * ✅ Reschedule → supabase.functions.invoke('notify-booking-status')
 * ✅ Optimistic UI + validation + haptics
 */

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle,
  Clock,
  X,
} from "lucide-react";
import BaseDrawer from "@/components/BaseDrawer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";

interface Booking {
  id: string;
  title: string;
  date: string; // ISO yyyy-mm-dd
  slot: string; // e.g., "2 PM - 5 PM"
  status: "upcoming" | "awaiting" | "completed" | "cancelled";
  image_url?: string | null;
  price?: number;
}

interface BookingDrawerProps {
  open: boolean;
  onClose: () => void;
}
export default function BookingDrawer({ open, onClose }: BookingDrawerProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);

  // Reschedule modal state
  const [selected, setSelected] = useState<Booking | null>(null);
  const [newDate, setNewDate] = useState<string>("");
  const [newSlot, setNewSlot] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const buzz = (ok = true) => {
    try {
      navigator.vibrate?.(ok ? 30 : [80, 40, 80]);
    } catch {}
  };

  /* -----------------------------------------------------------
     🧠 Mock data (replace with real Supabase fetch)
     ----------------------------------------------------------- */
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setTimeout(() => {
      setBookings([
        {
          id: "bkg-101",
          title: "Wardrobe Installation",
          date: "2025-10-27",
          slot: "10 AM - 1 PM",
          status: "upcoming",
          image_url: "/images/wardrobe.jpg",
          price: 2499,
        },
        {
          id: "bkg-102",
          title: "Bathroom Tile Replacement",
          date: "2025-10-29",
          slot: "2 PM - 5 PM",
          status: "awaiting",
          image_url: "/images/tiles.jpg",
          price: 3799,
        },
      ]);
      setLoading(false);
    }, 600);
  }, [open]);

  const handleCancel = (id: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b))
    );
    buzz(false);
  };

  const handleReschedule = (booking: Booking) => {
    setSelected(booking);
    setNewDate(booking.date);
    setNewSlot(booking.slot);
  };

  /* -----------------------------------------------------------
     📨 Save Reschedule → Supabase Edge Function
     ----------------------------------------------------------- */
  const handleSaveReschedule = async () => {
    if (!selected) return;
    if (!newDate || !newSlot.trim()) {
      alert("Please choose a date and time slot.");
      buzz(false);
      return;
    }
    if (newDate === selected.date && newSlot.trim() === selected.slot.trim()) {
      alert("No changes detected.");
      return;
    }

    setSaving(true);
    try {
      // Call Edge Function: notify-booking-status
      const { data, error } = await supabase.functions.invoke(
        "notify-booking-status",
        {
          body: {
            action: "reschedule",
            bookingId: selected.id,
            date: newDate,
            slot: newSlot,
          },
        },
      );

      if (error) {
        console.error("Edge Function error:", error);
        alert("Failed to reschedule. Please try again.");
        buzz(false);
        return;
      }

      // Optional: You can inspect `data` for confirmation details
      // console.log("Edge Function response:", data);

      // Optimistic UI update
      setBookings((prev) =>
        prev.map((b) =>
          b.id === selected.id ? { ...b, date: newDate, slot: newSlot } : b
        )
      );

      setSelected(null);
      buzz(true);
      alert("✅ Booking rescheduled successfully!");
    } catch (e) {
      console.error(e);
      alert("Network error while rescheduling.");
      buzz(false);
    } finally {
      setSaving(false);
    }
  };

  /* -----------------------------------------------------------
     🎨 Render
     ----------------------------------------------------------- */
  return (
    <BaseDrawer open={open} onClose={onClose} side="bottom">
      <div className="p-6 sm:p-8">
        <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-green-500" /> My Bookings
        </h2>

        {/* Loading */}
        {loading && (
          <p className="text-center text-gray-500 dark:text-gray-400 py-10">
            Loading bookings...
          </p>
        )}

        {/* Empty */}
        {!loading && bookings.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <CalendarDays className="w-10 h-10 text-gray-400 mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No bookings yet.</p>
          </div>
        )}

        {/* Booking List */}
        <div className="space-y-3">
          {bookings.map((b) => (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 180, damping: 18 }}
              className="p-4 border border-gray-200 dark:border-slate-700 rounded-xl flex gap-3 items-center"
            >
              {/* Thumbnail */}
              <div className="w-16 h-16 flex-shrink-0 rounded overflow-hidden">
                {b.image_url
                  ? (
                    <img
                      src={b.image_url}
                      alt={b.title}
                      className="object-cover w-full h-full"
                    />
                  )
                  : (
                    <div className="bg-gray-100 dark:bg-slate-800 w-full h-full flex items-center justify-center text-gray-400 text-xs">
                      No Img
                    </div>
                  )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
                  {b.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {b.date} • {b.slot}
                </p>
                <p className="text-xs font-medium mt-1">
                  {b.status === "upcoming" && (
                    <span className="text-green-600 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Scheduled
                    </span>
                  )}
                  {b.status === "awaiting" && (
                    <span className="text-yellow-600 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Awaiting Confirmation
                    </span>
                  )}
                  {b.status === "cancelled" && (
                    <span className="text-red-600 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Cancelled
                    </span>
                  )}
                  {b.status === "completed" && (
                    <span className="text-emerald-600 flex items-center gap-1">
                      ✅ Completed
                    </span>
                  )}
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                {b.status === "upcoming" && (
                  <>
                    <Button
                      variant="outline"
                      className="text-xs py-1 px-2"
                      onClick={() => handleReschedule(b)}
                    >
                      Reschedule
                    </Button>
                    <Button
                      variant="ghost"
                      className="text-xs text-red-500 hover:text-red-700"
                      onClick={() => handleCancel(b.id)}
                    >
                      Cancel
                    </Button>
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Reschedule Modal */}
        <AnimatePresence>
          {selected && (
            <div className="fixed inset-0 bg-black/50 z-[10000] flex items-center justify-center">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", stiffness: 240, damping: 25 }}
                className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl max-w-md w-[90%]"
              >
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    Reschedule
                  </h3>
                  <button
                    onClick={() => setSelected(null)}
                    className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Change booking for <strong>{selected.title}</strong>
                </p>

                <label className="text-xs text-gray-600 dark:text-gray-400">
                  New Date
                </label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 mb-3 bg-transparent text-gray-900 dark:text-gray-100"
                />

                <label className="text-xs text-gray-600 dark:text-gray-400">
                  New Slot
                </label>
                <input
                  type="text"
                  placeholder="e.g., 2 PM - 5 PM"
                  value={newSlot}
                  onChange={(e) => setNewSlot(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 mb-4 bg-transparent text-gray-900 dark:text-gray-100"
                />

                <div className="flex gap-3">
                  <Button
                    className="flex-1"
                    onClick={handleSaveReschedule}
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSelected(null)}
                    className="flex-1"
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </BaseDrawer>
  );
}
