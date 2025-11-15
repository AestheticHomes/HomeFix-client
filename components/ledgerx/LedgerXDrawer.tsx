/**
 * LedgerX Local DB — v2.0
 * Unified Type + IndexedDB Helpers
 * Fully compatible with:
 * - useLedgerX.ts
 * - LedgerXItemCard
 * - LedgerXDrawer
 * - Checkout + My Orders
 */

export type LedgerXStatus = "pending" | "synced" | "failed" | "cancelled";

export interface LedgerXEntry {
  id: string;
  type: string;
  status: LedgerXStatus;
  createdAt: number | string;

  payload: {
    cart?: any[];
    total?: number;
    address?: {
      label?: string;
      formatted?: string;
    };
    [key: string]: any;
  };

  [key: string]: any;
}

/* ------------------------------------------------------------
   IndexedDB minimal wrapper (used by useLedgerX.ts)
------------------------------------------------------------- */

// Use one database name consistently
const DB_NAME = "ledgerx_db";
const STORE_NAME = "entries";

export function getLedgerDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);

    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);

    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
  });
}

export async function addLedgerEntry(entry: LedgerXEntry) {
  const db = await getLedgerDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  tx.objectStore(STORE_NAME).put(entry);
  return new Promise((resolve) => {
    tx.oncomplete = resolve;
  });
}

export async function getAllLedgerEntries(): Promise<LedgerXEntry[]> {
  const db = await getLedgerDB();
  const tx = db.transaction(STORE_NAME, "readonly");
  const store = tx.objectStore(STORE_NAME);

  return new Promise((resolve) => {
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result as LedgerXEntry[]);
  });
}

export async function deleteLedgerEntry(id: string) {
  const db = await getLedgerDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  tx.objectStore(STORE_NAME).delete(id);
  return new Promise((resolve) => {
    tx.oncomplete = resolve;
  });
}
