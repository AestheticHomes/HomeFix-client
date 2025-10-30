"use client";
/**
 * File: /app/devtools/page.js
 * Purpose: (auto-added during Portable Cleanup) — add a concise, human-readable purpose for this file.
 * Process: Part of HomeFix portable refactor; no functional changes made by header.
 * Dependencies: Review local imports; ensure single supabase client in /lib when applicable.
 * Note: This header is documentation-only and safe to remove or edit.
 */
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function DevTools() {
  const [status, setStatus] = useState("Checking...");

  useEffect(() => {
    async function testSupabase() {
      try {
        const { data, error } = await supabase.from("users").select("*").limit(1);
        if (error) throw error;
        setStatus(`✅ Connected. Found ${data.length} user(s).`);
      } catch (err) {
        setStatus(`❌ Error: ${err.message}`);
      }
    }
    testSupabase();
  }, []);

  return (
    <main className="p-8 text-center">
      <h1 className="text-2xl font-bold mb-4">Supabase Connectivity Test</h1>
      <p>{status}</p>
    </main>
  );
}