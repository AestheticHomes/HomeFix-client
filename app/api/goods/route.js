/**
 * ============================================================
 * 📦 File: /app/api/goods/route.js
 * ------------------------------------------------------------
 * ✅ Handles CRUD operations for the `goods` table
 * ✅ Uses unified supabaseServer() (service-role)
 * ✅ Structured JSON responses for Admin Dashboard & PWA
 * ✅ Auto-timestamped inserts/updates
 * ============================================================
 */

import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServerClient";

export const dynamic = "force-dynamic"; // ensures live reads via Edge runtime

const supabase = supabaseServer;

/* ------------------------------------------------------------
   🔹 GET — list all goods
------------------------------------------------------------ */
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("goods")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ success: true, goods: data }, { status: 200 });
  } catch (err) {
    console.error("❌ [GET /goods]:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 },
    );
  }
}

/* ------------------------------------------------------------
   🔹 POST — create new item
------------------------------------------------------------ */
export async function POST(req) {
  try {
    const body = await req.json();
    const record = {
      ...body,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("goods")
      .insert([record])
      .select("*")
      .single();

    if (error) throw error;
    console.log("🆕 [POST /goods] Added:", data.id);
    return NextResponse.json({ success: true, item: data }, { status: 201 });
  } catch (err) {
    console.error("❌ [POST /goods]:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 },
    );
  }
}

/* ------------------------------------------------------------
   🔹 PUT — update existing item
------------------------------------------------------------ */
export async function PUT(req) {
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json(
        { success: false, error: "Missing item ID" },
        { status: 400 },
      );
    }

    const record = {
      ...body,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("goods")
      .update(record)
      .eq("id", body.id)
      .select("*")
      .single();

    if (error) throw error;
    console.log("✏️ [PUT /goods] Updated:", body.id);
    return NextResponse.json({ success: true, item: data }, { status: 200 });
  } catch (err) {
    console.error("❌ [PUT /goods]:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 },
    );
  }
}

/* ------------------------------------------------------------
   🔹 DELETE — remove item by ID
------------------------------------------------------------ */
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing ?id= param" },
        { status: 400 },
      );
    }

    const { error } = await supabase.from("goods").delete().eq("id", id);
    if (error) throw error;

    console.log("🗑️ [DELETE /goods] Removed:", id);
    return NextResponse.json(
      { success: true, message: `Item ${id} deleted` },
      { status: 200 },
    );
  } catch (err) {
    console.error("❌ [DELETE /goods]:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 },
    );
  }
}
