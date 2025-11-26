/**
 * ============================================================
 * 📘 API: /api/auth/verify-email-otp (v5.1 Idempotent & Strict)
 * ------------------------------------------------------------
 * ✅ Verifies otp for the *current* email on the user profile
 * ✅ Idempotent when already verified for same email (200)
 * ✅ Precise conflicts: EMAIL_MISMATCH (409), NOT_FOUND (404)
 * ✅ Proper 400s: INVALID_OTP / EXPIRED_OTP with codes
 * ✅ On success: sets email_verified = true, clears email_otp
 * ============================================================
 */
import { supabaseServer } from "@/lib/supabaseServerClient";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
const OTP_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

type Json = Record<string, any>;

function getCookie(req: Request, name: string): string | null {
  const raw = req.headers.get("cookie") || "";
  const m = raw.match(new RegExp(`${name}=([^;]+)`));
  return m ? decodeURIComponent(m[1]) : null;
}

export async function POST(req: Request) {
  const svc = supabaseServer;

  try {
    const { email, otp } = (await req.json()) as {
      email?: string;
      otp?: string;
    };

    if (!email || !otp || !/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        {
          success: false,
          code: "VALIDATION",
          message: "Email and a 6-digit OTP are required.",
        },
        { status: 400 }
      );
    }

    // Locate user: prefer cookie id; fallback to email
    const userId = getCookie(req, "hf_user_id");
    const selectCols =
      "id, email, email_verified, email_otp, otp_created_at, updated_at";

    let profile: any = null;
    if (userId) {
      const { data, error } = await svc
        .from("user_profiles")
        .select(selectCols)
        .eq("id", userId)
        .maybeSingle();
      if (error) throw error;
      profile = data;
    } else {
      const { data, error } = await svc
        .from("user_profiles")
        .select(selectCols)
        .eq("email", email)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      profile = data;
    }

    if (!profile) {
      return NextResponse.json(
        {
          success: false,
          code: "NOT_FOUND",
          message: "No matching user found.",
        },
        { status: 404 }
      );
    }

    const storedEmail: string | null = profile.email ?? null;

    // If email on profile does not match the one being verified, that’s a real conflict
    if (!storedEmail || storedEmail.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json(
        {
          success: false,
          code: "EMAIL_MISMATCH",
          message:
            "This code is for a different email. Re-send OTP for the current email.",
        },
        { status: 409 }
      );
    }

    // Idempotent success: already verified for this exact email
    if (profile.email_verified === true && !profile.email_otp) {
      return NextResponse.json({
        success: true,
        verified: true,
        message: "Email already verified.",
      });
    }

    // Validate OTP existence & freshness
    const storedOtp: string | null = profile.email_otp ?? null;
    const createdAt: string | null = profile.otp_created_at ?? null;

    if (!storedOtp || !createdAt) {
      return NextResponse.json(
        {
          success: false,
          code: "NOT_FOUND",
          message: "No active code found for this email. Send a new OTP.",
        },
        { status: 404 }
      );
    }

    const ageOk = Date.now() - new Date(createdAt).getTime() <= OTP_WINDOW_MS;

    if (!ageOk) {
      return NextResponse.json(
        {
          success: false,
          code: "EXPIRED_OTP",
          message: "Code expired. Request a new one.",
        },
        { status: 400 }
      );
    }

    if (storedOtp !== otp) {
      return NextResponse.json(
        {
          success: false,
          code: "INVALID_OTP",
          message: "Invalid code. Try again or resend.",
        },
        { status: 400 }
      );
    }

    // Success: mark verified + clear OTP
    const now = new Date().toISOString();
    const { data: updated, error: upErr } = await svc
      .from("user_profiles")
      .update({
        email_verified: true,
        verified_at: now,
        updated_at: now,
        email_otp: null,
        otp_created_at: null,
      })
      .eq("id", profile.id)
      .select("id, email, email_verified")
      .single();

    if (upErr) throw upErr;

    const res = NextResponse.json({
      success: true,
      verified: true,
      email,
      user_id: profile.id,
      message: "Email verified successfully.",
    });

    // Refresh cookies
    res.headers.set(
      "Set-Cookie",
      [
        `hf_user_id=${profile.id}; Path=/; Max-Age=604800; SameSite=Lax`,
        `hf_user_email=${email}; Path=/; Max-Age=604800; SameSite=Lax`,
        `hf_user_verified=true; Path=/; Max-Age=604800; SameSite=Lax`,
      ].join(", ")
    );

    return res;
  } catch (e: any) {
    return NextResponse.json(
      {
        success: false,
        code: "SERVER",
        message: e?.message || "Server error.",
      },
      { status: 500 }
    );
  }
}
