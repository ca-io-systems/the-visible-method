# The Visible Method — Studio Session (VIP) Email & SMS

Post-purchase confirmation + reminders after the $47 Studio Session / VIP Q&A checkout.
Dedicated to the VIP session only (masterclass confirmation stays in the masterclass sequence).

**GHL filter:** tag `studio-session` (apply on Whop purchase).

## Dates (keep in sync with site + GHL custom values)

- **VIP / Studio Session:** Monday, August 17 · 1 PM PT / 4 PM ET

## Cadence

| When | Email | SMS |
| --- | --- | --- |
| Immediate (purchase) | Confirmation | Confirmation |
| Sun Aug 16 · ~12pm | Tomorrow | Tomorrow |
| Mon Aug 17 · 2hr before | 2 hours | 2hr |
| Mon Aug 17 · 30min | — | 30min |
| Mon Aug 17 · 10min | — | 10min |
| Mon Aug 17 · live+6 | — | live+6 |
| Mon Aug 17 · live+20 | Live + 20 (not yet joined) | — |

## GHL merge tags

| Custom value | Example |
| --- | --- |
| `{{custom_values.webby__vip_qa_event_day}}` | Monday |
| `{{custom_values.webby__vip_qa_date__time}}` | August 17th, 1 PM PT / 4 PM ET |
| `{{custom_values.webby__vip_qa_date_for_opt_in_message}}` | August 17th |
| `{{custom_values.webby__vip_qa_zoom_link}}` | Zoom URL |
| `{{custom_values.webby__whatsapp_group_link}}` | VIP WhatsApp invite |

---

## Immediate · Studio Session / VIP buyers

### Email — Confirmation

**Subject:** Your Studio Session seat is booked.

**Preview:** {{custom_values.webby__vip_qa_date__time}}. Zoom and the VIP group are inside.

You're in.

{{custom_values.webby__vip_qa_event_day}}

{{custom_values.webby__vip_qa_date__time}}

Live on Zoom · twenty-five seats

[Your Zoom →]({{custom_values.webby__vip_qa_zoom_link}})

Save this email. Your link lives here.

**First thing**

Come sit in the VIP group. Prep, timing changes, and the join link if email lets you down all go here first.

[Join the VIP WhatsApp group]({{custom_values.webby__whatsapp_group_link}})

**Second thing**

Bring one thing you've been avoiding posting. That's the material we work with in the small room.

Your receipt is already in your inbox. See you on {{custom_values.webby__vip_qa_date_for_opt_in_message}}.

Jamie

---

### SMS — Immediate · US & CA

Hey it's Jamie. Your Studio Session seat is booked — {{custom_values.webby__vip_qa_date_for_opt_in_message}}. Zoom + VIP group are in your email. {{custom_values.webby__whatsapp_group_link}} Reply STOP to stop.

---

## Sunday, Aug 16

**Tomorrow**

### Email — Sun ~12pm · studio-session

**Subject:** tomorrow. bring the thing you've been avoiding.

**Preview:** Tomorrow — {{custom_values.webby__vip_qa_date__time}}. Small room. Twenty-five seats.

Tomorrow. {{custom_values.webby__vip_qa_date__time}}.

[Your Zoom Link →]({{custom_values.webby__vip_qa_zoom_link}})

Bring one thing you've been avoiding posting. That's what we work with in the small room.

Come five minutes early.

This room is live. Twenty-five seats. Your Zoom is above — and in the VIP WhatsApp if you need it again.

See you tomorrow.

Jamie

---

### SMS — Sun ~12.05pm · US & CA

Tomorrow {{custom_values.webby__vip_qa_date_for_opt_in_message}}. Studio Session. Bring the post you've been avoiding. Link's in your email.

---

## Monday, Aug 17

**Event day**

### Email — 2hr before · studio-session

**Subject:** 2 hours

**Preview:** Two hours. Come in five minutes early.

Two hours.

[Join Here →]({{custom_values.webby__vip_qa_zoom_link}})

Come in five minutes early. Sort your audio before we start.

Have that post ready — the one you've been sitting on.

Jamie

---

### SMS — 2hr · 30min · 10min · live+6 · US & CA

2hr → 2 hours. Your Studio Session link: {{custom_values.webby__vip_qa_zoom_link}} Come in 5 min early.

30min → 30 minutes. Have that post ready. {{custom_values.webby__vip_qa_zoom_link}}

10min → 10 minutes, I'm in the room. Come in early and say hi: {{custom_values.webby__vip_qa_zoom_link}}

live+6 → We're live in the Studio Session. Come in: {{custom_values.webby__vip_qa_zoom_link}}

---

### Email — Live + 20 min · Not yet joined

**Subject:** she's already in the room

**Preview:** She's twenty minutes in. The small room is open.

It's the team. We borrowed Jamie's email.

She's twenty minutes in. The Studio Session is already moving.

Come in.

[Come In →]({{custom_values.webby__vip_qa_zoom_link}})
