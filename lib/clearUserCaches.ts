"use client";

/**
 * clearUserCaches
 * ---------------------------------------
 * Wipes user-scoped caches to avoid stale/ghost sessions.
 * Safe to call multiple times.
 */
export async function clearUserCaches() {
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem("hf-user-profile");
      localStorage.removeItem("hf-user-email");
      localStorage.removeItem("hf-user-phone");
      localStorage.removeItem("hf-last-user-id");
      Object.keys(localStorage)
        .filter((k) => k.startsWith("hf_") || k.startsWith("homefix"))
        .forEach((k) => localStorage.removeItem(k));
    }
  } catch (err) {
    console.warn("[clearUserCaches] localStorage error", err);
  }

  try {
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.clear();
    }
  } catch (err) {
    console.warn("[clearUserCaches] sessionStorage error", err);
  }

  try {
    if (typeof indexedDB !== "undefined") {
      const dbNames = ["ledger-db", "ledgerx-db"];
      dbNames.forEach((name) => {
        const req = indexedDB.deleteDatabase(name);
        req.onerror = () =>
          console.warn("[clearUserCaches] failed to delete", name);
      });
    }
  } catch (err) {
    console.warn("[clearUserCaches] indexedDB error", err);
  }
}
