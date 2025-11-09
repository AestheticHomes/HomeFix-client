/**
 * ============================================================
 * 📘 FILE: /app/api/profile/route.js
 * 🔧 MODULE: HomeFix Profile Manager v5.3
 * ------------------------------------------------------------
 * ✅ Always respects `email_verified` & `phone_verified`
 * ✅ Fetches only the most recent user row (no stale flags)
 * ✅ Prevents email_verified reset if user re-enters same email
 * ✅ Normalizes all phone formats (+91XXXXXXXXXX)
 * ✅ Fully logged into `http_response_log`
 * ============================================================
 */

import { supabaseAnon, supabaseService } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

const TABLE_NAME = "user_profiles";

/* ============================================================
   🧠 Normalize phone numbers → +91XXXXXXXXXX
============================================================ */
function normalizePhone(raw) {
  if (!raw) return null;
  let p = raw.toString().replace(/\D/g, "");
  if (p.startsWith("91") && p.length === 12) return "+" + p;
  if (p.startsWith("+91")) return p;
  if (p.length === 10) return "+91" + p;
  return "+91" + p.slice(-10);
}

/* ============================================================
   🟢 POST — Create or Update Profile
============================================================ */
export async function POST(req) {
  const anon = supabaseAnon();
  const service = supabaseService();

  try {
    const body = await req.json();
    const {
      phone,
      name,
      email,
      address,
      latitude,
      longitude,
      email_verified,
      phone_verified,
    } = body;

    const phoneSafe = normalizePhone(phone);
    if (!phoneSafe) {
      return NextResponse.json(
        { success: false, message: "Missing valid phone number." },
        { status: 400 }
      );
    }

    // 🧠 Get authenticated Supabase user (if session exists)
    const {
      data: { user },
    } = await anon.auth.getUser().catch(() => ({ data: { user: null } }));
    const userId = user?.id || null;

    /* ------------------------------------------------------------
       Step 1️⃣ — Get latest existing profile for comparison
    ------------------------------------------------------------ */
    const { data: existingUser } = await service
      .from(TABLE_NAME)
      .select("id, phone, email, email_verified, phone_verified, updated_at")
      .eq("phone", phoneSafe)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const emailUnchanged =
      existingUser?.email &&
      existingUser.email.trim().toLowerCase() ===
        (email || "").trim().toLowerCase();

    /* ------------------------------------------------------------
       Step 2️⃣ — Prepare update payload
    ------------------------------------------------------------ */
    const updates = {
      ...(name && { name }),
      ...(email && { email }),
      ...(address && { address }),
      ...(latitude && { latitude }),
      ...(longitude && { longitude }),
      ...(phone_verified !== undefined && { phone_verified }),
      updated_at: new Date().toISOString(),
      // ✅ Preserve email_verified flag if email unchanged
      email_verified:
        emailUnchanged && existingUser?.email_verified
          ? true
          : email_verified ?? existingUser?.email_verified ?? false,
    };

    let result;

    /* ------------------------------------------------------------
       Step 3️⃣ — Authenticated user → update by id
    ------------------------------------------------------------ */
    if (userId) {
      const { data, error } = await service
        .from(TABLE_NAME)
        .update(updates)
        .eq("id", userId)
        .select("*")
        .single();

      if (error) throw error;
      result = data;
    } else {
      /* ------------------------------------------------------------
         Step 4️⃣ — OTP user → UPSERT by phone
      ------------------------------------------------------------ */
      const { data, error } = await service
        .from(TABLE_NAME)
        .upsert([{ phone: phoneSafe, ...updates }], { onConflict: "phone" })
        .select("*")
        .single();

      if (error) throw error;
      result = data;
    }

    // 🧾 Log to http_response_log
    await service.from("http_response_log").insert([
      {
        request_url: "/api/profile",
        status: 200,
        response_body: JSON.stringify(result),
        created_at: new Date().toISOString(),
      },
    ]);

    return NextResponse.json({
      success: true,
      user: result,
      message: "Profile updated successfully",
    });
  } catch (err) {
    console.error("💥 [Profile POST Error]:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

/* ============================================================
   🔵 GET /api/profile?phone=XXXXXXXXXX
   Fetch user profile by phone (deduped + latest verified)
============================================================ */
export async function GET(req) {
  const service = supabaseService();

  try {
    const { searchParams } = new URL(req.url);
    const rawPhone = searchParams.get("phone");
    const normalized = normalizePhone(rawPhone);

    console.log("🧠 [Profile GET] Fetching:", rawPhone, "→", normalized);
    if (!normalized) {
      return NextResponse.json(
        { success: false, message: "Missing phone number" },
        { status: 400 }
      );
    }

    // ✅ Always fetch the newest record by updated_at DESC
    const { data, error } = await service
      .from(TABLE_NAME)
      .select("*")
      .in("phone", [
        normalized,
        normalized.replace("+", ""),
        normalized.slice(-10),
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

    console.log(
      "✅ [Profile] Clean profile fetched:",
      data.phone,
      "| verified:",
      data.email_verified
    );

    // ✅ Ensure flag consistency for safety
    const normalizedData = {
      ...data,
      email_verified: !!data.email_verified,
      phone_verified: !!data.phone_verified,
    };

    return NextResponse.json({
      success: true,
      user: normalizedData,
      message: "Profile fetched successfully",
    });
  } catch (err) {
    console.error("💥 [Profile GET Error]:", err.message);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
