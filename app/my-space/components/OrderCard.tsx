"use client";
/**
 * OrderCard v1.1 — Edith Unified Aesthetic 🌗
 * ------------------------------------------------------------
 * ✅ Fits same grid as BookingCard
 * ✅ Shows date, amount, and invoice link
 * ✅ Subtle hover elevation
 * ============================================================
 */

import { format } from "date-fns";
import { motion } from "framer-motion";
import { ArrowUpRight, Calendar, FileText } from "lucide-react";

export default function OrderCard({ order }: { order: any }) {
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
      <div className="flex justify-between items-start mb-2">
        <h2 className="font-semibold text-base flex items-center gap-1">
          <FileText className="w-4 h-4" />
          Invoice #{order.id?.slice(0, 6)}
        </h2>
        <a
          href={order.invoice_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-emerald-600 dark:text-lime-400 hover:underline flex items-center gap-1"
        >
          View <ArrowUpRight className="w-3 h-3" />
        </a>
      </div>

      <div className="text-sm opacity-80 space-y-1">
        <p className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          {order.created_at
            ? format(new Date(order.created_at), "dd MMM yyyy")
            : "N/A"}
        </p>
        <p>Total: ₹{Number(order.total || 0).toLocaleString()}</p>
      </div>
    </motion.div>
  );
}
