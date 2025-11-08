"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wrench,
  Calendar,
  MapPin,
  Loader2,
  CheckCircle,
  Sun,
  Moon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserContext";
import { useCartStore } from "@/components/store/cartStore";
import { useTheme } from "next-themes";

const MapPicker = dynamic(() => import("@/components/MapPicker"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-48 rounded-xl bg-gray-100 dark:bg-slate-800 animate-pulse" />
  ),
});

interface Coordinates {
  lat: number;
  lng: number;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { items: cart, totalPrice, clearCart } = useCartStore();
  const { theme, setTheme } = useTheme();

  const [preferredDate, setPreferredDate] = useState("");
  const [preferredSlot, setPreferredSlot] = useState("");
  const [address, setAddress] = useState("");
  const [coords, setCoords] = useState<Coordinates>({ lat: 13.0827, lng: 80.2707 });
  const [selectedPro, setSelectedPro] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"info" | "success" | "error">("info");
  const [loading, setLoading] = useState(false);

  const hasProducts = cart.some((i) => i.type === "product");
  const hasServices = cart.some((i) => i.type === "service");
  const isFreeBooking = hasServices && !hasProducts;

  useEffect(() => {
    if (isLoaded && !user) {
      setMessage("Please log in to continue...");
      setTimeout(() => router.replace("/login"), 800);
    }
  }, [isLoaded, user, router]);

  const handleLocationChange = (loc: Coordinates, formatted: string) => {
    setCoords(loc);
    setAddress(formatted || "Selected location");
  };

