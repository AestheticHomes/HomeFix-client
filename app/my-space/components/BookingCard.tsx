"use client";
/**
 * BookingCard v1.2 — Edith SafeViewport Style 🌿
 * ------------------------------------------------------------
 * ✅ Compact card design that stays within responsive grid
 * ✅ Theme-aware shadows & surfaces
 * ✅ Safe for both mobile & desktop widths
 * ============================================================
 */

import { format } from "date-fns";
import { motion } from "framer-motion";
import { Calendar, Clock, Package } from "lucide-react";

export default function BookingCard({ booking }: { booking: any }) {
  const services = Array.isArray(booking.services)
    ? booking.services
    : [booking.services];

  return (
    <motion.div
      layout
      whileHover={{ scale: 1.01 }}
      transition={{ type: "spring", stiffness: 180, damping: 20 }}
      className="p-4 rounded-2xl border border-black/10 dark:border-white/10
                 bg-[var(--surface-card)] dark:bg-[var(--surface-card-dark)]
                 shadow-[0_2px_10px_rgba(0,0,0,0.05)] hover:shadow-[0_3px_14px_rgba(0,0,0,0.08)]
                 transition-all duration-400 flex flex-col justify-between"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <h2 className="font-semibold text-base leading-snug line-clamp-2">
          {services[0]?.name || "Service Booking"}
        </h2>
        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200/70 dark:bg-slate-700/70 text-gray-700 dark:text-gray-300 capitalize">
          {booking.status}
        </span>
      </div>

      {/* Details */}
      <div className="text-sm space-y-1 opacity-80">
        <p className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          {booking.preferred_date
            ? format(new Date(booking.preferred_date), "dd MMM yyyy")
            : "No date"}
        </p>
        {booking.preferred_slot && (
          <p className="flex items-center gap-1">
            <Clock className="w-4 h-4" /> {booking.preferred_slot}
          </p>
        )}
        <p className="flex items-center gap-1">
          <Package className="w-4 h-4" />{" "}
          {booking.type === "product"
            ? `Quantity: ${booking.quantity}`
            : "Scheduled service"}
        </p>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-100 dark:border-slate-800">
        <p className="font-semibold text-green-700 dark:text-green-400">
          ₹{Number(booking.total_price || 0).toLocaleString()}
        </p>
      </div>
    </motion.div>
  );
}
