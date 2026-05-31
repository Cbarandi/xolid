import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { canAccessPath } from "@/lib/auth/rbac";
import {
  decodeSessionPayload,
  isPrivateAuthConfigured,
  PRIVATE_SESSION_COOKIE_NAME,
  sessionFromPayload,
  verifySessionToken,
} from "@/lib/auth/private-session";

export async function middleware(request: NextRequest) {
  if (!isPrivateAuthConfigured()) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(login);
  }

  const token = request.cookies.get(PRIVATE_SESSION_COOKIE_NAME)?.value;
  if (!token || !(await verifySessionToken(token))) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(login);
  }

  const payload = decodeSessionPayload(token);
  if (!payload) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(login);
  }

  const session = sessionFromPayload(payload);
  if (!canAccessPath(session, request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/bots/:path*",
    "/strategies/:path*",
    "/coin-lists/:path*",
    "/deals/:path*",
    "/exchange/:path*",
    "/risk/:path*",
    "/users/:path*",
    "/admin/:path*",
  ],
};
