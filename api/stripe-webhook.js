// /api/stripe-webhook.js — Vercel serverless function
// Receives Stripe webhook events and confirms deposit payments back to the CRM
// POST /api/stripe-webhook (registered as an endpoint in Stripe Dashboard → Webhooks)
//
// ENV VARS REQUIRED (set in Vercel dashboard):
//   STRIPE_WEBHOOK_SECRET   — signing secret from Stripe Dashboard → Webhooks → this endpoint
//   VITE_CRM_WEBHOOK_URL    — same CRM webhook already used by inquiry/booking forms
//
// The booking's SmartBooking.jsx already appends `client_reference_id=<bookingId>`
// to the Stripe deposit link, so a completed checkout carries the booking ID back here.

import crypto from 'node:crypto'

export const config = { api: { bodyParser: false } }

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET
const CRM_URL = process.env.VITE_CRM_WEBHOOK_URL

async function readRawBody(req) {
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  return Buffer.concat(chunks)
}

function isValidStripeSignature(rawBody, signatureHeader, secret) {
  if (!signatureHeader) return false
  const parts = Object.fromEntries(signatureHeader.split(',').map((p) => p.split('=')))
  const timestamp = parts.t
  const signature = parts.v1
  if (!timestamp || !signature) return false

  const expected = crypto.createHmac('sha256', secret).update(`${timestamp}.${rawBody}`).digest('hex')

  const expectedBuf = Buffer.from(expected, 'hex')
  const signatureBuf = Buffer.from(signature, 'hex')
  if (expectedBuf.length !== signatureBuf.length) return false
  return crypto.timingSafeEqual(expectedBuf, signatureBuf)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  if (!WEBHOOK_SECRET) return res.status(500).json({ error: 'STRIPE_WEBHOOK_SECRET not configured' })

  const rawBody = await readRawBody(req)

  if (!isValidStripeSignature(rawBody.toString('utf8'), req.headers['stripe-signature'], WEBHOOK_SECRET)) {
    return res.status(400).json({ error: 'Invalid signature' })
  }

  let event
  try {
    event = JSON.parse(rawBody.toString('utf8'))
  } catch {
    return res.status(400).json({ error: 'Invalid JSON payload' })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data?.object || {}
    const bookingId = session.client_reference_id
    const email = session.customer_details?.email || session.customer_email
    const amountPaid = typeof session.amount_total === 'number' ? session.amount_total / 100 : null

    // Log to CRM (fire-and-forget, matches the pattern used by api/inquiry.js)
    if (bookingId && CRM_URL) {
      fetch(CRM_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'deposit_paid',
          booking_id: bookingId,
          email,
          amount_paid: amountPaid,
          paid_at: new Date().toISOString(),
          stripe_session_id: session.id,
        }),
      }).catch(() => {}) // non-blocking
    }
  }

  return res.status(200).json({ received: true })
}
