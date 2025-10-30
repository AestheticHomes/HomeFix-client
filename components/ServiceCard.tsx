/**
 * File: /components/ServiceCard.tsx
 * Purpose: Displays service info with hover motion and cart actions.
 * Removes: "Send Booking Email (Test)" button.
 */

"use client";
import { motion } from "framer-motion";

export default function ServiceCard({
  service,
  inCart,
  toggleCart,
}: {
  service: { title: string; description: string; price: number };
  inCart: boolean;
  toggleCart: () => void;
}) {
  return (
    <motion.div
      whileHover={{
        scale: 1.03,
        boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="rounded-xl border p-4 bg-white dark:bg-slate-800 flex flex-col justify-between"
    >
      <div>
        <h3 className="text-lg font-semibold">{service.title}</h3>
        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
          {service.description}
        </p>
        <p className="text-green-600 dark:text-green-400 font-semibold mt-2">
          ₹{service.price}
        </p>
      </div>
      <button
        onClick={toggleCart}
        className={`mt-4 px-4 py-2 rounded text-white ${
          inCart ? "bg-red-600" : "bg-green-600"
        }`}
      >
        {inCart ? "Remove from Cart" : "Add to Cart"}
      </button>
    </motion.div>
  );
}
