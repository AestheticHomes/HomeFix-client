/**
 * ============================================================
 * 📘 FILE: /app/api/profile/route.js
 * 🔧 MODULE: HomeFix Unified Profile CRUD (v4.6)
 * ------------------------------------------------------------
 * ✅ Handles both:
 *   - Authenticated users (Supabase ID → update by id)
 *   - OTP users (no session → upsert by phone)
 * ✅ Safe cookie + local fallback for phone
 * ✅ Auto logs to http_response_log
 * ============================================================
 */

import { NextResponse } from "next/server";
import { supabaseAnon, supabaseService } from "@/lib/supabaseClient";

const TABLE_NAME = "user_profiles";

/* ============================================================
   🟠 POST /api/profile
   ------------------------------------------------------------
   Handles both:
   - Authenticated user updates (from PWA / AuthCenterDrawer)
   - Phone-based UPSERT (from mobile OTP flow)
   ============================================================ */
export async function POST(req) {
  const anon = supabaseAnon(); // 🧠 session-aware client
  const service = supabaseService(); // 🔐 privileged client

  try {
    const body = await req.json();
    console.log("📩 [Profile Update] Incoming:", body);

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

    /* ------------------------------------------------------------
       🧠 Step 1: Detect Supabase Authenticated User
    ------------------------------------------------------------ */
    const {
      data: { user },
      error: authErr,
    } = await anon.auth.getUser();

    if (authErr) console.warn("⚠️ [Auth Detection Error]", authErr?.message);
    const userId = user?.id || null;

    /* ------------------------------------------------------------
       Case 1️⃣ Authenticated User (update by id)
    ------------------------------------------------------------ */
    if (userId) {
      const updates = {
        ...(name && { name }),
        ...(email && { email }),
        ...(address && { address }),
        ...(latitude && { latitude }),
        ...(longitude && { longitude }),
        ...(email_verified !== undefined && { email_verified }),
        ...(phone_verified !== undefined && { phone_verified }),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await service
        .from(TABLE_NAME)
        .update(updates)
        .eq("id", userId)
        .select("*")
        .single();

      if (error) throw error;
      console.log("✅ [Profile Updated by id]", data);

      await service.from("http_response_log").insert([
        {
          route: "/api/profile",
          method: "POST",
          status_code: 200,
          response_body: data,
          created_at: new Date().toISOString(),
        },
      ]);

      const res = NextResponse.json({
        success: true,
        user: data,
        message: "Profile updated successfully (by id)",
      });

      res.headers.set(
        "Set-Cookie",
        `hf_user_id=${userId}; Path=/; Max-Age=604800`,
      );
      return res;
    }

    /* ------------------------------------------------------------
       Case 2️⃣ OTP-based User (fallback by phone)
    ------------------------------------------------------------ */
    // 🟡 Try multiple recovery paths to get phone number
    let phoneSafe = phone;

    if (!phoneSafe && req.headers.get("cookie")) {
      const cookies = req.headers.get("cookie");

      // Check in standard cookie (hf_user_id)
      const fromHFID = cookies.match(/hf_user_id=(\+?\d{10,15})/);
      // Check inside serialized user JSON (if present)
      const fromUser = cookies.match(/"phone":"(\+?\d{10,15})"/);

      phoneSafe = fromHFID?.[1] || fromUser?.[1] || null;
    }

    if (!phoneSafe) {
      console.warn("⚠️ [Profile] No auth session or valid phone — rejecting");
      return NextResponse.json(
        {
          success: false,
          message: "Missing both Supabase session and phone number.",
        },
        { status: 400 },
      );
    }

    const phonePayload = {
      phone: phoneSafe,
      ...(name && { name }),
      ...(email && { email }),
      ...(address && { address }),
      ...(latitude && { latitude }),
      ...(longitude && { longitude }),
      ...(email_verified !== undefined && { email_verified }),
      ...(phone_verified !== undefined && { phone_verified }),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await service
      .from(TABLE_NAME)
      .upsert([phonePayload], { onConflict: "phone" })
      .select("*")
      .single();

    if (error) throw error;
    console.log("✅ [Profile Updated by phone]", data);

    return NextResponse.json({
      success: true,
      user: data,
      message: "Profile updated successfully (by phone)",
    });
  } catch (err) {
    console.error("💥 [Profile POST Error]:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}

/* ============================================================
   🔵 GET /api/profile?phone=XXXXXXXXXX
   ------------------------------------------------------------
   Fetch user profile by phone (for OTP or app prefill)
   ============================================================ */
export async function GET(req) {
  const service = supabaseService(); // Only need service client for read

  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get("phone");

    console.log("🧠 [Profile GET] Fetching profile for phone:", phone);
    if (!phone) {
      return NextResponse.json(
        { success: false, message: "Missing phone number" },
        { status: 400 },
      );
    }

    const { data, error } = await service
      .from(TABLE_NAME)
      .select("*")
      .eq("phone", phone)
      .maybeSingle();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      user: data || null,
      message: data ? "Profile found" : "No matching user found",
    });
  } catch (err) {
    console.error("💥 [Profile GET Error]:", err.message);
    return NextResponse.json(
      { success: false, message: err.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
