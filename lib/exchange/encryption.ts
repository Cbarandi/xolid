import crypto from "crypto";

const IV_BYTES = 12;
const TAG_BYTES = 16;
const KEY_BYTES = 32;

function parseMasterKey(raw: string): Buffer {
  const trimmed = raw.trim();
  if (!trimmed) {
    throw new Error("XOLID_MASTER_ENCRYPTION_KEY is not configured");
  }

  if (/^[0-9a-fA-F]{64}$/.test(trimmed)) {
    return Buffer.from(trimmed, "hex");
  }

  const fromB64 = Buffer.from(trimmed, "base64");
  if (fromB64.length === KEY_BYTES) {
    return fromB64;
  }

  throw new Error(
    "XOLID_MASTER_ENCRYPTION_KEY must be 32 bytes (base64) or 64 hex characters",
  );
}

function masterKey(): Buffer {
  const env = process.env.XOLID_MASTER_ENCRYPTION_KEY?.trim();
  if (!env) {
    throw new Error("XOLID_MASTER_ENCRYPTION_KEY is not configured");
  }
  return parseMasterKey(env);
}

export function isEncryptionConfigured(): boolean {
  try {
    masterKey();
    return true;
  } catch {
    return false;
  }
}

/** AES-256-GCM encrypt — returns base64(iv + authTag + ciphertext). */
export function encryptSecret(plaintext: string): string {
  const key = masterKey();
  const iv = crypto.randomBytes(IV_BYTES);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64");
}

/** AES-256-GCM decrypt. */
export function decryptSecret(payload: string): string {
  const key = masterKey();
  const buf = Buffer.from(payload, "base64");
  if (buf.length < IV_BYTES + TAG_BYTES + 1) {
    throw new Error("Invalid encrypted payload");
  }

  const iv = buf.subarray(0, IV_BYTES);
  const tag = buf.subarray(IV_BYTES, IV_BYTES + TAG_BYTES);
  const data = buf.subarray(IV_BYTES + TAG_BYTES);

  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
}

/** Mask API key for display — last 4 chars visible. */
export function maskApiKey(apiKey: string): string {
  const trimmed = apiKey.trim();
  if (trimmed.length <= 4) return "****";
  return `****${trimmed.slice(-4)}`;
}
