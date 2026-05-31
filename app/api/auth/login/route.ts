import { NextResponse } from "next/server";
import { logEvent } from "@/lib/audit/logger";
import {
  authenticateUser,
  createSessionForUser,
  isPrivateAuthConfigured,
  PRIVATE_SESSION_COOKIE_NAME,
  privateSessionCookieOptions,
} from "@/lib/auth/private-session";

export async function POST(request: Request) {
  if (!isPrivateAuthConfigured()) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  let body: { username?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const username = typeof body.username === "string" ? body.username.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!username || !password) {
    await logEvent({
      eventType: "LOGIN_FAILURE",
      entityType: "auth",
      metadata: { username: username || "unknown", reason: "missing_credentials" },
    });
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const session = await authenticateUser(username, password);
  if (!session) {
    await logEvent({
      eventType: "LOGIN_FAILURE",
      entityType: "auth",
      metadata: { username },
    });
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  let token: string;
  try {
    token = await createSessionForUser(session);
  } catch {
    await logEvent({
      userId: session.userId,
      eventType: "LOGIN_FAILURE",
      entityType: "auth",
      metadata: { username, reason: "session_error" },
    });
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  await logEvent({
    userId: session.userId,
    eventType: "LOGIN_SUCCESS",
    entityType: "auth",
    metadata: { username: session.username, role: session.role },
  });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(PRIVATE_SESSION_COOKIE_NAME, token, privateSessionCookieOptions());
  return res;
}
