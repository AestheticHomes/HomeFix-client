import { NextResponse } from "next/server";

/**
 * POST /api/logout
 * Clears the httpOnly auth/session cookie to complete logout on the server.
 * Twilio OTP is only for login verification; this endpoint just expires the session.
 */
export async function POST() {
  const res = NextResponse.json({ ok: true });

  const common = {
    httpOnly: true,
    secure: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  };

  // Clear all auth cookies used by Twilio login/profile
  res.cookies.set("hf_session", "", common);
  res.cookies.set("hf_user_id", "", { ...common, httpOnly: false });
  res.cookies.set("hf_user_phone", "", { ...common, httpOnly: false });
  res.cookies.set("hf_user_verified", "", { ...common, httpOnly: false });

  return res;
}
