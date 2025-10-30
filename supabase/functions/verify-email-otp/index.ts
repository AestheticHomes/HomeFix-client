/**
 * Edge Function: verify-email-otp
 * -------------------------------
 * Confirms OTP from `email_verifications` and updates `user_profiles`.
 */

import { serve } from "std/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

serve(async (req: Request): Promise<Response> => {
  try {
    const { email, otp } = await req.json();
    if (!email || !otp) {
      return new Response(
        JSON.stringify({ success: false, message: "Missing email or OTP" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const { data, error } = await supabase
      .from("email_verifications")
      .select("*")
      .eq("email", email)
      .eq("otp", otp)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return new Response(
        JSON.stringify({ success: false, message: "Invalid code" }),
        { status: 401, headers: { "Content-Type": "application/json" } },
      );
    }

    await supabase.from("email_verifications").update({ verified: true }).eq(
      "id",
      data.id,
    );
    await supabase.from("user_profiles").update({ email_verified: true }).eq(
      "email",
      email,
    );

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("❌ verify-email-otp:", msg);
    return new Response(JSON.stringify({ success: false, message: msg }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
