import { NextRequest, NextResponse } from "next/server";

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
      ? (body as { name?: string; country?: string; email?: string })
      : {};

  const name = typeof record.name === "string" ? record.name.trim() : "";
  const country = typeof record.country === "string" ? record.country.trim() : "";
  const email = typeof record.email === "string" ? record.email.trim() : "";

  if (!email || !email.includes("@")) {
    return NextResponse.json({ ok: false, error: "Email required" }, { status: 400 });
  }

  const ip = clientIp(req);
  const countryHint = req.headers.get("x-vercel-ip-country");
  const ua = req.headers.get("user-agent");

  console.info("[waitlist]", {
    ts: new Date().toISOString(),
    name: name || null,
    country: country || null,
    email,
    ip,
    countryHint,
    ua: ua?.slice(0, 160) ?? null,
  });

  return NextResponse.json({ ok: true });
}
