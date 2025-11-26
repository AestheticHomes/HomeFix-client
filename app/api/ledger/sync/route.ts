// app/api/ledger/sync/route.ts
export const runtime = "nodejs";

import { supabaseServer } from "@/lib/supabaseServerClient";
import { NextResponse } from "next/server";

/* -----------------------
   TYPES
------------------------- */
interface LedgerXIncomingEntry {
  id?: string;
  user_id?: string | null;
  type?: string;
  payload?: any;
  status?: string;
  device_id?: string;
  checksum?: string;
  created_at?: string;
  updated_at?: string;
}

interface LedgerXBody {
  _entries?: LedgerXIncomingEntry[];
}

/* -----------------------
   HELPERS
------------------------- */
const safeJson = (v: any) => {
  try {
    return JSON.parse(JSON.stringify(v ?? {}));
  } catch {
    return {};
  }
};

const safeUUID = (id?: string): string => {
  try {
    if (id && /^[0-9a-f-]{36}$/i.test(id)) return id;
    return crypto.randomUUID();
  } catch {
    return crypto.randomUUID();
  }
};

const isRealUser = (u?: string | null) =>
  !!u &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    u
  );

/* -----------------------
   POST HANDLER
------------------------- */
export async function POST(req: Request) {
  const supabase = supabaseServer;

  try {
    const body: LedgerXBody = await req.json();

    if (!Array.isArray(body._entries) || body._entries.length === 0) {
      return NextResponse.json(
        { success: false, message: "Entries array missing or empty" },
        { status: 400 }
      );
    }

    /* -----------------------------
       Normalize incoming entries
    ------------------------------ */
    const normalized = body._entries
      .filter((e) => isRealUser(e.user_id)) // reject guest or null user_id
      .map((e) => {
        const p = safeJson(e.payload);
        const loc = p?.site_location ?? p?.address ?? {};

        return {
          /* ---- IDENTIFIERS ---- */
          id: safeUUID(e.id),
          user_id: e.user_id!,
          schema_version: 1,

          /* ---- META ---- */
          type: e.type || "booking",
          status: e.status || "pending",
          channel: p.channel || "pwa",
          source: "homefix",

          /* ---- DEVICE ---- */
          device_id: e.device_id || "unknown",
          checksum: e.checksum || "none",

          /* ---- PAYLOAD ---- */
          payload: p,

          /* ---- FLATTENED LOCATION ---- */
          address: loc.formatted ?? loc.address ?? null,
          landmark: loc.landmark ?? null,
          pincode: loc.pincode ?? null,
          latitude: loc.latitude ?? null,
          longitude: loc.longitude ?? null,
          receiver_name: loc.receiver_name ?? null,
          receiver_phone: loc.receiver_phone ?? null,

          /* ---- ITEMS & TOTAL ---- */
          items: p.services ?? p.items ?? [],
          total: Number(p.total_price ?? p.total ?? 0),

          /* ---- EVENTS ---- */
          event_count: p.event_count ?? 0,

          /* ---- TIMESTAMPS ---- */
          created_at: e.created_at ?? new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      });

    if (normalized.length === 0) {
      return NextResponse.json(
        { success: false, message: "Rejected: guest or invalid user_id" },
        { status: 400 }
      );
    }

    console.log(
      `📨 [LedgerX Sync] Received entries: ${normalized.length}`,
      normalized
    );

    /* -----------------------------
       UPSERT into bookings_ledger
    ------------------------------ */
    const { data, error } = await supabase
      .from("bookings_ledger")
      .upsert(normalized, {
        onConflict: "id", // idempotent sync
        ignoreDuplicates: false,
      })
      .select("id");

    if (error) {
      console.error("❌ [LedgerX Upsert Error]", error);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    console.log(
      `✅ [LedgerX] Synced OK: ${normalized.length} sent → ${
        data?.length || 0
      } affected`
    );

    return NextResponse.json(
      {
        success: true,
        sent: normalized.length,
        affected: data?.length || 0,
        message: "Ledger synced successfully",
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("💥 [LedgerX API Fatal]", err);
    return NextResponse.json(
      { success: false, message: err?.message ?? "Internal error" },
      { status: 500 }
    );
  }
}
