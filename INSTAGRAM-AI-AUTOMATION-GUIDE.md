# AI Automation Guide — Automate Your Instagram with Claude

Comment-to-DM, an AI that answers your inbox, and posts that publish
themselves. Plus the rules that keep your account alive.

*A guide by @aiwithanushka*

---

## Good news first: Instagram actually allows this

Unlike LinkedIn, Meta supports DM automation officially. The Instagram
Messaging API exists precisely so businesses can automate conversations, and
comment-to-DM is a mainstream, approved feature used by tens of thousands of
accounts.

The catch is architecture. Everything must run through the official Graph
API with a Business or Creator account, a registered Meta App, and OAuth. The
tools that get accounts banned are the ones that log in with your username
and password and drive Instagram's private mobile API.

There is no first-party Instagram connector in Claude. You connect through a
Meta Business Partner or an MCP server built on the official API. Which one
you pick is the entire risk decision.

---

## Agent 1 — Comment-to-DM, the money maker

Someone comments a keyword like `PRICE` or `LINK`. They get a personal DM
within seconds. This is consistently the highest-converting automation on
the platform, because the conversation moves to where people actually buy.

- Pick a distinctive keyword and say it out loud in the post or reel —
  "Comment PRICE and I'll send it."
- Let AI write the DM, not a fixed template. Claude can respond to what they
  actually said.
- Keep the first DM short. Answer the thing they asked, then offer one next
  step.

## Agent 2 — An AI that works your inbox

Once the conversation starts, Claude can keep it going: answering FAQs,
handling objections, qualifying the lead, and passing the good ones to you.

- It answers instantly and escalates when it is out of its depth.
- Give it your real information — pricing, shipping, policies, FAQs. It
  should never improvise those.
- Match your voice. Feed it your actual past replies so it does not sound
  like a helpdesk.
- Always leave a human exit — a clear way for someone to reach you, and an
  escalation rule for anything sensitive.

## Agents 3 and 4 — Publishing and insights

The same connection can draft and queue content, then tell you what
actually worked.

- Claude drafts the carousel and caption. You approve before it publishes.
- Instead of scrolling Insights, you just ask — read-only analytics through
  the official Insights API.

---

## Read this twice: safe vs. what gets you banned

The line is not what you automate. It is how the tool connects.

| SAFE — official Graph API | BAN RISK — private API |
|---|---|
| Business or Creator account | Logging in with username and password |
| Registered Meta App with OAuth | `instagrapi` or reverse-engineered API |
| Comment-to-DM after app review | Modded clients or browser bots |
| Publishing and scheduling | Mass DMs to people who never messaged you |
| Insights and analytics | Ignoring the 24-hour messaging window |

Never install an MCP server that asks for your Instagram username and
password. Those wrap Instagram's reverse-engineered mobile API. Accounts
driving that traffic get rate-limited, challenged, or permanently disabled,
and there are documented cases of users receiving warnings.

---

## The rules Meta enforces

1. **Account type and app.** You need a Business or Creator account, a
   registered Meta App, and OAuth. DM access additionally requires app
   review and business verification.
2. **The 24-hour messaging window.** You can reply freely within 24 hours of
   someone messaging you. Outside that, you are limited to specific
   approved message types, much like WhatsApp.
3. **Rate limits.** The Graph API allows roughly 200 calls per user per
   hour. Exceeding it triggers throttling, so batch requests and back off on
   errors rather than retrying immediately.

---

## Two ways to connect it

### Option A: a Meta Business Partner — fastest, recommended

Best for creators and small businesses.

1. Choose an approved partner platform such as ManyChat, Inrō, or
   InstantDM.
2. Connect your Instagram Business or Creator account through their OAuth
   flow.
3. Build your comment-to-DM trigger and your DM agent inside the platform.
4. If the platform exposes an MCP server, add it in Claude under
   Settings → Connectors → Add custom connector, so you can run it all in
   plain language.

### Option B: the Graph API directly — full control

Best for teams that want to own the stack.

1. Create a Meta Business account and register a Meta App.
2. Convert your Instagram account to Business or Creator and link it.
3. Request the messaging permissions and pass app review.
4. Wire the API to Claude through n8n, Make, or your own backend.

> **Note on this repo:** Shot by Seven already runs Option B directly — see
> `INSTAGRAM-SETUP.md` for the deployed webhook (Facebook Developer App +
> `/api/instagram` on Vercel) that qualifies DM leads today.

---

## Prompts to try first

- "DM everyone who commented PRICE on my last reel with the pricing link."
- "Summarize my unread DMs and flag the ones that look like real leads."
- "Which reels drove the most follows per 10k views this month?"
- "Draft this week's carousel and caption, then schedule it for Tuesday
  9am."
- "What questions keep coming up in my DMs? Turn the top 5 into a FAQ
  post."

---

## Launch checklist

- [ ] Account is Business or Creator, and linked to a Meta App.
- [ ] You tested the comment trigger on your own post first.
- [ ] The DM agent has your real pricing, policies, and FAQs.
- [ ] There is a clear human handoff, and an escalation rule.
- [ ] Nothing in your stack asks for your Instagram password.

---

*Automate your Instagram with Claude. Your DMs are where the money is. Put
an AI there. Follow @aiwithanushka.*
