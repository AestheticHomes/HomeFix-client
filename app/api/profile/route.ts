// /app/api/profile/route.ts
// HomeFix Profile Manager v6 — server-truth, no accidental verification

import { supabaseServer } from "@/lib/supabaseServerClient";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const TABLE = "user_profiles";

/* ------------------------- helpers ------------------------- */

function normalizePhone(raw?: string | null): string | null {
  if (!raw) return null;
  let p = String(raw).replace(/\D/g, "");
  if (p.startsWith("91") && p.length === 12) return "+" + p;
  if (p.startsWith("+91")) return p;
  if (p.length === 10) return "+91" + p;
  return "+91" + p.slice(-10);
}

function getUserIdFromCookies(cookieHeader = ""): string | null {
  const m = cookieHeader.match(/hf_user_id=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

/* --------------------------- types -------------------------- */

type Profile = {
  id: string;
  name: string | null;
  phone: string | null;
  phone_verified: boolean | null;
  email: string | null;
  email_verified: boolean | null;
  email_otp: string | null;
  otp_created_at: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  updated_at?: string | null;
};

type PostBody = {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  // client flags are ignored for safety (no silent flips)
  email_verified?: boolean;
  phone_verified?: boolean;
};

/* ============================= POST ============================= */
/**
 * Create/Update profile:
 * - Identifies row by hf_user_id cookie; falls back to normalized phone.
 * - NEVER sets email_verified=true here.
 * - If email changes → email_verified=false and clears OTP fields.
 * - NEVER escalates phone_verified; verification endpoints do that.
 */
export async function POST(req: Request) {
  const sb = supabaseServer;

  try {
    const body = (await req.json()) as PostBody;
    const cookieHeader = req.headers.get("cookie") || "";
    const userId = getUserIdFromCookies(cookieHeader);

    const phoneSafe = normalizePhone(body.phone ?? null);
    const emailInput = body.email?.trim() || null;

    if (!userId && !phoneSafe) {
      return NextResponse.json(
        { success: false, message: "Missing identity (user cookie or phone)" },
        { status: 400 }
      );
    }

    // load current profile (by id if present, else by phone)
    let current: Profile | null = null;

    if (userId) {
      const { data, error } = await sb
        .from(TABLE)
        .select(
          "id, name, phone, phone_verified, email, email_verified, email_otp, otp_created_at, address, latitude, longitude, updated_at"
        )
        .eq("id", userId)
        .maybeSingle();
      if (error) throw error;
      current = (data as Profile) ?? null;
    } else {
      const { data, error } = await sb
        .from(TABLE)
        .select(
          "id, name, phone, phone_verified, email, email_verified, email_otp, otp_created_at, address, latitude, longitude, updated_at"
        )
        .eq("phone", phoneSafe!)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      current = (data as Profile) ?? null;
    }

    const nowIso = new Date().toISOString();

    let emailChanged = false;
    if (emailInput !== null) {
      const currEmail = (current?.email || "").trim().toLowerCase();
      emailChanged = currEmail !== emailInput.toLowerCase();
    }

    const update: Partial<Profile> = {
      updated_at: nowIso,
    };

    if (typeof body.name === "string") update.name = body.name.trim();
    if (typeof body.address === "string") update.address = body.address.trim();
    if (typeof body.latitude === "number") update.latitude = body.latitude;
    if (typeof body.longitude === "number") update.longitude = body.longitude;

    if (phoneSafe) update.phone = phoneSafe;
    if (emailInput !== null) update.email = emailInput;

    if (emailChanged) {
      update.email_verified = false;
      update.email_otp = null;
      update.otp_created_at = null;
    } else if (current) {
      update.email_verified = !!current.email_verified;
    }

    if (current) {
      update.phone_verified = !!current.phone_verified;
    }

    let saved: Profile;

    if (current) {
      const { data, error } = await sb
        .from(TABLE)
        .update(update)
        .eq("id", current.id)
        .select(
          "id, name, phone, phone_verified, email, email_verified, address, latitude, longitude, updated_at"
        )
        .single();
      if (error) throw error;
      saved = data as Profile;
    } else {
      const insert: Partial<Profile> = {
        name: update.name ?? null,
        phone: phoneSafe ?? null,
        phone_verified: false,
        email: emailInput,
        email_verified: false,
        address: update.address ?? null,
        latitude: update.latitude ?? null,
        longitude: update.longitude ?? null,
        updated_at: nowIso,
      };

      const { data, error } = await sb
        .from(TABLE)
        .insert([insert])
        .select(
          "id, name, phone, phone_verified, email, email_verified, address, latitude, longitude, updated_at"
        )
        .single();
      if (error) throw error;
      saved = data as Profile;
    }

    await sb.from("http_response_log").insert([
      {
        request_url: "/api/profile",
        status: 200,
        request_body: {
          name: body.name ?? null,
          phone: phoneSafe,
          email: emailInput,
        },
        response_body: JSON.stringify({
          id: saved.id,
          email_verified: saved.email_verified,
          phone_verified: saved.phone_verified,
        }),
        created_at: nowIso,
      },
    ]);

    return NextResponse.json({
      success: true,
      user: saved,
      message: "Profile updated successfully",
    });
  } catch (e: any) {
    const msg = e?.message || "Internal Server Error";
    try {
      const sb = supabaseServer;
      await sb.from("http_response_log").insert([
        {
          request_url: "/api/profile",
          status: 500,
          request_body: null,
          response_body: JSON.stringify({ error: msg }),
          created_at: new Date().toISOString(),
        },
      ]);
    } catch {}
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}

/* ============================== GET ============================== */
export async function GET(req: Request) {
  const sb = supabaseServer;
  try {
    const { searchParams } = new URL(req.url);
    const rawPhone = searchParams.get("phone");
    const phoneSafe = normalizePhone(rawPhone);

    if (!phoneSafe) {
      return NextResponse.json(
        { success: false, message: "Missing phone number" },
        { status: 400 }
      );
    }

    const { data, error } = await sb
      .from(TABLE)
      .select("*")
      .in("phone", [
        phoneSafe,
        phoneSafe.replace("+", ""),
        phoneSafe.slice(-10),
      ])
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      return NextResponse.json(
        { success: false, message: "No matching user found" },
        { status: 404 }
      );
    }

    const row = data as Profile;
    const clean = {
      ...row,
      email_verified: !!row.email_verified,
      phone_verified: !!row.phone_verified,
    };

    return NextResponse.json({
      success: true,
      user: clean,
      message: "Profile fetched successfully",
    });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, message: e?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
