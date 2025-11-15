"use client";

/**
 * ============================================================
 * 🪶 HomeFix Checkout — Edith Continuum v12.3 (Refactored)
 * ------------------------------------------------------------
 * ✅ Legacy MapPicker compatible (no apiKey prop)
 * ✅ Fixed all template literals, JSX, imports
 * ✅ 100% build-safe
 * ============================================================
 */

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import SafeViewport from "@/components/layout/SafeViewport";
import { useLedgerX } from "@/components/ledgerx/useLedgerX";
import type { Coordinates } from "@/components/MapPicker";
import {
  type CartItem,
  useProductCartStore,
  useServiceCartStore,
} from "@/components/store/cartStore";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserContext";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, Loader2, MapPin, WifiOff, Wrench } from "lucide-react";
import { nanoid } from "nanoid";
import NextDynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { ChangeEventHandler, useEffect, useMemo, useState } from "react";
type Item = CartItem;

const MapPicker = NextDynamic(() => import("@/components/MapPicker"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[320px] rounded-xl bg-[var(--edith-surface-hover)] animate-pulse" />
  ),
});

interface ToastMessage {
  text: string;
  type: "info" | "success" | "error";
}

interface InputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "tel";
  disabled?: boolean;
}

interface CardProps {
  title: string;
  children: React.ReactNode;
}

