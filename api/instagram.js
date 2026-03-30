// /api/instagram.js — Instagram DM Lead Qualifier
// Receives Instagram DM webhooks from Facebook
// Uses Claude API to qualify leads and auto-respond
// Notifies Cam via Telegram for every message
//
// ENV VARS REQUIRED (set in Vercel dashboard):
//   INSTAGRAM_VERIFY_TOKEN   — any secret string you choose, paste same into Facebook App webhook config
//   INSTAGRAM_ACCESS_TOKEN   — long-lived Page Access Token from Facebook App
//   INSTAGRAM_PAGE_ID        — your Instagram Business Account ID
//   ANTHROPIC_API_KEY        — from openclaw config
//   TELEGRAM_BOT_TOKEN       — from openclaw config
//   TELEGRAM_CHAT_ID         — your Telegram user ID

const VERIFY_TOKEN = process.env.INSTAGRAM_VERIFY_TOKEN
const IG_ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID

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

async function callClaude(userMessage) {
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
      system: SYSTEM_PROMPT,
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
  }

  return res.status(200).json({ ok: true })
}
