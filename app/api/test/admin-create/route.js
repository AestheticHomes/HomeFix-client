import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseClient";

export async function POST(req) {
  console.log("🧩 [Admin Create] Invoked at:", new Date().toISOString());

  if (!supabaseServer) {
    console.error("❌ Supabase server client not initialized");
    return NextResponse.json({ error: "Server client not available" }, { status: 500 });
  }

  try {
    const body = await req.json();
    console.log("📩 Incoming body:", body);

    // Make sure you have service key client
    const { data, error } = await supabaseServer.auth.admin.createUser({
      email: body.email,
      password: body.password,
      email_confirm: true,
    });

    if (error) {
      console.error("❌ Supabase Admin Error:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    console.log("✅ User created:", data);
    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("💥 Unexpected Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
