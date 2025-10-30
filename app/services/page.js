"use client";
/**
 * File: /app/services/page.js
 * Purpose: (auto-added during Portable Cleanup) — add a concise, human-readable purpose for this file.
 * Process: Part of HomeFix portable refactor; no functional changes made by header.
 * Dependencies: Review local imports; ensure single supabase client in /lib when applicable.
 * Note: This header is documentation-only and safe to remove or edit.
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartContext";
import { ShoppingCart } from "lucide-react";
import { sendEmail } from "@/app/util/sendEmail"; // ✅ fixed folder path

export default function ServicesPage() {
  const router = useRouter();
  const { cart, addToCart, removeFromCart } = useCart();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Load service list once
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/services");
        const data = await res.json();
        setServices(data.services || []);
      } catch (err) {
        console.error("❌ Failed to load services:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ✅ Booking email handler
  async function handleBooking(service, user) {
    const emailPayload = {
      to: user.email,
      subject: "HomeFix Booking Confirmed",
      type: "booking",
      data: {
        name: user.name,
        service: service.name,
        date: new Date().toISOString().split("T")[0], // today's date
        slot: "10:00 AM",
      },
    };

    const result = await sendEmail(emailPayload);

    if (result.success) {
      console.log("✅ Booking confirmation email sent!");
      alert("Booking email sent successfully!");
    } else {
      console.error("❌ Email failed:", result.error);
      alert("Email sending failed. Check console for details.");
    }
  }

return (
  <main className="max-w-6xl mx-auto p-6 pb-[100px] md:pb-6">
    <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">
      Our Services
    </h1>

    {loading ? (
      <p className="text-gray-500">Loading...</p>
    ) : (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {services.map((service) => {
          const inCart = cart.some((item) => item.id === service.id);
          return (
            <motion.div
              key={service.id}
              whileHover={{ scale: 1.02 }}
              className="p-5 rounded-2xl border shadow-sm bg-white dark:bg-slate-800 dark:border-slate-700 transition-transform"
            >
              {/* 🧱 Service Details */}
              <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">
                {service.name}
              </h2>

              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-3">
                {service.description}
              </p>

              <p className="font-semibold text-green-600 dark:text-green-400">
                ₹{service.price}
              </p>

              {/* 🛒 Cart Buttons */}
              {inCart ? (
                <button
                  onClick={() => removeFromCart(service.id)}
                  className="mt-4 w-full py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium transition active:scale-[0.98]"
                >
                  Remove from Cart
                </button>
              ) : (
                <button
                  onClick={() => addToCart(service)}
                  className="mt-4 w-full py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white font-medium transition active:scale-[0.98]"
                >
                  Add to Cart
                </button>
              )}
            </motion.div>
          );
        })}
      </div>
    )}

      {/* ✅ Floating Cart Button */}
      {cart.length > 0 && (
        <motion.button
          onClick={() => router.push("/cart")}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-[90px] right-4 bg-green-600 text-white rounded-full shadow-lg px-4 py-3"
        >
          <ShoppingCart size={18} className="inline mr-2" />
          Go to Cart ({cart.length})
        </motion.button>
      )}
    </main>
  );
}