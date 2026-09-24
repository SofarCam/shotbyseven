// /api/crm.js — Vercel serverless function
// Proxies all CRM (Google Sheets webhook) calls server-side so the webhook
// URL is never shipped in the client JS bundle — previously every form
// (Contact, SmartBooking, ClientPortal, ContractSign) called it directly
// from the browser, meaning anyone reading the deployed JS could find the
// URL and POST arbitrary rows into the business's CRM sheet, or read the
// portal/loyalty-lookup endpoints directly. This only changes WHO calls the
// webhook — the external contract (query params / POST body) is unchanged.
//
//   GET  /api/crm?action=lookup&email=...                  (loyalty check)
//   GET  /api/crm?action=portal&email=...&bookingId=...    (portal lookup)
//   POST /api/crm { ...leadOrBookingData }                  (log a record)

const CRM_URL = process.env.VITE_CRM_WEBHOOK_URL || process.env.CRM_WEBHOOK_URL

// Only the site itself may call this proxy — blocks the trivial "curl it from
// anywhere" replay that made the original client-side webhook URL abusable.
const ALLOWED_ORIGINS = ['https://shotbyseven.com', 'https://www.shotbyseven.com']

function isAllowedOrigin(req) {
  const origin = req.headers.origin || ''
  if (ALLOWED_ORIGINS.includes(origin)) return true
  // Vercel preview deployments (shotbyseven-*.vercel.app) — same repo, no external risk
  if (/^https:\/\/shotbyseven-[a-z0-9-]+\.vercel\.app$/.test(origin)) return true
  return false
}

export default async function handler(req, res) {
  const origin = req.headers.origin || ''
  const allowed = isAllowedOrigin(req)
  res.setHeader('Access-Control-Allow-Origin', allowed ? origin : 'null')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  if (!allowed) {
    return res.status(403).json({ ok: false, error: 'forbidden' })
  }

  if (!CRM_URL) {
    return res.status(200).json({ ok: false, error: 'crm_not_configured' })
  }

  try {
    if (req.method === 'GET') {
      const qs = new URLSearchParams(req.query).toString()
      const upstream = await fetch(`${CRM_URL}?${qs}`)
      const text = await upstream.text()
      try { return res.status(upstream.status).json(JSON.parse(text)) } catch { return res.status(upstream.status).send(text) }
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {})
      const upstream = await fetch(CRM_URL, { method: 'POST', body })
      const text = await upstream.text()
      try { return res.status(upstream.status).json(JSON.parse(text)) } catch { return res.status(upstream.status).send(text) }
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch {
    return res.status(502).json({ ok: false, error: 'crm_request_failed' })
  }
}
