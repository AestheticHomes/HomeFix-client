// app/api/auth/verify/route.js
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { error, log, warn } from "@/lib/console";

/**
 * ============================================================
 * 📘 HomeFix API: /api/auth/verify
 * ------------------------------------------------------------
 * ✅ Verifies OTP (Twilio or Debug)
 * ✅ Updates phone_verified or email_verified
 * ✅ Ensures user_profiles row exists
 * ✅ Returns user_id + verification target info
 * ============================================================
 */

export const dynamic = "force-dynamic";

// 🧱 Supabase (service-role client)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

/* ------------------------------------------------------------
   ⚙️ Twilio Loader (safe + lazy init)
------------------------------------------------------------ */
function getTwilioClient() {
  try {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    if (!sid || !token) {
      warn("Twilio", "Missing SID or Token — skipping init");
      return null;
    }
    const twilio = require("twilio");
    return twilio(sid, token);
  } catch (err) {
    error("Twilio", "💥 Failed to initialize:", err);
    return null;
  }
}

/* ------------------------------------------------------------
   🚀 Main POST handler
------------------------------------------------------------ */
export async function POST(req) {
  try {
    const raw = await req.text();
    if (!raw || raw.trim() === "{}") {
      warn("Verify", "Empty request body");
      return NextResponse.json({ skipped: true });
    }

    const { phone, email, otp, username } = JSON.parse(raw || "{}");
    const formattedPhone = phone
      ? phone.startsWith("+91") ? phone : `+91${phone}`
      : null;
    const target = formattedPhone || email;
    const safeUsername = username || "guest";

    if (!target) {
      return NextResponse.json(
        { success: false, error: "Phone or email required" },
        { status: 400 },
      );
    }

    if (!otp) {
      return NextResponse.json(
        { success: false, error: "OTP required" },
        { status: 400 },
      );
    }

    /* ------------------------------------------
       🧪 DEBUG MODE (no Twilio)
    ------------------------------------------ */
    if (process.env.DEBUG_MODE === "true") {
      log("Verify", "🧪 Debug bypass for", target);
      const profile = await ensureUserProfileExists(
        formattedPhone,
        email,
        safeUsername,
      );
      await markVerified(profile.id, !!formattedPhone, !!email);
      return NextResponse.json({
        success: true,
        verified: true,
        user_id: profile.id,
        target,
        message: "Debug mode: verification simulated",
      });
    }

    /* ------------------------------------------
       🚀 Twilio Verify Flow
    ------------------------------------------ */
    const client = getTwilioClient();
    const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
    if (!client || !serviceSid) {
      return NextResponse.json(
        { success: false, error: "Twilio not configured" },
        { status: 500 },
      );
    }

    const check = await client.verify.v2
      .services(serviceSid)
      .verificationChecks.create({
        to: target,
        code: otp,
      });

    log("Twilio", "Verification result:", check.status);

    if (check.status !== "approved") {
      return NextResponse.json(
        { success: false, verified: false, message: "Invalid or expired OTP" },
        { status: 400 },
      );
    }

    const profile = await ensureUserProfileExists(
      formattedPhone,
      email,
      safeUsername,
    );
    await markVerified(profile.id, !!formattedPhone, !!email);

    return NextResponse.json({
      success: true,
      verified: true,
      user_id: profile.id,
      target,
      message: "Verification successful",
    });
  } catch (err) {
    error("Verify", "💥 Fatal error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 },
    );
  }
}

/* ------------------------------------------------------------
   🧩 Ensure user_profiles row exists
------------------------------------------------------------ */
async function ensureUserProfileExists(
  formattedPhone = null,
  email = null,
  safeName = "guest",
) {
  try {
    const query = supabase.from("user_profiles").select("id").maybeSingle();
    const qb = formattedPhone
      ? query.eq("phone", formattedPhone)
      : query.eq("email", email);

    const { data: existing, error: checkError } = await qb;
    if (checkError) throw checkError;

    if (existing) {
      log("Supabase", "Existing user found:", formattedPhone || email);
      return { id: existing.id, created: false };
    }

    const { data: inserted, error: insertError } = await supabase
      .from("user_profiles")
      .insert([
        {
          phone: formattedPhone,
          email,
          name: safeName,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select("id")
      .single();

    if (insertError) throw insertError;
    log("Supabase", "🆕 New user profile created:", inserted.id);
    return { id: inserted.id, created: true };
  } catch (err) {
    error("Supabase", "ensureUserProfileExists failed:", err);
    return { id: null, created: false };
  }
}

/* ------------------------------------------------------------
   🧩 Mark verified flags
------------------------------------------------------------ */
async function markVerified(profileId, isPhone = false, isEmail = false) {
  try {
    const updates = { updated_at: new Date().toISOString() };
    if (isPhone) updates.phone_verified = true;
    if (isEmail) updates.email_verified = true;

    const { error: updateErr } = await supabase
      .from("user_profiles")
      .update(updates)
      .eq("id", profileId);

    if (updateErr) throw updateErr;
    log(
      "Supabase",
      `✅ Marked profile ${profileId} verified (${isPhone ? "phone" : ""} ${
        isEmail ? "email" : ""
      })`,
    );
    return true;
  } catch (err) {
    error("Supabase", "markVerified failed:", err);
    return false;
  }
}
