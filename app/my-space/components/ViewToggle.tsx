"use client";
import clsx from "clsx";
import { motion } from "framer-motion";

export default function ViewToggle({
  view,
  setView,
}: {
  view: "bookings" | "orders";
  setView: (v: "bookings" | "orders") => void;
}) {
  return (
    <div
      className="flex justify-center sm:justify-end gap-3 mt-4 mb-4"
      style={{
        paddingInline:
          "max(env(safe-area-inset-left),1rem) max(env(safe-area-inset-right),1rem)",
      }}
    >
      {[
        { key: "bookings", label: "Service Bookings" },
        { key: "orders", label: "Product Orders" },
      ].map((opt) => {
        const active = view === opt.key;
        return (
          <motion.button
            key={opt.key}
            onClick={() => setView(opt.key as any)}
            whileTap={{ scale: 0.95 }}
            className={clsx(
              "px-4 py-2 rounded-full text-sm font-medium border transition-all select-none",
              active
                ? "bg-gradient-to-r from-emerald-500 to-lime-400 text-white shadow-md border-transparent"
                : "border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800"
            )}
          >
            {opt.label}
          </motion.button>
        );
      })}
    </div>
  );
}
