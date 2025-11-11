"use client";
/**
 * ============================================================
 * HomeFix Checkout — Edith Continuum v9.1 🌗
 * ------------------------------------------------------------
 * ✅ Schedule hidden automatically for product-only checkouts
 * ✅ MapPicker confirmation flow stable
 * ✅ Clean layout, spacing, and transition consistency
 * ============================================================
 */

import { useOfflineLedger } from "@/components/hooks/useOfflineLedger";
import { useCartStore } from "@/components/store/cartStore";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserContext";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, Loader2, Wrench } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const MapPicker = dynamic(() => import("@/components/MapPicker"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-48 rounded-xl bg-[var(--edith-surface-hover)] animate-pulse" />
  ),
});

interface Coordinates {
  lat: number;
  lng: number;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { items, totalPrice, clearCart } = useCartStore();
  const { addOrder, updateOrder, syncPaidOrders, online } = useOfflineLedger();

  const [ready, setReady] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState<"info" | "success" | "error">("info");
  const [loading, setLoading] = useState(false);

  // 🗺️ Location states
  const [coords, setCoords] = useState<Coordinates>({
    lat: 13.0827,
    lng: 80.2707,
  });
  const [liveAddress, setLiveAddress] = useState("");
  const [confirmedAddress, setConfirmedAddress] = useState("");

