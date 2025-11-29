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

import ServiceCheckoutPanel from "@/components/booking/ServiceCheckoutPanel";
import SafeViewport from "@/components/layout/SafeViewport";
import { useLedgerX } from "@/components/ledgerx/useLedgerX";
import type { Coordinates } from "@/components/MapPicker";
import { resolveCartConflict } from "@/components/store/cartGuards";
import {
  type CartItem,
  useProductCartStore,
  useServiceCartStore,
} from "@/components/store/cartStore";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useOtpManager } from "@/hooks/useOtpManager";
import { useUserProfile } from "@/hooks/useUserProfile";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, Loader2, MapPin, WifiOff, Wrench } from "lucide-react";
import { nanoid } from "nanoid";
import NextDynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChangeEventHandler,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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

const slugToId = (slug: string) => {
  let hash = 0;
  for (let i = 0; i < slug.length; i += 1) {
    hash = (hash << 5) - hash + slug.charCodeAt(i);
    hash |= 0; // keep in 32-bit range
  }
  const normalized = Math.abs(hash);
  return normalized === 0 ? 1 : normalized;
};

const slugToTitle = (slug: string) =>
  slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
    .trim();

/* =================================================================== */
/* MAIN CHECKOUT PAGE */
/* =================================================================== */

