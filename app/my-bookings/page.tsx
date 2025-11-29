"use client";

/**
 * app/my-bookings/page.tsx
 * Canonical bookings/orders page (supersedes legacy /my-space and /my-orders)
 */

import SafeViewport from "@/components/layout/SafeViewport";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useOrdersWithCache } from "@/hooks/useOrdersWithCache";
import { format } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpRight,
  Calendar,
  FileText,
  MapPin,
  RefreshCw,
  ShoppingBag,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";

type BookingKind = "store" | "service";

type BookingCardModel = {
  id: string;
  reference: string;
  createdAt?: string;
  kind: BookingKind;
  summary: string;
  statusLabel: string;
  address?: string | null;
  total?: number | null;
  items?: any[];
  invoiceUrl?: string | null;
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

function summarizeOrder(order: any, kind: BookingKind) {
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
      order?.payload?.service_preferences?.preferred_slot ||
      order?.payload?.ledgerx_v3?.fulfillment?.slot;
    return slot ? `${name} · ${slot}` : name;
  }

  return "Service booking";
}

function MyBookingsPageInner() {
  const { loading: profileLoading, loggedIn } = useUserProfile();
  const { orders, loading: ordersLoading, error, refresh } = useOrdersWithCache();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const tabParam = searchParams?.get("tab");
  const initialFilter: BookingKind =
    tabParam === "store" ? "store" : "service";
  const [filterType, setFilterType] = useState<BookingKind>(initialFilter);

  const loading = profileLoading || ordersLoading;

  const mappedOrders = useMemo<BookingCardModel[]>(() => {
    if (!loggedIn || !Array.isArray(orders)) return [];
    return orders.map((o: any) => {
      const kind = deriveKind(o);
      const last = latestEvent(o);
      const total =
        typeof o?.total === "number"
          ? o.total
          : o?.payload?.ledgerx_v3?.financials?.subtotal ?? null;
      const address =
        o?.address ||
        o?.payload?.address ||
        o?.payload?.store_fulfillment?.address ||
        o?.payload?.service_preferences?.address ||
        null;

      return {
        id: String(o.id),
        reference: o.reference || o.id,
        createdAt: o.created_at,
        kind,
        summary: summarizeOrder(o, kind),
        statusLabel: formatStatusLabel(last?.status || last?.event || o.status),
        address,
        total,
        items: o.items || [],
        invoiceUrl: o.invoice_url ?? null,
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
            className="bg-[var(--edith-surface)]/85 border border-[var(--edith-border)] rounded-2xl shadow-xl p-5 backdrop-blur"
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
      className="bg-gradient-to-br from-[var(--accent-primary)]/12 via-[var(--accent-secondary)]/10 to-transparent border border-[var(--border-soft)] rounded-2xl p-5 flex flex-wrap gap-3 items-center justify-between"
    >
      <div>
        <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--text-muted)]">
          Your bookings & orders
        </p>
        <h1 className="text-xl font-semibold text-[var(--text-primary)]">
          Track deliveries, service visits, and invoices
        </h1>
        <p className="text-sm text-[var(--text-secondary)] max-w-2xl">
          All your product orders and service bookings in one place. Download
          invoices, see status, and chat with support.
        </p>
      </div>
      <button
        type="button"
        onClick={onRefresh}
        className="inline-flex items-center gap-2 rounded-full border border-[var(--border-soft)] px-3 py-2 text-[12px] font-semibold text-[var(--text-primary)] hover:border-[var(--accent-primary)] transition"
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
                ? "bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]"
                : "bg-[var(--edith-surface)] text-[var(--text-secondary)] border-[var(--border-soft)] hover:border-[var(--accent-primary)]"
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
}: {
  order: BookingCardModel;
  expanded: boolean;
  onToggle: () => void;
}) {
  const createdAt = order.createdAt
    ? format(new Date(order.createdAt), "dd MMM yyyy")
    : "Date unavailable";
  const isService = order.kind === "service";
  const label = isService ? "Service booking" : "Store order";

  return (
    <motion.div
      layout
      className="border border-[var(--border-soft)] rounded-xl bg-[var(--surface-card)] shadow-sm overflow-hidden"
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
                ? "bg-[color-mix(in_srgb,var(--accent-secondary)15%,transparent)] text-[var(--accent-secondary)]"
                : "bg-[color-mix(in_srgb,var(--accent-primary)15%,transparent)] text-[var(--accent-primary)]"
            }`}
          >
            {isService ? (
              <Calendar className="w-5 h-5" />
            ) : (
              <ShoppingBag className="w-5 h-5" />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              {label} · {order.reference || order.id}
            </p>
            <p className="text-[12px] text-[var(--text-secondary)]">
              {order.summary}
            </p>
            {typeof order.total === "number" ? (
              <p className="text-[12px] text-[var(--text-secondary)]">
                Total: ₹{Number(order.total).toLocaleString("en-IN")}
              </p>
            ) : null}
            <p className="text-[12px] text-[var(--text-muted)]">
              {createdAt}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[12px] text-[var(--text-secondary)]">
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
            {order.address && (
              <div className="flex items-start gap-2 text-[12px] text-[var(--text-secondary)] mb-2">
                <MapPin className="w-4 h-4 text-[var(--accent-primary)] mt-[2px]" />
                <span>{order.address}</span>
              </div>
            )}

            {order.invoiceUrl && (
              <a
                href={order.invoiceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[12px] text-[var(--accent-primary)] font-semibold hover:underline"
              >
                <FileText className="w-4 h-4" />
                View invoice
              </a>
            )}

            {order.items?.length ? (
              <div className="mt-3 border-t border-[var(--border-soft)] pt-2 space-y-2">
                {order.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="text-[12px] text-[var(--text-primary)] flex justify-between gap-2"
                  >
                    <span className="font-semibold">
                      {item.title || item.name || "Item"}
                    </span>
                    {item.price ? (
                      <span className="text-[var(--text-muted)] ml-1">
                        ₹{Number(item.price).toLocaleString("en-IN")}
                      </span>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function MutedState({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 text-[12px] text-[var(--text-secondary)]">
      <span className="w-2 h-2 rounded-full bg-[var(--accent-primary)] animate-pulse" />
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
    <div className="flex items-center justify-between text-[12px] text-[var(--text-secondary)]">
      <span>{message}</span>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-1 text-[var(--accent-primary)] font-semibold hover:underline"
      >
        <RefreshCw className="w-3 h-3" />
        Retry
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-[12px] text-[var(--text-secondary)]">
      No bookings yet. Start with a service visit or place a store order to see
      them here.
    </div>
  );
}

function LoginPrompt() {
  return (
    <div className="text-[12px] text-[var(--text-secondary)]">
      Please log in to view your bookings.
    </div>
  );
}
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
