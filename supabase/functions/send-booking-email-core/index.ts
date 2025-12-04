/**
 * ===============================================================
 * 📨 HomeFix India — Booking Email Core v7.0 (Supabase Client)
 * ---------------------------------------------------------------
 * ✅ Uses `email_templates` table (kind + placeholders)
 * ✅ Expects: { kind, to | email | user_email | to_email, meta?, subject?, html? }
 * ✅ Renders {{placeholders}} from meta into subject + html
 * ✅ Sends to customer + ADMIN_EMAIL via Resend
 * ✅ Logs to public.http_response_log via supabase-js
 * ===============================================================
 */

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

/* ── Env ─────────────────────────────────────────────────────── */

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY =
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const PROJECT_NAME = Deno.env.get("PROJECT_BRAND") || "HomeFix India";
const FROM_EMAIL =
  Deno.env.get("FROM_EMAIL") || `${PROJECT_NAME} <no-reply@aesthetichomes.net>`;
const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") || "support@aesthetichomes.net";

console.log(
  "[send-booking-email-core env] supabase_url:",
  SUPABASE_URL || "MISSING",
  "| project:",
  PROJECT_NAME,
  "| from_email:",
  FROM_EMAIL,
  "| admin_email:",
  ADMIN_EMAIL,
  "| service_role_set:",
  !!SUPABASE_SERVICE_ROLE_KEY,
  "| resend_key_set:",
  !!RESEND_API_KEY
);

// Single supabase client (service role – bypasses RLS)
const supabase =
  SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    : null;

/* ── Types ───────────────────────────────────────────────────── */

type AnyRecord = Record<string, unknown>;

interface TemplateRow {
  subject: string;
  html: string;
}

/* ── Logging helper (via supabase-js) ───────────────────────── */

async function log(entry: {
  endpoint?: string;
  request_body?: unknown;
  status_code?: number | null;
  response_body?: string | null;
  error_message?: string | null;
}) {
  if (!supabase) {
    console.warn("[send-booking-email-core] log() skipped, no supabase client");
    return;
  }
  try {
    const { error } = await supabase.from("http_response_log").insert({
      endpoint: entry.endpoint ?? "send-booking-email-core",
      request_body: entry.request_body ?? null,
      status_code: entry.status_code ?? null,
      response_body: entry.response_body ?? null,
      error_message: entry.error_message ?? null,
      created_at: new Date().toISOString(),
    });
    if (error) {
      console.error("[send-booking-email-core] log() insert error:", error);
    }
  } catch (err) {
    console.error("[send-booking-email-core] log() failed:", err);
  }
}

/* ── Tiny template renderer {{foo}} → meta.foo ──────────────── */

function renderTemplate(template: string, meta: AnyRecord): string {
  if (!template) return template;
  return template.replace(/{{\s*([\w.]+)\s*}}/g, (match, key) => {
    try {
      const parts = String(key).split(".");
      let value: any = meta;
      for (const p of parts) {
        if (value == null || typeof value !== "object") return "";
        value = value[p as keyof typeof value];
      }
      if (value == null) return "";
      return String(value);
    } catch {
      return "";
    }
  });
}

/* ── Fetch template using supabase-js ───────────────────────── */

async function fetchTemplate(kind: string): Promise<TemplateRow | null> {
  if (!supabase) {
    console.warn(
      "[send-booking-email-core] fetchTemplate() skipped, no supabase client"
    );
    return null;
  }

  console.log("[send-booking-email-core] fetchTemplate: kind=", kind);

  const { data, error } = await supabase
    .from("email_templates")
    .select("subject, html")
    .eq("kind", kind)
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[send-booking-email-core] fetchTemplate error:", error);
    await log({
      endpoint: "send-booking-email-core/fetchTemplate",
      status_code: 500,
      response_body: JSON.stringify(error),
      error_message: `Failed to load template for kind=${kind}`,
    });
    return null;
  }

  if (!data) {
    console.warn("[send-booking-email-core] no template found for kind=", kind);
    return null;
  }

  console.log(
    "[send-booking-email-core] fetchTemplate: template found for kind=",
    kind
  );
  return data as TemplateRow;
}

/* ── Mail Builder (template-aware) ──────────────────────────── */

