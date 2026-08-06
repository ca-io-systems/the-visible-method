import { NextResponse } from "next/server";
import Stripe from "stripe";
import { buildStudioSessionGhlPayload } from "@/lib/stripe-studio-session";

export const runtime = "nodejs";

/**
 * POST /api/stripe-webhook
 *
 * args: raw Stripe body + stripe-signature header
 * env: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, GHL_STUDIO_SESSION_WEBHOOK_URL
 * returns: { received: true } on success; 4xx/5xx on config/signature/GHL failures
 *
 * On checkout.session.completed → POST flat contact JSON to GHL inbound webhook
 * (GHL workflow should Add Tag studio-session + send VIP confirmation).
 */
export async function POST(request: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  const ghlWebhookUrl = process.env.GHL_STUDIO_SESSION_WEBHOOK_URL?.trim();

  if (!secretKey || !webhookSecret || !ghlWebhookUrl) {
    return NextResponse.json(
      {
        error:
          "STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, and GHL_STUDIO_SESSION_WEBHOOK_URL are required",
      },
      { status: 500 },
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  const rawBody = await request.text();
  const stripe = new Stripe(secretKey);

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const payload = buildStudioSessionGhlPayload(session);

    if (!payload) {
      console.error(
        "[stripe-webhook] checkout.session.completed missing email",
        session.id,
      );
      return NextResponse.json({ received: true, skipped: "missing_email" });
    }

    const ghlRes = await fetch(ghlWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!ghlRes.ok) {
      const detail = await ghlRes.text();
      console.error("[stripe-webhook] GHL webhook failed", ghlRes.status, detail);
      return NextResponse.json(
        { error: "GHL webhook request failed", detail },
        { status: 502 },
      );
    }
  }

  return NextResponse.json({ received: true });
}
