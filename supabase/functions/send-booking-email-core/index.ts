// supabase/functions/send-booking-email-core/index.ts
// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const FROM_EMAIL = "HomeFix India <no-reply@aesthetichomes.net>";
const ADMIN_EMAIL = "support@homefixindia.in";

type MailShape = { to: string; subject: string; message: string };

function coerceToMailShape(payload: any): MailShape | null {
  // If already in final shape
  if (payload?.to && payload?.subject && payload?.message) {
    return { to: payload.to, subject: payload.subject, message: payload.message };
  }

  // Accept booking-like payloads and map them
  const to = payload?.user_email || payload?.email;
  const bookingId = payload?.booking_id ?? payload?.id ?? "N/A";
  const service = payload?.service_name ?? payload?.services?.name ?? payload?.services?.["name"] ?? "HomeFix Service";
  const date = payload?.preferred_date ?? payload?.date ?? "";
  const slot = payload?.preferred_time ?? payload?.preferred_slot ?? "";
  const name = payload?.user_name ?? payload?.client_name ?? "Customer";
  const status = payload?.status ?? "upcoming";

  if (!to) return null;

  const isCancel = /cancel/i.test(status ?? "") || payload?.action === "cancelled" || payload?.cancelled === true;
  const isInsert = payload?.action === "booking_created" || payload?.created === true || payload?.__op === "INSERT";
  const subject =
    isCancel
      ? `❌ Booking Cancelled — #${bookingId}`
      : isInsert
      ? `✅ Booking Confirmed — #${bookingId}`
      : `🔄 Booking Updated — #${bookingId}`;

  const message = isCancel
    ? `
      <p>Hi ${name},</p>
      <p>Your booking for <b>${service}</b> has been cancelled.</p>
      <p>If this was a mistake, please re-book in the HomeFix app.</p>
      <p>— HomeFix India</p>
    `
    : `
      <p>Hi ${name},</p>
      <p>Your booking for <b>${service}</b> is ${isInsert ? "confirmed" : "updated"}.</p>
      <p>Date: ${date || "-"} | Time: ${slot || "-"}</p>
      <p>Status: <b>${status}</b></p>
      <p>— HomeFix India</p>
    `;

  return { to, subject, message };
}

async function logToSupabase(entry: Record<string, any>) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/http_response_log`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        ...entry,
        created_at: new Date().toISOString(),
        endpoint: "send-booking-email-core",
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function sendViaResend(mail: MailShape) {
  const resp = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [mail.to],
      subject: mail.subject,
      html: mail.message,
    }),
  });

  const data = await resp.json().catch(() => ({}));
  return { status: resp.status, data };
}

serve(async (req) => {
  let payload: any = null;
  try {
    payload = await req.json();
  } catch (err) {
    await logToSupabase({
      status_code: 400,
      message: "Invalid JSON",
      response_body: String(err?.message || err),
    });
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
  }

  const mail = coerceToMailShape(payload);
  if (!mail) {
    await logToSupabase({
      status_code: 400,
      message: "Missing required fields",
      request_body: payload,
    });
    return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
  }

  const { status, data } = await sendViaResend(mail);
  const success = status === 202;

  await logToSupabase({
    status_code: status,
    request_body: mail,
    response_body: JSON.stringify(data),
    message: success ? "Email accepted by Resend" : "Resend non-202 response",
  });

  // Optional fallback to admin inbox on non-202
  if (!success) {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: [ADMIN_EMAIL],
          subject: `⚠️ Mail Failure — ${mail.subject}`,
          html: `<pre>${JSON.stringify({ status, data, mail }, null, 2)}</pre>`,
        }),
      });
    } catch {}
  }

  // Return 200 with details (your panel will read this)
  return new Response(
    JSON.stringify({ ok: success, resendStatus: status, resendResponse: data }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
});
