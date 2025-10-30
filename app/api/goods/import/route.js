/**
 * File: /app/api/goods/import/route.js
 * Purpose: (auto-added during Portable Cleanup) — add a concise, human-readable purpose for this file.
 * Process: Part of HomeFix portable refactor; no functional changes made by header.
 * Dependencies: Review local imports; ensure single supabase client in /lib when applicable.
 * Note: This header is documentation-only and safe to remove or edit.
 */
// POST /api/goods/import
// Body: { rows: [{sku,title,price,stock,category,description}] }

import { supabaseServer } from "@/lib/supabaseServerClient";
const supabase = supabaseServer;

export async function POST(req) {
  try {
    const { rows } = await req.json();

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return new Response(JSON.stringify({ error: "No rows provided" }), {
        status: 400,
      });
    }

    const { data, error } = await supabase.from("goods").insert(rows);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
      });
    }

    return new Response(JSON.stringify({ inserted: data.length }), {
      status: 200,
    });
  } catch (err) {
    console.error("❌ Import API error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}
