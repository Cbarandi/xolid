import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, signSessionToken } from "@/lib/admin-session";

export async function POST(request: Request) {
  const adminEmail = process.env.ADMIN_EMAIL?.trim();
  const adminPassword = (process.env.ADMIN_PASSWORD ?? "").trim();

  if (!adminEmail || adminPassword === "") {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (email !== adminEmail || password !== adminPassword) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  let token: string;
  try {
    token = await signSessionToken();
  } catch {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const res = NextResponse.json({ ok: true });
  const secure = process.env.NODE_ENV === "production";
  res.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
