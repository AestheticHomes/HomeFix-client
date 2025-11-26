// /app/api/auth/send-email-otp/route.ts
import { supabaseServer } from "@/lib/supabaseServerClient";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/* ── ENV ───────────────────────────────────────────────────────── */
const RESEND_API_KEY = process.env.RESEND_API_KEY ?? "";
const BRAND_NAME = process.env.PROJECT_BRAND ?? "HomeFix India";
const FROM_EMAIL =
  process.env.FROM_EMAIL ?? "HomeFix India <no-reply@aesthetichomes.net>";

/* ── Types ─────────────────────────────────────────────────────── */
type Json = Record<string, unknown>;

interface Profile {
  id: string;
  email: string | null;
  email_verified: boolean | null;
  email_otp: string | null;
  otp_created_at: string | null;
  phone: string | null;
  phone_verified: boolean | null;
  name: string | null;
  role: string | null;
  updated_at?: string | null;
  created_at?: string | null;
}

interface Body {
  email: string;
}

/* ── Utils ─────────────────────────────────────────────────────── */
const generateOtp = (): string =>
  Math.floor(100000 + Math.random() * 900000).toString();

const getUserIdFromCookies = (cookieHeader = ""): string | null => {
  const m = cookieHeader.match(/hf_user_id=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : null;
};

async function sendOtpEmail(email: string, otp: string) {
  if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY not configured");

  const subject = `${BRAND_NAME} — Verify Your Email Address`;
  const html = `
    <div style="font-family:Arial, sans-serif; max-width:480px; margin:0 auto; padding:24px;">
      <h2 style="margin-bottom:8px;">Verify your email for ${BRAND_NAME}</h2>
      <p style="margin-bottom:16px; color:#4b5563;">Use the one-time code below to verify your email address:</p>
      <div style="font-size:32px; letter-spacing:0.3em; font-weight:bold; padding:16px 0; text-align:center;">
        ${otp}
      </div>
      <p style="margin-top:16px; color:#6b7280; font-size:14px;">This code will expire in 10 minutes. If you didn’t request this, you can safely ignore this email.</p>
    </div>
  `;

  const resp = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: FROM_EMAIL, to: [email], subject, html }),
  });

  if (!resp.ok) {
    const body = await resp.text().catch(() => "");
    console.error(
      "❌ [send-email-otp] Resend error:",
      resp.status,
      resp.statusText,
      body
    );
    if (resp.status === 403 && /domain is not verified/i.test(body)) {
      throw new Error("Resend domain not verified");
    }
    throw new Error("Failed to dispatch OTP email");
  }
}

async function logHttp(
  url: string,
  status: number,
  requestBody?: Json | null,
  responseBody?: Json | null
) {
  try {
    const sb = supabaseServer;
    await sb.from("http_response_log").insert([
      {
        request_url: url,
        status,
        request_body: requestBody ?? null,
        response_body: responseBody ? JSON.stringify(responseBody) : null,
        created_at: new Date().toISOString(),
      },
    ]);
  } catch (e) {
    console.error("⚠️ [send-email-otp] logHttp failed:", e);
  }
}

/* ── Handler ───────────────────────────────────────────────────── */
export async function POST(req: Request) {
  const started = Date.now();
  const sb = supabaseServer;

  try {
    const { email } = (await req.json()) as Body;
    const cookieHeader = req.headers.get("cookie") || "";
    const userId = getUserIdFromCookies(cookieHeader);

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }

    console.log(
      `🟢 [send-email-otp] email=${email}, hf_user_id=${userId ?? "null"}`
    );

    // Prefer cookie-anchored lookup; fallback to email
    let profile: Profile | null = null;

    if (userId) {
      const { data, error } = await sb
        .from("user_profiles")
        .select(
          "id,email,email_verified,email_otp,otp_created_at,phone,phone_verified,name,role"
        )
        .eq("id", userId)
        .maybeSingle<Profile>();
      if (error) throw error;
      profile = data ?? null;
    } else {
      const { data, error } = await sb
        .from("user_profiles")
        .select(
          "id,email,email_verified,email_otp,otp_created_at,phone,phone_verified,name,role"
        )
        .eq("email", email)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle<Profile>();
      if (error) throw error;
      profile = data ?? null;
    }

    const nowIso = new Date().toISOString();
    const otp = generateOtp();

    // Create new profile if missing
    if (!profile) {
      const { data: inserted, error: insErr } = await sb
        .from("user_profiles")
        .insert([
          {
            email,
            email_verified: false,
            email_otp: otp,
            otp_created_at: nowIso,
            created_at: nowIso,
            updated_at: nowIso,
            role: "client",
          },
        ])
        .select(
          "id,email,email_verified,email_otp,otp_created_at,phone,phone_verified,name,role"
        )
        .single<Profile>();
      if (insErr) throw insErr;

      await sendOtpEmail(email, otp);

      await logHttp(
        "/api/auth/send-email-otp",
        200,
        { email, created_new_user: true },
        {
          id: inserted.id,
          email: inserted.email,
          email_verified: inserted.email_verified,
        }
      );

      const res = NextResponse.json({
        success: true,
        message: "OTP sent successfully",
      });
      // Set cookie so verify hits the exact row next
      res.headers.set(
        "Set-Cookie",
        `hf_user_id=${inserted.id}; Path=/; Max-Age=604800; SameSite=Lax`
      );
      console.log(
        `✅ [send-email-otp] Created user + sent OTP (user_id=${inserted.id})`
      );
      return res;
    }

    // Existing profile — always rotate OTP; reset verification on email change
    const emailChanged =
      !!profile.email && profile.email.toLowerCase() !== email.toLowerCase();

    const updatePayload: Partial<Profile> & {
      email: string;
      email_otp: string;
      otp_created_at: string;
      updated_at: string;
      email_verified?: boolean;
    } = {
      email,
      email_otp: otp,
      otp_created_at: nowIso,
      updated_at: nowIso,
    };

    if (emailChanged || !profile.email_verified) {
      updatePayload.email_verified = false;
    }

    const { data: updated, error: updErr } = await sb
      .from("user_profiles")
      .update(updatePayload)
      .eq("id", profile.id)
      .select(
        "id,email,email_verified,email_otp,otp_created_at,phone,phone_verified,name,role"
      )
      .single<Profile>();
    if (updErr) throw updErr;

    await sendOtpEmail(email, otp);

    await logHttp(
      "/api/auth/send-email-otp",
      200,
      { email, linked_user_id: profile.id },
      {
        id: updated.id,
        email: updated.email,
        email_verified: updated.email_verified,
      }
    );

    console.log(`✅ [send-email-otp] Updated profile ${profile.id} + sent OTP`);
    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("💥 [send-email-otp] Fatal:", msg);

    await logHttp(
      "/api/auth/send-email-otp",
      500,
      { error: msg },
      { error: msg }
    );

    const status = /domain not verified/i.test(msg) ? 502 : 500;
    const message = /domain not verified/i.test(msg)
      ? "Email provider domain is not verified. Please verify your sending domain."
      : "Failed to send email OTP";

    return NextResponse.json({ success: false, message }, { status });
  } finally {
    console.log(`⏱️ [send-email-otp] Completed in ${Date.now() - started}ms`);
  }
}
