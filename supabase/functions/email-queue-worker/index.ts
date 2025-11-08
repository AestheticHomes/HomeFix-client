/**
 * ===============================================================
 * 📨 HomeFix SmartMail v4.7 — Event-Driven Queue Worker
 * ---------------------------------------------------------------
 * ✅ Auth via x-service-key (no JWT validation)
 * ✅ Calls send-booking-email-core internally
 * ✅ Fallback to Resend direct
 * ✅ Logs to http_response_log
 * ===============================================================
 */

import { serve } from "https://deno.land/std@0.182.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_KEY = Deno.env.get("RESEND_API_KEY")!;
const FN_ENDPOINT = `${SUPABASE_URL}/functions/v1/send-booking-email-core`;

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

serve(async (req) => {
  const hdr = req.headers.get("x-service-key");
  if (!hdr || hdr !== SERVICE_KEY) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { data: job } = await supabase
      .from("notification_queue")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: true })
      .limit(1)
      .single();

    if (!job) return new Response("✅ No pending jobs", { status: 200 });

    await supabase
      .from("notification_queue")
      .update({ status: "processing", locked_at: new Date().toISOString() })
      .eq("id", job.id);

    const payload = {
      to: job.to_email,
      subject: job.subject ?? "HomeFix Notification",
      html: job.html ?? "<p>Notification from HomeFix</p>",
      attachments: job.attachments ?? [],
      meta: job.meta ?? {},
    };

    let res = await fetch(FN_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-service-key": SERVICE_KEY,
      },
      body: JSON.stringify(payload),
    });

    // Fallback to direct Resend if the core function fails
    if (res.status >= 400) {
      res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "HomeFix <no-reply@aesthetichomes.net>",
          to: [payload.to],
          subject: payload.subject,
          html: payload.html,
        }),
      });
    }

    const body = await res.text();
    const ok = res.status >= 200 && res.status < 300;

    await supabase.from("http_response_log").insert([
      {
        endpoint: "email-queue-worker",
        status_code: res.status,
        response_body: body.slice(0, 1000),
        created_at: new Date().toISOString(),
      },
    ]);

    await supabase
      .from("notification_queue")
      .update({
        status: ok ? "sent" : "failed",
        try_count: (job.try_count ?? 0) + 1,
        last_error: ok ? null : body,
        updated_at: new Date().toISOString(),
      })
      .eq("id", job.id);

    return new Response("OK", { status: 200 });
  } catch (err) {
    await supabase.from("http_response_log").insert([
      {
        endpoint: "email-queue-worker",
        status_code: 500,
        response_body: String(err),
        created_at: new Date().toISOString(),
      },
    ]);
    return new Response(String(err), { status: 500 });
  }
});
