import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { logEvent } from "@/lib/audit/logger";
import {
  getSessionFromToken,
  PRIVATE_SESSION_COOKIE_NAME,
  privateSessionCookieOptions,
  verifySessionToken,
} from "@/lib/auth/private-session";

export async function POST() {
  const token = (await cookies()).get(PRIVATE_SESSION_COOKIE_NAME)?.value;
  if (token && (await verifySessionToken(token))) {
    const session = getSessionFromToken(token);
    if (session) {
      await logEvent({
        userId: session.userId,
        eventType: "LOGOUT",
        entityType: "auth",
        metadata: { username: session.username },
      });
    }
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(PRIVATE_SESSION_COOKIE_NAME, "", {
    ...privateSessionCookieOptions(),
    maxAge: 0,
  });
  return res;
}