/* =================================================================== */
/* MAIN CHECKOUT PAGE */
/* =================================================================== */

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const { addEntry } = useLedgerX();

  const productItems = useProductCartStore((s) => s.items);
  const productTotalPrice = useProductCartStore((s) => s.totalPrice);

  const serviceItems = useServiceCartStore((s) => s.items);
  const serviceTotalPrice = useServiceCartStore((s) => s.totalPrice);

  const forcedServiceMode = searchParams?.get("type") === "service";
  const checkoutMode: "product" | "service" =
    forcedServiceMode || (serviceItems.length && !productItems.length)
      ? "service"
      : "product";

  const items = checkoutMode === "service" ? serviceItems : productItems;
  const cartTotalPrice =
    checkoutMode === "service" ? serviceTotalPrice : productTotalPrice;
  const hasProducts = checkoutMode === "product";
  const hasServices = checkoutMode === "service";
  const total = hasServices ? 0 : cartTotalPrice;
  const payableLabel = hasProducts
    ? "Total (Delivery)"
    : "Booking (no upfront charge)";
  const buttonLabel = hasProducts ? "Confirm & Pay" : "Confirm Visit";

  /* STATE */
  const [coords, setCoords] = useState<Coordinates>({
    lat: 13.0827,
    lng: 80.2707 /*  */,
  });

  const [liveAddress, setLiveAddress] = useState("");
  const [confirmedAddress, setConfirmedAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [sameAsUser, setSameAsUser] = useState(false);
  const [serviceContactName, setServiceContactName] = useState("");
  const [serviceContactPhone, setServiceContactPhone] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredSlot, setPreferredSlot] = useState("09:00 - 12:00");
  const [projectNotes, setProjectNotes] = useState("");

  const [online, setOnline] = useState(true);
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState<ToastMessage | null>(null);
  const [uid, setUid] = useState<string | null>(null);

  const createToast = (text: string, type: ToastMessage["type"]) => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3000);
  };

  /* UID RESOLUTION */
  useEffect(() => {
    const determineUid = () => {
      const cachedUser = localStorage.getItem("user");
      let determinedUid: string | null = null;

      if (user?.id) {
        determinedUid = user.id;
      } else if (cachedUser) {
        try {
          const parsed = JSON.parse(cachedUser);
          determinedUid = parsed?.id || null;
        } catch {
          determinedUid = null;
        }
      }

      if (!determinedUid) {
        const guest =
          localStorage.getItem("hf_guest_id") || `guest-${nanoid(10)}`;
        localStorage.setItem("hf_guest_id", guest);
        determinedUid = guest;
      }

      setUid(determinedUid);
    };

    determineUid();
  }, [user]);

  /* Autofill */
  useEffect(() => {
    const u =
      user ||
      JSON.parse(localStorage.getItem("user") || "null") ||
      JSON.parse(sessionStorage.getItem("user") || "null");

    if (sameAsUser && u) {
      setReceiverName(u.name || "");
      setReceiverPhone(u.phone || "");
    }
  }, [sameAsUser, user]);

  useEffect(() => {
    if (user?.name && !serviceContactName) {
      setServiceContactName(user.name);
    }
    if (user?.phone && !serviceContactPhone) {
      setServiceContactPhone(user.phone);
    }
  }, [user?.name, user?.phone, serviceContactName, serviceContactPhone]);

  /* ONLINE WATCHER */
  useEffect(() => {
    const updateOnline = () => setOnline(navigator.onLine);
    updateOnline();
    window.addEventListener("online", updateOnline);
    window.addEventListener("offline", updateOnline);
    return () => {
      window.removeEventListener("online", updateOnline);
      window.removeEventListener("offline", updateOnline);
    };
  }, []);

  /* VALIDATION */
  const canSubmit = useMemo(() => {
    const addr = confirmedAddress || liveAddress;
    if (!addr) return false;
    if (!online) return false;
    if (hasProducts && !receiverPhone) return false;
    if (hasServices && (!serviceContactPhone || !preferredDate)) return false;

    return items.length > 0;
  }, [
    confirmedAddress,
    liveAddress,
    receiverPhone,
    serviceContactPhone,
    preferredDate,
    online,
    hasProducts,
    hasServices,
    items,
  ]);

  /* HANDLE CHECKOUT */
  async function handleCheckout() {
    if (!canSubmit) {
      return createToast(
        !online
          ? "⚠️ You are offline. Please reconnect."
          : "📍 Please confirm your location.",
        "error"
      );
    }

    setLoading(true);
    createToast(
      hasServices ? "Booking your service visit..." : "Redirecting to payment...",
      "info"
    );

    const basePayload: Record<string, any> = {
      user_id: uid,
      type: checkoutMode,
      items,
      total,
      address: confirmedAddress || liveAddress,
      landmark,
      latitude: coords.lat,
      longitude: coords.lng,
      status: "pending",
      created_at: new Date().toISOString(),
    };

    if (hasProducts) {
      basePayload.receiver_name = receiverName;
      basePayload.receiver_phone = receiverPhone;
      basePayload.store_fulfillment = {
        receiver_name: receiverName,
        receiver_phone: receiverPhone,
        same_as_user: sameAsUser,
        address: confirmedAddress || liveAddress,
        landmark,
      };
      basePayload.payment = {
        mode: "upi",
        gateway: "Razorpay",
        status: "initiated",
      };
    } else {
      basePayload.receiver_name = serviceContactName;
      basePayload.receiver_phone = serviceContactPhone;
      basePayload.visit_fee = 200;
      basePayload.visit_fee_waived = false;
      basePayload.service_preferences = {
        contact_name: serviceContactName,
        contact_phone: serviceContactPhone,
        preferred_date: preferredDate,
        preferred_slot: preferredSlot,
        notes: projectNotes,
      };
      basePayload.payment = {
        mode: "visit_fee",
        gateway: "BookNowPayLater",
        status: "pending",
      };
    }

    try {
      const result = await addEntry(
        uid ?? "guest",
        hasServices ? "service-booking" : "checkout-pending",
        basePayload
      );
      if (result?.id) {
        localStorage.setItem("hf_pending_order_id", result.id);
      }

      sessionStorage.setItem(
        "hf_checkout_payload",
        JSON.stringify({
          uid: uid ?? "guest",
          payload: basePayload,
          type: checkoutMode,
        })
      );

      if (hasProducts) {
        localStorage.setItem("last_checkout_total", String(total));
      }
    } catch (err) {
      console.error("Pending ledger entry failed", err);
      // continue anyway
    }

    await new Promise((r) => setTimeout(r, 900));
    sessionStorage.setItem("checkoutInitiated", "true");

    router.push(`/mockrazorpay?type=${checkoutMode}`);
  }

  /* EMPTY CART */
  if (!items.length)
    return (
      <SafeViewport>
        <div className="flex flex-col items-center justify-center h-[70vh] text-[var(--text-secondary)]">
          <Wrench className="w-8 h-8 mb-3 opacity-60" />
          <p>Your cart is empty. Add items to continue.</p>
          <Button
            onClick={() =>
              router.push(hasProducts ? "/store" : "/services")
            }
            className="mt-4"
          >
            {hasProducts ? "Shop Now" : "Browse Services"}
          </Button>
        </div>
      </SafeViewport>
    );

  /* RENDER */
  return (
    <SafeViewport>
      <main className="flex flex-col w-full sm:max-w-2xl mx-auto px-4 sm:px-6 pb-28 min-h-[calc(100vh-120px)]">
        {!online && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2 py-2 mb-3 rounded-lg bg-red-500/10 border border-red-500/40 text-red-600 text-sm"
          >
            <WifiOff className="w-4 h-4" />
            You’re offline — checkout disabled
          </motion.div>
        )}

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold mb-4 text-center sm:text-left"
        >
          {hasServices && !hasProducts ? "Book Free Site Visit" : "Checkout"}
        </motion.h2>

        {/* CART ITEMS */}
        {hasServices && (
          <Card title={hasProducts ? "Service Bookings" : "Selected Services"}>
            {serviceItems.map((i) => (
              <div
                key={`svc-${i.id}`}
                className="flex justify-between items-center border-b border-[var(--edith-border)] last:border-none py-2 text-sm"
              >
                <div className="flex flex-col">
                  <span className="font-semibold">{i.title}</span>
                  <span className="text-xs text-[var(--text-secondary)]">
                    {i.quantity} slot{i.quantity > 1 ? "s" : ""} · {i.unit || i.category || "On-site"}
                  </span>
                </div>
                <span className="font-medium text-[var(--accent-success)] text-right">
                  {i.price
                    ? `Est. ?${(i.price * i.quantity).toLocaleString()}`
                    : "To be quoted"}
                </span>
              </div>
            ))}
            <p className="text-xs text-amber-600 font-medium mt-3">
              Visit Charge: ?200 — Free if you confirm the service. You only pay when you decline the job.
            </p>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Service visits are scheduled after we confirm your preferred slot.
              Billing happens only after you approve the quotation.
            </p>
          </Card>
        )}
        {hasProducts && (
          <Card title={hasServices ? "Store Deliveries" : "Selected Products"}>
            {productItems.map((i) => {
              const lineTotal = (i.price || 0) * i.quantity;
              return (
                <div
                  key={`prod-${i.id}`}
                  className="flex justify-between items-center border-b border-[var(--edith-border)] last:border-none py-2 text-sm"
                >
                  <div className="flex flex-col">
                    <span className="font-semibold">{i.title}</span>
                    <span className="text-xs text-[var(--text-secondary)]">
                      {i.quantity} x ?{(i.price || 0).toLocaleString()}
                    </span>
                  </div>
                  <span className="font-medium text-[var(--accent-success)]">
                    ?{lineTotal.toLocaleString()}
                  </span>
                </div>
              );
            })}
            {!hasServices && <InstallationSuggestion />}
          </Card>
        )}
        {/* LOCATION PICKER */}
        <Card title={hasProducts ? "Delivery Details" : "Service Location"}>
          {hasServices && (
            <div className="mb-3 rounded-xl border border-amber-400/50 bg-amber-50 text-amber-700 text-xs px-4 py-3">
              Visit Charge: ?200 — Free if you confirm the service. Charged only
              if you cancel after the site visit or decline the quotation.
            </div>
          )}
          <div className="relative h-[340px] mb-6 overflow-hidden rounded-xl border border-[var(--edith-border)]">
            <MapPicker
              initialLocation={coords}
              editable
              onLocationChange={(loc, addr, confirmed) => {
                if (loc) setCoords(loc);
                const safe = addr ?? "";
                if (!!confirmed) setConfirmedAddress(safe);
                else setLiveAddress(safe);
              }}
            />
          </div>

          {/* ADDRESS STRIP */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div
              className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium truncate ${
                confirmedAddress
                  ? "bg-emerald-900/10 border border-emerald-600/50"
                  : "bg-[var(--edith-surface)] border border-[var(--edith-border)]"
              }`}
            >
              {confirmedAddress ||
                liveAddress ||
                "📍 Move map to select location"}
            </div>

            <button
              onClick={() => {
                if (liveAddress) {
                  setConfirmedAddress(liveAddress);
                  createToast("Location confirmed", "success");
                  navigator.vibrate?.([15, 30]);
                } else {
                  createToast("Move map to select address", "error");
                }
              }}
              className={`relative whitespace-nowrap px-6 py-2.5 rounded-xl font-semibold text-white transition-all duration-500 ${
                confirmedAddress
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-gradient-to-r from-fuchsia-500 via-indigo-500 to-cyan-400 hover:from-fuchsia-600 hover:to-indigo-600 shadow-[0_0_16px_rgba(147,51,234,0.5)]"
              }`}
            >
              {confirmedAddress ? "Confirmed ✓" : "Confirm Location"}
            </button>
          </div>

          {/* CONFIRMED ADDRESS DISPLAY */}
          {hasProducts && confirmedAddress && (
            <div className="mb-6 border border-emerald-600/40 bg-emerald-900/5 rounded-xl p-3 shadow-sm">
              <label className="block text-xs font-semibold text-emerald-700 mb-1">
                Confirmed Delivery Address
              </label>
              <div className="flex items-start text-sm text-[var(--text-primary)] font-medium leading-relaxed">
                <MapPin className="inline-block w-4 h-4 mr-2 mt-0.5 text-emerald-600 flex-shrink-0" />
                <span>{confirmedAddress}</span>
              </div>
              {landmark && (
                <p className="text-xs mt-1 text-[var(--text-secondary)] italic">
                  Landmark: {landmark}
                </p>
              )}
            </div>
          )}

          {/* RECEIVER INFO */}
          {hasProducts && (
            <div className="space-y-3 relative z-[2]">
              <Input
                label="Receiver Name"
                value={receiverName}
                onChange={setReceiverName}
                disabled={sameAsUser}
              />

              <Input
                label="Receiver Phone"
                value={receiverPhone}
                onChange={setReceiverPhone}
                type="tel"
                disabled={sameAsUser}
              />

              <Input
                label="Landmark / Flat No."
                value={landmark}
                onChange={setLandmark}
              />

              <label className="flex items-center gap-2 mt-2 text-sm text-[var(--text-secondary)]">
                <input
                  type="checkbox"
                  checked={sameAsUser}
                  onChange={(e) => setSameAsUser(e.target.checked)}
                />
                I will receive it myself {user?.name ? `(as ${user.name})` : ""}
              </label>
            </div>
          )}

          {hasServices && (
            <div className="mt-6 space-y-3">
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                Visit Preferences
              </p>
              <Input
                label="On-site Contact Name"
                value={serviceContactName}
                onChange={setServiceContactName}
              />
              <Input
                label="On-site Contact Phone"
                value={serviceContactPhone}
                onChange={setServiceContactPhone}
                type="tel"
              />

              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--text-secondary)]">
                  Preferred Visit Date
                </label>
                <input
                  type="date"
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="w-full p-2 rounded-lg border border-[var(--edith-border)] bg-[var(--edith-surface)] text-sm focus:ring-2 focus:ring-[var(--edith-primary)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--text-secondary)]">
                  Preferred Time Slot
                </label>
                <select
                  value={preferredSlot}
                  onChange={(e) => setPreferredSlot(e.target.value)}
                  className="w-full p-2 rounded-lg border border-[var(--edith-border)] bg-[var(--edith-surface)] text-sm focus:ring-2 focus:ring-[var(--edith-primary)]"
                >
                  <option value="09:00 - 12:00">Morning (9am - 12pm)</option>
                  <option value="12:00 - 15:00">Midday (12pm - 3pm)</option>
                  <option value="15:00 - 18:00">Evening (3pm - 6pm)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--text-secondary)]">
                  Project Notes / Access Info
                </label>
                <textarea
                  value={projectNotes}
                  onChange={(e) => setProjectNotes(e.target.value)}
                  rows={3}
                  placeholder="Share requirements, parking info, or gate access details"
                  className="w-full p-3 rounded-lg border border-[var(--edith-border)] bg-[var(--edith-surface)] text-sm focus:ring-2 focus:ring-[var(--edith-primary)] resize-none"
                />
              </div>
            </div>
          )}
        </Card>

        {/* FOOTER */}
        <footer className="fixed bottom-0 left-0 right-0 z-50 flex justify-between items-center px-5 py-4 w-full sm:max-w-2xl mx-auto rounded-t-2xl bg-[var(--edith-surface)] border-t border-[var(--edith-border)] backdrop-blur-md">
          <div>
            <p className="text-sm text-[var(--text-secondary)]">
              {payableLabel}
            </p>
            <p className="text-lg font-semibold text-[var(--accent-success)]">
              ?{(hasProducts ? total : 0).toLocaleString()}
            </p>
            {hasServices && (
              <p className="text-[11px] text-[var(--text-secondary)] mt-1">
                Services move ahead once you approve the quotation.
              </p>
            )}
          </div>

          <Button
            onClick={handleCheckout}
            disabled={loading || !canSubmit}
            className="font-semibold px-5 sm:px-6 py-2 rounded-xl"
          >
            {loading ? (
              <Loader2 className="animate-spin w-5 h-5" />
            ) : (
              buttonLabel
            )}
          </Button>
        </footer>

        {/* TOAST */}
        <AnimatePresence>
          {toastMsg && (
            <motion.div
              key={toastMsg.text}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className={`fixed bottom-28 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl shadow-lg text-sm ${
                toastMsg.type === "success"
                  ? "bg-green-600 text-white"
                  : toastMsg.type === "error"
                  ? "bg-red-600 text-white"
                  : "bg-gray-700 text-white"
              }`}
            >
              <div className="flex justify-center items-center gap-2">
                {toastMsg.type === "success" && (
                  <CheckCircle className="w-4 h-4" />
                )}
                {toastMsg.text}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </SafeViewport>
  );
}

/* =================================================================== */
/* SUBCOMPONENTS */
/* =================================================================== */

function Input({
  label,
  value,
  onChange,
  type = "text",
  disabled = false,
}: InputProps) {
  const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    onChange(e.target.value);
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-2 text-[var(--text-secondary)]">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        className={`w-full p-2 rounded-lg border border-[var(--edith-border)] bg-[var(--edith-surface)] text-sm focus:ring-2 focus:ring-[var(--edith-primary)] ${
          disabled ? "opacity-70 pointer-events-none" : ""
        }`}
      />
    </div>
  );
}

function Card({ title, children }: CardProps) {
  return (
    <section className="p-4 sm:p-5 rounded-xl border border-[var(--edith-border)] bg-[var(--edith-surface)] shadow-[0_4px_20px_rgba(0,0,0,0.05)] mb-4">
      <h3 className="font-semibold mb-3 text-base text-[var(--text-primary)]">
        {title}
      </h3>
      {children}
    </section>
  );
}

function InstallationSuggestion() {
  return (
    <div className="mt-4 rounded-xl border border-indigo-200/60 bg-indigo-50/60 dark:bg-indigo-900/30 p-4 text-sm text-indigo-900 dark:text-indigo-100">
      <p className="font-semibold mb-1">Need professional installation?</p>
      <p className="text-xs opacity-80">
        Our carpenters and installers can help assemble flooring, panels, and
        fittings you&apos;re buying. Add a service booking after checkout or{" "}
        <a
          href="/services?tab=carpentry"
          className="underline font-medium text-indigo-700 dark:text-indigo-200"
        >
          chat with a carpenter now
        </a>{" "}
        for recommendations.
      </p>
    </div>
  );
}





