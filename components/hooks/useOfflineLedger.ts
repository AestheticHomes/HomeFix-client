"use client";
/**
 * ============================================================
 * 🧾 Edith Continuum v7.2 — Offline Ledger Hook
 * ------------------------------------------------------------
 * ✅ Hybrid offline + Supabase queue
 * ✅ Tracks orders, items, delivery, and payment states
 * ✅ Syncs automatically when online
 * ============================================================
 */

import { useEffect, useState } from "react";

/* ============================================================
   ⚙️ Local Storage Helpers
   ============================================================ */
const STORAGE_KEY = "hf_offline_orders";

function loadQueue() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveQueue(queue: any[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
}

/* ============================================================
   🧠 Hook
   ============================================================ */
export function useOfflineLedger() {
  const [queue, setQueue] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [online, setOnline] = useState(true);

  // 🔁 Load queue on mount
  useEffect(() => {
    setQueue(loadQueue());
  }, []);

  // 🌐 Watch online/offline
  useEffect(() => {
    const updateStatus = () => setOnline(navigator.onLine);
    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);
    updateStatus();
    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
    };
  }, []);

  /* ============================================================
     🧾 Queue Actions
     ============================================================ */
  function addOrder(order: any) {
    const newOrder = { ...order, local_id: `local-${Date.now()}` };
    const updated = [...queue, newOrder];
    setQueue(updated);
    saveQueue(updated);
    return newOrder.local_id;
  }

  function updateOrder(id: string, updates: Record<string, any>) {
    const updated = queue.map((o) =>
      o.local_id === id ? { ...o, ...updates } : o
    );
    setQueue(updated);
    saveQueue(updated);
  }

  function removeOrder(id: string) {
    const updated = queue.filter((o) => o.local_id !== id);
    setQueue(updated);
    saveQueue(updated);
  }

  /* ============================================================
     🔄 Sync Logic
     ============================================================ */
  async function syncPaidOrders() {
    if (!online) return;
    const unsynced = loadQueue().filter(
      (o: any) => o.payment?.status === "success" && !o.synced
    );
    if (!unsynced.length) return;

    setIsSyncing(true);

    for (const order of unsynced) {
      try {
        const res = await fetch("/api/orders/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(order),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          updateOrder(order.local_id, { synced: true, status: "synced" });
        } else {
          console.warn("❌ Sync failed:", data.error);
        }
      } catch (err) {
        console.warn("💤 Offline order could not sync:", err);
      }
    }

    setIsSyncing(false);
    setLastSync(new Date().toISOString());
  }

  useEffect(() => {
    if (online) syncPaidOrders();
  }, [online]);

  /* ============================================================
     🧩 Public API
     ============================================================ */
  return {
    queue,
    online,
    isSyncing,
    lastSync,
    addOrder,
    updateOrder,
    removeOrder,
    syncPaidOrders,
  };
}