async function buildMailFromPayload(payload: AnyRecord) {
  const to =
    (payload.email as string | undefined) ??
    (payload.user_email as string | undefined) ??
    (payload.to as string | undefined) ??
    (payload.to_email as string | undefined);

  const kind =
    (payload.kind as string | undefined) ??
    (payload.meta &&
      ((payload.meta as AnyRecord).kind as string | undefined)) ??
    null;

  const meta: AnyRecord = (payload.meta as AnyRecord) ?? {};

  console.log(
    "[send-booking-email-core] buildMailFromPayload: to=",
    to,
    "kind=",
    kind,
    "meta_keys=",
    Object.keys(meta)
  );

  if (!to) {
    console.warn(
      "[send-booking-email-core] buildMailFromPayload: missing 'to' email"
    );
    return null;
  }

  // 1️⃣ Template-based path (preferred)
  if (kind) {
    const tpl = await fetchTemplate(kind);
    console.log(
      "[send-booking-email-core] template lookup:",
      "kind=",
      kind,
      "found=",
      !!tpl
    );
    if (tpl) {
      const subject = renderTemplate(
        tpl.subject || "HomeFix Notification",
        meta
      );
      const html = renderTemplate(
        tpl.html ||
          `<p>Hello {{customer_name}},</p><p>This is a notification from ${PROJECT_NAME}.</p>`,
        meta
      );

      return { to, subject, html };
    }
  }

  // 2️⃣ Fallback: use payload-provided subject/html
  const subject =
    (payload.subject as string | undefined) ?? `HomeFix Notification`;
  const html =
    (payload.html as string | undefined) ??
    `<p>Hello from ${PROJECT_NAME}.<br>This notification has no additional content.</p>`;

  console.log(
    "[send-booking-email-core] using fallback subject/html (no template or kind)"
  );

  return { to, subject, html };
}

/* ── Resend Mail Sender ─────────────────────────────────────── */

async function sendViaResend(mail: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!RESEND_API_KEY) {
    console.error(
      "[send-booking-email-core] sendViaResend: RESEND_API_KEY not configured"
    );
    throw new Error("RESEND_API_KEY not configured");
  }

  console.log(
    "[send-booking-email-core] sendViaResend: to=",
    mail.to,
    "subject=",
    mail.subject
  );

  const resp = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [mail.to, ADMIN_EMAIL], // client + admin copy
      subject: mail.subject,
      html: mail.html,
    }),
  });

  const data = await resp.json().catch(() => ({}));
  console.log(
    `📤 [Resend] Status ${resp.status} for ${mail.to} | ok=`,
    resp.ok
  );
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
  console.log(
    `🔔 [send-booking-email-core] incoming request: internal=${internal}, authorized=${authOK}`
  );

  if (!internal && !authOK) {
    console.warn("🚫 Unauthorized access attempt.");
    await log({ status_code: 401, error_message: "Unauthorized request" });
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  let payload: AnyRecord;
  try {
    payload = (await req.json()) as AnyRecord;
    console.log(
      "[send-booking-email-core] incoming payload:",
      JSON.stringify(payload).slice(0, 1000)
    );
  } catch {
    await log({ status_code: 400, error_message: "Invalid JSON" });
    console.warn("[send-booking-email-core] invalid JSON body");
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const mail = await buildMailFromPayload(payload);
  if (!mail) {
    await log({
      status_code: 400,
      error_message:
        "Missing email recipient fields (email|user_email|to|to_email)",
      request_body: payload,
    });
    console.warn(
      "[send-booking-email-core] buildMailFromPayload returned null (missing recipient)"
    );
    return new Response(
      JSON.stringify({
        error: "Missing email recipient fields (email|user_email|to|to_email)",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  console.log(
    "[send-booking-email-core] built mail:",
    JSON.stringify(
      {
        to: mail.to,
        subject: mail.subject,
        html_preview: mail.html.slice(0, 200),
      },
      null,
      2
    )
  );

  try {
    const { status, data } = await sendViaResend(mail);
    const ok = status === 202;

    await log({
      status_code: status,
      request_body: { email: mail.to, subject: mail.subject },
      response_body: JSON.stringify(data),
      error_message: ok ? null : "Resend returned non-202",
    });

    console.log(
      `✅ [BookingEmail] Sent to ${mail.to} | resend_status=${status} | ok=${ok}`
    );
    return new Response(JSON.stringify({ ok, status, data }), {
      status: ok ? 200 : 502,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("💥 [send-booking-email-core] sendViaResend threw:", err);
    await log({
      status_code: 500,
      error_message: `Unhandled: ${String(err)}`,
      request_body: { snippet: payload },
    });
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
