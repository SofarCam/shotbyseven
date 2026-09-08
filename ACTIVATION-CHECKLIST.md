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
| `INSTAGRAM_ACCESS_TOKEN` | Long-lived Page token (from the FB app, step 3) | IG DM send/receive + comment-to-DM |
| `INSTAGRAM_PAGE_ID` | Your IG Business Account ID | IG DM send/receive + skips replying to our own comments |
| `INSTAGRAM_COMMENT_KEYWORDS` | *(optional)* comma-separated, default `PRICE,INFO,LINK,BOOK` | Comment-to-DM trigger words |

> `VITE_`-prefixed vars are baked in at build time — you MUST redeploy after adding them.

---

## 2. Analytics accounts (free, ~10 min)
- **GA4**: analytics.google.com → create a Web property for `shotbyseven.com` → copy the `G-…` ID into `VITE_GA4_ID`.
- **Meta Pixel**: business.facebook.com → Events Manager → Connect Data Sources → Web → name it "Shot by Seven" → copy the Pixel ID into `VITE_FB_PIXEL_ID`.
- Verify: after redeploy, open the site → GA4 Realtime shows you within seconds; install the "Meta Pixel Helper" Chrome extension to see the pixel fire.

---

## 3. Instagram DM qualifier + comment-to-DM (the auto lead-responder)
Follow `INSTAGRAM-SETUP.md` — the short version:
1. Env vars from the table above are set (including `INSTAGRAM_PAGE_ID`).
2. developers.facebook.com → create a Business app → add the **Instagram** product → connect the Shot by Seven IG Business account → generate a long-lived token → paste as `INSTAGRAM_ACCESS_TOKEN`.
3. In the FB app → Instagram → Webhooks → Callback URL `https://shotbyseven.com/api/instagram`, Verify Token `shotbyseven_verify_2026`, subscribe to **both `messages` and `comments`**.
4. Verify DMs: DM @shotbyseven777 from another account → you should get a Telegram ping within seconds.
5. Verify comment-to-DM: comment "PRICE" on one of your own posts from another account → Telegram ping, then a private DM reply (one per comment, within 7 days per Meta's rules).

See `INSTAGRAM-AI-AUTOMATION-GUIDE.md` for the full picture (why this is safe under
the official Graph API, the 24-hour messaging window, and rate limits to respect).

---

## 4. Content pipeline (Postiz)
Follow `CONTENT-PIPELINE-SETUP.md` — short version:
1. In Postiz → connect your social channels (Instagram, TikTok, etc.).
2. Postiz → Settings → Public API → generate key → paste as `POSTIZ_API_KEY` in Vercel → redeploy.
3. Verify: go to `shotbyseven.com/content` (password gate) → **04 Schedule** → **Load channels** → your channels appear. Schedule one test post to confirm it lands in Postiz.
   - **First live post**: confirm the image actually attaches (see the note in CONTENT-PIPELINE-SETUP.md).

---

## 5. Stripe — the real revenue gap (needs a decision)
Finding from this session: the connected Stripe account ("New business", live mode) has **$0, no charges, no payment links, no products.** Deposits are NOT flowing through it. Decide:
- **Is this the right account?** If deposits should go elsewhere, point `VITE_STRIPE_DEPOSIT_URL` at that account's payment link.
- **If this IS the account**: create a **Payment Link** in Stripe for the deposit (e.g. a $50/$100 deposit product), then set `VITE_STRIPE_DEPOSIT_URL` in Vercel to that link. Until this exists, the booking form's "pay deposit" step has nothing real behind it and no income is tracked.
- Once live: I can reconnect to Stripe and pull real revenue, reconcile deposits against bookings (the `client_reference_id` on each payment is the site's `bookingId`), and track progress vs. the $5k target.

---

## When you're back
Tell me which of the above you've done and I'll verify each one live (webhook handshake, analytics firing, a real scheduled post, Stripe revenue) — I can confirm the whole machine end-to-end in one pass.
