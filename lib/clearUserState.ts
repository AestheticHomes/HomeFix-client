"use client";

/**
 * Clear all locally persisted user state to avoid ghost profiles.
 * - Clears localStorage + sessionStorage
 * - Deletes the LedgerX IndexedDB
 */
export async function clearLocalUserState() {
  try {
    localStorage.clear();
  } catch {}
  try {
    sessionStorage.clear();
  } catch {}
  try {
    indexedDB.deleteDatabase("ledger-db");
  } catch {}
}
