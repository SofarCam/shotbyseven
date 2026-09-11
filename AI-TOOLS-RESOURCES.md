# AI Tools & Skills — Resource Breakdown

You pasted a large, mixed batch of Claude Skills, plugin marketplaces, GitHub repos,
tool directories, and a couple of unrelated notes (an Instagram automation guide, a
"content creator business" class-notes dump). This sorts all of it, flags what's
actually useful for **shotbyseven** (a React/Vite photography business site with
Stripe deposits, Instagram DM automation, and a Postiz content pipeline — see
`ACTIVATION-CHECKLIST.md`, `INSTAGRAM-SETUP.md`, `CONTENT-PIPELINE-SETUP.md`), and
skips what doesn't apply.

Claude Skills/plugins are an **account-wide** setting, not something stored in this
repo — installing one makes it available across every project, not just this one.

---

## 1. Installed this session — click to confirm

I searched the official plugin marketplace (not the `skills.sh` links you pasted —
see §3) and sent install cards for the three that match this project. If you
haven't clicked them yet, they're above in this conversation:

| Plugin | Covers | Why it fits shotbyseven |
|---|---|---|
| **Small Business** | payroll planning, invoice-chase, cash-flow snapshot, customer-pulse, content-strategy, run-campaign — wired to Stripe/QuickBooks/PayPal/Square/Canva | Matches the deposit tracking and $5k revenue target from `ACTIVATION-CHECKLIST.md` §5 |
| **Marketing** | content-creation, campaign-plan, SEO audit, performance-report — wired to Figma/Canva/Supermetrics/Notion | Matches the Postiz content pipeline and GA4/Meta Pixel analytics already built |
| **Design** | design-critique, accessibility-review, ux-copy | Polishing the booking/pricing UI — same goal as the "Impeccable" / "UI-UX Pro Max" skills you pasted, but from a vetted source |

Already enabled and usable right now, no install needed: `dataviz` (for any GA4/Stripe
reporting charts), `code-review`, `security-review`, `run` (launch + screenshot the
site), `brand-guidelines`, `theme-factory`.

---

## 2. The `skills.sh` list — why I didn't install these

Design (UI/UX Pro Max, Awesome Design MD, Taste Skill, Impeccable, Design.md,
Hallmark, Diagram Design, Archify), Writing (Humanizer, Voiceprint, Answer First,
Stop Slop), Thinking (Understand Anything, I Have ADHD), and Frontend Slides are
all **third-party, unreviewed** skill packages hosted outside Anthropic's
marketplace. My skill-management tools only search and install from the vetted
catalog in §1 — I can't vet or install arbitrary `skills.sh` links for you. If you
want one of these, install it yourself and treat it like any other third-party
dependency (read it before trusting it with your account).

Net effect you're after (better-looking, less "AI slop" UI copy) is already covered
by the **Design** plugin above plus normal review — no gap to fill.

---

## 3. Official / verified skill collections — worth knowing about, not installing now

These are legitimate (Anthropic's own repo, or verified partners like Sentry,
Cloudflare, Trail of Bits, Microsoft, HashiCorp, AWS, Stripe, Figma, Sanity, etc.),
but none match this stack directly:

- **Relevant if you ever need it**: `Stripe` skills (you already have live Stripe
  Payment Links wired in `src/utils/stripe.js`), `Figma` (if designs move from code
  into Figma files).
- **Not relevant to shotbyseven**: everything infra/backend-specific (Cloudflare
  Workers/D1/R2, HashiCorp Terraform, Qt, Twilio, Airtable, WordPress) — this is a
  static Vite site on Vercel with serverless functions, no infra those skills target.
- **Mega collections** (`obra/superpowers`, `alirezarezvani/claude-skills`,
  `wshobson/agents`, `mattpocock/skills`) are general engineering-workflow skills
  (TDD, debugging, PR review). Useful generally, but same third-party caveat as §2.

---

## 4. Instagram automation guide — you already built the safe version

The guide's core warning (official Graph API + Business/Creator account + OAuth =
safe; logging in with a password or using a reverse-engineered private API = ban
risk) is exactly the path `INSTAGRAM-SETUP.md` already follows: a registered Meta
Business app, long-lived token, and a webhook at `/api/instagram` with
`shotbyseven_verify_2026` as the verify token. **No action needed** — this is
confirmation the existing setup is the correct one, not a new thing to build.

One idea from the guide that isn't built yet: comment-to-DM (a keyword comment on a
post/reel auto-triggers a DM), as a top-of-funnel feeder into the DM qualifier that
already exists. Worth a future PR if you want it.

---

## 5. Free tools — relevance triage

| Tool | What it is | Relevant here? |
|---|---|---|
| Camoufox Browser | Anti-detection browser for scraping agents | Maybe — only if you start scraping competitor pricing/content instead of using vidIQ |
| HyperFrames (HeyGen) | HTML → MP4 video rendering | Maybe — could turn Content Engine captions/carousels into short-form video; there's a HeyGen MCP available in this account if you want to try it |
| Agentic Inbox (Cloudflare) | Self-hosted AI email client | Maybe — alternative to handling client emails manually, but Gmail is already available as an MCP connector |
| Open Higgsfield AI | Local image/video generation studio | Low priority — Content Engine already generates captions/reels; this would add local media generation on top |
| LibreChat, Open-LLM-VTuber, AutoHedge, Vibe-Trading, Fincept Terminal, Indeed/job tools | Multi-LLM chat UI, desktop VTuber, trading bots, job search | **Not applicable** — no connection to a photography business site |

---

## 6. Bookmark-style lists — high-signal picks only

From the "50 websites" list, the ones actually useful for this project:
**tinypng.com / compressjpeg.com** (compress gallery photos before upload — check
against what `scripts/` and `sharp` already do in this repo), **unsplash.com /
pexels.com / pixabay.com** (placeholder imagery), **coolors.co / fontjoy.com**
(palette/type pairing if the site's design system changes), **ray.so / carbon.now.sh**
(clean code screenshots for any dev-facing posts). The rest (regex testers, JWT
decoders, roadmap sites, aircraft trackers) aren't relevant to a client-facing
photography site.

The "10 GitHub repos for AI coding agents" list is generic agent-tooling
(context management, multi-agent orchestration) — general engineering interest, not
project-specific.

**`github.com/tonhowtf/omniget`** — a free open-source desktop downloader (yt-dlp
front end) for courses/video/music/images from 1,800+ sites. A personal utility, not
something to integrate into shotbyseven.

---

## Bottom line

- Confirm the **Small Business**, **Marketing**, and **Design** plugin cards above if
  you want them — that's the actionable "add skills" part of your ask, scoped to what
  this project can actually use.
- Nothing here changes code or config in this repo; it's a reference so future
  decisions ("should we add X") don't require re-reading the original dump.
- This session only has `shotbyseven` attached. If you want skill recommendations
  mapped to your other projects, attach those repos in a session and ask again —
  the matches will differ (e.g. a backend service would care about the
  infra-specific skills this doc ruled out above).
