/**
 * DIY Add to Calendar helpers (no AddEvent).
 *
 * Args / returns for the public builders:
 * - buildCalendarLinks(event) → { google, outlook, icsPath }
 * - buildIcs(event) → VCALENDAR string
 */

export type CalendarEventInput = {
  title: string
  description?: string
  location?: string
  start: Date
  end: Date
  url?: string
  uid?: string
}

export type CalendarLinks = {
  google: string
  outlook: string
  icsPath: string
}

function pad(n: number): string {
  return String(n).padStart(2, "0")
}

/**
 * Formats a Date as YYYYMMDDTHHMMSSZ (UTC) for Google Calendar URLs / ICS.
 *
 * @param date - Instant to format
 * @returns UTC compact timestamp with Z suffix
 */
export function toUtcCompact(date: Date): string {
  return (
    `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}` +
    `T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`
  )
}

/**
 * Formats a Date as YYYY-MM-DDTHH:MM:SSZ for Outlook deep links.
 *
 * @param date - Instant to format
 * @returns ISO-like UTC string without milliseconds
 */
export function toUtcOutlook(date: Date): string {
  return toUtcCompact(date).replace(
    /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/,
    "$1-$2-$3T$4:$5:$6Z",
  )
}

function icsEscape(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;")
}

function foldIcsLine(line: string): string {
  if (line.length <= 75) return line
  const parts: string[] = []
  parts.push(line.slice(0, 75))
  let rest = line.slice(75)
  while (rest.length > 0) {
    parts.push(` ${rest.slice(0, 74)}`)
    rest = rest.slice(74)
  }
  return parts.join("\r\n")
}

/**
 * Builds Google + Outlook.com deep links and the local ICS path.
 *
 * @param event - Calendar event fields
 * @returns CalendarLinks for confirm-page / email use
 */
export function buildCalendarLinks(event: CalendarEventInput): CalendarLinks {
  const dates = `${toUtcCompact(event.start)}/${toUtcCompact(event.end)}`
  const google = new URL("https://calendar.google.com/calendar/render")
  google.searchParams.set("action", "TEMPLATE")
  google.searchParams.set("text", event.title)
  google.searchParams.set("dates", dates)
  if (event.description) google.searchParams.set("details", event.description)
  if (event.location) google.searchParams.set("location", event.location)

  const outlook = new URL(
    "https://outlook.live.com/calendar/0/action/compose",
  )
  outlook.searchParams.set("rru", "addevent")
  outlook.searchParams.set("subject", event.title)
  outlook.searchParams.set("startdt", toUtcOutlook(event.start))
  outlook.searchParams.set("enddt", toUtcOutlook(event.end))
  if (event.description) outlook.searchParams.set("body", event.description)
  if (event.location) outlook.searchParams.set("location", event.location)

  return {
    google: google.toString(),
    outlook: outlook.toString(),
    icsPath: "/api/calendar",
  }
}

/**
 * Builds a valid iCalendar (.ics) document for Apple Calendar / Outlook desktop.
 *
 * @param event - Calendar event fields
 * @returns ICS file body (CRLF line endings)
 */
export function buildIcs(event: CalendarEventInput): string {
  const uid =
    event.uid ||
    `visible-method-workshop-${toUtcCompact(event.start)}@the-visible-method`
  const now = toUtcCompact(new Date())
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//The Visible Method//Workshop//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${toUtcCompact(event.start)}`,
    `DTEND:${toUtcCompact(event.end)}`,
    `SUMMARY:${icsEscape(event.title)}`,
  ]
  if (event.description) {
    lines.push(`DESCRIPTION:${icsEscape(event.description)}`)
  }
  if (event.location) {
    lines.push(`LOCATION:${icsEscape(event.location)}`)
  }
  if (event.url) {
    lines.push(`URL:${icsEscape(event.url)}`)
  }
  lines.push("END:VEVENT", "END:VCALENDAR")
  return lines.map(foldIcsLine).join("\r\n") + "\r\n"
}
