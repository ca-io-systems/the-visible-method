import { buildCalendarLinks } from "./add-to-calendar"
import { getStudioSessionEvent } from "./studio-session-event"
import { getWorkshopEvent } from "./workshop-event"

const FUNNEL_ENV_KEYS = [
  "WHATSAPP_GROUP_URL",
  "WHATSAPP_GROUP_VIP_URL",
  "CHECKOUT_URL",
] as const

/**
 * Replaces {{ENV_KEY}} placeholders in funnel HTML with server env values
 * and injects Add to Calendar links for workshop + studio session events.
 *
 * @param html - Raw content HTML
 * @returns HTML with configured placeholders substituted
 */
export function injectFunnelEnv(html: string): string {
  let out = html
  for (const key of FUNNEL_ENV_KEYS) {
    const value = process.env[key]
    if (value) {
      out = out.replaceAll(`{{${key}}}`, value)
    }
  }

  const zoomUrl = process.env.WORKSHOP_ZOOM_URL?.trim()
  const workshop = getWorkshopEvent()
  const studio = getStudioSessionEvent()

  const workshopLinks = buildCalendarLinks({
    title: workshop.title,
    description: workshop.description,
    location: workshop.location,
    start: workshop.start,
    end: workshop.end,
    url: zoomUrl,
  })

  const studioLinks = buildCalendarLinks({
    title: studio.title,
    description: studio.description,
    location: studio.location,
    start: studio.start,
    end: studio.end,
    url: zoomUrl,
  })

  out = out
    .replaceAll("{{CALENDAR_GOOGLE_URL}}", workshopLinks.google)
    .replaceAll("{{CALENDAR_OUTLOOK_URL}}", workshopLinks.outlook)
    .replaceAll("{{CALENDAR_ICS_URL}}", workshopLinks.icsPath)
    .replaceAll("{{CALENDAR_STUDIO_GOOGLE_URL}}", studioLinks.google)
    .replaceAll("{{CALENDAR_STUDIO_OUTLOOK_URL}}", studioLinks.outlook)
    .replaceAll("{{CALENDAR_STUDIO_ICS_URL}}", "/api/calendar?event=studio")
    .replaceAll("{{CALENDAR_BOTH_ICS_URL}}", "/api/calendar?event=both")

  return out
}
