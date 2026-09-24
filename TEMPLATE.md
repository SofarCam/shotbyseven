# Cloning this site for another business (Seven System)

This site doubles as the template for Seven System client sites. Contact and
identity details live in one file; offers, copy, and photos are per-client and
get rewritten for each build.

Work top to bottom. Search the repo for `shotbyseven`, `Shot by Seven`,
`Charlotte`, and `Cameron` when you finish, and anything left is copy you
still need to rewrite.

## 1. One file: contact & identity
`src/config/business.js`: business name, email, Instagram, site URL, client
gallery link, and studio address. Every form error message, mailto link,
footer, Instagram link, map, SEO canonical URL, and outgoing EmailJS
notification reads from here.

## 2. Offers & pricing (per client)
| File | What's in it |
|------|--------------|
| `src/components/Services.jsx` | Main service cards and prices |
| `src/components/PricingCalculator.jsx` | Quote calculator rates |
| `src/components/ChatBot.jsx` | `INFO.services` (the bot's price list) and studio details |
| `src/components/Creators.jsx` | Creator packages, add-ons, FAQ |
| `src/holidayMinis.js` | Seasonal mini-session event |
| `src/shopConfig.js` | Digital products (free guide + paid guides) |
| `src/components/FAQ.jsx` | Homepage FAQ (also feeds Google's FAQ rich results) |

## 3. Photos & content
- `src/imageConfig.js`: every photo on the site, by section
- `src/blogConfig.js`: blog posts and case studies
- `public/photos/`: the image files themselves
- Hero, About, and Testimonials copy: `src/components/Hero.jsx`, `About.jsx`, `Testimonials.jsx`. **Testimonials must be real and consented.**

## 4. Static files (read before JavaScript runs)
Search engines and link previews read these directly, so they can't use the config:
- `index.html`: default title, meta description, Open Graph tags, and LocalBusiness JSON-LD
- `public/sitemap.xml`, `public/robots.txt`, `public/llms.txt`: the domain on every line
- `public/site.webmanifest`: app name
- Favicons in `public/`

## 5. Legal pages
`src/components/legal/`: owner's legal name, city/state, governing-law state
and county. Have the client confirm these; don't guess.

## 6. Server functions (`api/`)
- `api/crm.js`: `ALLOWED_ORIGINS` (the client's domain) and the preview-URL pattern
- `api/blog-subscribe.js`: the `to:` address for subscriber notifications
- `api/availability.js`: default calendar ID
- `api/download.js`: product list for paid downloads (mirror `src/shopConfig.js`)

## 7. Accounts & env vars
Each client gets their own accounts, and nothing is shared with Shot by Seven:
EmailJS, the Google Sheets CRM webhook, Stripe Payment Links, Cloudinary, GA4,
and Meta Pixel. Set every variable in `ACTIVATION-CHECKLIST.md` in the
client's own Vercel project, then redeploy.
