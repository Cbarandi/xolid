import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { AuthSession, UserRole } from "./types";
import { getUserByUsername, touchLastLogin } from "./users-db";

/** HttpOnly signed session for private XOLID access (Edge-compatible verify). */

export const PRIVATE_SESSION_COOKIE_NAME = "xolid_private_session";

const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 7;

type SessionPayloadV1 = {
  v: 1;
  sub: string;
  iat: number;
};

type SessionPayloadV2 = {
  v: 2;
  sub: string;
  uid: string | null;
  role: UserRole;
  iat: number;
};

type SessionPayload = SessionPayloadV1 | SessionPayloadV2;

export function isPrivateAuthConfigured(): boolean {
  const username = process.env.XOLID_PRIVATE_USERNAME?.trim();
  const hash = process.env.XOLID_PRIVATE_PASSWORD_HASH?.trim();
  const secret = process.env.XOLID_SESSION_SECRET?.trim();

  if (process.env.NODE_ENV === "production") {
    return Boolean(username && hash && secret);
  }

  return Boolean(username && hash);
}

function sessionSecret(): string {
  const explicit = process.env.XOLID_SESSION_SECRET?.trim();
  if (explicit) return explicit;
  if (process.env.NODE_ENV === "production") {
    throw new Error("XOLID_SESSION_SECRET is required in production");
  }
  return "xolid-local-dev-insecure-session-secret";
}

function base64urlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]!);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64urlDecode(s: string): Uint8Array {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + pad;
  const binary = atob(b64);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
}

async function hmacSha256(secret: string, message: Uint8Array): Promise<Uint8Array> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.digest("SHA-256", enc.encode(secret));
  const key = await crypto.subtle.importKey(
    "raw",
    keyMaterial,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, message as BufferSource);
  return new Uint8Array(sig);
}

export function decodeSessionPayload(token: string): SessionPayload | null {
  try {
    const dot = token.indexOf(".");
    if (dot <= 0) return null;
    const payloadBytes = base64urlDecode(token.slice(0, dot));
    const json = new TextDecoder().decode(payloadBytes);
    const parsed = JSON.parse(json) as SessionPayload;
    if (parsed.v === 2) {
      if (typeof parsed.sub !== "string" || typeof parsed.role !== "string") return null;
      return parsed;
    }
    if (parsed.v === 1 && typeof parsed.sub === "string") return parsed;
    return null;
  } catch {
    return null;
  }
}

async function signSessionPayload(payload: SessionPayloadV2): Promise<string> {
  const secret = sessionSecret();
  const enc = new TextEncoder();
  const payloadBytes = enc.encode(JSON.stringify(payload));
  const sig = await hmacSha256(secret, payloadBytes);
  return `${base64urlEncode(payloadBytes)}.${base64urlEncode(sig)}`;
}

export async function verifySessionToken(token: string): Promise<boolean> {
  if (!isPrivateAuthConfigured()) return false;

  try {
    const secret = sessionSecret();
    if (!token.includes(".")) return false;
    const dot = token.indexOf(".");
    const payloadB64 = token.slice(0, dot);
    const sigB64 = token.slice(dot + 1);
    const payloadBytes = base64urlDecode(payloadB64);
    const sigBytes = base64urlDecode(sigB64);
    const expected = await hmacSha256(secret, payloadBytes);
    if (sigBytes.length !== expected.length) return false;
    let diff = 0;
    for (let i = 0; i < expected.length; i++) diff |= sigBytes[i]! ^ expected[i]!;
    return diff === 0;
  } catch {
    return false;
  }
}

async function verifyEnvCredentials(username: string, password: string): Promise<boolean> {
  const expectedUser = process.env.XOLID_PRIVATE_USERNAME!.trim();
  const hash = process.env.XOLID_PRIVATE_PASSWORD_HASH!.trim();

  if (username.trim() !== expectedUser) return false;

  try {
    return await bcrypt.compare(password, hash);
  } catch {
    return false;
  }
}

export async function authenticateUser(
  username: string,
  password: string,
): Promise<AuthSession | null> {
  if (!isPrivateAuthConfigured()) return null;

  const trimmed = username.trim();
  if (!trimmed || !password) return null;

  const dbUser = await getUserByUsername(trimmed);

  if (dbUser) {
    if (!dbUser.isActive) return null;

    if (dbUser.passwordHash) {
      const ok = await bcrypt.compare(password, dbUser.passwordHash);
      if (!ok) return null;
      await touchLastLogin(dbUser.id);
      return {
        userId: dbUser.id,
        username: dbUser.username,
        email: dbUser.email,
        role: dbUser.role,
      };
    }

    const envOk = await verifyEnvCredentials(trimmed, password);
    if (!envOk) return null;
    await touchLastLogin(dbUser.id);
    return {
      userId: dbUser.id,
      username: dbUser.username,
      email: dbUser.email,
      role: dbUser.role,
    };
  }

  const envOk = await verifyEnvCredentials(trimmed, password);
  if (!envOk) return null;

  return {
    userId: null,
    username: process.env.XOLID_PRIVATE_USERNAME!.trim(),
    email: null,
    role: "SUPER_ADMIN",
  };
}

export async function createSessionForUser(session: AuthSession): Promise<string> {
  const payload: SessionPayloadV2 = {
    v: 2,
    sub: session.username,
    uid: session.userId,
    role: session.role,
    iat: Math.floor(Date.now() / 1000),
  };
  return signSessionPayload(payload);
}

export function sessionFromPayload(payload: SessionPayload): AuthSession {
  if (payload.v === 2) {
    return {
      userId: payload.uid,
      username: payload.sub,
      email: null,
      role: payload.role,
    };
  }
  return {
    userId: null,
    username: payload.sub,
    email: null,
    role: "SUPER_ADMIN",
  };
}

export async function getPrivateSession(): Promise<AuthSession | null> {
  if (!isPrivateAuthConfigured()) return null;

  const token = (await cookies()).get(PRIVATE_SESSION_COOKIE_NAME)?.value;
  if (!token || !(await verifySessionToken(token))) return null;

  const payload = decodeSessionPayload(token);
  if (!payload) return null;

  const session = sessionFromPayload(payload);

  if (session.userId) {
    const dbUser = await getUserByUsername(session.username);
    if (!dbUser || !dbUser.isActive) return null;
    return {
      userId: dbUser.id,
      username: dbUser.username,
      email: dbUser.email,
      role: dbUser.role,
    };
  }

  return session;
}

export async function requirePrivateSession(): Promise<AuthSession> {
  const session = await getPrivateSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}

export async function destroyPrivateSession(): Promise<void> {
  const store = await cookies();
  store.set(PRIVATE_SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export function privateSessionCookieOptions() {
  return {
    httpOnly: true as const,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE_SEC,
  };
}

/** @deprecated Use authenticateUser */
export async function verifyPrivateCredentials(
  username: string,
  password: string,
): Promise<boolean> {
  const session = await authenticateUser(username, password);
  return session != null;
}

/** @deprecated Use createSessionForUser */
export async function createPrivateSession(): Promise<string> {
  const username = process.env.XOLID_PRIVATE_USERNAME?.trim();
  if (!username) throw new Error("XOLID_PRIVATE_USERNAME is not configured");
  return createSessionForUser({
    userId: null,
    username,
    email: null,
    role: "SUPER_ADMIN",
  });
}

export function getSessionFromToken(token: string): AuthSession | null {
  const payload = decodeSessionPayload(token);
  if (!payload) return null;
  return sessionFromPayload(payload);
}