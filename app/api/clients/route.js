/**
 * File: /app/api/clients/route.js
 * Purpose: CRUD endpoint for lightweight client records (HomeFix booking or lead flow)
 * Dependencies:
 *  - Uses `supabaseServer` for safe service-role operations
 *  - Consistent JSON structure and unified console logging
 */

import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServerClient";
import { error, log, warn } from "@/lib/console";

export const dynamic = "force-dynamic";

// 🧩 Shared Supabase instance (service role bypasses RLS safely)
const supabase = supabaseServer;

/* ------------------------------------------------------------
   ✅ GET — Fetch client by phone
------------------------------------------------------------ */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get("phone");

    if (!phone) {
      return NextResponse.json(
        { success: false, error: "Missing phone parameter" },
        { status: 400 },
      );
    }

    log("API:clients", `🔍 Searching client by phone: ${phone}`);

    const { data, error: fetchErr } = await supabase
      .from("clients")
      .select("id, name, phone")
      .eq("phone", phone)
      .maybeSingle();

    if (fetchErr) throw fetchErr;

    if (!data) {
      warn("API:clients", `⚠️ No client found for ${phone}`);
      return NextResponse.json(
        { success: false, error: "Client not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, client: data }, { status: 200 });
  } catch (err) {
    error("API:clients", "💥 GET failed:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Server error" },
      { status: 500 },
    );
  }
}

/* ------------------------------------------------------------
   ✅ POST — Create new client
------------------------------------------------------------ */
export async function POST(req) {
  try {
    const { name, phone } = await req.json();

    if (!name || !phone) {
      return NextResponse.json(
        { success: false, error: "Missing name or phone" },
        { status: 400 },
      );
    }

    log("API:clients", `➕ Creating new client: ${name} (${phone})`);

    const { data, error: insertErr } = await supabase
      .from("clients")
      .insert([{ name, phone, created_at: new Date().toISOString() }])
      .select("id, name, phone")
      .maybeSingle();

    if (insertErr) throw insertErr;

    return NextResponse.json({ success: true, client: data }, { status: 201 });
  } catch (err) {
    error("API:clients", "💥 POST failed:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Server error" },
      { status: 500 },
    );
  }
}
