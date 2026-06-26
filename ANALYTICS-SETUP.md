# Analytics & Tracking — Setup Guide

The site now has GA4 + Facebook Pixel wiring and booking-funnel conversion
events built in. They're **dormant until you add two env vars** in Vercel —
the code no-ops safely when they're unset, so nothing breaks in the meantime.

---

## Step 1 — Add Env Vars to Vercel

Go to: vercel.com → **shotbyseven** project → Settings → Environment Variables

| Name | Value | Where to get it |
|------|-------|-----------------|
| `VITE_GA4_ID` | `G-XXXXXXXXXX` | analytics.google.com → Admin → Data Streams → your web stream → Measurement ID |
| `VITE_FB_PIXEL_ID` | `1234567890` | business.facebook.com → Events Manager → your Pixel → Pixel ID |

> `VITE_` prefix is required — Vite only exposes env vars to the browser
> bundle when they start with `VITE_`. After adding them, **redeploy** so
> the new build picks them up.

---

## Step 2 — Create the accounts (if you don't have them)

**GA4 (free):**
1. analytics.google.com → Start measuring
2. Create a property → choose "Web" platform → enter `shotbyseven.com`
3. Copy the Measurement ID (`G-…`) into `VITE_GA4_ID`

**Facebook Pixel (free):**
1. business.facebook.com → Events Manager → Connect Data Sources → Web
2. Name it "Shot by Seven" → copy the Pixel ID into `VITE_FB_PIXEL_ID`
3. (The Pixel powers retargeting ads — show ads to people who visited but
   didn't book.)

---

## What's already tracked (once the IDs are live)

| Event | Fires when | GA4 name | FB Pixel name |
|-------|-----------|----------|---------------|
| Page view | Any route change | `page_view` | `PageView` |
| Pricing → booking | "Book This Session" in the calculator | `pricing_book_now` | (custom) |
| Booking step 1 done | Moving past session/location step | `booking_step_1_complete` | (custom) |
| **Booking submitted** | A booking form is completed | `booking_submitted` | `Schedule` |
| **Lead captured** | Contact form submitted | `generate_lead` | `Lead` |

The two bold events are your real conversions. Once data flows, you can:
- See exactly where people drop off in the booking funnel (GA4 → Reports → Engagement)
- Build a retargeting audience of visitors who didn't book (FB Ads Manager)
- Measure cost-per-booking if you run ads

---

## Verifying it works

After redeploying with the env vars set:
1. Open shotbyseven.com in a browser
2. GA4: analytics.google.com → Reports → Realtime — you should appear within seconds
3. FB Pixel: install the "Meta Pixel Helper" Chrome extension — it shows a green badge when the pixel fires
