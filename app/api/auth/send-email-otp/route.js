// app/api/auth/send-email-otp/route.js
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { email, user_id } = await req.json();

    if (!email)
      return NextResponse.json({ success: false, error: "Missing email" }, { status: 400 });

    // Call Supabase Edge Function (same domain as your mailer)
    const res = await fetch(
      "https://xnubmphixlpkyqfhghup.functions.supabase.co/send-email-otp",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({ email, user_id }),
      }
    );

    const data = await res.json();
    return NextResponse.json({ success: true, resendResponse: data });
  } catch (err) {
    console.error("[EMAIL OTP SEND] Error:", err);
    return NextResponse.json({ success: false, error: "Internal error" }, { status: 500 });
  }
}
