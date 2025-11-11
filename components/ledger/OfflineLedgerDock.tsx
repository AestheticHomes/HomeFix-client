"use client";
/**
 * ============================================================
 * 🪶 OfflineLedgerDock — Edith Continuum v8.1
 * ------------------------------------------------------------
 * ✅ Floating tab for accessing the Offline Ledger Drawer
 * ✅ Shows live queue status (unsynced, failed)
 * ✅ Offline/Online indicator
 * ✅ Opens Drawer via shared local state
 * ✅ Adaptive to light/dark Edith theme
 * ============================================================
 */

import { useOfflineLedger } from "@/components/hooks/useOfflineLedger";
import OfflineLedgerDrawer from "@/components/ledger/OfflineLedgerDrawer";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Clock, CloudUpload, WifiOff } from "lucide-react";
import { useState } from "react";

export default function OfflineLedgerDock() {
  const { queue, online, isSyncing } = useOfflineLedger();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // 🧮 Status counters
  const total = queue.length;
  const unsynced = queue.filter(
    (o) => o.payment?.status === "success" && !o.synced
  ).length;
  const failed = queue.filter((o) => o.status === "failed").length;

  // 🎨 Dynamic badge color
  const badgeColor =
    failed > 0 ? "bg-red-500" : unsynced > 0 ? "bg-yellow-500" : "bg-green-500";

  return (
    <>
      {/* ⚡ Floating Ledger Button */}
      <motion.button
        onClick={() => setDrawerOpen(true)}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-5 z-[80] flex items-center gap-2 
                   bg-[var(--edith-surface)] dark:bg-[var(--edith-surface)] 
                   shadow-[0_4px_14px_rgba(0,0,0,0.12)] dark:shadow-[0_4px_14px_rgba(255,255,255,0.05)]
                   border border-[var(--edith-border)] rounded-full px-4 py-2 backdrop-blur-md"
      >
        {isSyncing ? (
          <CloudUpload className="w-4 h-4 text-[var(--edith-primary)] animate-spin" />
        ) : online ? (
          <CheckCircle2 className="w-4 h-4 text-green-500" />
        ) : (
          <WifiOff className="w-4 h-4 text-red-500" />
        )}

        <span className="text-xs font-medium text-[var(--edith-text)]">
          Ledger
        </span>

        {total > 0 && (
          <span
            className={clsx(
              "ml-2 w-2.5 h-2.5 rounded-full animate-pulse",
              badgeColor
            )}
          />
        )}
      </motion.button>

      {/* 🪟 Drawer Overlay */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70]"
          >
            {/* 🧾 Embedded Drawer */}
            <OfflineLedgerDrawerWrapper onClose={() => setDrawerOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ------------------------------------------------------------
   🔒 Drawer Wrapper — handles open/close independently
------------------------------------------------------------ */
function OfflineLedgerDrawerWrapper({ onClose }: { onClose: () => void }) {
  const [visible, setVisible] = useState(true);

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => {
              setVisible(false);
              setTimeout(onClose, 250);
            }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[90]"
          />

          {/* Drawer */}
          <motion.div
            key="drawer"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 240, damping: 30 }}
            className="fixed inset-x-0 bottom-0 z-[100]
                       bg-[var(--edith-surface)] dark:bg-[var(--edith-surface)] 
                       rounded-t-3xl shadow-2xl border-t border-[var(--edith-border)]
                       max-h-[85vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-[var(--edith-border)]">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[var(--edith-primary)]" />
                <h3 className="text-base font-semibold">Offline Ledger</h3>
              </div>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  setVisible(false);
                  setTimeout(onClose, 250);
                }}
                className="rounded-lg p-1.5 hover:bg-[var(--edith-surface-hover)] transition-colors"
              >
                ✕
              </motion.button>
            </div>

            {/* Content */}
            <motion.div
              layout
              className="overflow-y-auto max-h-[75vh] px-1 pb-6"
            >
              <OfflineLedgerDrawer />
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
