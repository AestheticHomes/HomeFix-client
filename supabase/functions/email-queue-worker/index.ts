// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const WORKER_NAME = "email-queue-worker";
const DEV_MODE = Deno.env.get("DEV_MODE") === "true"; // 👈 Switch logging ON/OFF

// ─────────────────────────────────────────────
// Utility: Conditional Log to Supabase
// ─────────────────────────────────────────────
async function logToSupabase(entry: Record<string, any>) {
  if (!DEV_MODE) return; // 👈 Skip in production mode
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/http_response_log`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...entry,
        function: WORKER_NAME,
        created_at: new Date().toISOString(),
      }),
    });
  } catch (err) {
    console.error("❌ Logging failed:", err);
  }
}

// ─────────────────────────────────────────────
// Step 1: Fetch unprocessed queue entries
// ─────────────────────────────────────────────
async function fetchPending(limit = 20) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/email_queue?processed=eq.false&order=created_at.asc&limit=${limit}`,
    {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
    }
  );
  return res.ok ? await res.json() : [];
}

// ─────────────────────────────────────────────
// Step 2: Send queued emails via core mailer
// ─────────────────────────────────────────────
async function sendOne(payload: any) {
  const mailEndpoint = `${SUPABASE_URL}/functions/v1/send-booking-email-core`;
  const res = await fetch(mailEndpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const ok = res.ok;
  const data = await res.json().catch(() => ({}));
  return { ok, data, status: res.status };
}

// ─────────────────────────────────────────────
// Step 3: Mark queue items processed/failed
// ─────────────────────────────────────────────
async function markDone(id: number, processed: boolean, err?: string) {
  await fetch(`${SUPABASE_URL}/rest/v1/email_queue?id=eq.${id}`, {
    method: "PATCH",
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      processed,
      processed_at: new Date().toISOString(),
      last_error: err ?? null,
    }),
  });
}

// ─────────────────────────────────────────────
// Step 4: Main Worker Handler
// ─────────────────────────────────────────────
serve(async (_req) => {
  try {
    const batch = await fetchPending();
    let sent = 0;
    let failed = 0;

    for (const item of batch) {
      try {
        const { ok, data, status } = await sendOne(item.payload);
        if (ok && (status === 200 || data?.resendStatus === 202)) {
          await markDone(item.id, true);
          sent++;
        } else {
          await markDone(item.id, false, `status=${status} body=${JSON.stringify(data).slice(0, 400)}`);
          failed++;
        }
      } catch (err) {
        await markDone(item.id, false, String(err?.message || err));
        failed++;
      }
    }

    const summary = { processed: batch.length, sent, failed };

    // ✅ Log batch summary (only in DEV_MODE)
    await logToSupabase({
      status_code: 200,
      payload: summary,
      message: `Batch run complete — processed: ${batch.length}, sent: ${sent}, failed: ${failed}`,
    });

    return new Response(JSON.stringify(summary), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e) {
    // 🔴 Log crash (only in DEV_MODE)
    await logToSupabase({
      status_code: 500,
      error_message: e.message,
      message: "Worker crash in email-queue-worker",
    });

    return new Response(
      JSON.stringify({ error: e.message }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }
});
