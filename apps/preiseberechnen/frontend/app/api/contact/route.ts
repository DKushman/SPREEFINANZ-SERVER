import { NextResponse } from "next/server";

type ContactBody = {
  name?: string;
  email?: string;
  message?: string;
};

export async function POST(request: Request) {
  let body: ContactBody;
  try {
    body = (await request.json()) as ContactBody;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const name = typeof body.name === "string" ? body.name.trim() : "";

  if (!email || !message || message.length < 5) {
    return NextResponse.json({ ok: false, error: "validation" }, { status: 400 });
  }

  const forwardUrl = process.env.CONTACT_FORWARD_URL;
  if (forwardUrl) {
    const res = await fetch(forwardUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        message,
        source: "preiseberechnen-kontaktformular",
      }),
    });
    if (!res.ok) {
      return NextResponse.json({ ok: false, error: "upstream" }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json(
    { ok: false, error: "not_configured" },
    { status: 503 },
  );
}
