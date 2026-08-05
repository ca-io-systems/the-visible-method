/**
 * Canonical workshop event for The Visible Method.
 * Keep in sync with confirmation page copy (August 11 · 12 PM PT / 3 PM ET).
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
 * @returns WorkshopEvent with UTC start/end derived from 12:00–1:30 PM America/Los_Angeles on Aug 11, 2026
 */
export function getWorkshopEvent(): WorkshopEvent {
  const zoomUrl = process.env.WORKSHOP_ZOOM_URL?.trim()
  const location = zoomUrl || "Zoom — link in your confirmation email"
  const descriptionParts = [
    "The Visible Method live workshop with Jamie Gabrielle.",
    "Join from your confirmation email (and the private group if you are in it).",
  ]
  if (zoomUrl) descriptionParts.push(`Zoom: ${zoomUrl}`)

  // Aug 11, 2026 12:00–1:30 PM PT (PDT, UTC-7)
  return {
    title: "The Visible Method · Live Workshop",
    description: descriptionParts.join("\n\n"),
    location,
    start: new Date("2026-08-11T19:00:00.000Z"),
    end: new Date("2026-08-11T20:30:00.000Z"),
    timezone: "America/Los_Angeles",
    filename: "the-visible-method-workshop.ics",
  }
}
