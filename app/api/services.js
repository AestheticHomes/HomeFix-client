/**
 * File: /app/api/services.js
 * Purpose: (auto-added during Portable Cleanup) — add a concise, human-readable purpose for this file.
 * Process: Part of HomeFix portable refactor; no functional changes made by header.
 * Dependencies: Review local imports; ensure single supabase client in /lib when applicable.
 * Note: This header is documentation-only and safe to remove or edit.
 */
// pages/api/services.js
import { supabase } from "../../lib/supa";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .order("price", { ascending: true });

    if (error) throw error;

    res.status(200).json({ services: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
