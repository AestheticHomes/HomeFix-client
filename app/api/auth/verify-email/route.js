/**
 * ============================================================
 * 📧 API: /api/auth/verify-email
 * HomeFix India — Email Verification Sender v2.5 🌿
 * ------------------------------------------------------------
 * ✅ Uses unified Supabase service client (no duplicate createClient)
 * ✅ Supports DEBUG_MODE for dev testing
 * ✅ Sends via Edge Function `send-booking-email`
 * ✅ Fully typed JSON responses + console logs
 * ✅ Edith logger integration
 * ============================================================
 */

import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabaseClient";
import { error, log } from "@/lib/console";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Missing email" },
        { status: 400 },
      );
    }

    const supabase = supabaseService();
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    log("API:verify-email", `📧 Sending verification to ${email}`);
    log("API:verify-email", `🪄 Generated OTP: ${code}`);

    // ✅ Store OTP in DB
    const { error: updateErr } = await supabase
      .from("user_profiles")
      .update({
        email_otp: code,
        email_otp_sent_at: new Date().toISOString(),
      })
      .eq("email", email);

    if (updateErr) {
      error(
        "API:verify-email",
        "⚠️ Supabase update failed:",
        updateErr.message,
      );
      return NextResponse.json(
        { success: false, error: "Failed to store OTP" },
        { status: 500 },
      );
    }

    // 🧪 Debug mode (don’t actually send email)
    if (process.env.DEBUG_MODE === "true") {
      log(
        "API:verify-email",
        `🧪 [DEBUG] OTP ${code} generated for ${email} (not sent)`,
      );
      return NextResponse.json({
        success: true,
        debug: true,
        otp: code,
        message: `Debug mode active — OTP not sent`,
      });
    }

    // 🚀 Real email via Supabase Edge Function
    const fnUrl = process.env.SUPABASE_FUNCTION_URL;
    const sendUrl = `${fnUrl}/send-booking-email`;

    const sendRes = await fetch(sendUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: email,
        subject: "HomeFix Email Verification",
        message: `
          <div style="font-family:sans-serif;padding:16px">
            <h2>Your HomeFix verification code:</h2>
            <h1 style="color:#16a34a;font-size:32px;letter-spacing:3px;">${code}</h1>
            <p>This code expires in 10 minutes.</p>
          </div>
        `,
      }),
    });

    if (!sendRes.ok) {
      const errText = await sendRes.text();
      error(
        "API:verify-email",
        `⚠️ Edge Function failed → ${sendRes.status}: ${errText}`,
      );
      return NextResponse.json(
        { success: false, error: "Failed to send verification email" },
        { status: 500 },
      );
    }

    log(
      "API:verify-email",
      `✅ Verification email sent successfully to ${email}`,
    );

    return NextResponse.json({
      success: true,
      message: "Verification email sent successfully",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    error("API:verify-email", "💥 Fatal runtime error:", message);

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}

/* ------------------------------------------------------------
   🧩 OPTIONS — Preflight for CORS
------------------------------------------------------------ */
export async function OPTIONS() {
  return new Response("OK", {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
