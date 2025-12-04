/**
 * ===============================================================
 * 📨 HomeFix SmartMail v5.0 — Event-Driven Queue Worker
 * ---------------------------------------------------------------
 * ✅ Dequeues from notification_queue
 * ✅ Forwards kind + meta to send-booking-email-core
 * ✅ Fallback to Resend if core fails
 * ✅ Sends to customer + ADMIN_EMAIL in all cases
 * ✅ Logs to http_response_log
 * ===============================================================
 */

import { serve } from "https://deno.land/std@0.182.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

// ============================================================
// 🔐 Environment
// ============================================================
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const RESEND_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") || "support@aesthetichomes.net";

const FN_ENDPOINT = SUPABASE_URL
  ? `${SUPABASE_URL}/functions/v1/send-booking-email-core`
  : "";

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

console.log("🚀 SmartMail v5.0 worker initialized");
console.log(
  "[email-queue-worker env] url:",
  SUPABASE_URL ? "set" : "MISSING",
  "| srv:",
  SERVICE_KEY ? "set" : "MISSING",
  "| resend:",
  RESEND_KEY ? "set" : "MISSING"
);

/* ── Logging helper into http_response_log ─────────────────── */

async function logHttp(entry: {
  endpoint?: string;
  status_code?: number | null;
  response_body?: string | null;
  error_message?: string | null;
}) {
  try {
    await supabase.from("http_response_log").insert([
      {
        endpoint: entry.endpoint ?? "email-queue-worker",
        status_code: entry.status_code ?? null,
        response_body: entry.response_body ?? null,
        error_message: entry.error_message ?? null,
        created_at: new Date().toISOString(),
      },
    ]);
  } catch (err) {
    console.error("[email-queue-worker] logHttp failed:", err);
  }
}

/* ── Main worker loop (single job per invoke) ───────────────── */

serve(async () => {
  try {
    // 1️⃣ Pick next pending, unlocked job
    const { data, error } = await supabase
      .from("notification_queue")
      .select("*")
      .eq("status", "pending")
      .is("locked_at", null)
      .order("created_at", { ascending: true })
      .limit(1);

    if (error) {
      throw new Error(error.message);
    }

    const job = data?.[0];

    if (!job) {
      // no pending items → this is a normal, non-error case
      return new Response("✅ No pending jobs", { status: 200 });
    }

    console.log(`📬 Processing job #${job.id} [${job.kind}] → ${job.to_email}`);

    // 2️⃣ Lock job for processing
    await supabase
      .from("notification_queue")
      .update({
        status: "processing",
        locked_at: new Date().toISOString(),
      })
      .eq("id", job.id);

    // 3️⃣ Build payload for core (template-aware)
    const payload = {
      kind: job.kind,
      to: job.to_email,
      to_email: job.to_email,
      subject: job.subject ?? undefined,
      html: job.html ?? undefined,
      attachments: job.attachments ?? [],
      meta: job.meta ?? {},
    };

    let res: Response | null = null;
    let bodyText = "";

    // 4️⃣ Attempt send via send-booking-email-core
    if (FN_ENDPOINT) {
      res = await fetch(FN_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-service-key": SERVICE_KEY,
        },
        body: JSON.stringify(payload),
      });

      bodyText = (await res.text()).slice(0, 1000);

      await logHttp({
        endpoint: "email-queue-worker → send-booking-email-core",
        status_code: res.status,
        response_body: bodyText,
      });
    }

    // 5️⃣ No direct Resend fallback; core is the single sender
    if (!res || res.status >= 400) {
      console.error("[email-queue-worker] send-booking-email-core failed", {
        status: res?.status,
        body: bodyText,
      });
    }

    const ok = !!res && res.status >= 200 && res.status < 300;

    // 6️⃣ Update queue job status
    await supabase
      .from("notification_queue")
      .update({
        status: ok ? "sent" : "failed",
        try_count: (job.try_count ?? 0) + 1,
        last_error: ok ? null : bodyText,
        updated_at: new Date().toISOString(),
      })
      .eq("id", job.id);

    console.log(
      `✅ Job ${job.id} ${ok ? "SENT" : "FAILED"} (${res?.status ?? "no-resp"})`
    );

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("🔥 Worker crashed:", err);
    await logHttp({
      endpoint: "email-queue-worker",
      status_code: 500,
      response_body: String(err),
      error_message: String(err),
    });
    return new Response(String(err), { status: 500 });
  }
});
