"use client";
/**
 * File: /app/checkout/page.js
 * Version: v3.3 — HomeFix India Checkout 🌿
 * ------------------------------------------------------------
 * ✅ Uses global user context (isLoaded)
 * ✅ Hydration-safe with graceful fallback
 * ✅ Animated feedback for booking submission
 * ✅ Styled consistently with Aesthetic Homes brand
 */

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartContext";
import { useUser } from "@/contexts/UserContext";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
import { Wrench, Calendar, MapPin, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

// ✅ MapPicker client-only (no SSR mismatch)
const MapPicker = dynamic(() => import("@/components/MapPicker"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-48 rounded-xl bg-gray-100 dark:bg-slate-800 animate-pulse" />
  ),
});

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, total, clearCart } = useCart();
  const { user, isLoaded } = useUser();

  const [preferredDate, setPreferredDate] = useState("");
  const [preferredSlot, setPreferredSlot] = useState("");
  const [address, setAddress] = useState("");
  const [coords, setCoords] = useState({ lat: 13.0827, lng: 80.2707 });
  const [selectedPro, setSelectedPro] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [loading, setLoading] = useState(false);

  /* ✅ Redirect if not logged in */
  useEffect(() => {
    if (isLoaded && !user) {
      setMessage("Please log in to continue...");
      setTimeout(() => router.replace("/login"), 800);
    }
  }, [isLoaded, user, router]);

  /* ✅ Map selection handler */
  const handleLocationChange = (loc, formattedAddress) => {
    setCoords(loc);
    setAddress(formattedAddress || "Selected location");
  };

  /* ✅ Checkout logic */
  const handleCheckout = async () => {
    if (!user?.id) return setMessage("❌ Please log in first.");
    if (!address.trim()) return setMessage("📍 Please select a valid location.");
    if (cart.length === 0) return setMessage("🛒 Your cart is empty.");

    const payload = {
      user_id: user.id,
      services: cart.map((c) => ({
        name: c.name || "Service",
        price: Number(c.price) || 0,
        quantity: c.quantity || 1,
      })),
      professional_service: selectedPro,
      total: Number(total + (selectedPro ? 299 : 0)) || 0,
      address: address.trim(),
      latitude: coords?.lat,
      longitude: coords?.lng,
      preferred_date: preferredDate || null,
      preferred_slot: preferredSlot || null,
      status: "upcoming",
    };

    console.log("📤 [Checkout] Payload:", payload);
    setLoading(true);
    setMessageType("info");
    setMessage("🔄 Processing your booking...");

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMessageType("success");
        setMessage("🎉 Booking confirmed! Redirecting...");
        clearCart();
        setTimeout(() => router.push("/bookings"), 1500);
      } else {
        setMessageType("error");
        setMessage("❌ " + (data.error || "Failed to create booking."));
      }
    } catch (err) {
      console.error("❌ [Checkout] Error:", err);
      setMessageType("error");
      setMessage("❌ Server error during booking.");
    } finally {
      setLoading(false);
    }
  };

  /* 🧾 Empty Cart */
  if (isLoaded && (!cart || cart.length === 0))
    return (
      <main className="flex flex-col items-center justify-center h-[80vh] text-gray-500">
        <Wrench className="w-8 h-8 mb-3 text-gray-400" />
        <p>Your cart is empty. Add services to continue.</p>
      </main>
    );

  /* 🌀 Loader */
  if (!isLoaded || loading)
    return (
      <main className="flex justify-center items-center h-[80vh] text-gray-500">
        <Loader2 className="animate-spin mr-2 w-5 h-5" />
        {isLoaded ? "Processing checkout..." : "Initializing session..."}
      </main>
    );

  /* ✅ Main UI */
  return (
    <main className="max-w-5xl mx-auto p-6 pb-[100px] md:pb-6 space-y-6">
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold text-gray-800 dark:text-gray-100"
      >
        Checkout
      </motion.h2>

      {/* 🧾 Cart Summary */}
      <motion.div
        layout
        className="rounded-2xl border bg-white dark:bg-slate-800 shadow-sm p-4 space-y-2"
      >
        <h3 className="font-semibold flex items-center gap-2 text-lg mb-3">
          <Wrench className="w-5 h-5 text-green-600" /> Selected Services
        </h3>
        {cart.map((item, idx) => (
          <div
            key={idx}
            className="flex justify-between items-center border-b last:border-none py-2 text-sm"
          >
            <span>{item.name}</span>
            <span className="font-medium text-green-700 dark:text-green-300">
              ₹{item.price}
            </span>
          </div>
        ))}
      </motion.div>

      {/* 📅 Schedule Picker */}
      <section className="border rounded-2xl p-4 shadow-sm bg-white dark:bg-slate-800">
        <h3 className="font-semibold flex items-center gap-2 mb-3">
          <Calendar className="w-5 h-5 text-green-600" /> Schedule
        </h3>

        <input
          type="date"
          className="w-full border rounded-lg p-2 mb-3 dark:bg-slate-900 dark:border-slate-700"
          min={new Date().toISOString().split("T")[0]}
          value={preferredDate}
          onChange={(e) => setPreferredDate(e.target.value)}
        />

        <div className="grid grid-cols-2 gap-2">
          {["9:00 AM", "1:00 PM", "5:00 PM", "7:00 PM"].map((slot) => (
            <button
              key={slot}
              type="button"
              onClick={() => setPreferredSlot(slot)}
              className={`px-3 py-2 rounded-lg border text-sm transition ${
                preferredSlot === slot
                  ? "border-green-600 bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-200"
                  : "border-gray-300 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700"
              }`}
            >
              {slot}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          We’ll do our best to match your preferred timing.
        </p>
      </section>

      {/* 📍 Map & Address */}
      <section className="border rounded-2xl p-4 shadow-sm bg-white dark:bg-slate-800">
        <h3 className="font-semibold flex items-center gap-2 mb-3">
          <MapPin className="w-5 h-5 text-green-600" /> Service Location
        </h3>

        <div className="rounded-xl overflow-hidden border dark:border-slate-700">
          <MapPicker
            initialLocation={coords}
            onLocationChange={handleLocationChange}
          />
        </div>

        <textarea
          className="w-full mt-3 p-2 rounded-lg border dark:bg-slate-900 dark:border-slate-700 text-sm"
          placeholder="Detected address (you can edit if needed)"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
      </section>

      {/* 🧰 Professional Add-on */}
      <motion.div
        layout
        className="rounded-2xl border bg-white dark:bg-slate-800 shadow-sm p-4"
      >
        <h3 className="font-semibold flex items-center gap-2 mb-3">
          <Wrench className="w-5 h-5 text-green-600" /> Add-on: Professional Service
        </h3>

        <div className="grid sm:grid-cols-3 gap-3">
          {["Carpenter", "Plumber", "Installation Expert"].map((pro) => (
            <button
              key={pro}
              onClick={() => setSelectedPro(selectedPro === pro ? null : pro)}
              className={`border rounded-lg px-3 py-2 text-sm transition ${
                selectedPro === pro
                  ? "border-green-600 bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-200"
                  : "border-gray-300 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700"
              }`}
            >
              {pro}
            </button>
          ))}
        </div>
        {selectedPro && (
          <p className="text-xs text-gray-500 mt-2">
            Service fee: ₹299 (added to total)
          </p>
        )}
      </motion.div>

      {/* 💰 Final Total */}
      <div className="flex justify-between items-center text-lg font-semibold">
        <span>Total:</span>
        <span className="text-green-600 dark:text-green-400">
          ₹{(total + (selectedPro ? 299 : 0)).toLocaleString()}
        </span>
      </div>

      {/* ✅ Confirm Booking */}
      <Button
        onClick={handleCheckout}
        disabled={loading}
        className="w-full py-3 rounded-lg text-white font-semibold shadow transition bg-green-600 hover:bg-green-700 disabled:opacity-60"
      >
        {loading ? (
          <Loader2 className="animate-spin w-5 h-5 mx-auto" />
        ) : (
          "Confirm Booking"
        )}
      </Button>

      {/* ✅ Animated Toast */}
      <AnimatePresence>
        {message && (
          <motion.div
            key={message}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
            className={`mt-4 text-center text-sm font-medium ${
              messageType === "success"
                ? "text-green-600"
                : messageType === "error"
                ? "text-red-600"
                : "text-gray-700 dark:text-gray-300"
            }`}
          >
            <div className="flex justify-center items-center gap-2">
              {messageType === "success" && (
                <CheckCircle className="w-4 h-4 text-green-500" />
              )}
              {message}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
