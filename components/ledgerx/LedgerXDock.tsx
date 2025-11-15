// components/ledgerx/LedgerXDock.tsx
"use client";
import { useState } from "react";
import { useLedgerX } from "./useLedgerX";
import { Dock, Circle } from "lucide-react"; // replace with your favorite icon

export default function LedgerXDock({ onOpen }: { onOpen: () => void }) {
  const { pendingCount, isSyncing } = useLedgerX();
  return (
    <button
      onClick={onOpen}
      className="fixed bottom-5 right-5 z-40 rounded-full shadow-lg px-4 py-3 bg-[var(--edith-surface)] hover:opacity-90"
      aria-label="Open ledger"
    >
      <span className="inline-flex items-center gap-2">
        <Dock className="w-5 h-5" />
        <span>Ledger</span>
        {isSyncing ? (
          <span className="animate-pulse text-xs">syncing…</span>
        ) : (
          <span className="text-xs opacity-70">{pendingCount} pending</span>
        )}
        {pendingCount > 0 && <Circle className="w-2 h-2" />}
      </span>
    </button>
  );
}
