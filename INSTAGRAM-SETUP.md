# Instagram DM Lead Qualifier — Setup Guide

The webhook is built and deployed. You need to do 3 things:

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

---

## Step 2 — Create a Facebook Developer App

1. Go to **developers.facebook.com** → My Apps → Create App
2. Choose **"Business"** type
3. Name it `Shot by Seven`
4. Once created, add the **Instagram** product (from the left sidebar "Add Product")
5. Under Instagram → **Settings**, connect your Shot by Seven Instagram Business account
6. Go to **Instagram → Generate Token** — copy the long-lived token
7. Paste it as `INSTAGRAM_ACCESS_TOKEN` in Vercel (from Step 1)

---

## Step 3 — Register the Webhook

1. In your Facebook App → Instagram → **Webhooks**
2. Click **Subscribe to this object**
3. Set:
   - **Callback URL**: `https://shotbyseven.com/api/instagram`
   - **Verify Token**: `shotbyseven_verify_2026`
4. Click **Verify and Save**
5. Subscribe to the **`messages`** field

---

## That's It

Once all 3 steps are done:
- Every Instagram DM → Seven qualifies the lead automatically
- You get a Telegram notification for every message + every reply Seven sends
- Seven asks about shoot type, date, location, and budget
- Once qualified, it tells them Cam will follow up personally

## Testing

Send a DM to @shotbyseven777 from another account. You should get a Telegram ping within seconds.