  async function handleCheckout() {
    if (!user?.id) return setMessage("❌ Please log in first.");
    if (!address.trim()) return setMessage("📍 Please select a valid location.");
    if (!cart.length) return setMessage("🛒 Your cart is empty.");

    const payload = {
      user_id: user.id,
      type: hasProducts ? "product" : "service",
      services: cart.map((i) => ({
        name: i.title,
        price: i.price || 0,
        quantity: i.quantity || 1,
        billing_type: i.billing_type || "job",
      })),
      professional_service: hasProducts ? selectedPro : null,
      total: isFreeBooking ? 0 : totalPrice + (selectedPro ? 299 : 0),
      address,
      latitude: coords.lat,
      longitude: coords.lng,
      preferred_date: preferredDate || null,
      preferred_slot: preferredSlot || null,
      status: isFreeBooking ? "site-visit" : "upcoming",
    };

    setLoading(true);
    setMessage("🔄 Processing your booking...");
    setMessageType("info");

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
      } else throw new Error(data.error || "Booking creation failed");
    } catch (err) {
      console.error("❌ Checkout error:", err);
      setMessageType("error");
      setMessage("❌ Something went wrong during booking.");
    } finally {
      setLoading(false);
    }
  }

  if (!isLoaded || loading)
    return (
      <main className="flex justify-center items-center h-screen text-gray-500">
        <Loader2 className="animate-spin mr-2 w-5 h-5" />
        {isLoaded ? "Processing checkout..." : "Initializing session..."}
      </main>
    );

  if (!cart.length)
    return (
      <main className="flex flex-col items-center justify-center h-[80vh] text-gray-500">
        <Wrench className="w-8 h-8 mb-3 text-gray-400" />
        <p>Your cart is empty. Add services or products to continue.</p>
      </main>
    );

  return (
    <main
      className={`
        relative flex flex-col w-full
        sm:max-w-2xl mx-auto px-4 sm:px-6 pb-28
        min-h-screen transition-colors duration-500
        bg-gradient-to-b from-gray-50 via-gray-100 to-gray-200
        dark:from-[#0f0c29] dark:via-[#302b63] dark:to-[#24243e]
        text-gray-800 dark:text-gray-100
      `}
    >
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold mb-4 text-center sm:text-left"
      >
        {isFreeBooking ? "Book Free Site Visit" : "Checkout"}
      </motion.h2>

      {/* 📦 Main sections */}
      <section className="space-y-5 w-full">
        <Card title={hasProducts ? "Selected Products" : "Selected Services"} icon={<Wrench />}>
          {cart.map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-center border-b border-gray-200 dark:border-slate-700/50 last:border-none py-2 text-sm"
            >
              <span>{item.title}</span>
              <span className="font-medium text-green-600 dark:text-green-400">
                {item.price
                  ? `₹${item.price} ${item.unit ? `/ ${item.unit}` : ""}`
                  : "Free Site Visit"}
              </span>
            </div>
          ))}
        </Card>

        <Card title="Schedule" icon={<Calendar />}>
          <input
            type="date"
            min={new Date().toISOString().split("T")[0]}
            value={preferredDate}
            onChange={(e) => setPreferredDate(e.target.value)}
            className="w-full border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg p-2 mb-3 text-sm text-gray-800 dark:text-gray-100"
          />
          <div className="grid grid-cols-2 gap-2">
            {["9:00 AM", "1:00 PM", "5:00 PM", "7:00 PM"].map((slot) => (
              <button
                key={slot}
                onClick={() => setPreferredSlot(slot)}
                className={`px-3 py-2 rounded-lg text-sm border transition-all ${
                  preferredSlot === slot
                    ? "border-green-500 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                    : "border-gray-300 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800"
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
        </Card>

        <Card title={hasProducts ? "Delivery Location" : "Service Location"} icon={<MapPin />}>
          <div className="rounded-xl overflow-hidden border border-gray-300 dark:border-slate-700/60 h-[250px] sm:h-[300px]">
            <MapPicker initialLocation={coords} onLocationChange={handleLocationChange} />
          </div>
          <textarea
            className="w-full mt-3 p-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-gray-800 dark:text-gray-100"
            placeholder="Detected address (editable)"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </Card>

        {hasProducts && (
          <Card title="Professional Installation" icon={<Wrench />}>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {["Carpenter", "Plumber", "Installation Expert"].map((pro) => (
                <button
                  key={pro}
                  onClick={() => setSelectedPro(selectedPro === pro ? null : pro)}
                  className={`px-3 py-2 rounded-lg text-sm border transition ${
                    selectedPro === pro
                      ? "border-green-500 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                      : "border-gray-300 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800"
                  }`}
                >
                  {pro}
                </button>
              ))}
            </div>
            {selectedPro && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Installation fee: ₹299 added to total
              </p>
            )}
          </Card>
        )}
      </section>

      {/* ✅ Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-950/90 backdrop-blur-md border-t border-gray-200 dark:border-slate-800 px-5 py-3 flex justify-between items-center z-50 w-full sm:max-w-2xl mx-auto rounded-t-2xl shadow-lg">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
          <p className="text-lg font-semibold text-green-600 dark:text-green-400">
            ₹{(isFreeBooking ? 0 : totalPrice + (selectedPro ? 299 : 0)).toLocaleString()}
          </p>
        </div>
        <Button
          onClick={handleCheckout}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-5 sm:px-6 py-2 rounded-xl transition-colors duration-300"
        >
          {loading ? <Loader2 className="animate-spin w-5 h-5" /> : isFreeBooking ? "Book Visit" : "Confirm & Pay"}
        </Button>
      </div>

     
      {/* Toast */}
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
                ? "text-green-600 dark:text-green-400"
                : messageType === "error"
                ? "text-red-600 dark:text-red-400"
                : "text-gray-700 dark:text-gray-300"
            }`}
          >
            <div className="flex justify-center items-center gap-2">
              {messageType === "success" && <CheckCircle className="w-4 h-4" />}
              {message}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

/* ---------------------------- Card ---------------------------- */
function Card({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      layout
      className="
        w-full rounded-2xl border border-gray-200 dark:border-slate-800
        bg-white/80 dark:bg-slate-900/70
        backdrop-blur-sm shadow-md p-4 sm:p-5
        transition-colors duration-500
      "
    >
      <h3 className="font-semibold flex items-center gap-2 mb-3 text-base">
        {icon && <span className="text-green-600 dark:text-green-400">{icon}</span>}
        {title}
      </h3>
      {children}
    </motion.section>
  );
}
