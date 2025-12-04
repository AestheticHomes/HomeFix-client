"use client";

/**
 * app/my-bookings/page.tsx
 * Canonical bookings/orders page (supersedes legacy /my-space and /my-orders).
 * Displays human-readable IDs, timelines, and lightweight actions (reschedule/cancel) with themed dialogs.
 * Data flows: fetches bookings_ledger rows + booking_events via /api/bookings-ledger/list, hydrates an IndexedDB
 * (ledgerx-db) cache through useOrdersWithCache, and renders cards that now treat bookings_ledger.preferred_date/slot
 * as the single source of truth for the current visit slot (payload/events can be stale).
 */

import SafeViewport from "@/components/layout/SafeViewport";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useOrdersWithCache } from "@/hooks/useOrdersWithCache";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpRight,
  Calendar as CalendarIcon,
  FileText,
  MapPin,
  RefreshCw,
  ShoppingBag,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

type BookingKind = "store" | "service";

type BookingCardModel = {
  id: string;
  reference: string;
  displayId: string;
  createdAt?: string;
  kind: BookingKind;
  summary: string;
  statusLabel: string;
  status?: string | null;
  address?: string | null;
  total?: number | null;
  items?: any[];
  invoiceUrl?: string | null;
  preferredDate?: string | null;
  preferredSlot?: string | null;
};

function deriveKind(order: any): BookingKind {
  const fulfillment = order?.payload?.ledgerx_v3?.fulfillment?.type;
  const type = String(order?.type ?? "").toLowerCase();
  const source = String(order?.source ?? "").toLowerCase();

  if (fulfillment === "delivery") return "store";
  if (fulfillment === "service") return "service";
  if (type.includes("product")) return "store";
  if (source.includes("store")) return "store";
  return "service";
}

function latestEvent(order: any) {
  const evs = Array.isArray(order?.events) ? order.events : [];
  return evs[evs.length - 1] || order?.last_event || null;
}

function formatStatusLabel(status?: string | null) {
  if (!status) return "In progress";
  const safe = status.toString().replace(/[_-]/g, " ").trim();
  return safe.charAt(0).toUpperCase() + safe.slice(1);
}

/**
 * Builds a human-readable public ID for bookings/orders from created_at.
 * - Service → HFBID-XXXXXXXX
 * - Store   → HFOID-XXXXXXXX
 * Falls back to the tail of the UUID when date is unavailable.
 */
function makeDisplayId(
  kind: "store" | "service",
  createdAt?: string | Date,
  id?: string
) {
  const fallbackTail = id ? String(id).slice(-8) : "NA";
  if (!createdAt) {
    const prefix = kind === "store" ? "HFOID" : "HFBID";
    return `${prefix}-${fallbackTail}`;
  }
  const d = typeof createdAt === "string" ? new Date(createdAt) : createdAt;
  const epochSeconds = Number.isFinite(d.getTime())
    ? Math.floor(d.getTime() / 1000)
    : NaN;
  const last8 = Number.isNaN(epochSeconds)
    ? fallbackTail
    : String(epochSeconds).slice(-8);
  const prefix = kind === "store" ? "HFOID" : "HFBID";
  return `${prefix}-${last8}`;
}

type OrderStep = { key: string; label: string };

const STORE_FLOW: OrderStep[] = [
  { key: "pending", label: "Order placed" },
  { key: "received", label: "Order received" },
  { key: "confirmed", label: "Order confirmed" },
  { key: "packed", label: "Packed" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
];

const SERVICE_FLOW: OrderStep[] = [
  { key: "pending", label: "Service booked" },
  { key: "engineer_assigned", label: "Engineer assigned" },
  { key: "site_visit", label: "Site visit" },
  { key: "quotation_sent", label: "Quotation sent" },
  { key: "awaiting_approval", label: "Awaiting approval" },
  { key: "work_started", label: "Work started" },
  { key: "in_progress", label: "In progress" },
  { key: "completed", label: "Completed & handover" },
];
const SERVICE_STATUS_MAP: Record<string, string> = {
  booked: "pending",
  pending: "pending",
  confirmed: "pending",
  visit_scheduled: "site_visit",
  rescheduled: "site_visit",
  quotation_sent: "quotation_sent",
  awaiting_approval: "awaiting_approval",
  work_started: "work_started",
  in_progress: "in_progress",
  completed: "completed",
};

function summarizeOrder(
  order: any,
  kind: BookingKind,
  preferredSlot?: string | null
) {
  const items = Array.isArray(order?.items) ? order.items : [];
  if (kind === "store") {
    if (!items.length) return "Store order";
    const names = items
      .map((i: any) => i?.title || i?.name)
      .filter(Boolean)
      .slice(0, 3);
    const count = items.length;
    return `${count} item${count > 1 ? "s" : ""}${
      names.length ? ` · ${names.join(", ")}` : ""
    }`;
  }

  if (items.length) {
    const first = items[0];
    const name = first?.title || first?.name || "Service booking";
    const slot =
      preferredSlot ||
      order?.payload?.ledgerx_v3?.fulfillment?.slot ||
      order?.payload?.service_preferences?.preferred_slot;
    return slot ? `${name} · ${slot}` : name;
  }

  return "Service booking";
}

function parsePayload(raw: any) {
  if (!raw) return {};
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }
  return raw;
}

