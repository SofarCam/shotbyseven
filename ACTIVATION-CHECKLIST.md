# Activation Checklist — turn on everything that's built

Everything in PR #3 is built and dormant. This is the exact order to switch it on.
Work top to bottom. Each section says where to click and how to verify.

---

## 0. Merge PR #3
- GitHub → PR #3 → **Merge**. It's green and conflict-free.
- Vercel auto-deploys `main`. Wait for the deploy to finish before testing anything below.

---

## 1. Vercel env vars (one place, do them all at once)
vercel.com → **shotbyseven** project → Settings → Environment Variables.
Add any that aren't already there, then **redeploy** so the build picks them up.

| Variable | Value / where to get it | Powers |
|----------|-------------------------|--------|
| `VITE_GA4_ID` | `G-XXXXXXXXXX` — analytics.google.com → Admin → Data Streams → web stream → Measurement ID | Page + conversion analytics |
| `VITE_FB_PIXEL_ID` | Pixel ID — business.facebook.com → Events Manager → your Pixel | Retargeting + conversion events |
| `POSTIZ_API_KEY` | Postiz → Settings → Public API → generate key | Content Engine scheduling |
| `POSTIZ_API_URL` | *(optional)* only if self-hosting Postiz: `https://<host>/public/v1` | — |
| `ANTHROPIC_API_KEY` | The `sk-ant-api03…` key (openclaw config). **May already be set** — Content Engine is live | IG DM qualifier + Content Engine |
| `TELEGRAM_BOT_TOKEN` | The `8233…` bot token (openclaw config) | IG DM notifications |
| `TELEGRAM_CHAT_ID` | `2138115398` | IG DM notifications |
| `INSTAGRAM_VERIFY_TOKEN` | `shotbyseven_verify_2026` | IG DM webhook handshake |
| `INSTAGRAM_ACCESS_TOKEN` | Long-lived Page token (from the FB app, step 3) | IG DM send/receive |
| `INSTAGRAM_PAGE_ID` | Your IG Business Account ID | IG DM send/receive |

> `VITE_`-prefixed vars are baked in at build time — you MUST redeploy after adding them.

---

## 2. Analytics accounts (free, ~10 min)
- **GA4**: analytics.google.com → create a Web property for `shotbyseven.com` → copy the `G-…` ID into `VITE_GA4_ID`.
- **Meta Pixel**: business.facebook.com → Events Manager → Connect Data Sources → Web → name it "Shot by Seven" → copy the Pixel ID into `VITE_FB_PIXEL_ID`.
- Verify: after redeploy, open the site → GA4 Realtime shows you within seconds; install the "Meta Pixel Helper" Chrome extension to see the pixel fire.

---

## 3. Instagram DM qualifier (the auto lead-responder)
Follow `INSTAGRAM-SETUP.md` — the short version:
1. Env vars from the table above are set.
2. developers.facebook.com → create a Business app → add the **Instagram** product → connect the Shot by Seven IG Business account → generate a long-lived token → paste as `INSTAGRAM_ACCESS_TOKEN`.
3. In the FB app → Instagram → Webhooks → Callback URL `https://shotbyseven.com/api/instagram`, Verify Token `shotbyseven_verify_2026`, subscribe to **messages**.
4. Verify: DM @shotbyseven777 from another account → you should get a Telegram ping within seconds.

---

## 4. Content pipeline (Postiz)
Follow `CONTENT-PIPELINE-SETUP.md` — short version:
1. In Postiz → connect your social channels (Instagram, TikTok, etc.).
2. Postiz → Settings → Public API → generate key → paste as `POSTIZ_API_KEY` in Vercel → redeploy.
3. Verify: go to `shotbyseven.com/content` (password gate) → **04 Schedule** → **Load channels** → your channels appear. Schedule one test post to confirm it lands in Postiz.
   - **First live post**: confirm the image actually attaches (see the note in CONTENT-PIPELINE-SETUP.md).

---

## 5. Stripe — resolved: deposits now go to the real account

Correction to an earlier finding in this checklist: the Stripe account connected to Claude's tools ("New business", `acct_1U5wLvPsMx8xz3Ni`) was never the live business account — it was empty because it's the wrong one. The real account is **shotbyseven** (`acct_1T44Z3FPsZacyI0u`), which already had active Payment Links:

| Link | Price | Used for |
|---|---|---|
| SofarSeven — Session Deposit | $50 | Sessions under $300 |
| ShotBySeven Booking deposit | $100 | Sessions $300+ |
| SofarSeven Studio — Hourly Rental | $60 | Not wired into the site — studio rental is billed directly through NoDa Art House's own booking page instead |

**Bug found and fixed**: `SmartBooking.jsx` and `ClientPortal.jsx` computed whether a client owed a $50 or $100 deposit, but both only had a single `VITE_STRIPE_DEPOSIT_URL` env var to send them to — so whichever one link was configured, half of bookings were being sent to pay the wrong amount. Replaced with `src/utils/stripe.js`, which picks the correct real Payment Link based on the computed deposit amount. The `VITE_STRIPE_DEPOSIT_URL` env var is no longer used — nothing to set for deposits anymore.

**Still open**: the Gift Cards page (`/gift`) needs its own Payment Link — none of the three above allow a custom amount. Create one in Stripe (Payment Links → New → customer chooses the price, $50 minimum) → set `VITE_STRIPE_GIFT_CARD_URL` in Vercel → redeploy.

The Claude Stripe connector is now repointed at the real `shotbyseven` account (`acct_1T44Z3FPsZacyI0u`) — confirmed by listing its webhook endpoints directly.

**Second bug found and fixed**: `ClientPortal.jsx`'s repeat-payment button (`Pay $X →`, shown to a client who logs back into their portal to pay a deposit) called `getDepositUrl(depositAmount)` with no `client_reference_id` — so the resulting Stripe Checkout Session couldn't be matched back to a booking at all, unlike the initial `SmartBooking.jsx` flow which already appended it correctly. Fixed to match: `client_reference_id` and `prefilled_email` now flow through both paths, using `booking.bookingId` / `booking.email`.

**Webhook re-created on the correct account**: the previous `api/stripe-webhook.js` endpoint (`we_1UCtcJPsMx8xz3NiNoBrNodJ`) was registered on the wrong Stripe account (`acct_1U5wLvPsMx8xz3Ni`) and could never have fired on a real payment. A new endpoint (`we_1UDzuHFPsZacyI0uOfPmFFmw`) now exists on `acct_1T44Z3FPsZacyI0u`, listening for `checkout.session.completed`, pointed at `https://shotbyseven.com/api/stripe-webhook`.

**Action needed**: update `STRIPE_WEBHOOK_SECRET` in Vercel to the new endpoint's signing secret (the old value is for the dead endpoint and will fail signature verification). Get it from Stripe Dashboard → Developers → Webhooks → this endpoint, or ask Claude — it was generated in this session and is not saved anywhere else.

Once that env var is updated and redeployed, I can pull actual revenue, reconcile deposits against bookings (`client_reference_id` = the site's `bookingId`), and track progress vs. the $5k target.

---

## When you're back
Tell me which of the above you've done and I'll verify each one live (webhook handshake, analytics firing, a real scheduled post, Stripe revenue) — I can confirm the whole machine end-to-end in one pass.
