// /api/instagram.js — Instagram DM Lead Qualifier + Comment-to-DM
// Receives Instagram webhooks from Facebook:
//   - "messages" changes  → DM lead qualifier (Claude replies in the inbox)
//   - "comments" changes  → comment-to-DM (keyword comment gets a private reply)
// Notifies Cam via Telegram for every event.
//
// ENV VARS REQUIRED (set in Vercel dashboard):
//   INSTAGRAM_VERIFY_TOKEN     — any secret string you choose, paste same into Facebook App webhook config
//   INSTAGRAM_ACCESS_TOKEN     — long-lived Page Access Token from Facebook App
//   INSTAGRAM_PAGE_ID          — your Instagram Business Account ID
//   ANTHROPIC_API_KEY          — from openclaw config
//   TELEGRAM_BOT_TOKEN         — from openclaw config
//   TELEGRAM_CHAT_ID           — your Telegram user ID
//   INSTAGRAM_COMMENT_KEYWORDS — optional, comma-separated (default: "PRICE,INFO,LINK,BOOK")

const VERIFY_TOKEN = process.env.INSTAGRAM_VERIFY_TOKEN
const IG_ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN
const IG_PAGE_ID = process.env.INSTAGRAM_PAGE_ID
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID

const COMMENT_KEYWORDS = (process.env.INSTAGRAM_COMMENT_KEYWORDS || 'PRICE,INFO,LINK,BOOK')
  .split(',')
  .map((k) => k.trim().toLowerCase())
  .filter(Boolean)

const SYSTEM_PROMPT = `You are Seven, the assistant for Shot by Seven — a professional photography studio in Charlotte, NC run by Cam (Cameron Currence). You respond to Instagram DMs from potential clients.

Your job:
1. Warmly greet new inquiries and gather the key details:
   - Type of shoot (wedding, portrait, event, brand, boudoir, etc.)
   - Date or timeframe they're looking for
   - Location (Charlotte area or elsewhere?)
   - Budget (packages start at $150 for portraits, $800+ for weddings)
2. If they're answering questions, continue the conversation naturally — acknowledge what they shared, then ask the next question
3. Once you have shoot type + date + budget, let them know Cam will personally follow up within a few hours to confirm availability and lock in the date

Keep it short — 2-3 sentences max. Warm, real, and professional. Not salesy.
End with: — Seven | Shot by Seven`

const COMMENT_DM_SYSTEM_PROMPT = `You are Seven, the assistant for Shot by Seven — a professional photography studio in Charlotte, NC run by Cam (Cameron Currence). Someone just commented a keyword on an Instagram post asking for pricing/info, and you're sending them the first private DM about it.

Your job:
1. Reference what they commented so it feels personal, not automated.
2. Give them the one thing they asked for — pricing starts at $150 for portraits/headshots, $800+ for weddings — or point them to book.
3. Offer exactly one next step (reply with shoot type + date, or use the booking link on the site).

Keep it to 2-3 sentences max. Warm and real, not a bot. End with: — Seven | Shot by Seven`

async function callClaude(userMessage, systemPrompt = SYSTEM_PROMPT) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    }),
  })
  const data = await res.json()
  return data?.content?.[0]?.text || null
}

async function sendTelegram(text) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return
  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text,
      parse_mode: 'Markdown',
    }),
  }).catch(() => {})
}

async function sendIGReply(recipientId, message) {
  if (!IG_ACCESS_TOKEN) return
  await fetch('https://graph.facebook.com/v21.0/me/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${IG_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      recipient: { id: recipientId },
      message: { text: message },
      messaging_type: 'RESPONSE',
    }),
  })
}

// Comment-to-DM: sends the FIRST private reply to a comment (Meta only allows
// one private reply per comment, within 7 days of it being posted).
async function sendPrivateReply(commentId, message) {
  if (!IG_ACCESS_TOKEN) return { ok: false }
  const res = await fetch('https://graph.facebook.com/v21.0/me/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${IG_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      recipient: { comment_id: commentId },
      message: { text: message },
    }),
  })
  const data = await res.json().catch(() => null)
  return { ok: res.ok, data }
}

function matchesCommentKeyword(text) {
  if (!text) return null
  const lower = text.toLowerCase()
  return COMMENT_KEYWORDS.find((kw) => lower.includes(kw)) || null
}

export default async function handler(req, res) {
  // Facebook webhook verification (GET)
  if (req.method === 'GET') {
    const mode = req.query['hub.mode']
    const token = req.query['hub.verify_token']
    const challenge = req.query['hub.challenge']

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      return res.status(200).send(challenge)
    }
    return res.status(403).json({ error: 'Verification failed' })
  }

  if (req.method !== 'POST') return res.status(405).end()

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body

  // Only handle Instagram events
  if (body?.object !== 'instagram') return res.status(200).end()

  for (const entry of body?.entry || []) {
    for (const event of entry?.messaging || []) {
      const senderId = event?.sender?.id
      const messageText = event?.message?.text

      // Skip echoes (our own messages), non-text events (stickers/images), and missing data
      if (!messageText || !senderId || event?.message?.is_echo) continue

      // Notify Cam immediately — don't wait on Claude
      sendTelegram(`📸 *New Instagram DM*\n\nFrom: \`${senderId}\`\n\n"${messageText}"\n\n_Responding now..._`)

      // Get Claude's qualifying response
      const reply = await callClaude(messageText)

      if (reply) {
        // Send reply on Instagram
        await sendIGReply(senderId, reply)

        // Send Cam what we replied
        sendTelegram(`✅ *Seven replied:*\n\n"${reply}"`)
      } else {
        sendTelegram(`⚠️ *Claude failed to respond* — check ANTHROPIC_API_KEY`)
      }
    }

    // Comment-to-DM: someone commented a trigger keyword on a post/reel
    for (const change of entry?.changes || []) {
      if (change?.field !== 'comments') continue

      const comment = change?.value
      const commentId = comment?.id
      const commentText = comment?.text
      const commenterId = comment?.from?.id
      const commenterName = comment?.from?.username || 'someone'

      // Skip our own comments/replies, and comments with no matched keyword
      if (!commentId || !commentText || (IG_PAGE_ID && commenterId === IG_PAGE_ID)) continue
      const keyword = matchesCommentKeyword(commentText)
      if (!keyword) continue

      sendTelegram(
        `💬 *Comment keyword hit* ("${keyword}")\n\nFrom: @${commenterName}\n\n"${commentText}"\n\n_Sending private reply..._`
      )

      const dm = await callClaude(
        `Someone commented "${commentText}" on my Instagram post — they used the keyword "${keyword}". Write the private DM reply.`,
        COMMENT_DM_SYSTEM_PROMPT
      )

      if (dm) {
        const { ok } = await sendPrivateReply(commentId, dm)
        sendTelegram(
          ok
            ? `✅ *Private reply sent to @${commenterName}:*\n\n"${dm}"`
            : `⚠️ *Private reply failed to send* — check INSTAGRAM_ACCESS_TOKEN and that the comment is within the 7-day window`
        )
      } else {
        sendTelegram(`⚠️ *Claude failed to draft the comment-to-DM reply* — check ANTHROPIC_API_KEY`)
      }
    }
  }

  return res.status(200).json({ ok: true })
}
