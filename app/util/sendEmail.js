"use client";
/**
 * File: /app/util/sendEmail.js
 * Purpose: (auto-added during Portable Cleanup) — add a concise, human-readable purpose for this file.
 * Process: Part of HomeFix portable refactor; no functional changes made by header.
 * Dependencies: Review local imports; ensure single supabase client in /lib when applicable.
 * Note: This header is documentation-only and safe to remove or edit.
 */

import { toast } from "@/components/ui/use-toast"; // ✅ shadcn toast hook (works if you already have it)
import { Toaster } from "@/components/ui/toaster"; // optional global toaster container

/**
 * HomeFix Email Utility
 * Triggers Supabase Edge Function for all email templates
 * Adds toast notifications for visual feedback
 */
const fnUrl = process.env.SUPABASE_FUNCTION_URL;
export async function sendEmail({ to, subject, type, data }) {
  try {
    if (!to || !subject || !type) {
      toast({
        title: "Missing Fields ⚠️",
        description: "Please check 'to', 'subject', and 'type' fields before sending.",
        variant: "destructive",
      });
      return { success: false, error: "Missing required fields" };
    }

    const payload = { to, subject, type, data };

    const res = await fetch(
      `${fnUrl}/send-booking-email-core`,
      {
        method: "POST",
        headers: {
          "Authorization": "Bearer H0m3Fix-3dg3Fn-2025@Secure!",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const json = await res.json();

    if (!res.ok) {
      toast({
        title: "Email Failed ❌",
        description: json.error || "There was an issue sending the email.",
        variant: "destructive",
      });
      console.error("❌ Email API Error:", json.error || json);
      return { success: false, error: json.error || "Email API Error" };
    }

    // ✅ Success feedback
    toast({
      title: "Email Sent Successfully ✅",
      description: `Delivered to ${to}`,
      variant: "success",
      duration: 4000,
    });

    console.log("📨 Email sent →", json.data?.id);
    return { success: true, data: json.data };
  } catch (error) {
    console.error("⚠️ sendEmail() failed:", error);
    toast({
      title: "Error ⚙️",
      description: error.message || "Something went wrong while sending.",
      variant: "destructive",
    });
    return { success: false, error: error.message };
  }
}

// Optional helper to render the toaster in your layout
export function EmailToaster() {
  return <Toaster />;
}