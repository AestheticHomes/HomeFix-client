// /supabase/functions/link-otp-user/index.ts

// Deno + Supabase Edge Function
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

serve(async (req: Request) => {
  try {
    const { phone } = await req.json();

    if (!phone) {
      return new Response(
        JSON.stringify({ error: "Missing phone number" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const formattedPhone = phone.startsWith("+91") ? phone : `+91${phone}`;

    // 🔍 Check if user exists
    const { data: existing, error: lookupErr } = await supabase
      .from("user_profiles")
      .select("id")
      .eq("phone", formattedPhone)
      .maybeSingle();

    if (lookupErr) throw lookupErr;

    if (existing) {
      console.log("✅ Existing user found:", existing.id);
      return new Response(
        JSON.stringify({ userId: existing.id, status: "existing" }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // 🆕 Insert new user
    const { data: inserted, error: insertErr } = await supabase
      .from("user_profiles")
      .insert([
        {
          phone: formattedPhone,
          phone_verified: true,
          role: "client",
          created_at: new Date().toISOString(),
        },
      ])
      .select("id")
      .single();

    if (insertErr) throw insertErr;

    console.log("✨ New user created:", inserted.id);

    return new Response(
      JSON.stringify({ userId: inserted.id, status: "created" }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("💥 [link-otp-user] Error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Unknown error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
