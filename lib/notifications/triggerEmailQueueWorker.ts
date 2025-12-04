"use server";
/**
 * Triggers the Supabase edge function email-queue-worker after notification_queue inserts.
 * Uses service role key to POST to `${SUPABASE_URL}/functions/v1/email-queue-worker`.
 */

export async function triggerEmailQueueWorker() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.warn("[notifications] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY; cannot trigger worker.");
    return;
  }

  try {
    const resp = await fetch(`${url}/functions/v1/email-queue-worker`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ source: "homefix-api" }),
      cache: "no-store",
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      console.warn("[notifications] email-queue-worker responded non-200", resp.status, text);
    }
  } catch (err) {
    console.warn("[notifications] Failed to trigger email-queue-worker", err);
  }
}
