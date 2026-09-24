# Shot by Seven

The website for [Shot by Seven](https://shotbyseven.com), a Charlotte, NC photography studio run by Cameron Currence. React 19 + Vite + Tailwind CSS 4, deployed to Vercel.

## Stack

- **Frontend**: React 19, React Router 7, Framer Motion, Tailwind CSS 4
- **Serverless functions**: Vercel Functions (`api/`) — booking availability, Instagram DM/publishing, the CRM webhook proxy, blog subscriber email, AI content tools
- **Third-party integrations**: EmailJS, Stripe (payment links), Cloudinary (reference photo uploads), Google Calendar (availability), Instagram/Meta Graph API, Anthropic Claude API, Google Sheets (lead/booking tracker)

See `ANALYTICS-SETUP.md`, `INSTAGRAM-SETUP.md`, `CONTENT-PIPELINE-SETUP.md`, and `ACTIVATION-CHECKLIST.md` for integration setup details.

## Development

```bash
npm install
npm run dev       # start the dev server
npm run build     # production build
npm run lint      # eslint
npm run preview   # preview the production build locally
```

## Project structure

- `src/components/` — page sections and components; most public pages compose sections directly on `/` (Hero, Gallery, Services, SmartBooking, etc.)
- `src/components/legal/` — Privacy Policy, Terms of Service, Accessibility Statement
- `api/` — Vercel serverless functions
- `public/photos/` — site imagery, optimized via `scripts/optimize-images.mjs`
- `src/blogConfig.js` — blog post content
