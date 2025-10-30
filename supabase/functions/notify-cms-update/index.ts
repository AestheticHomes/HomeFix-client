/**
 * Edge Function: notify-cms-update
 * --------------------------------
 * Logs and notifies when CMS (goods) table is modified.
 */

import { serve } from "std/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

serve(async (req: Request): Promise<Response> => {
  try {
    const payload = await req.json();
    console.log("🧩 notify-cms-update payload:", payload);

    const { type, table, record, old_record } = payload ?? {};
    if (table !== "goods") {
      return new Response(
        JSON.stringify({ ok: false, message: "Ignored non-goods table" }),
        { headers: { "Content-Type": "application/json" } },
      );
    }

    const title = record?.title ?? old_record?.title ?? "Untitled";
    const action = (type ?? "unknown").toUpperCase();

    await supabase.from("http_response_log").insert([
      {
        context: "notify-cms-update",
        response: { action, title },
        created_at: new Date().toISOString(),
      },
    ]);

    await supabase.functions.invoke("email-queue-worker", {
      body: {
        type: "cms-update",
        payload: {
          to: "support@homefixindia.in",
          subject: `CMS ${action}: ${title}`,
          message:
            `<p>Product <b>${title}</b> was ${action.toLowerCase()}.</p>`,
        },
      },
    });

    return new Response(
      JSON.stringify({ ok: true, message: `CMS ${action} logged` }),
      { headers: { "Content-Type": "application/json" } },
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("❌ notify-cms-update error:", msg);
    return new Response(JSON.stringify({ ok: false, error: msg }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