function CheckoutPageInner() {
  const router = useRouter();
  const search = useSearchParams();
  const { user, loggedIn, isLoading: loadingProfile } = useUserProfile();
  const { addEntry } = useLedgerX();

  const isAuthenticated = !!user?.id;

  const isService = search?.get("type") === "service";
  const serviceSlugParam = search?.get("service") ?? undefined;
  const bookingTypeParam =
    (search?.get("bookingType") as "consultation" | "site-visit" | null) ??
    null;
  const sku = search?.get("sku") ?? "turnkey";
  const isFreeParam = search?.get("free") === "1";
  const bookingFeeMrp = isService ? 500 : 0;
  const waived = isService && (isFreeParam || bookingFeeMrp === 0);
  const amountDue = waived ? 0 : bookingFeeMrp;

  const productItems = useProductCartStore((s) => s.items);
  const productTotalPrice = useProductCartStore((s) => s.totalPrice);

  const serviceItems = useServiceCartStore((s) => s.items);
  const addServiceItem = useServiceCartStore((s) => s.addItem);
  const serviceTotalPrice = useServiceCartStore((s) => s.totalPrice);
  const {
    sendOtp,
    verifyOtp,
    loading: otpSending,
    verifying: otpVerifying,
  } = useOtpManager();

  const forcedServiceMode = isService;
  const checkoutMode: "product" | "service" =
    forcedServiceMode || (serviceItems.length && !productItems.length)
      ? "service"
      : "product";

  const items = checkoutMode === "service" ? serviceItems : productItems;
  const cartTotalPrice =
    checkoutMode === "service" ? serviceTotalPrice : productTotalPrice;
  const hasProducts = checkoutMode === "product";
  const hasServices = checkoutMode === "service";
  const total = hasServices ? amountDue : cartTotalPrice;
  const totalPayable = total ?? 0;
  const payableLabel = hasProducts ? "Total (Delivery)" : "Booking fee";
  const buttonLabel = hasProducts
    ? "Confirm & Pay"
    : amountDue === 0
    ? "Book free visit"
    : "Confirm Visit";

  const normalizePhone = (raw: string | null | undefined) =>
    (raw || "").replace(/\D/g, "").slice(-10);

  const tomorrowDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  };

  // Lock the form until the on-site phone is verified via OTP (services only)
  const [isPhoneVerified, setIsPhoneVerified] = useState<boolean>(
    !!user?.phone_verified
  );
  const [otpOpen, setOtpOpen] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const isCheckoutLocked = hasServices && !isPhoneVerified;

  const serviceFromParams = useMemo(() => {
    if (!serviceSlugParam) return null;
    const unit =
      bookingTypeParam === "consultation" ? "Consultation" : "Site visit";

    return {
      id: slugToId(serviceSlugParam),
      title: slugToTitle(serviceSlugParam) || "Service visit",
      price: 0,
      unit,
      slug: serviceSlugParam,
    };
  }, [serviceSlugParam, bookingTypeParam]);

  const autoAddRef = useRef(false);

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
  const [sameAsUser, setSameAsUser] = useState(true);
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
      if (user?.id) {
        setUid(user.id);
        return;
      }

      const guest =
        localStorage.getItem("hf_guest_id") || `guest-${nanoid(10)}`;
      localStorage.setItem("hf_guest_id", guest);
      setUid(guest);
    };

    determineUid();
  }, [user?.id]);

  /* Autofill from profile when available */
  useEffect(() => {
    if (loadingProfile || !loggedIn || !user) return;
    if (sameAsUser) {
      setReceiverName((prev) => prev || user.name || "");
      setReceiverPhone((prev) => prev || user.phone || "");
    } else {
      setReceiverName((prev) => prev || user.name || "");
      setReceiverPhone((prev) => prev || user.phone || "");
    }
  }, [loadingProfile, loggedIn, user, sameAsUser]);

  useEffect(() => {
    if (user?.name && !serviceContactName) {
      setServiceContactName(user.name);
    }
    if (user?.phone && !serviceContactPhone) {
      setServiceContactPhone(user.phone);
    }
    if (!preferredDate) {
      setPreferredDate(tomorrowDate());
    }
  }, [
    user?.name,
    user?.phone,
    serviceContactName,
    serviceContactPhone,
    preferredDate,
  ]);

  useEffect(() => {
    const userDigits = normalizePhone(user?.phone);
    const contactDigits = normalizePhone(serviceContactPhone);
    if (
      user?.phone_verified &&
      (!contactDigits || contactDigits === userDigits)
    ) {
      setIsPhoneVerified(true);
    } else if (contactDigits && userDigits && contactDigits !== userDigits) {
      setIsPhoneVerified(false);
    }
  }, [user?.phone_verified, user?.phone, serviceContactPhone]);

  useEffect(() => {
    if (!isService) return;
    if (!serviceFromParams) return;
    if (serviceItems.length > 0) return;
    if (autoAddRef.current) return;
    if (!resolveCartConflict("service")) return;

    addServiceItem({
      ...serviceFromParams,
      quantity: 1,
      type: "service",
    });
    autoAddRef.current = true;
  }, [isService, serviceFromParams, serviceItems.length, addServiceItem]);

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

    const hasCartItems = hasProducts ? items.length > 0 : true;
    return hasCartItems;
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
    if (!isAuthenticated) {
      return createToast("Please log in to continue to checkout.", "error");
    }

    if (hasServices && !isPhoneVerified) {
      setOtpOpen(true);
      return createToast("Verify the on-site phone to continue.", "error");
    }

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
      amountDue === 0 && hasServices
        ? "Booking your free visit..."
        : hasServices
        ? "Booking your service visit..."
        : "Redirecting to payment...",
      "info"
    );

    const contactName =
      (hasProducts ? receiverName : serviceContactName) ||
      user?.name ||
      "Guest";
    const contactPhone =
      (hasProducts ? receiverPhone : serviceContactPhone) || user?.phone || "";
    const address = confirmedAddress || liveAddress;

    if (amountDue === 0 && hasServices) {
      try {
        const res = await fetch("/api/checkout/finalize", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            isFree: true,
            kind: "service",
            sku,
            contact: {
              name: contactName,
              phone: contactPhone,
              email: (user as any)?.email ?? null,
            },
            address: {
              line1: address || null,
              line2: landmark || null,
              city: null,
              pincode: null,
              latitude: coords.lat ?? null,
              longitude: coords.lng ?? null,
              landmark: landmark || null,
            },
            cart: serviceItems,
            notes: `Free booking via services/${sku}`,
            channel: "web",
            source: "FREE",
            userId: uid ?? (user as any)?.id ?? null,
            deviceId:
              typeof navigator !== "undefined"
                ? navigator.userAgent || "web"
                : "web",
          }),
        });

        if (!res.ok) {
          const msg = await res.text().catch(() => "");
          console.error("Finalize (FREE) failed:", msg);
          createToast("Could not create booking. Try again.", "error");
          setLoading(false);
          return;
        }

        sessionStorage.setItem("checkoutInitiated", "true");
        createToast(
          "Booked! We’ll call to schedule your free site visit.",
          "success"
        );
        setLoading(false);
        router.push("/my-orders?state=booked");
        return;
      } catch (err) {
        console.error(err);
        createToast("Something went wrong.", "error");
        setLoading(false);
        return;
      }
    }

    const basePayload: Record<string, any> = {
      user_id: uid ?? "guest",
      type: checkoutMode,
      items,
      total: totalPayable,
      address,
      landmark,
      latitude: coords.lat,
      longitude: coords.lng,
      status: "pending",
      created_at: new Date().toISOString(),
    };

    basePayload.ledgerx_v3 = {
      fulfillment: {
        type: checkoutMode === "product" ? "delivery" : "service",
        slot: preferredSlot ?? null,
        preferred_date: preferredDate ?? null,
      },
      financials: {
        subtotal: totalPayable,
        visit_fee: hasServices ? amountDue : 0,
        cod_allowed: false,
      },
      metadata: {
        app_version: "edith-pwa-2025",
        platform: "web",
        flow: checkoutMode,
      },
    };

    if (hasProducts) {
      basePayload.receiver_name = receiverName;
      basePayload.receiver_phone = receiverPhone;
      basePayload.store_fulfillment = {
        receiver_name: receiverName,
        receiver_phone: receiverPhone,
        same_as_user: sameAsUser,
        address,
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
      basePayload.visit_fee = amountDue;
      basePayload.visit_fee_waived = waived;
      basePayload.service_preferences = {
        contact_name: serviceContactName,
        contact_phone: serviceContactPhone,
        preferred_date: preferredDate,
        preferred_slot: preferredSlot,
        notes: projectNotes,
      };
      basePayload.payment = {
        mode: "booking_fee",
        gateway: "BookNowPayLater",
        status: "pending",
      };
    }

    try {
      await addEntry(
        uid ?? "guest",
        hasServices ? "service-draft" : "product-draft",
        basePayload
      );

      const ledgerRes = await fetch("/api/bookings-ledger/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(basePayload),
      });

      const ledgerData = await ledgerRes.json();

      if (!ledgerData?.success) {
        console.error("Ledger create failed:", ledgerData);
        createToast("Failed to create booking", "error");
        setLoading(false);
        return;
      }

      const bookingId = ledgerData.booking.id;
      localStorage.setItem("hf_pending_order_id", bookingId);
    } catch (err) {
      console.error("❌ Checkout ledger error:", err);
      createToast("Failed to create booking", "error");
      setLoading(false);
      return;
    }

    await new Promise((r) => setTimeout(r, 900));
    sessionStorage.setItem("checkoutInitiated", "true");

    router.push(`/mockrazorpay?type=${checkoutMode}`);
  }

  /* EMPTY CART */
  if (!items.length && !isService)
    return (
      <SafeViewport>
        <div className="flex flex-col items-center justify-center h-[70vh] text-[var(--text-secondary)]">
          <Wrench className="w-8 h-8 mb-3 opacity-60" />
          <p>Your cart is empty. Add items to continue.</p>
          <Button
            onClick={() => router.push(hasProducts ? "/store" : "/services")}
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
                    {i.quantity} slot{i.quantity > 1 ? "s" : ""} ·{" "}
                    {i.unit || i.category || "On-site"}
                  </span>
                </div>
                {i.price ? (
                  <span className="font-medium text-[var(--accent-success)] text-right">
                    {`Est. ₹${(i.price * i.quantity).toLocaleString()}`}
                  </span>
                ) : (
                  <div className="flex flex-col items-end text-sm">
                    <span className="line-through text-[var(--text-secondary)]">
                      ₹500
                    </span>
                    <span className="font-semibold text-emerald-500">Free</span>
                  </div>
                )}
              </div>
            ))}
            {!serviceItems.length && isService && serviceFromParams && (
              <ServiceCheckoutPanel
                service={serviceFromParams}
                bookingType={bookingTypeParam ?? undefined}
              />
            )}
            {!serviceItems.length && isService && !serviceFromParams && (
              <div className="flex justify-between items-center py-2 text-sm text-[var(--text-secondary)]">
                <span className="font-semibold text-[var(--text-primary)]">
                  Turnkey interiors booking
                </span>
                <span>Site visit · Chennai</span>
              </div>
            )}
            <p className="text-sm text-muted-foreground mt-3">
              Service visits are free. We confirm your preferred slot and share
              the plan before any advance.
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
                      {i.quantity} x ₹{(i.price || 0).toLocaleString()}
                    </span>
                  </div>
                  <span className="font-medium text-[var(--accent-success)]">
                    ₹{lineTotal.toLocaleString()}
                  </span>
                </div>
              );
            })}
            {!hasServices && <InstallationSuggestion />}
          </Card>
        )}
        {/* LOCATION PICKER */}
        <Card title={hasProducts ? "Delivery Details" : "Service Location"}>
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
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setSameAsUser(checked);
                    if (checked && user) {
                      setReceiverName(user.name || "");
                      setReceiverPhone(user.phone || "");
                    }
                  }}
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
              {isCheckoutLocked && (
                <p className="text-xs text-[var(--text-secondary)]">
                  Verify the on-site contact phone number to continue with your
                  booking.
                </p>
              )}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[var(--text-secondary)]">
                  On-site Contact Phone
                </label>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    value={serviceContactPhone}
                    onChange={(e) => {
                      const next = e.target.value;
                      setServiceContactPhone(next);
                      const userDigits = normalizePhone(user?.phone);
                      const nextDigits = normalizePhone(next);
                      if (
                        user?.phone_verified &&
                        userDigits &&
                        nextDigits &&
                        nextDigits !== userDigits
                      ) {
                        setIsPhoneVerified(false);
                      }
                    }}
                    className="flex-1 rounded-lg border border-[var(--edith-border)] bg-[var(--edith-surface)] px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--edith-primary)]"
                    placeholder="Enter phone number"
                  />
                  {isPhoneVerified ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                      <CheckCircle className="h-3 w-3" /> Verified
                    </span>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const digits = serviceContactPhone.replace(/\D/g, "");
                        if (digits.length !== 10) {
                          return createToast(
                            "Enter a valid 10-digit phone number first.",
                            "error"
                          );
                        }
                        setOtpCode("");
                        setOtpOpen(true);
                      }}
                    >
                      Verify
                    </Button>
                  )}
                </div>
              </div>

              <div className="relative">
                {isCheckoutLocked && (
                  <div
                    className="pointer-events-none absolute inset-0 rounded-2xl bg-white/60 backdrop-blur-[1px]"
                    aria-hidden="true"
                  />
                )}

                <fieldset disabled={isCheckoutLocked} className="space-y-4">
                  <Input
                    label="On-site Contact Name"
                    value={serviceContactName}
                    onChange={setServiceContactName}
                  />

                  <div>
                    <label className="block text-sm font-medium mb-2 text-[var(--text-secondary)]">
                      Preferred Visit Date
                    </label>
                    <input
                      type="date"
                      value={preferredDate || tomorrowDate()}
                      min={tomorrowDate()}
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
                      <option value="09:00 - 12:00">
                        Morning (9am - 12pm)
                      </option>
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
                </fieldset>
              </div>
            </div>
          )}
        </Card>

        {/* FOOTER */}
        <footer className="fixed bottom-0 left-0 right-0 z-50 flex justify-between items-center px-5 py-4 w-full sm:max-w-2xl mx-auto rounded-t-2xl bg-[var(--edith-surface)] border-t border-[var(--edith-border)] backdrop-blur-md">
          <div className="flex-1 pr-4">
            <p className="text-sm text-[var(--text-secondary)]">
              {payableLabel}
            </p>
            {hasServices && (
              <div className="flex items-center justify-between text-sm">
                <span>Booking fee</span>
                {amountDue === 0 ? (
                  <span>
                    <s>₹{bookingFeeMrp}</s>&nbsp;<b>Free</b>
                  </span>
                ) : (
                  <span>₹{amountDue}</span>
                )}
              </div>
            )}
            <div className="flex items-center justify-between mt-2">
              <span className="font-medium text-[var(--text-primary)]">
                Total payable
              </span>
              <span className="font-semibold">
                {totalPayable === 0
                  ? "₹0"
                  : `₹${totalPayable.toLocaleString()}`}
              </span>
            </div>
            {hasServices && (
              <p className="text-[11px] text-[var(--text-secondary)] mt-1">
                Services move ahead once you approve the quotation.
              </p>
            )}
          </div>

          <Button
            onClick={handleCheckout}
            disabled={
              loading || !canSubmit || !isAuthenticated || isCheckoutLocked
            }
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

      {/* Inline phone OTP drawer for checkout verification */}
      <Drawer open={otpOpen} onOpenChange={setOtpOpen}>
        <DrawerContent className="p-4 space-y-3">
          <DrawerHeader>
            <DrawerTitle>Verify on-site contact phone</DrawerTitle>
          </DrawerHeader>
          <p className="text-sm text-[var(--text-secondary)]">
            Enter the 6-digit OTP sent to +91{" "}
            {serviceContactPhone.replace(/\D/g, "").slice(-10)} to unlock
            checkout.
          </p>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
            className="w-full rounded-lg border border-[var(--edith-border)] bg-[var(--edith-surface)] px-3 py-2 text-center tracking-widest text-lg"
            placeholder="••••••"
          />
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              disabled={otpSending}
              onClick={async () => {
                const digits = serviceContactPhone.replace(/\D/g, "");
                if (digits.length !== 10) {
                  return createToast(
                    "Enter a valid 10-digit phone number first.",
                    "error"
                  );
                }
                const ok = await sendOtp(digits, "phone");
                if (ok) {
                  createToast(`OTP sent to +91 ${digits}`, "success");
                }
              }}
            >
              {otpSending ? "Sending..." : "Resend OTP"}
            </Button>
            <Button
              type="button"
              className="flex-1"
              disabled={otpVerifying || otpCode.length !== 6}
              onClick={async () => {
                const digits = serviceContactPhone.replace(/\D/g, "");
                if (digits.length !== 10) {
                  return createToast(
                    "Enter a valid 10-digit phone number first.",
                    "error"
                  );
                }
                const ok = await verifyOtp(otpCode, digits, "phone");
                if (ok) {
                  const normalized = `+91${digits}`;
                  setServiceContactPhone(normalized);
                  setIsPhoneVerified(true);
                  setOtpOpen(false);
                  createToast("Phone verified. You can continue.", "success");
                } else {
                  createToast(
                    "Verification failed. Check the code and try again.",
                    "error"
                  );
                }
              }}
            >
              {otpVerifying ? "Verifying..." : "Verify"}
            </Button>
          </div>
        </DrawerContent>
      </Drawer>
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

export default function CheckoutPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutPageInner />
    </Suspense>
  );
}
