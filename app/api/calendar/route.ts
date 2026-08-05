import { NextResponse } from "next/server"
import { buildIcs } from "@/lib/add-to-calendar"
import { getWorkshopEvent } from "@/lib/workshop-event"

/**
 * GET /api/calendar
 * Downloads a .ics file for The Visible Method workshop (Apple / Outlook desktop).
 */
export async function GET() {
  const event = getWorkshopEvent()
  const ics = buildIcs({
    title: event.title,
    description: event.description,
    location: event.location,
    start: event.start,
    end: event.end,
    url: process.env.WORKSHOP_ZOOM_URL?.trim(),
  })

  return new NextResponse(ics, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${event.filename}"`,
      "Cache-Control": "public, max-age=300",
    },
  })
}
