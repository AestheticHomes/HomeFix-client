// /supabase/functions/send-email-otp/index.ts
// ============================================================
// 📨 HomeFix India — Send Email OTP (Deno Edge Function)
// ------------------------------------------------------------
// ✅ Uses Deno-native imports (no "process")
// ✅ Secure: reads keys from Deno.env
// ✅ Compatible with Supabase Edge runtime
// ============================================================

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { v4 as uuidv4 } from "https://esm.sh/uuid@9.0.0";

// ✅ Deno reads env via Deno.env (not process.env)
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const EMAIL_API_KEY = Deno.env.get("RESEND_API_KEY")!; // optional if you're using Resend or similar

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ============================================================
// 📩 Send OTP Function
// ============================================================
serve(async (req) => {
  try {
    const { email } = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ error: "Email required" }), {
        status: 400,
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in email_verifications table
    const { error: dbError } = await supabase
      .from("email_verifications")
      .insert([{ email, otp, id: uuidv4(), verified: false }]);

    if (dbError) throw dbError;

    // (Optional) send via Resend API or mail provider
    const sendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${EMAIL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "HomeFix <no-reply@homefixindia.in>",
        to: email,
        subject: "Your HomeFix India Email Verification Code",
        html: `<h2>${otp}</h2><p>This code expires in 10 minutes.</p>`,
      }),
    });

    if (!sendResponse.ok) {
      const text = await sendResponse.text();
      throw new Error(`Email send failed: ${text}`);
    }

    return new Response(JSON.stringify({ success: true, email }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err: unknown) {
    console.error("❌ [send-email-otp] failed:", err);

    // Safely extract message whether it's an Error or a string
    const message = err instanceof Error ? err.message : String(err);

    return new Response(JSON.stringify({ error: message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
