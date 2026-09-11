// /api/subscribe.js — Vercel serverless function
// Server-side proxy for the blog newsletter signup. Keeps the Resend API key
// out of the browser bundle (it was previously called directly from the
// client with a VITE_-prefixed — and therefore publicly shipped — key).
//
// POST /api/subscribe { email }
//
// ENV VARS:
//   RESEND_API_KEY — server-only, NOT VITE_-prefixed. Get from resend.com.

const RESEND_API_KEY = process.env.RESEND_API_KEY
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

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

  const email = (body?.email || '').trim()
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'A valid email is required' })
  }

  if (!RESEND_API_KEY) {
    // Don't fail the signup UX just because the notification email isn't configured yet.
    console.warn('RESEND_API_KEY not set — subscriber email not sent:', email)
    return res.status(200).json({ ok: true })
  }

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Shot by Seven <onboarding@resend.dev>',
        to: ['shotbyseven777@gmail.com'],
        subject: `New blog subscriber: ${email}`,
        html: `<p>New subscriber from the Shot by Seven blog.</p><p><strong>${email}</strong></p>`,
      }),
    })
  } catch (e) {
    console.warn('Resend send failed (non-blocking):', e.message)
  }

  return res.status(200).json({ ok: true })
}
