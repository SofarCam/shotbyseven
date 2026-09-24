// Digital products for /shop. Add a product by adding an entry here.
//
// Free guide: drop the finished PDF at public/downloads/<file> and set
// `available: true`. Until then the form collects a waitlist.
//
// Paid products: a product goes on sale when its Stripe Payment Link env var
// is set. Delivery is handled by api/download.js, which checks the purchase
// with Stripe before handing over the file. Until the link is set, the card
// shows a "get notified" form instead of a buy button, so it never dead-ends.

export const FREE_GUIDE = {
  slug: 'ten-poses',
  name: '10 Poses That Work on Everyone',
  tagline: 'The go-to poses I use on every shoot, for first-timers, experienced models, creators, and anyone who "doesn\'t know what to do with their hands."',
  cover: '/photos/webp/shop-free-guide-cover.webp',
  includes: [
    '10 poses, each with how to do it and why it works',
    'The one rule that fixes most awkward photos',
    'The common mistake to avoid on every pose',
  ],
  fileUrl: '/downloads/10-poses-that-work-on-everyone.pdf',
  available: false,
}

export const PRODUCTS = [
  {
    slug: 'posing-guide',
    name: 'The Model Posing Guide',
    price: 19,
    format: 'PDF · 26 pages',
    cover: '/photos/webp/shop-posing-guide-cover.webp',
    tagline: '40 poses I use on real shoots, plus how to flow between them so you never freeze in front of the camera.',
    includes: [
      '40 poses: standing, close-ups, seated, movement, and couples',
      'How to do each pose, why it works, and the mistake to avoid',
      '3 pose flows to practice in the mirror',
      'The night-before shoot prep checklist',
    ],
    checkoutUrl: import.meta.env.VITE_STRIPE_POSING_GUIDE_URL,
  },
]
