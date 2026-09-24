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
| `ANTHROPIC_API_KEY` | console.anthropic.com → API Keys — **set** | IG DM qualifier + Content Engine |
| `TELEGRAM_BOT_TOKEN` | The `8233…` bot token (openclaw config) | IG DM notifications |
| `TELEGRAM_CHAT_ID` | `2138115398` | IG DM notifications |
| `INSTAGRAM_VERIFY_TOKEN` | `shotbyseven_verify_2026` | IG DM webhook handshake |
| `INSTAGRAM_ACCESS_TOKEN` | Long-lived Page token (from the FB app, step 3) | IG DM send/receive |
| `INSTAGRAM_PAGE_ID` | Your IG Business Account ID | IG DM send/receive |
| `INSTAGRAM_DM_TRIGGER_KEYWORDS` | *(optional)* comma-separated, e.g. `PRICE,LINK`. Defaults to `PRICE,LINK` | Comment-to-DM keyword trigger |
| `VITE_STRIPE_GIFT_CARD_URL` | `https://buy.stripe.com/bJe3cv3JC0Jd9wnfT98og04` — **set** | Gift Cards page (`/gift`) checkout |
| `RESEND_API_KEY` | resend.com → API Keys. **Not** `VITE_`-prefixed — server-only | Blog newsletter subscriber notification email |
| `VITE_MANAGE_PASSWORD_HASH` | SHA-256 hash of your `/manage` + `/content` password — **set**. Access fails closed if this is missing | Admin tool access |
| `STRIPE_WEBHOOK_SECRET` | Stripe → Developers → Webhooks → the `shotbyseven.com/api/stripe-webhook` endpoint → Signing secret — **set** | Deposit confirmations |
| `VITE_STRIPE_CREATOR_MINI_URL` etc. | Payment Links for the creator offers — see `/creators` section below | `/creators` checkout buttons |
| `VITE_STRIPE_POSING_GUIDE_URL` | Payment Link URL for The Model Posing Guide ($19) — see "Shop" below | `/shop` buy button (shows "Notify me" until set) |
| `STRIPE_SECRET_KEY` | **Restricted** key: Stripe → Developers → API keys → Create restricted key → **Checkout Sessions: Read**, everything else None. Server-only | `/api/download` purchase check |
| `POSING_GUIDE_PAYMENT_LINK_ID` | The guide Payment Link's `plink_…` ID (Claude can look it up) | `/api/download` — which link = which product |
| `POSING_GUIDE_FILE_URL` | Where the finished PDF is hosted. **Not** in `public/` (the repo is public) | `/api/download` file delivery |

> `VITE_`-prefixed vars are baked in at build time — you MUST redeploy after adding them.

### Shop (`/shop`): turning on a paid guide
1. Finish the PDF (add the photos), host it outside the repo, and set `POSING_GUIDE_FILE_URL`.
2. Stripe → Payment Links → New → product "The Model Posing Guide", $19 one-time → **After payment** → *Don't show confirmation page* → redirect to
   `https://shotbyseven.com/shop/thanks?session_id={CHECKOUT_SESSION_ID}` (type it exactly, including the braces).
3. Set `VITE_STRIPE_POSING_GUIDE_URL`, `POSING_GUIDE_PAYMENT_LINK_ID`, and `STRIPE_SECRET_KEY`, then redeploy.
4. Buyers land on `/shop/thanks`, the server confirms the payment with Stripe, and the download button appears.

**Free guide**: drop the finished PDF at `public/downloads/10-poses-that-work-on-everyone.pdf` and set `available: true` in `src/shopConfig.js`. Until then the form collects a waitlist (CRM type `FREE_GUIDE`); email those people when it goes live.

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

**Resolved**: the Gift Cards page (`/gift`) already has its own "customer picks the amount, $50 minimum" Payment Link in Stripe — `https://buy.stripe.com/bJe3cv3JC0Jd9wnfT98og04` (product: "Shot by Seven Gift Card"). It just needs `VITE_STRIPE_GIFT_CARD_URL` set to that URL in Vercel, then redeploy.

**Cleanup flag**: there's also a second, unused gift-card product in Stripe — a fixed $70 "gift card" (no custom amount) with its own Payment Link (`https://buy.stripe.com/14AeVd7ZSajNdMDayP8og03`). It doesn't match `/gift`'s "pick your own amount" flow and nothing in the codebase references it — looks like a leftover from an earlier attempt. Worth deactivating in the Stripe dashboard (Payment Links → that link → Deactivate) once you confirm nothing external points to it.

The Claude Stripe connector is now repointed at the real `shotbyseven` account (`acct_1T44Z3FPsZacyI0u`) — confirmed by listing its webhook endpoints directly.

**Second bug found and fixed**: `ClientPortal.jsx`'s repeat-payment button (`Pay $X →`, shown to a client who logs back into their portal to pay a deposit) called `getDepositUrl(depositAmount)` with no `client_reference_id` — so the resulting Stripe Checkout Session couldn't be matched back to a booking at all, unlike the initial `SmartBooking.jsx` flow which already appended it correctly. Fixed to match: `client_reference_id` and `prefilled_email` now flow through both paths, using `booking.bookingId` / `booking.email`.

**Webhook re-created on the correct account**: the previous `api/stripe-webhook.js` endpoint (`we_1UCtcJPsMx8xz3NiNoBrNodJ`) was registered on the wrong Stripe account (`acct_1U5wLvPsMx8xz3Ni`) and could never have fired on a real payment. A new endpoint (`we_1UDzuHFPsZacyI0uOfPmFFmw`) now exists on `acct_1T44Z3FPsZacyI0u`, listening for `checkout.session.completed`, pointed at `https://shotbyseven.com/api/stripe-webhook`.

**Action needed**: update `STRIPE_WEBHOOK_SECRET` in Vercel to the new endpoint's signing secret (the old value is for the dead endpoint and will fail signature verification). Get it from Stripe Dashboard → Developers → Webhooks → this endpoint, or ask Claude — it was generated in this session and is not saved anywhere else.

Once that env var is updated and redeployed, I can pull actual revenue, reconcile deposits against bookings (`client_reference_id` = the site's `bookingId`), and track progress vs. the $5k target.

---

## When you're back
Tell me which of the above you've done and I'll verify each one live (webhook handshake, analytics firing, a real scheduled post, Stripe revenue) — I can confirm the whole machine end-to-end in one pass.
