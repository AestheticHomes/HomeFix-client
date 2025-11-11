"use client";
/**
 * ============================================================
 * 📘 OfflineLedger — Edith Continuum v8.0
 * ------------------------------------------------------------
 * ✅ Core visual + data component for offline transactions
 * ✅ Adds micro-motion transitions & responsive layout
 * ✅ Supabase-ready placeholders for live sync
 * ✅ Collapsible stats on mobile
 * ✅ Light/Dark adaptive (Edith tokens)
 * ============================================================
 */

import { useOfflineLedger } from "@/components/hooks/useOfflineLedger";
import { Button } from "@/components/ui/button";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  CloudUpload,
  RefreshCw,
  Trash2,
  WifiOff,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function OfflineLedger() {
  const { queue, syncPaidOrders, removeOrder, isSyncing, online, lastSync } =
    useOfflineLedger();

  const [stats, setStats] = useState({
    total: 0,
    paid: 0,
    failed: 0,
    unsynced: 0,
  });
  const [showStats, setShowStats] = useState(true);

  // 🔄 Compute Stats
  useEffect(() => {
    const total = queue.length;
    const paid = queue.filter((o) => o.status === "paid").length;
    const failed = queue.filter((o) => o.status === "failed").length;
    const unsynced = queue.filter(
      (o) => o.payment?.status === "success" && !o.synced
    ).length;
    setStats({ total, paid, failed, unsynced });
  }, [queue]);

  return (
    <section
      className="offline-ledger w-full sm:max-w-3xl mx-auto mt-6 mb-20 p-5 rounded-2xl
                 border border-[var(--edith-border)] bg-[var(--edith-surface)]
                 dark:bg-[var(--edith-surface)] shadow-[0_4px_20px_rgba(0,0,0,0.05)]
                 dark:shadow-[0_4px_20px_rgba(255,255,255,0.05)]"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <CloudUpload className="w-5 h-5 text-[var(--edith-primary)]" />
          <h2 className="text-lg font-semibold">Offline Ledger</h2>
        </div>

        <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)]">
          {online ? (
            <span className="text-green-500 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Online
            </span>
          ) : (
            <span className="text-red-400 flex items-center gap-1">
              <WifiOff className="w-3 h-3" /> Offline
            </span>
          )}
          {lastSync && (
            <span>
              <Clock className="inline w-3 h-3 mr-1" />
              {new Date(lastSync).toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mb-4">
        <button
          onClick={() => setShowStats(!showStats)}
          className="flex w-full justify-between items-center sm:hidden text-xs text-[var(--text-secondary)] py-1"
        >
          <span>Summary</span>
          {showStats ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        <AnimatePresence initial={false}>
          {showStats && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2"
            >
              <StatCard label="Total" value={stats.total} icon={Clock} />
              <StatCard
                label="Paid"
                value={stats.paid}
                icon={CheckCircle2}
                color="green"
              />
              <StatCard
                label="Failed"
                value={stats.failed}
                icon={XCircle}
                color="red"
              />
              <StatCard
                label="Unsynced"
                value={stats.unsynced}
                icon={RefreshCw}
                color="yellow"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Sync Controls */}
      <div className="flex flex-wrap gap-2 justify-between items-center mb-4">
        <Button
          onClick={syncPaidOrders}
          disabled={isSyncing || !online}
          variant="primary"
          className="flex items-center gap-2"
        >
          {isSyncing ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <CloudUpload className="w-4 h-4" />
          )}
          {isSyncing ? "Syncing..." : "Sync Paid Orders"}
        </Button>

        {stats.failed > 0 && (
          <Button
            variant="danger"
            onClick={() =>
              queue
                .filter((o) => o.status === "failed")
                .forEach((o) => removeOrder(o.local_id))
            }
            className="flex items-center gap-1"
          >
            <Trash2 className="w-4 h-4" /> Clear Failed
          </Button>
        )}
      </div>

      {/* Table */}
      <motion.div
        layout
        className="overflow-x-auto rounded-xl border border-[var(--edith-border)]"
      >
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left border-b border-[var(--edith-border)] text-[var(--text-secondary)] bg-[var(--edith-surface-hover)] dark:bg-[var(--edith-surface-hover)]">
              <th className="py-2 px-2">#</th>
              <th className="py-2 px-2">Status</th>
              <th className="py-2 px-2">Amount</th>
              <th className="py-2 px-2">Gateway</th>
              <th className="py-2 px-2">Receiver</th>
              <th className="py-2 px-2 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {queue.map((o, i) => (
                <motion.tr
                  key={o.local_id}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="border-b border-[var(--edith-border)] last:border-none"
                >
                  <td className="py-2 px-2">{i + 1}</td>
                  <td>
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="py-2 px-2">
                    ₹{o.payment?.amount?.toLocaleString() || "0"}
                  </td>
                  <td className="py-2 px-2">{o.payment?.gateway || "N/A"}</td>
                  <td className="py-2 px-2">
                    {o.delivery?.receiver_name || "-"}
                  </td>
                  <td className="py-2 px-2 text-right">
                    {o.status === "failed" ? (
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => removeOrder(o.local_id)}
                      >
                        Delete
                      </Button>
                    ) : !o.synced && o.payment?.status === "success" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={syncPaidOrders}
                      >
                        Sync
                      </Button>
                    ) : (
                      <span className="text-xs text-[var(--text-secondary)]">
                        Synced
                      </span>
                    )}
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </motion.div>
    </section>
  );
}

/* ------------------------------------------------------------
   📊 StatCard Subcomponent
------------------------------------------------------------ */
function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: any;
  color?: "green" | "red" | "yellow";
}) {
  const colorMap: Record<string, string> = {
    green: "text-green-500",
    red: "text-red-500",
    yellow: "text-yellow-500",
  };
  return (
    <div
      className={clsx(
        "p-3 rounded-xl border border-[var(--edith-border)] bg-[var(--edith-surface-hover)] dark:bg-[var(--edith-surface-hover)] flex flex-col items-start justify-center",
        color && colorMap[color]
      )}
    >
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-4 h-4" />
        <span className="text-xs text-[var(--text-secondary)]">{label}</span>
      </div>
      <span className="text-lg font-semibold">{value}</span>
    </div>
  );
}

/* ------------------------------------------------------------
   🟢 Status Badge Subcomponent
------------------------------------------------------------ */
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    paid: "bg-green-500/10 text-green-500",
    failed: "bg-red-500/10 text-red-500",
    pending: "bg-yellow-500/10 text-yellow-500",
  };
  return (
    <span
      className={clsx(
        "px-2 py-0.5 rounded-full text-xs font-medium capitalize",
        styles[status] || "bg-gray-500/10 text-gray-500"
      )}
    >
      {status}
    </span>
  );
}
