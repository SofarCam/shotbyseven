// ============================================
// SHOT BY SEVEN — BLOG / STUDIO JOURNAL
// ============================================
// Add new posts here. They appear at /blog.
// slug: URL-safe ID (no spaces, lowercase)
// cover: use any /photos/webp/ image
// gallery: optional extra images shown in the post
// ============================================

export const blogPosts = [
  {
    slug: 'petal-and-shadow-rose-studio-shoot',
    title: 'Petal & Shadow — Studio Diaries',
    date: '2026-02-14',
    category: 'Studio',
    readTime: '3 min read',
    cover: '/photos/webp/DM0A9139_websize.webp',
    excerpt: `Valentine's week. Studio A at NoDa Art House. One model, a floor covered in roses, and two hours to make something cinematic.`,
    body: [
      {
        type: 'p',
        content: `Some shoots come together fast. This was one of them. The idea started with a single image in my head — a woman half-buried in rose petals, everything red and cream and shadow. We had Studio A for two hours. I ordered three dozen roses the night before.`,
      },
      {
        type: 'p',
        content: `The key with high-contrast studio work is patience in the setup. We spent the first 45 minutes just laying petals and dialing in the one bare-bulb light source I wanted. No fill. No reflector. Just a hard key slightly off-center and the rest falling into black.`,
      },
      {
        type: 'p',
        content: `The model, Bri, came in with full creative trust. That's everything. When a client gives you that kind of openness, you can push into directions that a tighter brief would never allow. We ended up with something that felt less like a portrait session and more like a painting.`,
      },
      {
        type: 'tip',
        label: 'Studio Tip',
        content: `For petal or prop-heavy setups, always build the scene before the subject arrives. You want them walking into a finished world — not watching you arrange furniture.`,
      },
      {
        type: 'p',
        content: `Gallery delivered in 5 days. 42 selects. This one's in my top 10 shoots of the year.`,
      },
    ],
    gallery: [
      '/photos/webp/4_websize.webp',
      '/photos/webp/37_websize.webp',
      '/photos/webp/26_websize.webp',
      '/photos/webp/10_websize.webp',
    ],
    tags: ['Studio', 'NoDa Art House', 'Editorial', 'Charlotte'],
  },
  {
    slug: 'court-couture-jersey-editorial',
    title: 'Court Couture — Where Sports Meets Fashion',
    date: '2026-01-28',
    category: 'Fashion',
    readTime: '4 min read',
    cover: '/photos/webp/edit_28_websize.webp',
    excerpt: `A jersey, a yellow backdrop, and a vision for something that lives at the intersection of streetwear and editorial. Here's how the Court Couture shoot came together.`,
    body: [
      {
        type: 'p',
        content: `This concept started with a simple question: what does a jersey look like when you treat it like couture? Not a sports action shot, not a lifestyle photo — but a full editorial with drama and intentional styling.`,
      },
      {
        type: 'p',
        content: `We used a yellow seamless backdrop — a color I rarely reach for, but it earned its place here. The warmth balanced perfectly against the jersey and the model's skin tone. Every look we pulled was deliberately athletic-meets-elevated: sneakers with structured blazers, bike shorts under long coats.`,
      },
      {
        type: 'p',
        content: `Lighting was a two-light setup with a large softbox key and a strip box behind for rim separation. I wanted the subject to feel like they were lit for a magazine spread, not a gym session.`,
      },
      {
        type: 'tip',
        label: 'Styling Tip',
        content: `When you're shooting athletic wear, bring the styling up to meet the photography — not the other way around. Add accessories, layers, and intentional poses to elevate the garment.`,
      },
      {
        type: 'p',
        content: `The shoot ran 3 hours and we produced over 200 selects. The yellow backdrop is going back up soon — already planning a sequel.`,
      },
    ],
    gallery: [
      '/photos/webp/edit_24_websize.webp',
      '/photos/webp/edit_26_websize.webp',
      '/photos/webp/edit_22_websize.webp',
      '/photos/webp/edit_20_websize.webp',
    ],
    tags: ['Fashion', 'Editorial', 'Studio', 'Streetwear'],
  },
  {
    slug: 'walk-the-stage-graduation-portraits',
    title: 'Walk the Stage — Graduation Season Behind the Lens',
    date: '2026-01-10',
    category: 'Graduation',
    readTime: '3 min read',
    cover: '/photos/webp/DM0A6636_websize.webp',
    excerpt: `Graduation season is one of my favorite times of year. Here's why these sessions mean something different — and how I approach them to make the photos actually last.`,
    body: [
      {
        type: 'p',
        content: `Graduation portraits aren't just headshots in a cap and gown. They're a record of a moment that took years to reach. The pressure on the subject is real — they want to look right, feel right, and walk away with something they'll print and frame.`,
      },
      {
        type: 'p',
        content: `My approach starts before the session. I always ask graduates to bring two looks: the formal regalia and something personal — an outfit that represents who they actually are, not just who they are on graduation day. Some of the best frames I've ever captured came in that second wardrobe change.`,
      },
      {
        type: 'p',
        content: `Location matters for these. Charlotte has incredible spots — the UNCC fountain area, Marshall Park, Freedom Park. Natural light in the late afternoon gives a warmth that complements the joy in these faces. I'm usually done shooting by golden hour and into processing within 48 hours.`,
      },
      {
        type: 'tip',
        label: 'Session Tip',
        content: `Bring a second outfit that has nothing to do with graduation. Those frames always become the favorites — the real you, on your biggest day.`,
      },
      {
        type: 'p',
        content: `If you're booking a grad session, don't wait until two weeks before. My spring calendar fills up fast. Book early, lock in your date, and let's make something you'll hang on the wall.`,
      },
    ],
    gallery: [
      '/photos/webp/DM0A6672_5_websize.webp',
      '/photos/webp/DM0A6731_websize.webp',
      '/photos/webp/DM0A6753_websize.webp',
    ],
    tags: ['Graduation', 'Charlotte', 'UNCC', 'Portraits'],
  },
]

export function getPostBySlug(slug) {
  return blogPosts.find(p => p.slug === slug) || null
}

export function getRecentPosts(count = 3) {
  return [...blogPosts]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, count)
}