function MyBookingsPageInner() {
  const { loading: profileLoading, loggedIn } = useUserProfile();
  const {
    orders,
    loading: ordersLoading,
    error,
    refresh,
  } = useOrdersWithCache();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [rescheduleTarget, setRescheduleTarget] =
    useState<BookingCardModel | null>(null);
  const [cancelTarget, setCancelTarget] = useState<BookingCardModel | null>(
    null
  );
  const tabParam = searchParams?.get("tab");
  const initialFilter: BookingKind = tabParam === "store" ? "store" : "service";
  const [filterType, setFilterType] = useState<BookingKind>(initialFilter);
  const { success, error: errorToast } = useToast();

  const loading = profileLoading || ordersLoading;

  const mappedOrders = useMemo<BookingCardModel[]>(() => {
    if (!loggedIn || !Array.isArray(orders)) return [];
    return orders.map((o: any) => {
      const payload = parsePayload(o?.payload);
      const withParsedPayload = { ...o, payload };
      const kind = deriveKind(withParsedPayload);
      const last = latestEvent(withParsedPayload);
      const legacyPrefs = payload?.service_preferences ?? {};
      // NOTE: cards must use bookings_ledger.preferred_date/slot first; payload can remain stale after reschedule.
      const preferredDate =
        o?.preferred_date ?? legacyPrefs?.preferred_date ?? null;
      const preferredSlot =
        o?.preferred_slot ?? legacyPrefs?.preferred_slot ?? null;
      const total =
        typeof o?.total === "number"
          ? o.total
          : payload?.ledgerx_v3?.financials?.subtotal ?? null;
      const statusValue = last?.status || last?.event || o.status;
      const address =
        o?.address ||
        payload?.address ||
        payload?.store_fulfillment?.address ||
        legacyPrefs?.address ||
        null;

      return {
        id: String(o.id),
        reference: o.reference || o.id,
        displayId: makeDisplayId(kind, o.created_at, o.id),
        createdAt: o.created_at,
        kind,
        summary: summarizeOrder(
          withParsedPayload,
          kind,
          preferredSlot
        ),
        statusLabel: formatStatusLabel(statusValue),
        status: statusValue,
        address,
        total,
        items: o.items || [],
        invoiceUrl: o.invoice_url ?? null,
        preferredDate,
        preferredSlot,
      };
    });
  }, [loggedIn, orders]);

  const handleRefresh = () => refresh();

  const showLoginPrompt = !loggedIn && !ordersLoading && !profileLoading;

  const sortedOrders = useMemo(
    () =>
      mappedOrders.slice().sort((a, b) => {
        const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bDate - aDate;
      }),
    [mappedOrders]
  );
  const filteredOrders = useMemo(
    () => sortedOrders.filter((o) => o.kind === filterType),
    [sortedOrders, filterType]
  );

  return (
    <SafeViewport>
      <div className="min-h-[70vh] max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        <HeroCard loading={loading} onRefresh={handleRefresh} />

        {showLoginPrompt ? (
          <LoginPrompt />
        ) : (
          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-(--edith-surface)/85 border border-(--edith-border) rounded-2xl shadow-xl p-5 backdrop-blur"
          >
            <FilterTabs
              filterType={filterType}
              onChange={(next) => {
                setFilterType(next);
                if (!router || !pathname) return;
                const params = new URLSearchParams(
                  Array.from(searchParams?.entries() ?? [])
                );
                params.set("tab", next);
                const qs = params.toString();
                router.replace(`${pathname}${qs ? `?${qs}` : ""}`, {
                  scroll: false,
                });
              }}
            />
            {loading ? (
              <MutedState message="Loading bookings..." />
            ) : error ? (
              <ErrorState message={error} onRetry={handleRefresh} />
            ) : filteredOrders.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="flex flex-col gap-4">
                {filteredOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    expanded={expandedOrderId === order.id}
                    onReschedule={() => setRescheduleTarget(order)}
                    onCancel={() => setCancelTarget(order)}
                    onToggle={() =>
                      setExpandedOrderId((prev) =>
                        prev === order.id ? null : order.id
                      )
                    }
                  />
                ))}
              </div>
            )}
          </motion.section>
        )}
      </div>

      <RescheduleDialog
        order={rescheduleTarget}
        onClose={() => setRescheduleTarget(null)}
        onSuccess={() => {
          setRescheduleTarget(null);
          success("Reschedule request sent");
          // Refresh pulls fresh bookings_ledger rows and rewrites the ledgerx-db cache post-reschedule.
          refresh();
        }}
        onError={(msg) => errorToast(msg || "Could not reschedule")}
      />

      <CancelDialog
        order={cancelTarget}
        onClose={() => setCancelTarget(null)}
        onSuccess={() => {
          setCancelTarget(null);
          success("Cancellation submitted");
          refresh();
        }}
        onError={(msg) => errorToast(msg || "Could not cancel right now")}
      />
    </SafeViewport>
  );
}

