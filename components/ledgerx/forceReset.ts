// Run only in browser
export function forceResetLedgerX() {
  if (typeof window === "undefined") return;

  const FLAG = "ledgerx-force-reset-v1";

  // Already reset before → skip
  if (localStorage.getItem(FLAG)) return;

  console.warn("🧹 Running LedgerX one-time hard reset…");

  // delete DB
  indexedDB.deleteDatabase("homefix-ledgerx");

  // mark as cleaned
  localStorage.setItem(FLAG, "1");

  // reload once
  setTimeout(() => location.reload(), 200);
}
