import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { CANONICAL_ORIGIN } from "@/lib/seoConfig";

/**
 * ============================================================
 * 🧠 HomeFix Middleware — Edith Continuum v6.1 🌗
 * ------------------------------------------------------------
 * ✅ Protects /admin, /profile, /bookings, /account
 * ✅ Whitelists checkout + my-bookings (legacy my-orders) + mock-razorpay
 * ✅ Honors hf_skip_profile_redirect cookie
 * ✅ Works for both Supabase + App cookies
 * ✅ Edge-safe + PWA friendly
 * ✅ Enforces canonical host → https://www.homefix.co.in
 * ============================================================
 */
export function middleware(req: NextRequest) {
  // 0️⃣ Canonical host enforcement (SEO duplicate avoidance)
  const canonicalHost = new URL(CANONICAL_ORIGIN).hostname;
  const nextUrl = req.nextUrl.clone();
  if (nextUrl.hostname !== canonicalHost) {
    nextUrl.hostname = canonicalHost;
    nextUrl.protocol = "https:";
    return NextResponse.redirect(nextUrl, 308);
  }

  const url = nextUrl.pathname;
  const res = NextResponse.next();

  /* ------------------------------------------------------------
     1️⃣ Public / Whitelisted routes
     ------------------------------------------------------------ */
  const whitelist = [
    /^\/$/, // homepage
    /^\/checkout(\/.*)?$/,
    /^\/my-bookings(\/.*)?$/,
    /^\/my-orders(\/.*)?$/, // legacy path; now renders bookings UI directly
    /^\/mock-razorpay(\/.*)?$/, // allow mock payment page
    /^\/login(\/.*)?$/,
    /^\/signup(\/.*)?$/,
    /^\/store(\/.*)?$/,
    /^\/manifest\.json$/,
    /^\/icons(\/.*)?$/,
    /^\/_next(\/.*)?$/, // Next.js internals
    /^\/api(\/.*)?$/, // APIs
  ];

  if (whitelist.some((re) => re.test(url))) {
    if (process.env.NODE_ENV === "development") {
      console.log("🟢 [Middleware] Whitelisted:", url);
    }
    return res;
  }

  /* ------------------------------------------------------------
     2️⃣ Skip-redirect safeguard (post-checkout & payment flow)
     ------------------------------------------------------------ */
  const skipRedirect =
    req.cookies.get("hf_skip_profile_redirect")?.value === "1";

  if (
    skipRedirect &&
    (url.startsWith("/checkout") ||
      url.startsWith("/my-bookings") ||
      url.startsWith("/my-orders") ||
      url.startsWith("/mock-razorpay"))
  ) {
    if (process.env.NODE_ENV === "development") {
      console.log("🧭 [Middleware] Skip redirect → post-checkout safe path");
    }
    return res;
  }

  /* ------------------------------------------------------------
     3️⃣ Protected paths — require auth
     ------------------------------------------------------------ */
  const protectedPaths = [
    /^\/bookings(\/.*)?$/,
    /^\/account(\/.*)?$/,
    /^\/admin(\/.*)?$/,
    /^\/profile(\/.*)?$/, // keep /profile behind auth
  ];

  // Multi-source cookie-based authentication
  const authCookies = [
    "hf_user_id",
    "sb-access-token",
    "sb:token",
    "supabase-auth-token",
  ];
  const isAuthed = authCookies.some((key) => !!req.cookies.get(key)?.value);

  /* ------------------------------------------------------------
     4️⃣ Redirect unauthenticated users
     ------------------------------------------------------------ */
  const requiresAuth = protectedPaths.some((re) => re.test(url));
  if (requiresAuth && !isAuthed) {
    if (process.env.NODE_ENV === "development") {
      console.log(
        "🚫 [Middleware] Unauthorized access → redirecting to /login"
      );
    }

    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", url);
    return NextResponse.redirect(loginUrl);
  }

  /* ------------------------------------------------------------
     5️⃣ Allow all other requests
     ------------------------------------------------------------ */
  if (process.env.NODE_ENV === "development") {
    console.log("🧩 [Middleware] Normal pass-through:", url);
  }

  return res;
}

/* ------------------------------------------------------------
   ⚙️ Matcher Configuration
------------------------------------------------------------ */
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico|icons|manifest\\.json).*)"],
};
