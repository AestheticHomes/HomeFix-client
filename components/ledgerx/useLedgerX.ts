"use client";

import { nanoid } from "nanoid";
import { create } from "zustand";
import {
  addLedgerEntry,
  getAllLedgerEntries,
  LedgerXDBEntry,
} from "@/lib/client/ledgerxClient";

const DEBUG =
  (typeof window !== "undefined" &&
    (window as any).__DEBUG_LEDGERX__ === true) ||
  process.env.NEXT_PUBLIC_DEBUG_LEDGERX === "true" ||
  process.env.DEBUG_MODE === "true";

const TIMEOUT_MS = Number(process.env.NEXT_PUBLIC_LEDGERX_TIMEOUT_MS || 20000);
const SYNC_BATCH_SIZE = Number(
  process.env.NEXT_PUBLIC_LEDGERX_BATCH_SIZE || 40
);
const SYNC_MAX_RETRIES = Number(
  process.env.NEXT_PUBLIC_LEDGERX_SYNC_RETRIES || 3
);

export type LedgerXStatusType =
  | "pending"
  | "synced"
  | "failed"
  | "cancelled"
  | "completed"
  | "rescheduled"
  | "return_requested"
  | "return_approved"
  | "return_rejected"
  | "returned"
  | "refunded";

export interface LedgerXEntry {
  id: string;
  userId: string;
  type: string;
  payload: any;
  status: LedgerXStatusType;
  deviceId?: string | null;
  checksum?: string | null;
  createdAt: number;
  updatedAt: number;
}

function safeJson<T = any>(v: any): T {
  try {
    return JSON.parse(JSON.stringify(v ?? {}));
  } catch {
    return {} as T;
  }
}

function uuidv4(): string {
  try {
    if ((crypto as any)?.randomUUID) return (crypto as any).randomUUID();
  } catch {}
  const a = new Uint8Array(16);
  if ((crypto as any)?.getRandomValues) (crypto as any).getRandomValues(a);
  else for (let i = 0; i < 16; i++) a[i] = Math.floor(Math.random() * 256);
  a[6] = (a[6] & 0x0f) | 0x40;
  a[8] = (a[8] & 0x3f) | 0x80;
  return Array.from(a)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .replace(
      /([0-9a-f]{8})([0-9a-f]{4})([0-9a-f]{4})([0-9a-f]{4})([0-9a-f]{12})/,
      "$1-$2-$3-$4-$5"
    );
}

function withTimeout<T>(p: Promise<T>, ms = TIMEOUT_MS): Promise<T> {
  let id: any;
  const timeout = new Promise<T>((_, rej) => {
    id = setTimeout(
      () => rej(new Error(`operation timed out after ${ms}ms`)),
      ms
    );
  });
  return Promise.race([p.finally(() => clearTimeout(id)), timeout]);
}

function isUuidLike(id?: string | null): boolean {
  if (!id || typeof id !== "string") return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    id
  );
}

function normalizeLocalRow(r: LedgerXDBEntry | any): LedgerXEntry {
  return {
    id: String(r.id),
    userId: String(r.userId ?? ""),
    type: r.type ?? "unknown",
    payload: safeJson(r.payload),
    status: (r.status as LedgerXStatusType) ?? "pending",
    deviceId: r.deviceId ?? null,
    checksum: r.checksum ?? null,
    createdAt: typeof r.createdAt === "number" ? r.createdAt : Date.now(),
    updatedAt: typeof r.updatedAt === "number" ? r.updatedAt : Date.now(),
  };
}

function normalizeCloudRow(r: any): LedgerXEntry {
  const createdAt = r.created_at
    ? new Date(r.created_at).getTime()
    : Date.now();
  const updatedAt = r.updated_at ? new Date(r.updated_at).getTime() : createdAt;

  return {
    id: r.id ?? uuidv4(),
    userId: r.user_id ?? "",
    type: r.type ?? "booking",
    payload: safeJson(r.payload),
    status: (r.status as LedgerXStatusType) ?? "synced",
    deviceId: r.device_id ?? "remote",
    checksum: r.checksum ?? nanoid(6),
    createdAt,
    updatedAt,
  };
}

export type LedgerStore = {
  entries: LedgerXEntry[];
  pendingCount: number;
  isSyncing: boolean;
  lastSyncAt?: number;
  load: (uid?: string) => Promise<void>;
  addEntry: (uid: string, type: string, payload: any) => Promise<LedgerXEntry>;
  markStatus: (id: string, status: LedgerXStatusType) => Promise<void>;
  syncNow: (uid: string) => Promise<number>;
  syncPending: (uid: string) => Promise<number>;
  hydrateFromCloud: (uid?: string) => Promise<void>;
  fetchCloudOrders: (uid: string) => Promise<LedgerXEntry[]>;
  mergeOrders: (
    localEntries: LedgerXEntry[],
    cloudOrders: LedgerXEntry[]
  ) => LedgerXEntry[];
};

