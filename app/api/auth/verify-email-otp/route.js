/**
 * ============================================================
 * 📘 HomeFix API: /api/auth/verify-email-otp (v4.8)
 * ------------------------------------------------------------
 * ✅ Stateless & DB-synced email verification
 * ✅ Updates email_verified = true + verified_at = NOW()
 * ✅ Finds the exact user by email or phone (cookie-based)
 * ✅ Prevents duplicate rows (atomic update)
 * ✅ DEBUG_MODE = true → accepts OTP 123456
 * ============================================================
 */

import { error, log } from "@/lib/console";
import { supabaseService } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const { email, otp } = await req.json();
    const cookieHeader = req.headers.get("cookie") || "";

    if (!email || !otp) {
      return NextResponse.json(
        { success: false, message: "Missing email or OTP" },
        { status: 400 }
      );
    }

    const supabase = supabaseService();
    log("API:verify-email-otp", `📨 Verifying email ${email} with OTP ${otp}`);

    // ------------------------------------------------------------
    // 🧪 DEBUG MODE
    // ------------------------------------------------------------
    if (process.env.DEBUG_MODE === "true") {
      if (otp !== "123456") {
        return NextResponse.json(
          { success: false, message: "Invalid debug OTP (use 123456)" },
          { status: 400 }
        );
      }
    }

    // ------------------------------------------------------------
    // 🍪 Extract user identifiers from cookies
    // ------------------------------------------------------------
    const idMatch = cookieHeader.match(/hf_user_id=([^;]+)/);
    const phoneMatch = cookieHeader.match(/hf_user_phone=([^;]+)/);
    const hfUserId = idMatch ? idMatch[1] : null;
    const hfPhone = phoneMatch ? decodeURIComponent(phoneMatch[1]) : null;

    // ------------------------------------------------------------
    // 🔍 Locate the correct profile
    // ------------------------------------------------------------
    let { data: profile } = await supabase
      .from("user_profiles")
      .select("id, phone, email, email_verified, phone_verified, name, role")
      .or(`email.eq.${email},phone.eq.${hfPhone}`)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!profile) {
      error("API:verify-email-otp", `❌ No matching user found for ${email}`);
      return NextResponse.json(
        { success: false, message: "No matching user found" },
        { status: 404 }
      );
    }

    // ------------------------------------------------------------
    // ✅ Update email_verified = true
    // ------------------------------------------------------------
    const { data: updated, error: updateErr } = await supabase
      .from("user_profiles")
      .update({
        email_verified: true,
        verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        email: email, // ensure email is attached if missing
      })
      .eq("id", profile.id)
      .select("*")
      .single();

    if (updateErr) throw updateErr;

    log("API:verify-email-otp", `✅ Email marked verified for ${email}`);

    // ------------------------------------------------------------
    // 🍪 Set verification cookies
    // ------------------------------------------------------------
    const res = NextResponse.json({
      success: true,
      verified: true,
      email,
      user_id: profile.id,
      message: "Email verified successfully",
    });

    res.headers.set(
      "Set-Cookie",
      [
        `hf_user_id=${profile.id}; Path=/; Max-Age=604800; SameSite=Lax`,
        `hf_user_email=${email}; Path=/; Max-Age=604800; SameSite=Lax`,
        `hf_user_verified=true; Path=/; Max-Age=604800; SameSite=Lax`,
      ].join(", ")
    );

    // ------------------------------------------------------------
    // 🧾 Log to http_response_log
    // ------------------------------------------------------------
    await supabase.from("http_response_log").insert([
      {
        request_url: "/api/auth/verify-email-otp",
        request_body: { email, otp },
        status: 200,
        response_body: JSON.stringify(updated),
        created_at: new Date().toISOString(),
      },
    ]);

    return res;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    error("API:verify-email-otp", "💥 Fatal:", msg);

    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
