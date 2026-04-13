/** HttpOnly cookie session for admin (HMAC-signed payload, Edge-compatible). */

export const SESSION_COOKIE_NAME = "xolid_admin_session";

function signingSecret(): string {
  const explicit = process.env.ADMIN_SESSION_SECRET?.trim();
  if (explicit) return explicit;
  const email = process.env.ADMIN_EMAIL?.trim() ?? "";
  const password = process.env.ADMIN_PASSWORD ?? "";
  return `${email}:${password}`;
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

export async function signSessionToken(): Promise<string> {
  const secret = signingSecret();
  if (!secret) throw new Error("Missing ADMIN credentials or ADMIN_SESSION_SECRET");
  const enc = new TextEncoder();
  const payload = JSON.stringify({ v: 1, iat: Math.floor(Date.now() / 1000) });
  const payloadBytes = enc.encode(payload);
  const sig = await hmacSha256(secret, payloadBytes);
  return `${base64urlEncode(payloadBytes)}.${base64urlEncode(sig)}`;
}

export async function verifySessionToken(token: string): Promise<boolean> {
  try {
    const secret = signingSecret();
    if (!secret || !token.includes(".")) return false;
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
