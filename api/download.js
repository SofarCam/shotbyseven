// /api/download.js — Vercel serverless function
// Delivers paid digital products (see src/shopConfig.js) after Stripe checkout.
//
//   GET /api/download?session_id=cs_...          → 302 redirect to the product file
//   GET /api/download?session_id=cs_...&check=1  → { ok, product } (used by /shop/thanks)
//
// Each product's Stripe Payment Link redirects buyers after payment to
//   https://shotbyseven.com/shop/thanks?session_id={CHECKOUT_SESSION_ID}
// This function asks Stripe whether that session was paid through the
// product's Payment Link before revealing the file URL, so the file is never
// linked anywhere public. The repo is public, so paid files must NOT live in
// public/; host them elsewhere and point *_FILE_URL at them.
//
// ENV VARS REQUIRED (set in Vercel dashboard, server-side only, never VITE_):
//   STRIPE_SECRET_KEY             — restricted key with "Checkout Sessions: Read"
//   POSING_GUIDE_PAYMENT_LINK_ID  — plink_... of the guide's Payment Link
//   POSING_GUIDE_FILE_URL         — where the guide's PDF is hosted

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY

const PRODUCTS = [
  {
    slug: 'posing-guide',
    name: 'The Model Posing Guide',
    paymentLinkId: process.env.POSING_GUIDE_PAYMENT_LINK_ID,
    fileUrl: process.env.POSING_GUIDE_FILE_URL,
  },
]

const SESSION_ID = /^cs_(live|test)_[A-Za-z0-9]+$/

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'method_not_allowed' })

  const sessionId = String(req.query.session_id || '')
  const checkOnly = req.query.check === '1'
  const fail = (status, error) => res.status(status).json({ ok: false, error })

  if (!SESSION_ID.test(sessionId)) return fail(400, 'invalid_session')
  if (!STRIPE_SECRET_KEY) return fail(503, 'not_configured')

  let session
  try {
    const upstream = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
      headers: { Authorization: `Bearer ${STRIPE_SECRET_KEY}` },
    })
    if (upstream.status === 404) return fail(404, 'session_not_found')
    if (!upstream.ok) return fail(502, 'stripe_error')
    session = await upstream.json()
  } catch {
    return fail(502, 'stripe_error')
  }

  // 'no_payment_required' covers a 100%-off promo code on the Payment Link
  const paid = session.payment_status === 'paid' || session.payment_status === 'no_payment_required'
  if (session.status !== 'complete' || !paid) return fail(402, 'not_paid')

  const product = PRODUCTS.find((p) => p.paymentLinkId && p.paymentLinkId === session.payment_link)
  if (!product) return fail(404, 'product_not_found')
  if (!product.fileUrl) return fail(503, 'not_configured')

  if (checkOnly) return res.status(200).json({ ok: true, product: { slug: product.slug, name: product.name } })

  res.setHeader('Location', product.fileUrl)
  return res.status(302).end()
}
