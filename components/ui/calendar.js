"use client";
/**
 * File: /components/ui/calendar.js
 * Purpose: (auto-added during Portable Cleanup) — add a concise, human-readable purpose for this file.
 * Process: Part of HomeFix portable refactor; no functional changes made by header.
 * Dependencies: Review local imports; ensure single supabase client in /lib when applicable.
 * Note: This header is documentation-only and safe to remove or edit.
 */
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

export function Calendar(props) {
  return (
    <DayPicker
      {...props}
      className="p-3 rounded-xl border border-border"
      mode="single"
    />
  );
}