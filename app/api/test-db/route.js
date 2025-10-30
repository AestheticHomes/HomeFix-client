/**
 * File: /app/api/test-db/route.js
 * Purpose: Supabase connection test API (server-only)
 */
export const dynamic = "force-dynamic"; // ✅ disables prerendering

import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseClient";

// app/api/test/admin-create/route.js
export async function GET(req) {
  if (process.env.NEXT_PHASE === "phase-export") {
    return Response.json({ skipped: true, reason: "Static export mode" });
  }

  try {
    // existing create user logic...
  } catch (ex) {
    console.error("💥 Test route error:", ex);
    return Response.json({ error: ex.message }, { status: 500 });
  }
}

