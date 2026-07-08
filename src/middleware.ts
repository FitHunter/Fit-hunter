import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Minimal middleware: no edge JWT decoding.
// Server components handle their own auth via auth() from auth.ts.
// We only redirect logged-in users away from auth pages using the
// __Secure-authjs.session-token / authjs.session-token cookie presence.
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // /register is intentionally NOT bounced: a logged-in consumer must be able
  // to create a trainer/gym account (the register success screen signs them
  // out before sending them to login).
  const AUTH_PAGES = ["/login", "/forgot-password", "/reset-password"];
  const isAuthPage = AUTH_PAGES.some((p) => pathname.startsWith(p));

  if (isAuthPage) {
    const sessionCookie =
      request.cookies.get("__Secure-authjs.session-token") ??
      request.cookies.get("authjs.session-token") ??
      request.cookies.get("next-auth.session-token") ??
      request.cookies.get("__Secure-next-auth.session-token");

    if (sessionCookie) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
