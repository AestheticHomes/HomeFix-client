"use client";
/**
 * ============================================================
 * File: /app/my-space/page.tsx
 * Version: v9.7 — HomeFix “MySpace Continuum Final” 🌗
 * ------------------------------------------------------------
 * ✅ Controlled by UniversalHeader (compact toggle)
 * ✅ No redundant toggles or nested SafeViewport conflicts
 * ✅ Clean, minimal, and future-safe
 * ✅ Auto-responds to ?view=bookings | ?view=orders
 * ============================================================
 */

import SafeViewport from "@/components/layout/SafeViewport";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import BookingsView from "./components/BookingsView";
import OrdersView from "./components/OrdersView";

export default function MySpacePage() {
  const params = useSearchParams();
  const view = (params.get("view") as "bookings" | "orders") || "bookings";

  return (
    <SafeViewport>
      {/* ✨ Background Aura (for depth consistency with header) */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_15%,rgba(56,189,248,0.06),transparent_65%)] dark:bg-[radial-gradient(circle_at_50%_15%,rgba(34,197,94,0.12),transparent_70%)]" />

      {/* 🪶 Content Zone */}
      <motion.div
        key={view}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.35 }}
        className="flex-1 flex flex-col items-center justify-start w-full px-3 sm:px-4 pb-20"
      >
        <div className="w-full max-w-5xl">
          {view === "bookings" ? <BookingsView /> : <OrdersView />}
        </div>
      </motion.div>
    </SafeViewport>
  );
}