export default function MyBookingsPage() {
  return (
    <Suspense fallback={null}>
      <MyBookingsPageInner />
    </Suspense>
  );
}

function HeroCard({
  loading,
  onRefresh,
}: {
  loading: boolean;
  onRefresh: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-linear-to-br from-(--accent-primary)/12 via-(--accent-secondary)/10 to-transparent border border-(--border-soft) rounded-2xl p-5 flex flex-wrap gap-3 items-center justify-between"
    >
      <div>
        <p className="text-[11px] uppercase tracking-[0.2em] text-(--text-muted)">
          Your bookings & orders
        </p>
        <h1 className="text-xl font-semibold text-(--text-primary)">
          Track deliveries, service visits, and invoices
        </h1>
        <p className="text-sm text-(--text-secondary) max-w-2xl">
          All your product orders and service bookings in one place. Download
          invoices, see status, and chat with support.
        </p>
      </div>
      <button
        type="button"
        onClick={onRefresh}
        className="inline-flex items-center gap-2 rounded-full border border-(--border-soft) px-3 py-2 text-[12px] font-semibold text-(--text-primary) hover:border-(--accent-primary) transition"
        disabled={loading}
      >
        <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        {loading ? "Refreshing..." : "Refresh"}
      </button>
    </motion.div>
  );
}

