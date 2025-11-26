"use client";

/**
 * catalogCache (client-only)
 * ------------------------------------------------------------
 * Lightweight IndexedDB mirror for catalog metadata.
 * Supabase/CDN JSON is the source of truth; this cache only
 * stores product metadata + URLs for faster loads and offline use.
 * GLB or image binaries are NOT stored here.
 */

import type { CatalogItem } from "@/types/catalog";

type CatalogRecord = {
  id: "catalog";
  items: CatalogItem[];
  version: string | null;
  updatedAt: number;
};

const DB_NAME = "catalog-cache";
const STORE_NAME = "catalog";
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

async function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("IndexedDB unavailable on server"));
      return;
    }

    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };

    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
  });

  return dbPromise;
}

async function withStore<T>(
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

export async function getCatalog(): Promise<CatalogItem[] | null> {
  try {
    const record = await withStore<CatalogRecord | undefined>(
      "readonly",
      async (store) =>
        await new Promise((resolve, reject) => {
          const req = store.get("catalog");
          req.onsuccess = () => resolve(req.result as CatalogRecord | undefined);
          req.onerror = () => reject(req.error);
        })
    );
    return record?.items ?? null;
  } catch (err) {
    console.warn("[catalogCache] getCatalog failed", err);
    return null;
  }
}

export async function setCatalog(
  items: CatalogItem[],
  version: string | null
): Promise<void> {
  const record: CatalogRecord = {
    id: "catalog",
    items,
    version: version ?? null,
    updatedAt: Date.now(),
  };

  try {
    await withStore("readwrite", async (store) => {
      store.put(record);
      return record;
    });
  } catch (err) {
    console.warn("[catalogCache] setCatalog failed", err);
  }
}

export async function getCatalogVersion(): Promise<string | null> {
  try {
    const record = await withStore<CatalogRecord | undefined>(
      "readonly",
      async (store) =>
        await new Promise((resolve, reject) => {
          const req = store.get("catalog");
          req.onsuccess = () => resolve(req.result as CatalogRecord | undefined);
          req.onerror = () => reject(req.error);
        })
    );
    return record?.version ?? null;
  } catch (err) {
    console.warn("[catalogCache] getCatalogVersion failed", err);
    return null;
  }
}

export async function getCatalogUpdatedAt(): Promise<number | null> {
  try {
    const record = await withStore<CatalogRecord | undefined>(
      "readonly",
      async (store) =>
        await new Promise((resolve, reject) => {
          const req = store.get("catalog");
          req.onsuccess = () => resolve(req.result as CatalogRecord | undefined);
          req.onerror = () => reject(req.error);
        })
    );
    return record?.updatedAt ?? null;
  } catch {
    return null;
  }
}
