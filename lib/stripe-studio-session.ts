/**
 * Stripe Checkout → GHL Studio Session helpers.
 *
 * splitCustomerName(fullName) → { firstName, lastName }
 * buildStudioSessionGhlPayload(session) → flat GHL inbound webhook body
 */

import type Stripe from "stripe";

export type NameParts = {
  firstName: string;
  lastName: string;
};

export type StudioSessionGhlPayload = {
  email: string;
  source: "studio-session";
  firstName?: string;
  lastName?: string;
  phone?: string;
  stripe_session_id?: string;
  amount_total?: string;
  currency?: string;
};

/**
 * Splits a Stripe customer full name into first / last.
 *
 * @param fullName - `customer_details.name` from Checkout Session
 * @returns firstName + lastName (lastName empty if single token)
 */
export function splitCustomerName(fullName: string | null | undefined): NameParts {
  const trimmed = fullName?.trim() ?? "";
  if (!trimmed) return { firstName: "", lastName: "" };
  const [firstName, ...rest] = trimmed.split(/\s+/);
  return { firstName, lastName: rest.join(" ") };
}

/**
 * Builds the flat JSON body posted to GHL_STUDIO_SESSION_WEBHOOK_URL.
 *
 * @param session - Stripe Checkout Session from checkout.session.completed
 * @returns payload for GHL inbound webhook, or null if email is missing
 */
export function buildStudioSessionGhlPayload(
  session: Stripe.Checkout.Session,
): StudioSessionGhlPayload | null {
  const email =
    session.customer_details?.email?.trim() ||
    session.customer_email?.trim() ||
    "";
  if (!email) return null;

  const { firstName, lastName } = splitCustomerName(
    session.customer_details?.name,
  );
  const phone = session.customer_details?.phone?.trim() || "";

  const payload: StudioSessionGhlPayload = {
    email,
    source: "studio-session",
  };

  if (firstName) payload.firstName = firstName;
  if (lastName) payload.lastName = lastName;
  if (phone) payload.phone = phone;
  if (session.id) payload.stripe_session_id = session.id;
  if (typeof session.amount_total === "number") {
    payload.amount_total = String(session.amount_total);
  }
  if (session.currency) payload.currency = session.currency;

  return payload;
}
