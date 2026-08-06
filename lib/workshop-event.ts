/**
 * Canonical workshop event for The Visible Method.
 * Keep in sync with confirmation page copy (August 13 · 1 PM PT / 4 PM ET).
 */

export type WorkshopEvent = {
  title: string
  description: string
  location: string
  /** UTC instant */
  start: Date
  /** UTC instant */
  end: Date
  timezone: string
  filename: string
}

/**
 * Returns the workshop calendar event used by Add to Calendar links + ICS.
 *
 * @returns WorkshopEvent with UTC start/end derived from 1:00–3:00 PM America/Los_Angeles on Aug 13, 2026
 */
export function getWorkshopEvent(): WorkshopEvent {
  const zoomUrl = process.env.WORKSHOP_ZOOM_URL?.trim()
  const location = zoomUrl || "Zoom — link in your confirmation email"
  const descriptionParts = [
    "The Visible Method live workshop with Jamie Gabrielle.",
    "Join from your confirmation email (and the private group if you are in it).",
  ]
  if (zoomUrl) descriptionParts.push(`Zoom: ${zoomUrl}`)

  // Aug 13, 2026 1:00–3:00 PM PT (PDT, UTC-7) = 4:00–6:00 PM ET
  return {
    title: "The Visible Method · Live Workshop",
    description: descriptionParts.join("\n\n"),
    location,
    start: new Date("2026-08-13T20:00:00.000Z"),
    end: new Date("2026-08-13T22:00:00.000Z"),
    timezone: "America/Los_Angeles",
    filename: "the-visible-method-workshop.ics",
  }
}
