/**
 * ============================================================
 * 📧 FILE: /app/api/auth/send-email-otp/route.js
 * 🔧 MODULE: HomeFix Email OTP Sender v4.8 (DB Linked)
 * ------------------------------------------------------------
 * ✅ Generates + stores OTP in user_profiles
 * ✅ Sends via Resend API
 * ✅ Logs all to http_response_log
 * ✅ Simple + production safe
 * ============================================================
 */

import { supabaseService } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL =
  process.env.FROM_EMAIL || "HomeFix India <no-reply@homefixindia.in>";
const BRAND_NAME = process.env.PROJECT_BRAND || "HomeFix India";

export async function POST(req) {
  const supabase = supabaseService();

  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json(
        { success: false, message: "Missing email address" },
        { status: 400 }
      );
    }

    // 🔢 Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`🟢 [send-email-otp] Generated OTP for ${email}:`, otp);

    // 🧠 Store OTP in user_profiles (create or update)
    const { data: existing, error: fetchErr } = await supabase
      .from("user_profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (fetchErr) throw fetchErr;

    if (existing) {
      await supabase
        .from("user_profiles")
        .update({
          email_otp: otp,
          otp_created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
    } else {
      await supabase.from("user_profiles").insert([
        {
          email,
          email_otp: otp,
          otp_created_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          role: "client",
        },
      ]);
    }

    // 📨 Send via Resend API
    const subject = `${BRAND_NAME} — Verify Your Email Address`;
    const html = `
      <div style="font-family:Arial, sans-serif; max-width:480px; margin:auto; border:1px solid #eee; border-radius:10px; padding:20px;">
        <h2 style="color:#16a34a; text-align:center;">${BRAND_NAME}</h2>
        <p>Hello 👋,</p>
        <p>Your verification code is:</p>
        <h1 style="text-align:center; color:#111;">${otp}</h1>
        <p style="font-size:14px; color:#555;">This code is valid for 10 minutes. Please do not share it with anyone.</p>
        <hr />
        <p style="text-align:center; font-size:12px; color:#999;">© ${new Date().getFullYear()} ${BRAND_NAME}</p>
      </div>
    `;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: FROM_EMAIL, to: [email], subject, html }),
    });

    const result = await response.json();

    await supabase.from("http_response_log").insert([
      {
        request_url: "/api/auth/send-email-otp",
        request_body: { email },
        status: response.status,
        response_body: JSON.stringify(result),
        created_at: new Date().toISOString(),
      },
    ]);

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
      otp: process.env.DEBUG_MODE === "true" ? otp : undefined,
    });
  } catch (err) {
    console.error("💥 [send-email-otp] Error:", err);
    await supabase.from("http_response_log").insert([
      {
        request_url: "/api/auth/send-email-otp",
        status: 500,
        response_body: JSON.stringify({ error: err.message }),
        created_at: new Date().toISOString(),
      },
    ]);

    return NextResponse.json(
      { success: false, message: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
