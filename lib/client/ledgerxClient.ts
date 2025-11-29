"use client";

/**
 * LedgerX client-side cache
 * -------------------------------------------
 * Supabase DB is the canonical source of truth.
 * This IndexedDB cache is overwritten whenever fresh
 * data is fetched for the current user.
 */

export interface LedgerXDBEntry {
  id: string;
  userId?: string;
  type?: string;
  source?: string | null;
  payload?: any;
  status?: string | null;
  deviceId?: string | null;
  checksum?: string | null;
  createdAt?: number;
  updatedAt?: number;
  created_at?: string;
  total?: number | null;
  items?: any[];
  events?: any[];
  last_event?: any;
  address?: string | null;
  reference?: string | null;
  invoice_url?: string | null;
}

const DB_NAME = "ledgerx-db";
const STORE_NAME = "entries";
const DB_VERSION = 1;
const LEGACY_DB_NAMES = ["homefix-ledgerx", "ledgerx_db"];

(function cleanupLegacyLedgerDbs() {
  if (typeof window === "undefined") return;
  const flag = "__ledgerx_legacy_cleanup__";
  if ((window as any)[flag]) return;
  (window as any)[flag] = true;

  for (const name of LEGACY_DB_NAMES) {
    if (name === DB_NAME) continue;
    try {
      indexedDB.deleteDatabase(name);
    } catch (err) {
      console.warn("[LedgerX] legacy DB cleanup failed:", name, err);
    }
  }
})();

let dbPromise: Promise<IDBDatabase> | null = null;

async function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof window === "undefined")
      return reject(new Error("No window for IndexedDB"));

    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("userId", "userId", { unique: false });
        store.createIndex("createdAt", "createdAt", { unique: false });
      }
    };

    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
  });

  return dbPromise;
}

async function withTx<T>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => Promise<T>
): Promise<T> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, mode);
  const store = tx.objectStore(STORE_NAME);
  try {
    const res = await fn(store);
    return await new Promise<T>((resolve, reject) => {
      tx.oncomplete = () => resolve(res);
      tx.onabort = () => reject(tx.error);
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    tx.abort();
    throw err;
  }
}

export async function getOrdersForUser(
  userId: string
): Promise<LedgerXDBEntry[]> {
  return withTx("readonly", async (store) => {
    return await new Promise<LedgerXDBEntry[]>((resolve, reject) => {
      const idx = store.index("userId");
      const req = idx.getAll(IDBKeyRange.only(userId));
      req.onsuccess = () => resolve(req.result as LedgerXDBEntry[]);
      req.onerror = () => reject(req.error);
    });
  });
}

export async function setOrdersForUser(
  userId: string,
  orders: LedgerXDBEntry[]
): Promise<void> {
  await withTx("readwrite", async (store) => {
    // Clear existing entries for this user then bulk put
    const idx = store.index("userId");
    const req = idx.getAllKeys(IDBKeyRange.only(userId));
    const keys: IDBValidKey[] = await new Promise((resolve, reject) => {
      req.onsuccess = () => resolve(req.result as IDBValidKey[]);
      req.onerror = () => reject(req.error);
    });
    keys.forEach((key) => store.delete(key));
    orders.forEach((entry) => store.put({ ...entry, userId }));
  });
}

export async function clearOrdersForUser(userId: string): Promise<void> {
  await withTx("readwrite", async (store) => {
    const idx = store.index("userId");
    const req = idx.getAllKeys(IDBKeyRange.only(userId));
    const keys: IDBValidKey[] = await new Promise((resolve, reject) => {
      req.onsuccess = () => resolve(req.result as IDBValidKey[]);
      req.onerror = () => reject(req.error);
    });
    keys.forEach((key) => store.delete(key));
  });
}

// Generic helpers retained for legacy consumers (pure client cache only)
export async function addLedgerEntry(entry: LedgerXDBEntry): Promise<void> {
  await withTx("readwrite", async (store) => {
    store.put(entry);
    return entry;
  });
}

export async function getAllLedgerEntries(): Promise<LedgerXDBEntry[]> {
  return withTx("readonly", async (store) => {
    return await new Promise<LedgerXDBEntry[]>((resolve, reject) => {
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result as LedgerXDBEntry[]);
      req.onerror = () => reject(req.error);
    });
  });
}
