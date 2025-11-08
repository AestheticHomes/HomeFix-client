/**
 * ===============================================================
 * 📨 HomeFix India — Booking Email Dispatcher v6.2 (Debug + Handshake)
 * ---------------------------------------------------------------
 * ✅ Scans notification_queue for pending emails
 * ✅ Sends via Resend API
 * ✅ Handshake validation with Resend (confirm accepted delivery)
 * ✅ Updates queue status (sent / failed)
 * ✅ Rich debug logging to Supabase http_response_log
 * ===============================================================
 */

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

/* ── Environment Setup ───────────────────────────────────────── */
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const FROM_EMAIL =
  Deno.env.get("FROM_EMAIL") || "HomeFix India <no-reply@aesthetichomes.net>";

/* ── Safety Check for Required Envs ───────────────────────────── */
if (!RESEND_API_KEY || !SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("❌ Missing one or more environment variables.");
}

/* ── Utility: Logger to Supabase Table ────────────────────────── */
async function log(entry: Record<string, any>) {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/http_response_log`, {
      method: "POST",
      headers: {
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        endpoint: "dispatch-booking-emails",
        request_body: entry.request_body ?? null,
        status_code: entry.status_code ?? null,
        response_body: entry.response_body ?? null,
        error_message: entry.error_message ?? null,
        created_at: new Date().toISOString(),
      }),
    });
  } catch (err) {
    console.error("⚠️ Logging failed:", err);
  }
}

/* ── Helper Delay ─────────────────────────────────────────────── */
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/* ── Resend Handshake + Mail Send ─────────────────────────────── */
async function sendViaResend(to: string, subject: string, html: string) {
  const payload = { from: FROM_EMAIL, to: [to], subject, html };

  console.log("📬 Sending via Resend:", { to, subject });

  const resp = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  let data: any = {};
  try {
    data = await resp.json();
  } catch (_) {}

  // ✅ Handshake step: Check if response contains "id" & "object"
  const handshake =
    resp.status === 202 &&
    typeof data === "object" &&
    data.object === "email" &&
    data.id;

  console.log("🤝 Resend Handshake:", {
    status: resp.status,
    ok: handshake,
    id: data.id || null,
  });

  return { status: resp.status, handshake, data };
}

/* ── Dispatcher ───────────────────────────────────────────────── */
async function dispatchPending() {
  console.log("🚀 Dispatcher started at", new Date().toISOString());

  // Fetch queue
  const queueRes = await fetch(
    `${SUPABASE_URL}/rest/v1/notification_queue?status=eq.pending`,
    {
      headers: {
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      },
    }
  );

  if (!queueRes.ok) {
    const msg = `❌ Queue fetch failed (${queueRes.status})`;
    console.error(msg);
    await log({ status_code: queueRes.status, error_message: msg });
    return { ok: false, count: 0 };
  }

  const queue = await queueRes.json();
  console.log(`📦 Pending queue length: ${queue.length}`);

  if (!Array.isArray(queue) || queue.length === 0) {
    console.log("✅ No pending emails to send.");
    return { ok: true, count: 0 };
  }

  let sent = 0,
    failed = 0;

  for (const q of queue) {
    const { id, to_email, subject, html } = q;

    try {
      const result = await sendViaResend(to_email, subject, html);
      const ok = result.handshake;

      // Update status in queue
      await fetch(`${SUPABASE_URL}/rest/v1/notification_queue?id=eq.${id}`, {
        method: "PATCH",
        headers: {
          apikey: SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: ok ? "sent" : "failed",
          updated_at: new Date().toISOString(),
        }),
      });

      // Log detailed info
      await log({
        request_body: { id, to_email, subject },
        status_code: result.status,
        response_body: JSON.stringify(result.data),
        error_message: ok ? null : "Resend handshake failed",
      });

      console.log(
        ok
          ? `✅ Sent + verified handshake: ${to_email}`
          : `⚠️ Sent but no handshake confirmation: ${to_email}`
      );

      ok ? sent++ : failed++;
      await sleep(200 + Math.random() * 200);
    } catch (err) {
      console.error(`💥 Error processing ${id}:`, err);
      failed++;
      await log({
        status_code: 500,
        error_message: String(err),
        request_body: { id, to_email },
      });
    }
  }

  console.log(`🏁 Dispatch finished — ${sent} sent, ${failed} failed.`);
  return { ok: true, sent, failed };
}

/* ── HTTP Entrypoint ──────────────────────────────────────────── */
serve(async (_req) => {
  try {
    const result = await dispatchPending();
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("💥 Fatal Dispatcher Error:", err);
    await log({ status_code: 500, error_message: String(err) });
    return new Response(`Internal error: ${err}`, { status: 500 });
  }
});
