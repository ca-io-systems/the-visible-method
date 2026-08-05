import { buildCalendarLinks } from "./add-to-calendar"
import { getWorkshopEvent } from "./workshop-event"

const FUNNEL_ENV_KEYS = ["WHATSAPP_GROUP_URL", "CHECKOUT_URL"] as const

/**
 * Replaces {{ENV_KEY}} placeholders in funnel HTML with server env values
 * and injects Add to Calendar links for the workshop event.
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

  const event = getWorkshopEvent()
  const links = buildCalendarLinks({
    title: event.title,
    description: event.description,
    location: event.location,
    start: event.start,
    end: event.end,
    url: process.env.WORKSHOP_ZOOM_URL?.trim(),
  })

  out = out
    .replaceAll("{{CALENDAR_GOOGLE_URL}}", links.google)
    .replaceAll("{{CALENDAR_OUTLOOK_URL}}", links.outlook)
    .replaceAll("{{CALENDAR_ICS_URL}}", links.icsPath)

  return out
}