export const useLedgerX = create<LedgerStore>((set, get) => {
  let lastUidSeen: string | undefined = undefined;

  async function _refreshStateFromDB(uid?: string) {
    try {
      if (typeof window === "undefined") return;

      if (!uid) {
        if (DEBUG && lastUidSeen !== uid) {
          console.log("[LedgerX] _refreshStateFromDB: waiting for uid...");
        }
        lastUidSeen = uid;
        return;
      }

      lastUidSeen = uid;

      const rows = (await getAllLedgerEntries()) || [];
      const filtered: LedgerXEntry[] = rows
        .filter((r: LedgerXDBEntry) => String(r.userId) === String(uid))
        .map(normalizeLocalRow)
        .sort((a: LedgerXEntry, b: LedgerXEntry) => b.createdAt - a.createdAt);

      set({
        entries: filtered,
        pendingCount: filtered.filter((i) => i.status === "pending").length,
      });

      DEBUG &&
        console.log("[LedgerX] Refreshed from IndexedDB:", filtered.length);
    } catch (err) {
      console.warn("[LedgerX] _refreshStateFromDB failed:", err);
      set({ entries: [], pendingCount: 0 });
    }
  }

  async function _fetchCloudOrders(uid?: string): Promise<LedgerXEntry[]> {
    // Client cache only; Supabase is fetched via dedicated APIs elsewhere.
    // Keep this stub to preserve API shape without leaking server clients here.
    if (DEBUG) {
      console.log("[LedgerX] _fetchCloudOrders skipped (client-cache only)");
    }
    return [];
  }

  function _mergeOrders(
    localEntries: LedgerXEntry[],
    cloudOrders: LedgerXEntry[]
  ) {
    const map = new Map<string, LedgerXEntry>();

    for (const c of cloudOrders || []) map.set(c.id, c);

    for (const l of localEntries || []) {
      const existing = map.get(l.id);
      if (!existing) map.set(l.id, l);
      else if (l.status === "pending" && existing.status !== "pending") {
        map.set(l.id, {
          ...existing,
          status: l.status,
          updatedAt: Math.max(existing.updatedAt || 0, l.updatedAt || 0),
        });
      }
    }

    const arr = Array.from(map.values());
    arr.sort((a, b) => b.createdAt - a.createdAt);
    return arr;
  }

  return {
    entries: [],
    pendingCount: 0,
    isSyncing: false,
    lastSyncAt: undefined,

    load: async (uid?: string) => {
      if (!uid) {
        DEBUG && console.log("[LedgerX] load(): uid missing -> waiting");
        await _refreshStateFromDB(uid);
        return;
      }
      await _refreshStateFromDB(uid);
    },

    addEntry: async (uid: string, type: string, payload: any) => {
      const now = Date.now();
      const id = uuidv4() || nanoid();
      const entry: LedgerXEntry = {
        id,
        userId: uid,
        type,
        payload: safeJson(payload),
        status: "pending",
        deviceId:
          typeof navigator !== "undefined"
            ? `device:web:${navigator?.userAgent?.slice?.(0, 80) ?? "unknown"}`
            : "device:web:unknown",
        checksum: nanoid(8),
        createdAt: now,
        updatedAt: now,
      };

      try {
        await addLedgerEntry(entry as LedgerXDBEntry);

        const current = get().entries || [];
        set({
          entries: [entry, ...current],
          pendingCount:
            current.filter((e) => e.status === "pending").length + 1,
        });

        if (isUuidLike(uid)) {
          setTimeout(() => {
            if (
              typeof navigator !== "undefined" &&
              (navigator as any)?.onLine
            ) {
              get()
                .syncPending(uid)
                .catch(
                  (e) => DEBUG && console.warn("[LedgerX] bg sync failed", e)
                );
            }
          }, 300);
        }

        return entry;
      } catch (err) {
        console.error("[LedgerX] addEntry fatal:", err);
        throw err;
      }
    },

    markStatus: async (id: string, status: LedgerXStatusType) => {
      if (!id) return;
      try {
        const rows = (await getAllLedgerEntries()) || [];
        const target = rows.find((r) => r.id === id);
        if (target) {
          target.status = status;
          target.updatedAt = Date.now();
          await addLedgerEntry(target as LedgerXDBEntry);
        }

        const updated = get().entries.map((e) =>
          e.id === id ? { ...e, status, updatedAt: Date.now() } : e
        );
        set({
          entries: updated,
          pendingCount: updated.filter((i) => i.status === "pending").length,
        });
      } catch (err) {
        console.warn("[LedgerX] markStatus failed:", err);
      }
    },

    syncNow: async (uid: string) => {
      if (!uid) return 0;
      if (!isUuidLike(uid)) {
        DEBUG && console.log("[LedgerX] syncNow skipped: guest uid");
        return 0;
      }

      if (get().isSyncing) {
        DEBUG && console.log("[LedgerX] syncNow skipped: already syncing");
        return 0;
      }

      set({ isSyncing: true });

      try {
        const all = (await getAllLedgerEntries()) || [];
        const pendingAll = all
          .filter((r) => String(r.userId) === String(uid) && r.status === "pending")
          .filter((r) => r.type !== "product-draft"); // keep product drafts local-only

        if (!pendingAll || pendingAll.length === 0) {
          set({ isSyncing: false, lastSyncAt: Date.now() });
          return 0;
        }

        let syncedCount = 0;

        for (let i = 0; i < pendingAll.length; i += SYNC_BATCH_SIZE) {
          const batch = pendingAll.slice(i, i + SYNC_BATCH_SIZE);
          const payloadEntries = batch.map((p) => ({
            id: p.id,
            user_id: p.userId,
            type: p.type,
            payload: safeJson(p.payload),
            status: p.status || "pending",
            device_id: p.deviceId ?? "unknown",
            checksum: p.checksum ?? "none",
            created_at: new Date(p.createdAt || Date.now()).toISOString(),
            updated_at: new Date(p.updatedAt || Date.now()).toISOString(),
          }));

          const body = JSON.stringify({ _entries: payloadEntries });

          let attempt = 0;
          let success = false;
          let lastErr: any = null;

          while (attempt <= SYNC_MAX_RETRIES && !success) {
            try {
              attempt++;
              DEBUG &&
                console.log(
                  `[LedgerX] sync batch ${
                    i / SYNC_BATCH_SIZE + 1
                  } attempt ${attempt}`,
                  payloadEntries.map((p) => p.id)
                );

              const res = await withTimeout(
                fetch(
                  `${
                    typeof window !== "undefined" ? window.location.origin : ""
                  }/api/ledger/sync`,
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body,
                  }
                )
              );

              if (!res.ok) {
                const d = await res.json().catch(() => ({}));
                throw new Error(d?.message || `HTTP ${res.status}`);
              }

              const now = Date.now();
              for (const p of batch) {
                try {
                  const updated = { ...p, status: "synced", updatedAt: now };
                  await addLedgerEntry(updated as LedgerXDBEntry);
                } catch (err) {
                  console.warn("[LedgerX] marking entry synced failed:", err);
                }
              }

              syncedCount += batch.length;
              success = true;
            } catch (err) {
              lastErr = err;
              console.warn(
                `[LedgerX] batch sync attempt ${attempt} failed:`,
                err
              );
              const backoffMs = Math.min(1000 * Math.pow(2, attempt), 30000);
              await new Promise((r) => setTimeout(r, backoffMs));
            }
          }

          if (!success) {
            console.error("[LedgerX] batch permanently failed:", lastErr);
          } else {
            try {
              await get().hydrateFromCloud(uid);
            } catch (e) {
              DEBUG &&
                console.warn(
                  "[LedgerX] hydrateFromCloud after batch failed:",
                  e
                );
            }
          }
        }

        await _refreshStateFromDB(uid);
        set({ lastSyncAt: Date.now() });

        return syncedCount;
      } catch (err) {
        console.error("[LedgerX] Sync Error:", err);
        return 0;
      } finally {
        set({ isSyncing: false });
      }
    },

    syncPending: async (uid: string) => {
      if (typeof window === "undefined") return 0;
      if (!(navigator as any)?.onLine) return 0;
      return get().syncNow(uid);
    },

    hydrateFromCloud: async (uid?: string) => {
      // No-op: remote hydration is handled by Supabase-backed APIs.
      if (uid && DEBUG) {
        console.log("[LedgerX] hydrateFromCloud noop for uid", uid);
      }
    },

    fetchCloudOrders: async (uid: string) => {
      return _fetchCloudOrders(uid);
    },

    mergeOrders: (localEntries: LedgerXEntry[], cloudOrders: LedgerXEntry[]) =>
      _mergeOrders(localEntries, cloudOrders),
  };
});
