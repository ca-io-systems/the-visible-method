import { NextResponse } from "next/server";

type SubmitBody = {
  firstName: string;
  email: string;
  phone: string;
  lastName?: string;
  hyros_tag?: string;
  revenue?: string;
  optin_url?: string;
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

  if (!firstName || !email || !phone) {
    return NextResponse.json(
      { error: "firstName, email, and phone are required" },
      { status: 400 },
    );
  }

  const payload: Record<string, string> = { firstName, email, phone };

  const lastName = body.lastName?.trim();
  if (lastName) payload.lastName = lastName;

  const hyrosTag = body.hyros_tag?.trim();
  if (hyrosTag) payload.hyros_tag = hyrosTag;

  const revenue = body.revenue?.trim();
  if (revenue) payload.revenue = revenue;

  const optinUrl = body.optin_url?.trim();
  if (optinUrl) payload.optin_url = optinUrl;

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
