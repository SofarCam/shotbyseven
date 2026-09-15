// /api/blog-subscribe.js — Vercel serverless function
// Receives blog email-capture submissions and notifies via Resend.
// POST /api/blog-subscribe
//
// ENV VARS REQUIRED (set in Vercel dashboard):
//   RESEND_API_KEY — from resend.com → API Keys. Server-side only —
//                    do NOT prefix with VITE_, or it ships in the public bundle.

const RESEND_API_KEY = process.env.RESEND_API_KEY

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

  const { email } = body || {}
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Valid email is required' })
  }

  if (!RESEND_API_KEY) {
    return res.status(200).json({ success: true, notified: false })
  }

  const notified = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: 'Shot by Seven <onboarding@resend.dev>',
      to: ['shotbyseven777@gmail.com'],
      subject: `📸 New blog subscriber: ${email}`,
      html: `<p>New subscriber from the Shot by Seven blog.</p><p><strong>${email}</strong></p>`,
    }),
  })
    .then((r) => r.ok)
    .catch(() => false)

  return res.status(200).json({ success: true, notified })
}
