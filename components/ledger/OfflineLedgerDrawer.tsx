"use client";
/**
 * ============================================================
 * 🧾 OfflineLedgerDrawer — Edith Continuum v8.0
 * ------------------------------------------------------------
 * ✅ Integrates OfflineLedger v8.0 inside drawer
 * ✅ Opens from Dock trigger
 * ✅ Shared Framer Motion layout with smooth spring
 * ✅ Adds safe scroll-lock & backdrop blur
 * ✅ Light/Dark adaptive (Edith tokens)
 * ============================================================
 */

import { useOfflineLedger } from "@/components/hooks/useOfflineLedger";
import OfflineLedger from "@/components/ledger/OfflineLedger";
import { AnimatePresence, motion } from "framer-motion";
import { Clock, X } from "lucide-react";
import { useEffect, useState } from "react";

export default function OfflineLedgerDrawer() {
  const { queue } = useOfflineLedger();
  const [open, setOpen] = useState(false);

  // 🧭 Lock background scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // 🟢 Drawer trigger condition (can also be handled by Dock)
  // For now, manual toggle (Dock will manage open externally)
  const total = queue.length;

  return (
    <>
      {/* 🔘 Floating trigger (for standalone testing) */}
      {!open && (
        <motion.button
          onClick={() => setOpen(true)}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-6 right-5 z-[80] flex items-center gap-2 
                     bg-[var(--edith-surface)] dark:bg-[var(--edith-surface)] 
                     shadow-[0_4px_14px_rgba(0,0,0,0.12)] dark:shadow-[0_4px_14px_rgba(255,255,255,0.05)]
                     border border-[var(--edith-border)] rounded-full px-3 py-2 backdrop-blur-sm"
        >
          <Clock className="w-4 h-4 text-[var(--edith-primary)]" />
          <span className="text-xs font-medium text-[var(--edith-text)]">
            Ledger ({total})
          </span>
        </motion.button>
      )}

      {/* 🪟 Drawer Backdrop + Panel */}
      <AnimatePresence>
        {open && (
          <>
            {/* 🌑 Background overlay */}
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[90]"
            />

            {/* 🧾 Drawer panel */}
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
                  onClick={() => setOpen(false)}
                  className="rounded-lg p-1.5 hover:bg-[var(--edith-surface-hover)] transition-colors"
                >
                  <X className="w-5 h-5 text-[var(--text-secondary)]" />
                </motion.button>
              </div>

              {/* Scrollable Ledger Content */}
              <motion.div
                layout
                className="overflow-y-auto max-h-[75vh] px-1 pb-6"
              >
                <OfflineLedger />
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