function FilterTabs({
  filterType,
  onChange,
}: {
  filterType: BookingKind;
  onChange: (next: BookingKind) => void;
}) {
  const tabs: { id: BookingKind; label: string }[] = [
    { id: "service", label: "Service bookings" },
    { id: "store", label: "Store orders" },
  ];

  return (
    <div className="flex items-center gap-2 mb-4">
      {tabs.map((tab) => {
        const active = tab.id === filterType;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`px-3 py-1.5 rounded-full border text-[12px] font-semibold transition ${
              active
                ? "bg-(--accent-primary) text-white border-(--accent-primary)"
                : "bg-(--edith-surface) text-(--text-secondary) border-(--border-soft) hover:border-(--accent-primary)"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

function OrderCard({
  order,
  expanded,
  onToggle,
  onReschedule,
  onCancel,
}: {
  order: BookingCardModel;
  expanded: boolean;
  onToggle: () => void;
  onReschedule: () => void;
  onCancel: () => void;
}) {
  const createdAt = order.createdAt
    ? format(new Date(order.createdAt), "dd MMM yyyy")
    : "Date unavailable";
  const isService = order.kind === "service";
  const label = isService ? "Service booking" : "Store order";
  const rawStatus = (order.status || "").toString().toLowerCase();
  const currentStatus = isService
    ? SERVICE_STATUS_MAP[rawStatus] || SERVICE_FLOW[0].key
    : rawStatus || STORE_FLOW[0].key;
  const cancellableStoreStatuses = ["pending", "confirmed", "received"];
  const reschedulableStatuses = [
    "pending",
    "booked",
    "visit_scheduled",
    "rescheduled",
  ];

  return (
    <motion.div
      layout
      className="border border-(--border-soft) rounded-xl bg-(--surface-card) shadow-sm overflow-hidden"
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isService
                ? "bg-[color-mix(in_srgb,var(--accent-secondary)15%,transparent)] text-(--accent-secondary)"
                : "bg-[color-mix(in_srgb,var(--accent-primary)15%,transparent)] text-(--accent-primary)"
            }`}
          >
            {isService ? (
              <CalendarIcon className="w-5 h-5" />
            ) : (
              <ShoppingBag className="w-5 h-5" />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-(--text-primary)">
              {label} · {order.displayId || order.reference || order.id}
            </p>
            <p className="text-[12px] text-(--text-secondary)">
              {order.summary}
            </p>
            {typeof order.total === "number" ? (
              <p className="text-[12px] text-(--text-secondary)">
                Total: ₹{Number(order.total).toLocaleString("en-IN")}
              </p>
            ) : null}
            <p className="text-[12px] text-(--text-muted)">{createdAt}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[12px] text-(--text-secondary)">
          <span>{order.statusLabel || "In progress"}</span>
          <ArrowUpRight className="w-4 h-4" />
        </div>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="px-4 pb-4"
          >
            <OrderTimeline
              steps={isService ? SERVICE_FLOW : STORE_FLOW}
              currentStatus={currentStatus}
            />

            {order.address && (
              <div className="flex items-start gap-2 text-[12px] text-(--text-secondary) mb-2">
                <MapPin className="w-4 h-4 text-(--accent-primary) mt-0.5" />
                <span>{order.address}</span>
              </div>
            )}

            {order.invoiceUrl && (
              <a
                href={order.invoiceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[12px] text-(--accent-primary) font-semibold hover:underline"
              >
                <FileText className="w-4 h-4" />
                View invoice
              </a>
            )}

            {order.items?.length ? (
              <div className="mt-3 border-t border-(--border-soft) pt-2 space-y-2">
                {order.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="text-[12px] text-(--text-primary) flex justify-between gap-2"
                  >
                    <span className="font-semibold">
                      {item.title || item.name || "Item"}
                    </span>
                    {item.price ? (
                      <span className="text-(--text-muted) ml-1">
                        ₹{Number(item.price).toLocaleString("en-IN")}
                      </span>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}

            <div className="flex gap-2 mt-3 justify-end">
              {isService && reschedulableStatuses.includes(currentStatus) ? (
                <Button size="sm" variant="outline" onClick={onReschedule}>
                  Reschedule
                </Button>
              ) : null}
              {!isService &&
              cancellableStoreStatuses.includes(currentStatus) ? (
                <Button size="sm" variant="outline" onClick={onCancel}>
                  Cancel order
                </Button>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function MutedState({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 text-[12px] text-(--text-secondary)">
      <span className="w-2 h-2 rounded-full bg-(--accent-primary) animate-pulse" />
      {message}
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex items-center justify-between text-[12px] text-(--text-secondary)">
      <span>{message}</span>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-1 text-(--accent-primary) font-semibold hover:underline"
      >
        <RefreshCw className="w-3 h-3" />
        Retry
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-[12px] text-(--text-secondary)">
      No bookings yet. Start with a service visit or place a store order to see
      them here.
    </div>
  );
}

function LoginPrompt() {
  return (
    <div className="text-[12px] text-(--text-secondary)">
      Please log in to view your bookings.
    </div>
  );
}
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

/**
 * Compact horizontal status timeline for orders/bookings.
 * Highlights all steps up to the current status.
 */
function OrderTimeline({
  steps,
  currentStatus,
}: {
  steps: OrderStep[];
  currentStatus: string;
}) {
  const found = steps.findIndex((s) => s.key === currentStatus);
  const activeIndex = found === -1 ? 0 : found;

  return (
    <ol className="flex items-center gap-2 mt-3 text-xs">
      {steps.map((step, idx) => {
        const isActive = idx <= activeIndex && activeIndex !== -1;
        return (
          <li key={step.key} className="flex items-center gap-1">
            <div
              className={
                "w-2.5 h-2.5 rounded-full border " +
                (isActive
                  ? "bg-emerald-500 border-emerald-500"
                  : "bg-transparent border-(--edith-border)")
              }
            />
            <span
              className={
                isActive
                  ? "font-medium text-(--text-primary)"
                  : "text-(--text-secondary)"
              }
            >
              {step.label}
            </span>
            {idx < steps.length - 1 && (
              <span className="mx-1 text-(--text-secondary) opacity-60">
                ·
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

/**
 * Calls the reschedule API for a service booking.
 * Expects ISO date string (YYYY-MM-DD) and a time slot label.
 */
async function rescheduleServiceBooking(
  bookingId: string,
  isoDate: string,
  slot: string
) {
  const res = await fetch("/api/bookings-ledger/reschedule", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      booking_id: bookingId,
      preferred_date: isoDate,
      preferred_slot: slot,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || "Reschedule failed");
  }
  return res.json().catch(() => ({}));
}

/**
 * Cancels a booking/order by booking_id.
 * Used for both services and store orders.
 */
async function cancelBooking(bookingId: string) {
  const res = await fetch("/api/bookings-ledger/cancel", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ booking_id: bookingId }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || "Cancel failed");
  }
  return res.json().catch(() => ({}));
}

/**
 * Dialog for rescheduling a service booking with date + slot selection.
 */
function RescheduleDialog({
  order,
  onClose,
  onSuccess,
  onError,
}: {
  order: BookingCardModel | null;
  onClose: () => void;
  onSuccess: () => void;
  onError: (msg?: string) => void;
}) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedSlot, setSelectedSlot] = useState<string>("09:00 - 12:00");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (order?.preferredDate) {
      setSelectedDate(new Date(order.preferredDate));
    } else {
      setSelectedDate(undefined);
    }
    setSelectedSlot(order?.preferredSlot || "09:00 - 12:00");
  }, [order?.preferredDate, order?.preferredSlot, order?.id]);

  if (!order) return null;

  const minDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d;
  })();

  const formatted = selectedDate
    ? format(selectedDate, "dd-MM-yyyy")
    : "Select date";

  const handleConfirm = async () => {
    if (!selectedDate || !selectedSlot) {
      onError("Please choose a date and slot");
      return;
    }
    try {
      setSubmitting(true);
      const isoDate = format(selectedDate, "yyyy-MM-dd");
      await rescheduleServiceBooking(order.id, isoDate, selectedSlot);
      onSuccess();
    } catch (err: any) {
      console.error("[my-bookings] reschedule failed", err);
      onError(err?.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={!!order} onOpenChange={(open) => !open && onClose()}>
      {/* A11y: Description removes Radix warning and keeps dialog above dock */}
      <DialogContent className="rounded-2xl bg-(--edith-surface) border border-(--edith-border) p-4 sm:max-w-md w-full shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-(--text-primary)">
            Reschedule visit
          </DialogTitle>
          <DialogDescription className="text-sm text-(--text-secondary)">
            Pick a new slot for your service booking. We&apos;ll notify the
            team.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-3 space-y-3">
          <div>
            <p className="text-xs font-semibold text-(--text-secondary) mb-2">
              Choose date (from tomorrow)
            </p>
            <Calendar
              selected={selectedDate}
              onSelect={setSelectedDate}
              mode="single"
              fromDate={minDate}
              styles={{
                caption_label: { color: "var(--text-primary)" },
              }}
            />
            <p className="text-xs text-(--text-secondary) mt-1">
              Selected: <span className="font-semibold">{formatted}</span>
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-(--text-secondary) mb-2">
              Preferred time slot
            </label>
            <select
              value={selectedSlot}
              onChange={(e) => setSelectedSlot(e.target.value)}
              className="w-full p-2 rounded-lg border border-(--edith-border) bg-(--edith-surface) text-sm focus:ring-2 focus:ring-(--edith-primary)"
            >
              <option value="09:00 - 12:00">Morning (9am - 12pm)</option>
              <option value="12:00 - 15:00">Midday (12pm - 3pm)</option>
              <option value="15:00 - 18:00">Evening (3pm - 6pm)</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button size="sm" onClick={handleConfirm} disabled={submitting}>
            {submitting ? "Saving..." : "Confirm reschedule"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Dialog to confirm cancellation without using window.confirm.
 */
function CancelDialog({
  order,
  onClose,
  onSuccess,
  onError,
}: {
  order: BookingCardModel | null;
  onClose: () => void;
  onSuccess: () => void;
  onError: (msg?: string) => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  if (!order) return null;

  const handleConfirm = async () => {
    try {
      setSubmitting(true);
      await cancelBooking(order.id);
      onSuccess();
    } catch (err: any) {
      console.error("[my-bookings] cancel failed", err);
      onError(err?.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={!!order} onOpenChange={(open) => !open && onClose()}>
      {/* A11y: Description removes Radix warning and keeps dialog above dock */}
      <DialogContent className="rounded-2xl bg-(--edith-surface) border border-(--edith-border) p-4 sm:max-w-sm w-full shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-(--text-primary)">
            Cancel {order.kind === "service" ? "visit" : "order"}?
          </DialogTitle>
          <DialogDescription className="text-sm text-(--text-secondary)">
            We&apos;ll try to stop fulfillment if it hasn&apos;t progressed.
            You&apos;ll receive a confirmation email.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={submitting}
          >
            Keep
          </Button>
          <Button size="sm" onClick={handleConfirm} disabled={submitting}>
            {submitting ? "Submitting..." : "Confirm cancel"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
