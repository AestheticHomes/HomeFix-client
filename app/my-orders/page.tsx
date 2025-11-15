"use client";

/**
 * app/my-orders/page.tsx
 * Edith My Orders – invoice list (replaces legacy my-space orders)
 */

import SafeViewport from "@/components/layout/SafeViewport";
import { useUser } from "@/contexts/UserContext";
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
import { useEffect, useMemo, useState } from "react";

type OrderType = "store" | "service";

type OrderEntry = {
  id: string;
  reference: string;
  invoice_id: string;
  invoice_url?: string | null;
  total?: number;
  created_at?: string;
  order_type: OrderType;
  visit_fee?: number | null;
  visit_fee_waived?: boolean;
  items: any[];
  address?: string | null;
  status?: string;
  tracking_steps: string[];
  progress: number;
  payload?: any;
  raw?: any;
};

export default function MyOrdersPage() {
  const { user, isLoaded, isLoggedIn, setUser } = useUser();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [orders, setOrders] = useState<OrderEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshCount, setRefreshCount] = useState(0);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const tabParam = searchParams?.get("tab");
  const initialFilter =
    tabParam === "service" || tabParam === "store"
      ? (tabParam as OrderType)
      : "all";
  const [filterType, setFilterType] = useState<OrderType | "all">(
    initialFilter
  );

  const userId = user?.id;

  // Hydration bridge: recover user from localStorage if context hasn't populated yet.
  useEffect(() => {
    if (!isLoaded || isLoggedIn || user) return;
    try {
      const raw =
        typeof window !== "undefined" ? localStorage.getItem("user") : null;
      if (!raw) return;
      const cached = JSON.parse(raw);
      if (cached?.loggedIn) {
        setUser(cached);
      }
    } catch {
      // ignore parse errors
    }
  }, [user, isLoaded, isLoggedIn, setUser]);

  useEffect(() => {
    if (!isLoaded || !isLoggedIn || !userId) return;

    const controller = new AbortController();
    let isCurrent = true;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/invoices/list?user_id=${userId}`, {
          signal: controller.signal,
        });
        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`);
        }
        const json = await res.json();
        if (!json?.success) {
          throw new Error(
            json?.message ?? "Unable to load your orders right now."
          );
        }
        const invoices: OrderEntry[] = Array.isArray(json.invoices)
          ? json.invoices
          : [];
        if (isCurrent) {
          setOrders(invoices);
          if (invoices.length === 0) setExpandedOrderId(null);
        }
      } catch (err) {
        if (controller.signal.aborted || !isCurrent) return;
        console.error("[my-orders] Failed to load invoices:", err);
        setOrders([]);
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while loading your orders."
        );
      } finally {
        if (!controller.signal.aborted && isCurrent) {
          setLoading(false);
        }
      }
    })();

    return () => {
      isCurrent = false;
      controller.abort();
    };
  }, [userId, isLoaded, isLoggedIn, refreshCount]);

  const handleRefresh = () => setRefreshCount((prev) => prev + 1);

  const showLoginPrompt = !isLoggedIn && !loading && isLoaded;

  const sortedOrders = useMemo(
    () =>
      orders.slice().sort((a, b) => {
        const aDate = a.created_at ? new Date(a.created_at).getTime() : 0;
        const bDate = b.created_at ? new Date(b.created_at).getTime() : 0;
        return bDate - aDate;
      }),
    [orders]
  );
  const filteredOrders = useMemo(() => {
    if (filterType === "all") return sortedOrders;
    return sortedOrders.filter((o) => o.order_type === filterType);
  }, [sortedOrders, filterType]);

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
                if (next === "all") params.delete("tab");
                else params.set("tab", next);
                const qs = params.toString();
                router.replace(`${pathname}${qs ? `?${qs}` : ""}`, {
                  scroll: false,
                });
              }}
            />
            {loading ? (
              <MutedState message="Loading orders..." />
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

/* ---------- Helper Components ---------- */

function HeroCard({
  loading,
  onRefresh,
}: {
  loading: boolean;
  onRefresh: () => void;
}) {
  return (
    <div className="bg-[var(--edith-surface)]/90 border border-[var(--edith-border)] rounded-2xl shadow-xl p-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">
          Billing
        </p>
        <h1 className="text-2xl font-semibold text-[var(--text-primary-light)]">
          My Orders
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          View your past orders and invoices.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-full border border-[var(--edith-border)] bg-white/70 dark:bg-zinc-900/70 px-4 py-2 text-sm font-medium text-[var(--text-primary-light)] hover:bg-white disabled:opacity-50"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>
    </div>
  );
}

function FilterTabs({
  filterType,
  onChange,
}: {
  filterType: OrderType | "all";
  onChange: (v: OrderType | "all") => void;
}) {
  const tabs: { id: OrderType | "all"; label: string }[] = [
    { id: "all", label: "All" },
    { id: "service", label: "Services" },
    { id: "store", label: "Store" },
  ];

  return (
    <div className="flex justify-center mb-4">
      <div className="flex rounded-full border border-[var(--edith-border)] bg-white/70 dark:bg-zinc-900/60 text-xs sm:text-sm">
        {tabs.map((tab) => {
          const active = filterType === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`px-4 py-1.5 rounded-full font-semibold transition ${
                active
                  ? "bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white shadow"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary-light)]"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MutedState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center py-16 text-[var(--text-secondary)]">
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
    <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
      <p className="text-sm text-red-500">
        We couldn&apos;t load your orders. {message}
      </p>
      <button
        onClick={onRetry}
        className="text-sm font-medium underline text-red-400"
      >
        Try again
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-[var(--text-secondary)] space-y-3">
      <ShoppingBag className="w-10 h-10 opacity-60" />
      <p>No orders found for this account yet.</p>
    </div>
  );
}

function LoginPrompt() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center space-y-4 text-[var(--text-secondary)]">
      <FileText className="w-10 h-10 opacity-70 mx-auto" />
      <div>
        <p className="text-base font-medium text-[var(--text-primary-light)]">
          Sign in to view your orders
        </p>
        <p className="text-sm">
          Once you&apos;re signed in, your invoices will appear here.
        </p>
      </div>
    </div>
  );
}

function formatCurrency(value?: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(Number(value ?? 0));
}

function OrderCard({
  order,
  expanded,
  onToggle,
}: {
  order: OrderEntry;
  expanded: boolean;
  onToggle: () => void;
}) {
  const createdAtLabel = order.created_at
    ? format(new Date(order.created_at), "dd MMM yyyy, hh:mm a")
    : "Date unavailable";
  const rawIdentifier = String(order.reference || order.id || "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 8)
    .toUpperCase();
  const orderLabel = `${order.order_type === "service" ? "SR" : "OR"}-${
    rawIdentifier || "000000"
  }`;
  const invoiceLabel = order.invoice_id
    ? `INV-${String(order.invoice_id).slice(0, 10)}`
    : null;
  const totalDisplay =
    order.order_type === "service"
      ? order.total && order.total > 0
        ? formatCurrency(order.total)
        : "To be quoted"
      : formatCurrency(order.total);

  return (
    <motion.div
      layout
      className="rounded-3xl border border-[var(--border-soft)] bg-[var(--surface-card)] dark:bg-[var(--surface-panel-dark)] shadow-[var(--shadow-elevation)] overflow-hidden transition-colors duration-500"
    >
      <div className="p-4 sm:p-6 flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--accent-tertiary)]">
              {order.order_type === "store" ? "Products" : "Services"}
            </p>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] dark:text-[var(--text-primary-dark)] flex items-center gap-2">
              <FileText className="w-5 h-5 text-[var(--accent-primary)]" />
              {orderLabel}
            </h2>
            {invoiceLabel && (
              <p className="text-xs text-[var(--text-muted)]">
                Invoice {invoiceLabel}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs text-[var(--text-muted)] flex items-center gap-1 justify-end">
              <Calendar className="w-4 h-4" />
              {createdAtLabel}
            </p>
            <p className="text-sm font-semibold text-[var(--text-primary)] dark:text-[var(--text-primary-dark)] whitespace-nowrap">
              Total: {totalDisplay}
            </p>
          </div>
        </div>

        {order.address && (
          <p className="text-xs text-[var(--text-muted)] flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {order.address}
          </p>
        )}

        {order.order_type === "service" && (
          <p className="text-xs font-medium text-[var(--accent-warning)]">
            Visit Charge: {formatCurrency(order.visit_fee ?? 200)}{" "}
            {order.visit_fee_waived
              ? "(waived after confirmation)"
              : "(payable only if you decline)"}
          </p>
        )}

        <OrderTimeline
          type={order.order_type}
          steps={order.tracking_steps}
          progress={order.progress}
        />

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onToggle}
            className="rounded-full border border-[var(--border-soft)] px-4 py-1.5 text-sm font-medium text-[var(--accent-primary)] hover:bg-[var(--surface-hover)] transition"
          >
            {expanded ? "Hide details" : "View details"}
          </button>
          {order.invoice_url && (
            <a
              href={order.invoice_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-[var(--accent-success)] hover:underline"
            >
              View invoice <ArrowUpRight className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-[var(--border-soft)] bg-[var(--surface-overlay)] dark:bg-[var(--surface-panel-dark)]/50 px-4 sm:px-6 py-4 space-y-4"
          >
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-indigo-500 mb-2">
                Items
              </p>
              {order.items && order.items.length > 0 ? (
                <ul className="space-y-2">
                  {order.items.map((item, idx) => (
                    <li
                      key={idx}
                      className="flex items-center justify-between text-sm text-[var(--text-primary)] dark:text-[var(--text-primary-dark)]"
                    >
                      <span className="w-2/3">
                        {item?.name ?? item?.title ?? "Item"}
                      </span>
                      <span className="text-xs text-[var(--text-muted)]">
                        ×{item?.quantity ?? item?.qty ?? 1}
                      </span>
                      <span className="font-medium">
                        {formatCurrency(item?.price ?? item?.amount ?? 0)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500">
                  No line items captured on this order.
                </p>
              )}
            </div>

            {order.order_type === "service" && <ProgressNote order={order} />}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ProgressNote({ order }: { order: OrderEntry }) {
  const milestone =
    order.tracking_steps[
      Math.min(order.progress - 1, order.tracking_steps.length - 1)
    ];
  return (
    <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-card)] dark:bg-[var(--surface-panel-dark)]/60 p-4 text-sm text-[var(--text-secondary)] dark:text-[var(--text-primary-dark)]">
      <p className="font-semibold text-[var(--text-primary)] dark:text-[var(--text-primary-dark)] mb-1">
        {order.status ? order.status : "In Progress"}
      </p>
      <p>
        Latest milestone:{" "}
        <span className="text-[var(--accent-primary)] dark:text-[var(--accent-secondary)]">
          {milestone}
        </span>
      </p>
      <p className="text-xs text-[var(--text-muted)] mt-2">
        We&apos;ll notify you when the next step begins. You can refresh this
        page anytime to sync with the cosmic ledger.
      </p>
    </div>
  );
}

function OrderTimeline({
  type,
  steps,
  progress,
}: {
  type: OrderType;
  steps: string[];
  progress: number;
}) {
  const completed = Math.min(progress, steps.length);
  const percent = ((completed - 1) / (steps.length - 1 || 1)) * 100;

  return (
    <div className="space-y-3">
      <div className="relative h-2 rounded-full bg-[var(--surface-hover)] dark:bg-[var(--surface-panel-dark)]/60 overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-emerald-400 animate-pulse"
          style={{ width: `${Math.max(12, percent)}%` }}
        />
        <div className="absolute inset-y-0 left-0 w-full opacity-30 blur-xl bg-gradient-to-r from-blue-500 via-fuchsia-500 to-orange-400" />
      </div>
      <div className="flex justify-between text-[10px] uppercase tracking-wide text-[var(--text-muted)]">
        <span>{steps[0]}</span>
        <span>{steps[steps.length - 1]}</span>
      </div>
      <p className="text-xs text-[var(--text-muted)]">
        {type === "store"
          ? "Tracking cosmic parcels across HomeFix logistic ray."
          : "Service timeline entangled with your engineer's schedule."}
      </p>
    </div>
  );
}
