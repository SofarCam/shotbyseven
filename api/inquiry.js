// /api/inquiry.js — Vercel serverless function
// Receives SmartIntakeForm studio inquiry submissions
// Sends email notification + logs to CRM webhook
// POST /api/inquiry

const CRM_URL = process.env.VITE_CRM_WEBHOOK_URL

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  let body
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
  } catch {
    return res.status(400).json({ error: 'Invalid JSON body' })
  }

  const { shootType, duration, headcount, dates, wantsPhotographer, name, email, specialRequests } = body || {}

  // Basic validation
  if (!name || !email || !shootType) {
    return res.status(400).json({ error: 'Missing required fields: name, email, shootType' })
  }

  const inquiryId = (Date.now().toString(36) + Math.random().toString(36).substring(2, 5)).toUpperCase().substring(0, 8)
  const timestamp = new Date().toLocaleString('en-US', { timeZone: 'America/New_York', dateStyle: 'medium', timeStyle: 'short' })

  const datesFormatted = Array.isArray(dates)
    ? dates.filter(d => d.date).map((d, i) => `${i + 1}. ${d.date} (${d.timeOfDay || 'flexible'})`).join('\n')
    : (dates || 'Not specified')

  // Log to CRM (fire-and-forget)
  if (CRM_URL) {
    fetch(CRM_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        inquiry_id: inquiryId,
        name,
        email,
        shoot_type: shootType,
        duration,
        headcount,
        dates: datesFormatted,
        wants_photographer: wantsPhotographer,
        special_requests: specialRequests || '',
        submitted_at: timestamp,
        source: 'SmartIntakeForm /studio',
      }),
    }).catch(() => {}) // non-blocking
  }

  // Return success — EmailJS handles the actual email from the frontend
  // This endpoint exists to: (1) validate, (2) log to CRM, (3) be a hook point for Seven later
  return res.status(200).json({
    success: true,
    inquiryId,
    message: `Inquiry ${inquiryId} received. Seven will respond to ${email} within 5 minutes.`,
  })
}
