import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

function clientIp(req: NextRequest): string | null {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0]?.trim() ?? null;
  return req.headers.get("x-real-ip");
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
      ? (body as { name?: string; country?: string; email?: string; source?: string })
      : {};

  const name = typeof record.name === "string" ? record.name.trim() : "";
  const country = typeof record.country === "string" ? record.country.trim() : "";
  const email = typeof record.email === "string" ? record.email.trim().toLowerCase() : "";
  const source = typeof record.source === "string" && record.source.trim() ? record.source.trim() : "xolid_web";

  if (!email || !email.includes("@")) {
    return NextResponse.json({ ok: false, error: "Email required" }, { status: 400 });
  }

  let supabase;
  try {
    supabase = createSupabaseServerClient();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Waitlist service is not configured" },
      { status: 500 },
    );
  }

  const { error } = await supabase.from("waitlist").insert({
    name: name || null,
    email,
    country: country || null,
    source,
  });

  if (!error) {
    return NextResponse.json({ ok: true, message: "Waitlist entry created" }, { status: 201 });
  }

  if (error.code === "23505") {
    return NextResponse.json(
      { ok: false, error: "Email already registered in waitlist" },
      { status: 409 },
    );
  }

  const ip = clientIp(req);
  const countryHint = req.headers.get("x-vercel-ip-country");
  const ua = req.headers.get("user-agent");

  console.error("[waitlist] insert failed", {
    ts: new Date().toISOString(),
    email,
    source,
    ip,
    countryHint,
    ua: ua?.slice(0, 160) ?? null,
    code: error.code ?? null,
    message: error.message ?? null,
  });

  return NextResponse.json({ ok: false, error: "Internal server error" }, { status: 500 });
}
