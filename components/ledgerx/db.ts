// File: components/ledgerx/db.ts
// Clean IndexedDB wrapper for LedgerX (enhanced)

export interface LedgerXDBEntry {
  id: string;
  userId: string;
  type: string;
  payload: any;
  status: string;
  deviceId?: string | null;
  checksum?: string | null;
  createdAt: number;
  updatedAt: number;
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

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof window === "undefined") return reject(new Error("No window"));

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

/* ---------------------- Transaction helpers ---------------------- */

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

/* ---------------------- EXPORTED API ---------------------- */

export async function getLedgerDB(): Promise<IDBDatabase> {
  return openDB();
}

export async function addLedgerEntry(entry: LedgerXDBEntry): Promise<void> {
  await withTx("readwrite", async (store) => {
    store.put(entry);
  });
}

export async function getAllLedgerEntries(): Promise<LedgerXDBEntry[]> {
  return withTx("readonly", async (store) => {
    return await new Promise<LedgerXDBEntry[]>((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result as LedgerXDBEntry[]);
      request.onerror = () => reject(request.error);
    });
  });
}
