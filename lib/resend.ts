import { Resend } from "resend";

let client: Resend | null = null;

export function getResend(): Resend {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) {
    throw new Error("Missing RESEND_API_KEY");
  }
  if (!client) {
    client = new Resend(key);
  }
  return client;
}
