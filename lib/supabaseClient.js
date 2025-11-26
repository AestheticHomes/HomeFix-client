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
   🧩 On-Demand anon client (non-persistent)
------------------------------------------------------------ */
export const supabaseAnon = () =>
  createClient(SUPABASE_URL, ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

/* ------------------------------------------------------------
   🪶 Legacy Aliases (for backwards compatibility)
------------------------------------------------------------ */
export const supabaseClient = supabase;
export const supabaseBrowser = supabase;

/* ------------------------------------------------------------
   ✅ Default Export
------------------------------------------------------------ */
export default supabase;
