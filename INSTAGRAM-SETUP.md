# Instagram DM Lead Qualifier + Comment-to-DM — Setup Guide

The webhook is built and deployed (`api/instagram.js`) and now handles two things:
- **DMs** — Seven qualifies every inbound Instagram DM.
- **Comment-to-DM** — someone comments a keyword (`price`, `info`, `link`, or `book` by
  default) on a post/reel and gets an instant private DM.

You need to do 3 things:

---

## Step 1 — Add Env Vars to Vercel

Go to: vercel.com → shotbyseven project → Settings → Environment Variables

Add these:

| Name | Value |
|------|-------|
| `ANTHROPIC_API_KEY` | (from openclaw.json — the sk-ant-api03 key) |
| `TELEGRAM_BOT_TOKEN` | (from openclaw.json — the 8233... key) |
| `TELEGRAM_CHAT_ID` | `2138115398` |
| `INSTAGRAM_VERIFY_TOKEN` | `shotbyseven_verify_2026` |
| `INSTAGRAM_ACCESS_TOKEN` | (get this in Step 2 below) |
| `INSTAGRAM_PAGE_ID` | Your IG Business Account ID (Step 2) — prevents the bot from replying to its own comments |
| `INSTAGRAM_COMMENT_KEYWORDS` | *(optional)* comma-separated list, defaults to `PRICE,INFO,LINK,BOOK` |

---

## Step 2 — Create a Facebook Developer App

1. Go to **developers.facebook.com** → My Apps → Create App
2. Choose **"Business"** type
3. Name it `Shot by Seven`
4. Once created, add the **Instagram** product (from the left sidebar "Add Product")
5. Under Instagram → **Settings**, connect your Shot by Seven Instagram Business account
6. Go to **Instagram → Generate Token** — copy the long-lived token and the account's numeric ID
7. Paste the token as `INSTAGRAM_ACCESS_TOKEN` and the ID as `INSTAGRAM_PAGE_ID` in Vercel (Step 1)
8. Make sure the token/app has the `instagram_business_manage_messages` and
   `instagram_business_manage_comments` permissions — comment-to-DM needs both.

---

## Step 3 — Register the Webhook

1. In your Facebook App → Instagram → **Webhooks**
2. Click **Subscribe to this object**
3. Set:
   - **Callback URL**: `https://shotbyseven.com/api/instagram`
   - **Verify Token**: `shotbyseven_verify_2026`
4. Click **Verify and Save**
5. Subscribe to **both** the **`messages`** field (DMs) and the **`comments`** field
   (comment-to-DM)

---

## That's It

Once all 3 steps are done:
- Every Instagram DM → Seven qualifies the lead automatically
- Every comment containing a trigger keyword → Seven sends a private reply within seconds
- You get a Telegram notification for every DM/comment event + every reply Seven sends
- Seven asks about shoot type, date, location, and budget in DMs; comments get pricing + one next step
- Once qualified, it tells them Cam will follow up personally

## Testing

- **DMs**: send a DM to @shotbyseven777 from another account. You should get a Telegram ping within seconds.
- **Comment-to-DM**: comment "PRICE" on one of your own posts from another account. You
  should get a Telegram ping, then a private DM reply. Note Meta's private-reply rules:
  one private reply per comment, and only within 7 days of the comment being posted.
