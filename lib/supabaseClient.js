/**
 * ============================================================
 * 📘 FILE: /lib/supabaseClient.js
 * 🔧 Unified Supabase Clients (Browser + Server)
 * ------------------------------------------------------------
 * ✅ Single source of truth for all Supabase client instances
 * ✅ No duplicate GoTrue clients
 * ✅ No circular imports
 * ============================================================
 */

import { createClient } from "@supabase/supabase-js";

/* ------------------------------------------------------------
   ⚙️ Environment keys (validated)
------------------------------------------------------------ */
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !ANON_KEY) {
  console.error("❌ [Supabase] Missing URL or Anon key in environment");
}

/* ------------------------------------------------------------
   🌿 Browser Client — Persistent Sessions
------------------------------------------------------------ */
export const supabase = createClient(SUPABASE_URL, ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    storage: typeof window !== "undefined" && "localStorage" in window
      ? window.localStorage
      : undefined,
  },
});

/* ------------------------------------------------------------
   🧩 On-Demand Server Clients
   ------------------------------------------------------------
   supabaseAnon   → for cookie / JWT session awareness (auth.getUser)
   supabaseService → for privileged writes and triggers
------------------------------------------------------------ */
export const supabaseAnon = () =>
  createClient(SUPABASE_URL, ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

export const supabaseService = () =>
  createClient(SUPABASE_URL, SERVICE_KEY || ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

/* ------------------------------------------------------------
   🪶 Legacy Aliases (for backwards compatibility)
------------------------------------------------------------ */
export const supabaseClient = supabase;
export const supabaseBrowser = supabase;
export const supabaseServer = supabaseService; // alias maintained for API routes

/* ------------------------------------------------------------
   🧾 Initialization Log (once per runtime)
------------------------------------------------------------ */
try {
  const logOnce = (ctx) => {
    console.log("✅ [Supabase Init]");
    console.log("   URL:", SUPABASE_URL);
    console.log("   Keys:", {
      anon: ANON_KEY ? "✔️" : "❌",
      service: SERVICE_KEY ? "✔️" : "❌",
    });
    ctx.__supabaseInitLogged__ = true;
  };
  if (process.env.NODE_ENV !== "production") {
    if (typeof window !== "undefined") {
      if (!window.__supabaseInitLogged__) logOnce(window);
    } else if (typeof global !== "undefined") {
      if (!global.__supabaseInitLogged__) logOnce(global);
    }
  }
} catch (err) {
  console.warn("⚠️ [Supabase Init] Logging guard failed:", err);
}

/* ------------------------------------------------------------
   ✅ Default Export
------------------------------------------------------------ */
export default supabase;
