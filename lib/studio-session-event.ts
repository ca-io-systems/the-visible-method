/**
 * Canonical Studio Session ($47) event for The Visible Method.
 * Keep in sync with studio-session thank-you copy (August 17 · 1–3:00 PM PT).
 */

import type { WorkshopEvent } from "./workshop-event"

/**
 * Returns the Studio Session calendar event used by Add to Calendar links + ICS.
 *
 * @returns WorkshopEvent with UTC start/end derived from 1:00–3:00 PM America/Los_Angeles on Aug 17, 2026
 */
export function getStudioSessionEvent(): WorkshopEvent {
  const zoomUrl = process.env.WORKSHOP_ZOOM_URL?.trim()
  const location = zoomUrl || "Zoom — link in your confirmation email"
  const descriptionParts = [
    "The Studio Session with Jamie Gabrielle — the smaller paid room after the masterclass.",
    "Join from your confirmation email (and the private group if you are in it).",
  ]
  if (zoomUrl) descriptionParts.push(`Zoom: ${zoomUrl}`)

  // Aug 17, 2026 1:00–3:00 PM PT (PDT, UTC-7) = 4:00–6:00 PM ET
  return {
    title: "The Visible Method · The Studio Session",
    description: descriptionParts.join("\n\n"),
    location,
    start: new Date("2026-08-17T20:00:00.000Z"),
    end: new Date("2026-08-17T22:00:00.000Z"),
    timezone: "America/Los_Angeles",
    filename: "the-visible-method-studio-session.ics",
  }
}
