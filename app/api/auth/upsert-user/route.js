/**
 * ============================================================
 * 📘 HomeFix API: /api/auth/upsert-user (v3.3)
 * ------------------------------------------------------------
 * ✅ Preserves existing verified flags (email_verified, phone_verified)
 * ✅ Never downgrades verified users
 * ✅ Handles both new insert and existing updates safely
 * ✅ Logs cleanly
 * ============================================================
 */

import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      phone,
      email,
      name = "guest",
      verified = true,
      role = "client",
    } = body;

    if (!phone && !email) {
      return NextResponse.json(
        { success: false, error: "Missing phone or email" },
        { status: 400 }
      );
    }

    const matchKey = phone ? { phone } : { email };

    // 🔍 Step 1 — Find existing record
    const { data: existing, error: fetchErr } = await supabase
      .from("user_profiles")
      .select("id, email_verified, phone_verified")
      .match(matchKey)
      .maybeSingle();

    if (fetchErr) throw fetchErr;

    let profileId;

    // 🧩 Step 2 — If user exists, update only if needed
    if (existing) {
      const updates = {
        ...(name && { name }),
        ...(phone && { phone }),
        ...(email && { email }),
        // ✅ Preserve existing verified flags (never downgrade)
        email_verified:
          existing.email_verified || (verified && !!email) || false,
        phone_verified:
          existing.phone_verified || (verified && !!phone) || false,
        updated_at: new Date().toISOString(),
      };

      const { data: updated, error: updateErr } = await supabase
        .from("user_profiles")
        .update(updates)
        .eq("id", existing.id)
        .select("id")
        .single();

      if (updateErr) throw updateErr;
      profileId = updated.id;
      console.log(
        "♻️ [Upsert] Updated existing verified-safe user:",
        profileId
      );
    } else {
      // 🆕 Step 3 — Create new user safely
      const { data: inserted, error: insertErr } = await supabase
        .from("user_profiles")
        .insert([
          {
            phone,
            email,
            name,
            phone_verified: verified && !!phone,
            email_verified: verified && !!email,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            role,
          },
        ])
        .select("id")
        .single();

      if (insertErr) throw insertErr;
      profileId = inserted.id;
      console.log("🆕 [Upsert] New user created:", profileId);
    }

    return NextResponse.json({
      success: true,
      id: profileId,
      message: existing
        ? "Profile updated (verified preserved)"
        : "Profile created",
    });
  } catch (err) {
    console.error("💥 [Upsert-User]", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