  // 🕓 Schedule + Delivery
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredSlot, setPreferredSlot] = useState("");
  const [landmark, setLandmark] = useState("");

  // 👤 Receiver
  const [receiverName, setReceiverName] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [sameAsUser, setSameAsUser] = useState(false);

  const hasProducts = items.some((i) => i.type === "product");
  const hasServices = items.some((i) => i.type === "service");
  const isFreeBooking = hasServices && !hasProducts;
  const total = isFreeBooking ? 0 : totalPrice;

  useEffect(() => {
    if (isLoaded) setReady(true);
  }, [isLoaded]);

  // Prefill user data when "I will receive it myself" checked
  useEffect(() => {
    if (!sameAsUser) return;
    const cached = user || JSON.parse(localStorage.getItem("user") || "null");
    if (cached) {
      setReceiverName(cached.name || "");
      setReceiverPhone(cached.phone || "");
    }
  }, [sameAsUser, user]);

  const canSubmit = useMemo(() => {
    const addr = confirmedAddress || liveAddress;
    if (!addr) return false;
    if (hasProducts && !receiverPhone) return false;
    return true;
  }, [confirmedAddress, liveAddress, hasProducts, receiverPhone]);

  /* ------------------------------------------------------------
     💳 Checkout Flow
  ------------------------------------------------------------ */
  async function handleCheckout() {
    if (!user?.id) return setToast("❌ Please log in first.", "error");
    if (!canSubmit)
      return setToast("📍 Please confirm your delivery location.", "error");
    if (!items.length) return setToast("🛒 Cart is empty.", "error");

    const finalAddress = confirmedAddress || liveAddress;
    const baseOrder = {
      user_id: user.id,
      items,
      address: finalAddress,
      landmark,
      latitude: coords.lat,
      longitude: coords.lng,
      preferred_date: hasServices ? preferredDate || null : null,
      preferred_slot: hasServices ? preferredSlot || null : null,
      receiver_name: hasProducts ? receiverName : null,
      receiver_phone: hasProducts ? receiverPhone : null,
      total,
      status: isFreeBooking ? "site-visit" : "pending",
      created_at: new Date().toISOString(),
      payment: {
        mode: "upi",
        gateway: "Razorpay",
        amount: total,
        status: "initiated",
      },
    };

    const localId = addOrder(baseOrder);
    setLoading(true);
    setToast("🔄 Processing booking...", "info");

    setTimeout(async () => {
      const success = Math.random() > 0.25;
      if (success) {
        updateOrder(localId, {
          payment: {
            gateway: "Razorpay",
            status: "success",
            txn_id: `TXN-${Date.now()}`,
          },
          status: "paid",
        });
        setToast("🎉 Payment successful! Syncing...", "success");
        if (online) await syncPaidOrders();
        clearCart();
        setTimeout(() => router.push("/my-space"), 1500);
      } else {
        updateOrder(localId, {
          payment: { gateway: "Razorpay", status: "failed" },
          status: "failed",
        });
        setToast("⚠️ Payment failed — saved for retry.", "error");
      }
      setLoading(false);
    }, 1200);
  }

  function setToast(text: string, type: "info" | "success" | "error") {
    setMsg(text);
    setMsgType(type);
  }

  /* ------------------------------------------------------------
     🧭 Conditional UI
  ------------------------------------------------------------ */
  if (!ready)
    return (
      <main className="flex justify-center items-center h-screen text-[var(--text-secondary)]">
        <Loader2 className="animate-spin w-5 h-5 mr-2" /> Loading checkout…
      </main>
    );

  if (!items.length)
    return (
      <main className="flex flex-col items-center justify-center h-[80vh] text-[var(--text-secondary)]">
        <Wrench className="w-8 h-8 mb-3 opacity-60" />
        <p>Your cart is empty. Add items to continue.</p>
        <Button onClick={() => router.push("/store")} className="mt-4">
          Shop Now
        </Button>
      </main>
    );

  /* ------------------------------------------------------------
     🎨 Main Checkout UI
  ------------------------------------------------------------ */
  return (
    <main
      id="checkout-safe"
      className="flex flex-col w-full sm:max-w-2xl mx-auto px-4 sm:px-6 pb-28
                 min-h-[calc(100vh-140px)] safe-area-content"
    >
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold mb-4 text-center sm:text-left"
      >
        {isFreeBooking ? "Book Free Site Visit" : "Checkout"}
      </motion.h2>

      {/* 🧾 Order Summary */}
      <EdithCard
        title={hasProducts ? "Selected Products" : "Selected Services"}
      >
        {items.map((i) => (
          <div
            key={i.id}
            className="flex justify-between items-center border-b border-[var(--edith-border)] last:border-none py-2 text-sm"
          >
            <span>{i.title}</span>
            <span className="font-medium text-[var(--accent-success)]">
              {i.price ? `₹${i.price}` : "Free"}
            </span>
          </div>
        ))}
      </EdithCard>

      {/* 🗓 Schedule — visible only for service checkouts */}
      {hasServices && (
        <EdithCard title="Schedule">
          <input
            type="date"
            min={new Date().toISOString().split("T")[0]}
            value={preferredDate}
            onChange={(e) => setPreferredDate(e.target.value)}
            className="w-full border border-[var(--edith-border)] bg-[var(--edith-surface)]
                       rounded-lg p-2 mb-3 text-sm focus:ring-2 focus:ring-[var(--edith-primary)]"
          />
          <div className="grid grid-cols-2 gap-4">
            {["9:00 AM", "1:00 PM", "5:00 PM", "7:00 PM"].map((slot) => (
              <button
                key={slot}
                onClick={() => setPreferredSlot(slot)}
                className={`px-3 py-2 rounded-lg text-sm border transition-all ${
                  preferredSlot === slot
                    ? "border-[var(--accent-success)] bg-[var(--accent-success)]/10 text-[var(--accent-success)]"
                    : "border-[var(--edith-border)] hover:bg-[var(--edith-surface-hover)]"
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
        </EdithCard>
      )}

      {/* 🚚 Delivery / Service Location */}
      <EdithCard title={hasProducts ? "Delivery Details" : "Service Location"}>
        {/* 🗺️ MapPicker */}
        <div
          className="relative h-[340px] sm:h-[360px] mb-10 pt-2 pb-6 overflow-visible z-[10] border-b 
               border-[var(--edith-border)]"
        >
          <MapPicker
            initialLocation={coords}
            onLocationChange={(
              loc: { lat: number; lng: number },
              addr: string,
              confirmed?: boolean
            ) => {
              setCoords(loc);
              if (!confirmed) setLiveAddress(addr || "");
              if (confirmed) setConfirmedAddress(addr || "");
            }}
            editable={true}
          />
        </div>

        {/* 👤 Receiver Info for Product Orders */}
        {hasProducts && (
          <div className="pt-20 mt-3 space-y-2">
            <div>
              <label className="block text-sm font-medium mb-2 text-[var(--text-secondary)]">
                Receiver Name
              </label>
              <input
                type="text"
                className="w-full p-2 rounded-lg border border-[var(--edith-border)]
                         bg-[var(--edith-surface)] text-sm"
                placeholder="Full name"
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">
                Receiver Phone
              </label>
              <input
                type="tel"
                inputMode="numeric"
                className="w-full p-2 rounded-lg border border-[var(--edith-border)]
                         bg-[var(--edith-surface)] text-sm"
                placeholder="10-digit phone"
                value={receiverPhone}
                onChange={(e) => setReceiverPhone(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">
                Landmark / Flat No.
              </label>
              <input
                type="text"
                className="w-full p-2 rounded-lg border border-[var(--edith-border)]
                         bg-[var(--edith-surface)] text-sm"
                placeholder="E.g., Opposite ABC Store, Flat 2B"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
              />
            </div>

            <label className="flex items-center gap-2 mt-2 text-sm text-[var(--text-secondary)]">
              <input
                type="checkbox"
                checked={sameAsUser}
                onChange={(e) => setSameAsUser(e.target.checked)}
              />
              I will receive it myself
            </label>

            {/* 🏠 Confirmed Address */}
            {confirmedAddress && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="mt-5 border-t border-[var(--edith-border)] pt-3"
              >
                <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">
                  Delivery Address
                </label>
                <textarea
                  readOnly
                  className="w-full p-2 rounded-lg border border-emerald-600/60
                           bg-emerald-900/10 text-sm font-medium text-[var(--text-primary)]
                           shadow-md ring-1 ring-emerald-500/30 focus:outline-none
                           transition-all duration-300"
                  value={confirmedAddress}
                />
              </motion.div>
            )}
          </div>
        )}
      </EdithCard>

      {/* 🧮 Footer */}
      <footer
        className="checkout-footer fixed bottom-0 left-0 right-0 z-50 flex justify-between items-center px-5 py-4
                   w-full sm:max-w-2xl mx-auto rounded-t-2xl bg-[var(--edith-surface)]
                   border-t border-[var(--edith-border)] backdrop-blur-md"
      >
        <div>
          <p className="text-sm text-[var(--text-secondary)]">
            {hasProducts ? "Total (Delivery)" : "Total (Visit Booking)"}
          </p>
          <p className="text-lg font-semibold text-[var(--accent-success)]">
            ₹{total.toLocaleString()}
          </p>
        </div>
        <Button
          onClick={handleCheckout}
          disabled={loading || !canSubmit}
          className="font-semibold px-5 sm:px-6 py-2 rounded-xl"
        >
          {loading ? (
            <Loader2 className="animate-spin w-5 h-5" />
          ) : isFreeBooking ? (
            "Book Visit"
          ) : (
            "Confirm & Pay"
          )}
        </Button>
      </footer>

      {/* 🪶 Toast Feedback */}
      <AnimatePresence>
        {msg && (
          <motion.div
            key={msg}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
            className={`fixed bottom-28 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl shadow-lg text-sm
                       ${
                         msgType === "success"
                           ? "bg-green-600 text-white"
                           : msgType === "error"
                           ? "bg-red-600 text-white"
                           : "bg-gray-700 text-white"
                       }`}
          >
            <div className="flex justify-center items-center gap-2">
              {msgType === "success" && <CheckCircle className="w-4 h-4" />}
              {msg}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🌐 Online Indicator */}
      <div className="fixed bottom-5 left-5 text-xs text-[var(--text-secondary)]">
        {online ? "🟢 Online" : "🔴 Offline mode"}
      </div>
    </main>
  );
}

/* ------------------------------------------------------------
   🧱 EdithCard Component
------------------------------------------------------------ */
function EdithCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      layout
      className="checkout-card relative overflow-visible z-[5] p-4 sm:p-5 rounded-xl border border-[var(--edith-border)]
                 bg-[var(--edith-surface)] shadow-[0_4px_20px_rgba(0,0,0,0.05)]
                 dark:shadow-[0_4px_20px_rgba(255,255,255,0.05)]
                 transition-all duration-500"
    >
      <h3 className="font-semibold mb-3 text-base text-[var(--text-primary)]">
        {title}
      </h3>
      {children}
    </motion.section>
  );
}
