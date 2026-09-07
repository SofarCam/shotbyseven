// /api/postiz.js — Vercel serverless function
// Bridges the Content Engine to Postiz (self-hosted or hosted) for scheduling.
//   GET  /api/postiz                  -> list connected channels (integrations)
//   POST /api/postiz { action, ... }  -> action: 'schedule' creates a scheduled post
//
// ENV VARS (set in Vercel):
//   POSTIZ_API_KEY  — required. Postiz public API key (Settings → Public API).
//   POSTIZ_API_URL  — optional. Defaults to the hosted cloud API.
//                     Self-hosted: https://<your-postiz-host>/public/v1

const POSTIZ_API_KEY = process.env.POSTIZ_API_KEY
const POSTIZ_API_URL = (process.env.POSTIZ_API_URL || 'https://api.postiz.com/public/v1').replace(/\/$/, '')

async function postizFetch(path, init = {}) {
  const res = await fetch(`${POSTIZ_API_URL}${path}`, {
    ...init,
    headers: {
      Authorization: POSTIZ_API_KEY,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  })
  const text = await res.text()
  let json = null
  try { json = text ? JSON.parse(text) : null } catch { /* non-JSON response */ }
  return { ok: res.ok, status: res.status, json, text }
}

// Fetch an image by URL and upload it to Postiz, returning the media object
// ({ id, path, ... }) to attach to a post's `value[].image` array.
async function uploadImageFromUrl(url) {
  const imgRes = await fetch(url)
  if (!imgRes.ok) throw new Error(`Could not fetch image (${imgRes.status}): ${url}`)
  const contentType = imgRes.headers.get('content-type') || 'image/jpeg'
  const buf = Buffer.from(await imgRes.arrayBuffer())
  const name = (url.split('/').pop() || 'image').split('?')[0] || 'image.jpg'

  const form = new FormData()
  form.append('file', new Blob([buf], { type: contentType }), name)

  // Note: no Content-Type header — fetch sets the multipart boundary itself
  const res = await fetch(`${POSTIZ_API_URL}/upload`, {
    method: 'POST',
    headers: { Authorization: POSTIZ_API_KEY },
    body: form,
  })
  const text = await res.text()
  if (!res.ok) throw new Error(`Postiz upload failed (${res.status}): ${text.slice(0, 150)}`)
  let media = null
  try { media = text ? JSON.parse(text) : null } catch { /* non-JSON */ }
  if (!media?.id && !media?.path) throw new Error('Postiz upload returned no media reference')
  return { id: media.id, path: media.path, name: media.name || name }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  if (!POSTIZ_API_KEY) {
    return res.status(503).json({ error: 'Postiz is not connected. Set POSTIZ_API_KEY in Vercel to enable scheduling.' })
  }

  // ── List channels ──────────────────────────────────────────────
  if (req.method === 'GET') {
    const r = await postizFetch('/integrations')
    if (!r.ok) {
      return res.status(502).json({ error: `Postiz integrations error ${r.status}: ${(r.text || '').slice(0, 200)}` })
    }
    // Normalize to { id, name, provider } regardless of Postiz payload shape
    const list = Array.isArray(r.json) ? r.json : (r.json?.integrations || [])
    const channels = list.map((c) => ({
      id: c.id,
      name: c.name || c.profile || c.username || 'Channel',
      provider: c.identifier || c.provider || c.providerIdentifier || '',
    }))
    return res.status(200).json({ channels })
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  let body
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
  } catch {
    return res.status(400).json({ error: 'Invalid JSON body' })
  }

  const { action } = body || {}

  // ── Schedule a post ────────────────────────────────────────────
  if (action === 'schedule') {
    const { content, channelIds, date, imageUrls } = body
    if (!content?.trim()) return res.status(400).json({ error: '"content" is required' })
    if (!Array.isArray(channelIds) || channelIds.length === 0) {
      return res.status(400).json({ error: 'At least one channel is required' })
    }
    if (!date) return res.status(400).json({ error: '"date" (ISO timestamp) is required' })

    // Guard against scheduling in the past
    const when = new Date(date)
    if (isNaN(when.getTime())) return res.status(400).json({ error: 'Invalid date' })

    // Upload any provided image URLs to Postiz first (Instagram/TikTok require media)
    let media = []
    if (Array.isArray(imageUrls) && imageUrls.length) {
      try {
        media = await Promise.all(imageUrls.filter((u) => u?.trim()).slice(0, 10).map((u) => uploadImageFromUrl(u.trim())))
      } catch (e) {
        return res.status(502).json({ error: e.message })
      }
    }

    const posts = channelIds.map((id) => ({
      integration: { id },
      value: [{ content: content.trim(), image: media }],
    }))

    const r = await postizFetch('/posts', {
      method: 'POST',
      body: JSON.stringify({
        type: 'schedule',
        date: when.toISOString(),
        shortLink: false,
        tags: [],
        posts,
      }),
    })

    if (!r.ok) {
      return res.status(502).json({ error: `Postiz schedule error ${r.status}: ${(r.text || '').slice(0, 250)}` })
    }
    return res.status(200).json({ ok: true, result: r.json })
  }

  return res.status(400).json({ error: 'Unknown action. Use action "schedule".' })
}
