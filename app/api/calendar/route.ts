import { NextResponse } from "next/server"
import { buildIcs, buildMultiEventIcs, type CalendarEventInput } from "@/lib/add-to-calendar"
import { getStudioSessionEvent } from "@/lib/studio-session-event"
import { getWorkshopEvent } from "@/lib/workshop-event"

type CalendarKind = "workshop" | "studio" | "both"

function toCalendarInput(
  event: ReturnType<typeof getWorkshopEvent>,
  uid: string,
): CalendarEventInput {
  return {
    title: event.title,
    description: event.description,
    location: event.location,
    start: event.start,
    end: event.end,
    url: process.env.WORKSHOP_ZOOM_URL?.trim(),
    uid,
  }
}

/**
 * GET /api/calendar?event=workshop|studio|both
 * Downloads a .ics file (Apple / Outlook desktop).
 * Default: workshop (backward compatible).
 */
export async function GET(request: Request) {
  const kind = (new URL(request.url).searchParams.get("event") ||
    "workshop") as CalendarKind

  const workshop = getWorkshopEvent()
  const studio = getStudioSessionEvent()
  const zoomUrl = process.env.WORKSHOP_ZOOM_URL?.trim()

  if (kind === "studio") {
    const ics = buildIcs(
      toCalendarInput(studio, "visible-method-studio-session@the-visible-method"),
    )
    return new NextResponse(ics, {
      status: 200,
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="${studio.filename}"`,
        "Cache-Control": "public, max-age=300",
      },
    })
  }

  if (kind === "both") {
    const ics = buildMultiEventIcs([
      toCalendarInput(workshop, "visible-method-workshop@the-visible-method"),
      toCalendarInput(studio, "visible-method-studio-session@the-visible-method"),
    ])
    return new NextResponse(ics, {
      status: 200,
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition":
          'attachment; filename="the-visible-method-both-sessions.ics"',
        "Cache-Control": "public, max-age=300",
      },
    })
  }

  const ics = buildIcs({
    title: workshop.title,
    description: workshop.description,
    location: workshop.location,
    start: workshop.start,
    end: workshop.end,
    url: zoomUrl,
    uid: "visible-method-workshop@the-visible-method",
  })

  return new NextResponse(ics, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${workshop.filename}"`,
      "Cache-Control": "public, max-age=300",
    },
  })
}
