# The Visible Method

Waitlist + workshop funnel for Jamie Gabrielle / Symia Cloud.

Live: [the-visible-method.vercel.app](https://the-visible-method.vercel.app)  
Repo: [ca-io-systems/the-visible-method](https://github.com/ca-io-systems/the-visible-method)

## Why this exists

We need a fast, ownable webinar front-end (GitHub → Vercel) instead of editing HTML inside GHL embeds. GHL / Ivory still owns CRM, tags, and reminder SMS/email. This repo owns the pages people see.

## Page map

| Route | Content file | Job |
| --- | --- | --- |
| `/` | redirects / hub | Entry |
| `/waitlist` | `content/waitlist.html` | Organic waitlist opt-in |
| `/waitlist/wine` | `content/waitlist-wine.html` | Alternate waitlist creative |
| `/waitlist/thank-you` | `content/waitlist-thank-you.html` | Waitlist confirmation |
| `/workshop` | `content/workshop.html` | Workshop registration |
| `/workshop/confirmation` | `content/workshop-confirmation.html` | Post-reg: group + **calendar** + email |
| `/studio-session` | `content/studio-session.html` | Studio / VIP-adjacent page |

Forms POST to `app/api/submit` → `GHL_WEBHOOK_URL`.

## Confirmation page: Add to Calendar

Step 2 on `/workshop/confirmation` is the no-show reducer. Same job products like [AddEvent](https://www.addevent.com/) sell for a monthly fee.

We do it ourselves:

- `lib/workshop-event.ts` — canonical event (Aug 11, 2026 · 12:00–1:30 PM PT)
- `lib/add-to-calendar.ts` — Google / Outlook.com URLs + `.ics` builder
- `GET /api/calendar` — downloads `the-visible-method-workshop.ics` (Apple Calendar / Outlook desktop)

On the page:

- **Apple / Outlook** → `/api/calendar`
- **Google** / **Outlook.com** → deep links (no vendor JS)

Optional: set `WORKSHOP_ZOOM_URL` so the calendar event location/description includes Zoom.

## Emails / SMS

Pre-webby HTML + SMS drafts live under `emails/webby/`. Push script: `scripts/push-pre-webby.ts`. Reminders stay in GHL; this repo does not replace AddEvent’s RSVP email product.

## Local

```bash
bun install
bun run dev
```

Copy `.env.example` → `.env.local` and fill:

- `GHL_WEBHOOK_URL`
- `WHATSAPP_GROUP_URL`
- `CHECKOUT_URL` (if used)
- `WORKSHOP_ZOOM_URL` (optional, for calendar)

## Deploy

Vercel project for this repo. Content HTML in `content/` is loaded by `lib/load-page.ts` and rendered through `components/HtmlPage.tsx`.
