import { NextResponse } from "next/server";
import {
  PRIVATE_SESSION_COOKIE_NAME,
  privateSessionCookieOptions,
} from "@/lib/auth/private-session";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(PRIVATE_SESSION_COOKIE_NAME, "", {
    ...privateSessionCookieOptions(),
    maxAge: 0,
  });
  return res;
}
