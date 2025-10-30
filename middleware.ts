import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  // paths that require auth
  const protectedPaths = [
    /^\/bookings(\/.*)?$/,
    /^\/account(\/.*)?$/,
    /^\/admin(\/.*)?$/,
  ];
  const url = req.nextUrl.pathname;

  // simple cookie-based check (adjust if you use Supabase auth helpers)
  const isAuthed = Boolean(req.cookies.get("hf_user_id")?.value) ||
    Boolean(req.cookies.get("sb-access-token")?.value);

  if (protectedPaths.some((re) => re.test(url)) && !isAuthed) {
    const login = req.nextUrl.clone();
    login.pathname = "/login";
    login.searchParams.set("next", url);
    return NextResponse.redirect(login);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/bookings/:path*", "/account/:path*", "/profile/:path*"],
};
