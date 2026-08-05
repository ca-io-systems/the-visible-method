import { NextResponse } from "next/server";

type SubmitBody = {
  firstName: string;
  email: string;
  phone: string;
  optin_url: string;
  lastName?: string;
  hyros_tag?: string;
  revenue?: string;
  source?: string;
};

/**
 * POST /api/submit
 * Forwards funnel form data to the GHL inbound webhook.
 */
export async function POST(request: Request) {
  const webhookUrl = process.env.GHL_WEBHOOK_URL;
  if (!webhookUrl) {
    return NextResponse.json(
      { error: "GHL_WEBHOOK_URL is not configured" },
      { status: 500 },
    );
  }

  let body: SubmitBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const firstName = body.firstName?.trim();
  const email = body.email?.trim();
  const phone = body.phone?.trim();
  const optinUrl = body.optin_url?.trim();

  if (!firstName || !email || !phone || !optinUrl) {
    return NextResponse.json(
      { error: "firstName, email, phone, and optin_url are required" },
      { status: 400 },
    );
  }

  const payload: Record<string, string> = {
    firstName,
    email,
    phone,
    optin_url: optinUrl,
  };

  const lastName = body.lastName?.trim();
  if (lastName) payload.lastName = lastName;

  const hyrosTag = body.hyros_tag?.trim();
  if (hyrosTag) payload.hyros_tag = hyrosTag;

  const revenue = body.revenue?.trim();
  if (revenue) payload.revenue = revenue;

  const source = body.source?.trim();
  if (source) payload.source = source;

  const webhookRes = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!webhookRes.ok) {
    const detail = await webhookRes.text();
    return NextResponse.json(
      { error: "Webhook request failed", detail },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
