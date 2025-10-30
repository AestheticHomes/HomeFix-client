/**
 * File: /app/api/verify-email/route.js
 * Purpose: (auto-added during Portable Cleanup) — add a concise, human-readable purpose for this file.
 * Process: Part of HomeFix portable refactor; no functional changes made by header.
 * Dependencies: Review local imports; ensure single supabase client in /lib when applicable.
 * Note: This header is documentation-only and safe to remove or edit.
 */
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

// Send email (DEV mode can log OTP)
async function sendEmail(to, subject, message) {
  if (process.env.NODE_ENV === "development") {
    console.log(`📧 DEV EMAIL: To: ${to}, Code: ${message}`);
    return true;
  }
  // TODO: Replace this with real email service (like SendGrid or Resend)
  return true;
}

// Step 1: Request code
export async function POST(req) {
  try {
    const { email, user_id } = await req.json();
    if (!email || !user_id)
      return NextResponse.json({ success: false, error: "Missing email or user_id" }, { status: 400 });

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const { error } = await supabase
      .from("clients")
      .update({
        email,
        email_verified: false,
        email_verification_code: code,
      })
      .eq("id", user_id);

    if (error) throw error;

    await sendEmail(email, "Your HomeFix Email Verification Code", `Your code is ${code}`);

    return NextResponse.json({ success: true, message: "Verification code sent!" });
  } catch (err) {
    console.error("❌ Email verify POST error:", err);
    return NextResponse.json({ success: false, error: err.message });
  }
}

// Step 2: Verify code
export async function PUT(req) {
  try {
    const { email, user_id, code } = await req.json();
    if (!email || !user_id || !code)
      return NextResponse.json({ success: false, error: "Missing fields" }, { status: 400 });

    const { data, error } = await supabase
      .from("clients")
      .select("email_verification_code")
      .eq("id", user_id)
      .single();

    if (error) throw error;

    if (data.email_verification_code !== code)
      return NextResponse.json({ success: false, error: "Invalid code" }, { status: 400 });

    await supabase
      .from("clients")
      .update({ email_verified: true, email_verification_code: null })
      .eq("id", user_id);

    return NextResponse.json({ success: true, message: "Email verified successfully!" });
  } catch (err) {
    console.error("❌ Email verify PUT error:", err);
    return NextResponse.json({ success: false, error: err.message });
  }
}
