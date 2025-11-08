/**
 * ============================================================
 * 📧 HomeFix API: /api/auth/send-email-otp (v4.0)
 * ------------------------------------------------------------
 * ✅ Generates 6-digit OTP
 * ✅ Updates user_profiles
 * ✅ Sends via Edge Function send-otp-email-core
 * ✅ Logs & safe errors
 * ============================================================
 */
import { error, log } from "@/lib/console";
import { supabaseService } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { email } = await req.json();
    if (!email)
      return NextResponse.json(
        { success: false, message: "Missing email" },
        { status: 400 }
      );

    const supabase = supabaseService();
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    log("API:send-email-otp", `🎯 Generating OTP for ${email}: ${code}`);

    // Store OTP in DB
    const { error: updateErr } = await supabase
      .from("user_profiles")
      .update({
        email_otp: code,
        email_otp_sent_at: new Date().toISOString(),
      })
      .eq("email", email);

    if (updateErr) {
      error("API:send-email-otp", "DB update failed:", updateErr.message);
      return NextResponse.json(
        { success: false, message: "Database error" },
        { status: 500 }
      );
    }

    // Send OTP via Edge Function
    const otpFnUrl = `${
      process.env.NEXT_PUBLIC_SUPABASE_FUNCTION_URL || process.env.SUPABASE_URL
    }/functions/v1/send-otp-email-core`;

    const sendRes = await fetch(otpFnUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ email, otp: code }),
    });

    if (!sendRes.ok) {
      const errTxt = await sendRes.text();
      error(
        "API:send-email-otp",
        `Resend failed → ${sendRes.status}: ${errTxt}`
      );
      return NextResponse.json(
        { success: false, message: "Failed to send OTP" },
        { status: 500 }
      );
    }

    log("API:send-email-otp", `✅ OTP email dispatched to ${email}`);
    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (err) {
    error("API:send-email-otp", "💥 Fatal:", err.message);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
