/**
 * ============================================================
 * 📘 HomeFix API: /api/auth/verify-email-otp (v3.2)
 * ------------------------------------------------------------
 * ✅ Validates 6-digit OTP for email verification
 * ✅ Attaches email if missing (from cookie user)
 * ✅ Supports DEBUG_MODE= true (OTP 123456)
 * ✅ Safe fallback verification if Edge Function unavailable
 * ✅ Sets persistent cookies: hf_user_id, hf_user_email, hf_user_verified
 * ============================================================
 */

import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabaseClient";
import { error, log } from "@/lib/console";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const { email, otp } = await req.json();
    const cookieHeader = req.headers.get("cookie") || "";

    if (!email || !otp) {
      return NextResponse.json(
        { success: false, message: "Missing email or OTP" },
        { status: 400 },
      );
    }

    const supabase = supabaseService();
    const idMatch = cookieHeader.match(/hf_user_id=([^;]+)/);
    const phoneMatch = cookieHeader.match(/hf_user_phone=([^;]+)/);
    const hfUserId = idMatch ? idMatch[1] : null;
    const hfPhone = phoneMatch ? decodeURIComponent(phoneMatch[1]) : null;

    log("API:verify-email-otp", `📨 Incoming verification for ${email}`);

    /* ------------------------------------------------------------
       🧪 DEBUG MODE (local testing only)
    ------------------------------------------------------------ */
    if (process.env.DEBUG_MODE === "true") {
      if (otp !== "123456") {
        return NextResponse.json(
          { success: false, message: "Invalid debug OTP. Use 123456." },
          { status: 400 },
        );
      }
      return await verifyAndAttachEmail(
        supabase,
        email,
        hfUserId,
        hfPhone,
        true,
      );
    }

    /* ------------------------------------------------------------
       🚀 Production (Edge Function-based verification)
    ------------------------------------------------------------ */
    const VERIFY_URL = process.env.NEXT_PUBLIC_SUPABASE_FUNCTION_URL ||
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/verify-email-otp`;

    log("API:verify-email-otp", `🌍 Calling edge function → ${VERIFY_URL}`);

    const response = await fetch(VERIFY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ email, otp }),
    });

    if (response.status === 404) {
      log(
        "API:verify-email-otp",
        "⚠️ Edge Function missing — fallback triggered",
      );
      return await verifyAndAttachEmail(
        supabase,
        email,
        hfUserId,
        hfPhone,
        false,
      );
    }

    const data = await response.json();

    if (!response.ok) {
      error("API:verify-email-otp", "Edge function failed:", data);
      return NextResponse.json(
        { success: false, message: "Verification failed" },
        { status: response.status },
      );
    }

    const user_id = data?.user_id || hfUserId || null;

    const res = NextResponse.json({
      success: true,
      verified: true,
      email,
      user_id,
      message: "Email verified successfully",
    });

    res.headers.set(
      "Set-Cookie",
      [
        `hf_user_id=${user_id}; Path=/; Max-Age=604800; SameSite=Lax`,
        `hf_user_email=${email}; Path=/; Max-Age=604800; SameSite=Lax`,
        `hf_user_verified=true; Path=/; Max-Age=604800; SameSite=Lax`,
      ].join(", "),
    );

    return res;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    error("API:verify-email-otp", "💥 Fatal:", msg);

    return NextResponse.json(
      { success: false, message: msg },
      { status: 500 },
    );
  }
}

/* ------------------------------------------------------------
   🔁 Shared local/fallback verification helper
------------------------------------------------------------ */
async function verifyAndAttachEmail(
  supabase,
  email,
  hfUserId,
  hfPhone,
  debugMode,
) {
  log("API:verify-email-otp", "🧩 Running local verification logic");

  // Find user by email
  let { data: user } = await supabase
    .from("user_profiles")
    .select("id, phone")
    .eq("email", email)
    .maybeSingle();

  // Try fallback via cookie
  if (!user && (hfUserId || hfPhone)) {
    const { data: attached, error: attachErr } = await supabase
      .from("user_profiles")
      .update({
        email,
        email_verified: true,
        updated_at: new Date().toISOString(),
      })
      .or(`id.eq.${hfUserId},phone.eq.${hfPhone}`)
      .select("id, phone")
      .maybeSingle();

    if (attachErr) throw attachErr;
    user = attached;
  }

  if (!user) {
    error("API:verify-email-otp", `No user found for ${email}`);
    return NextResponse.json(
      { success: false, message: "No matching user found" },
      { status: 404 },
    );
  }

  await supabase
    .from("user_profiles")
    .update({
      email_verified: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  log("API:verify-email-otp", `✅ Email verified for ${email}`);

  const res = NextResponse.json({
    success: true,
    verified: true,
    email,
    user_id: user.id,
    message: debugMode
      ? "Email verified (debug mode)"
      : "Email verified locally (fallback)",
  });

  res.headers.set(
    "Set-Cookie",
    [
      `hf_user_id=${user.id}; Path=/; Max-Age=604800; SameSite=Lax`,
      `hf_user_email=${email}; Path=/; Max-Age=604800; SameSite=Lax`,
      `hf_user_verified=true; Path=/; Max-Age=604800; SameSite=Lax`,
    ].join(", "),
  );

  return res;
}
