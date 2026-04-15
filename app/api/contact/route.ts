import { NextRequest, NextResponse } from "next/server";
import { getResend } from "@/lib/resend";
import { createSupabaseServerClient } from "@/lib/supabase-server";

function isValidEmail(email: string): boolean {
  return Boolean(email && email.includes("@"));
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const record =
    typeof body === "object" && body !== null
      ? (body as { name?: string; email?: string; message?: string })
      : {};

  const name = typeof record.name === "string" ? record.name.trim() : "";
  const email = typeof record.email === "string" ? record.email.trim().toLowerCase() : "";
  const message = typeof record.message === "string" ? record.message.trim() : "";

  if (!isValidEmail(email)) {
    return NextResponse.json({ ok: false, error: "Valid email required" }, { status: 400 });
  }

  if (!message) {
    return NextResponse.json({ ok: false, error: "Message required" }, { status: 400 });
  }

  const to = process.env.CONTACT_TO_EMAIL?.trim();
  const from = process.env.CONTACT_FROM_EMAIL?.trim();

  if (!to || !from) {
    return NextResponse.json({ ok: false, error: "Contact email is not configured" }, { status: 500 });
  }

  const textBody = [
    `Name: ${name || "(not provided)"}`,
    `Email: ${email}`,
    `Message:`,
    message,
  ].join("\n");

  try {
    const resend = getResend();
    const { error: sendError } = await resend.emails.send({
      from,
      to: [to],
      subject: "New contact from XOLID",
      text: textBody,
    });

    if (sendError) {
      console.error("[contact] resend error", sendError);
      return NextResponse.json({ ok: false, error: "Internal server error" }, { status: 500 });
    }
  } catch (e) {
    console.error("[contact] resend failed", e);
    return NextResponse.json({ ok: false, error: "Internal server error" }, { status: 500 });
  }

  try {
    const supabase = createSupabaseServerClient();
    const { error: dbError } = await supabase.from("contacts").insert({
      name: name || null,
      email,
      message,
      created_at: new Date().toISOString(),
    });
    if (dbError) {
      console.error("[contact] supabase insert failed", dbError);
    }
  } catch {
    // Optional persistence: ignore if Supabase is not configured.
  }

  return NextResponse.json({ ok: true, message: "Contact received" }, { status: 201 });
}
