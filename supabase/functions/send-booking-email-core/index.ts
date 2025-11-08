/**
 * ===============================================================
 * 📨 HomeFix India — Booking Email Core v5.7
 * ---------------------------------------------------------------
 * ✅ Internal triggers auto-authorized (pg_net / PostgREST)
 * ✅ External: allow x-service-key OR Authorization: Bearer <svc>
 * ✅ Immediate email dispatch via Resend API
 * ✅ Logs to public.http_response_log + visible console logs
 * ===============================================================
 */
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

/* ── Env ─────────────────────────────────────────────────────── */
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const SUPABASE_SERVICE_ROLE_KEY =
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const PROJECT_NAME = Deno.env.get("PROJECT_BRAND") || "HomeFix India";
const FROM_EMAIL =
  Deno.env.get("FROM_EMAIL") || `${PROJECT_NAME} <no-reply@aesthetichomes.net>`;
const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") || "support@aesthetichomes.net";

/* ── Logging helper ──────────────────────────────────────────── */
async function log(entry: any) {
  try {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY)
      return;
    await fetch(`${SUPABASE_URL}/rest/v1/http_response_log`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        endpoint: entry.endpoint ?? "send-booking-email-core",
        request_body: entry.request_body ?? null,
        status_code: entry.status_code ?? null,
        response_body: entry.response_body ?? null,
        error_message: entry.error_message ?? null,
        created_at: new Date().toISOString(),
      }),
    });
  } catch (err) {
    console.error("log() failed:", err);
  }
}

/* ── Mail Builder ───────────────────────────────────────────── */
function buildMail(payload: any) {
  const to = payload?.email ?? payload?.user_email ?? payload?.to;
  if (!to) return null;

  const id = payload?.id ?? "N/A";
  const service = payload?.services?.[0]?.name ?? "HomeFix Service";
  const date = payload?.preferred_date ?? "-";
  const slot = payload?.preferred_slot ?? "-";
  const status = payload?.status ?? "upcoming";
  const isCancel = /cancel/i.test(String(status));
  const subject = isCancel
    ? `❌ Booking Cancelled — #${id}`
    : `✅ Booking Confirmed — #${id}`;
  const html = isCancel
    ? `<p>Hi,</p><p>Your booking for <b>${service}</b> has been cancelled.</p><p>— ${PROJECT_NAME}</p>`
    : `<p>Hi,</p><p>Your booking for <b>${service}</b> is confirmed.</p>
       <p>Date: ${date} | Slot: ${slot}</p>
       <p>Status: <b>${status}</b></p>
       <p>— ${PROJECT_NAME}</p>`;

  return { to, subject, html };
}

/* ── Resend Mail Sender ─────────────────────────────────────── */
async function sendViaResend(mail: any) {
  const resp = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [mail.to, ADMIN_EMAIL], // send to client + admin copy
      subject: mail.subject,
      html: mail.html,
    }),
  });

  const data = await resp.json().catch(() => ({}));
  console.log(`📤 [Resend] Status ${resp.status} for ${mail.to}`);
  return { status: resp.status, data };
}

/* ── Auth Checks ─────────────────────────────────────────────── */
function isInternal(req: Request): boolean {
  const ua = (req.headers.get("user-agent") || "").toLowerCase();
  const xfwd = req.headers.get("x-forwarded-for") || "";
  const xrip = req.headers.get("x-real-ip") || "";
  const internalUA =
    ua.includes("pg_net") ||
    ua.includes("postgrest") ||
    ua.includes("supabasefunctions");
  const internalIP =
    xfwd === "" ||
    xfwd.startsWith("10.") ||
    xfwd.startsWith("172.") ||
    xrip === "";
  return internalUA || internalIP;
}
function isAuthorized(req: Request): boolean {
  const xKey = req.headers.get("x-service-key") || "";
  const auth = req.headers.get("authorization") || "";
  const token = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7) : "";
  return (
    !!SUPABASE_SERVICE_ROLE_KEY &&
    (xKey === SUPABASE_SERVICE_ROLE_KEY || token === SUPABASE_SERVICE_ROLE_KEY)
  );
}

/* ── Main Handler ───────────────────────────────────────────── */
serve(async (req) => {
  const internal = isInternal(req);
  const authOK = isAuthorized(req);
  console.log(`🔔 [Invoke] internal=${internal}, authorized=${authOK}`);

  if (!internal && !authOK) {
    console.warn("🚫 Unauthorized access attempt.");
    await log({ status_code: 401, error_message: "Unauthorized request" });
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  let payload;
  try {
    payload = await req.json();
  } catch {
    await log({ status_code: 400, error_message: "Invalid JSON" });
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
    });
  }

  const mail = buildMail(payload);
  if (!mail) {
    await log({
      status_code: 400,
      error_message: "Missing email fields",
      request_body: payload,
    });
    return new Response(JSON.stringify({ error: "Missing fields" }), {
      status: 400,
    });
  }

  try {
    const { status, data } = await sendViaResend(mail);
    const ok = status === 202;
    await log({
      status_code: status,
      request_body: { email: mail.to, subject: mail.subject },
      response_body: JSON.stringify(data),
      error_message: ok ? null : "Resend returned non-202",
    });

    console.log(`✅ [BookingEmail] Sent to ${mail.to} | ${status}`);
    return new Response(JSON.stringify({ ok, status, data }), {
      status: ok ? 200 : 502,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("💥 Send error:", err);
    await log({
      status_code: 500,
      error_message: `Unhandled: ${String(err)}`,
      request_body: { snippet: payload },
    });
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
    });
  }
});
