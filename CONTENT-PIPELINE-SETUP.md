# Content Pipeline — Setup Guide

The Content Engine at `/content` (password-gated) is now a full pipeline:

```
  vidIQ (research)  →   Content Engine (generate)   →   Postiz (schedule/publish)
  trending hooks        voice-matched captions,          auto-posts to IG / TikTok /
  & keywords            carousels, reels, email          28+ channels on a schedule
```

## Step 1 — Research trends (vidIQ)

vidIQ is a Claude connector, so trend research happens in **Claude or the vidIQ app**, not the website itself. Ask Claude (or vidIQ directly) things like:
- "What hooks are trending for photographers on Instagram/TikTok right now?"
- "Keyword research for 'Charlotte photographer' and 'fall mini sessions'"
- "Find outlier reels in the photography niche this month"

Copy the best angles/keywords. In the Content Engine's **02 Generate** tab, paste them into the new **"Trending hooks / keywords"** field. The generator weaves 2–3 of them into hooks and reel concepts naturally, so the content rides current trends.

## Step 2 — Generate (already working)

Fill in the shoot intake → generate a month of captions, carousels, reel hooks, and an email. Everything is saved to **03 History** and can be downloaded as markdown.

## Step 3 — Schedule to Postiz

To turn on the **04 Schedule** tab, connect Postiz:

### Add env vars in Vercel
Go to: vercel.com → **shotbyseven** project → Settings → Environment Variables

| Name | Value |
|------|-------|
| `POSTIZ_API_KEY` | Your Postiz public API key (Postiz → Settings → Public API) |
| `POSTIZ_API_URL` | *(optional)* Defaults to `https://api.postiz.com/public/v1`. For self-hosted Postiz use `https://<your-host>/public/v1` |

Redeploy after adding them.

### How to get the API key
1. In Postiz → **Settings → Public API** → generate a key
2. Connect your social channels in Postiz first (Instagram, TikTok, etc.) — the Schedule tab lists whatever's connected

### Using it
1. Generate content (Step 02), then hit **Scheduler** on any section — it drops the text into the scheduler
2. Trim to the single caption you want
3. Paste **image URLs** (one per line) — your Cloudinary or gallery links. **Instagram & TikTok require at least one image.** Text-only platforms (X, LinkedIn, etc.) can skip this.
4. **Load channels**, pick one or more, set the publish date/time, hit **Schedule Post**
5. The post is queued in Postiz and auto-publishes at that time

## Notes
- The Schedule tab safely shows "Postiz is not connected" until `POSTIZ_API_KEY` is set — nothing breaks in the meantime
- `api/postiz.js` normalizes Postiz's channel payload and converts the caption + date into Postiz's `POST /public/v1/posts` format
- **Images**: the serverless function fetches each pasted URL, uploads it to Postiz (`POST /public/v1/upload`), and attaches the returned media to the post. The upload plumbing is verified end-to-end in the app; **confirm the first live scheduled post attaches its image correctly** — Postiz's `value[].image` shape has had edge cases across versions, and it's built to the documented `{ id, path }` shape.
