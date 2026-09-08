// /api/content-engine.js — Vercel serverless function
// Calls Claude API to generate voice profiles and shoot content
// POST /api/content-engine
// Body: { action: 'voice' | 'generate' | 'mine' | 'angle' | 'learn', posts?, voiceProfile?, intake?, raw?, idea?, topPosts?, bottomPosts? }

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY
const MODEL = 'claude-haiku-4-5-20251001'

export const config = { maxDuration: 60 }

const VOICE_PROMPT = `You are a brand voice analyst. Below are real social media posts from a photographer/creator. Study them and produce a reusable "Voice Profile" that another writer could follow to sound exactly like this person.

POSTS:
{POSTS}

Produce the Voice Profile with these sections:

1. TONE — 3–5 adjectives, plus one sentence on the overall feeling.
2. SENTENCE STYLE — typical length, rhythm, use of fragments, line breaks.
3. SIGNATURE PHRASES — recurring words, openers, sign-offs, slang they actually use.
4. EMOJI & PUNCTUATION — which emojis, how often, how they use dashes/ellipses/caps.
5. POINT OF VIEW — first person? how personal? how much do they share vs. promote?
6. WHAT THEY NEVER DO — words, tones, or formats that would feel off-brand.
7. THREE SAMPLE CAPTIONS — write 3 original captions in their voice on a generic topic, as a calibration test.

Be specific and concrete. Quote real examples from the posts to justify each point.`

function buildGenerationPrompt(intakeText) {
  return `Using the Voice Profile in your system instructions, generate one month of social content from the shoot described below. Everything must sound like the creator — match their tone, phrasing, and style exactly.

SHOOT INTAKE:
${intakeText}

Produce:

1. CAPTIONS — 8 Instagram captions, varied in angle (story, behind-the-scenes, value/tip, personal, call-to-book). Each with a hook line and a clear or soft CTA.

2. CAROUSEL CONCEPTS — 4 carousels. For each: a title, the slide-by-slide breakdown (3–6 slides), and the caption.

3. REEL HOOKS — 6 opening lines/hooks for short video, each with a one-line concept for what the reel shows.

4. EMAIL — 1 short newsletter-style email tied to this shoot that drives toward their goal.

Rules:
- Stay in voice. No generic "AI influencer" language.
- Vary the openers — no two captions should start the same way.
- Where a booking CTA fits naturally, include one. Don't force it everywhere.
- If trending hooks/keywords are provided, work 2–3 of them into hooks or reel concepts naturally — never keyword-stuff.
- Output clean and ready to copy. No commentary.`
}

const IDEA_BLOCK_FORMAT = `### N
IDEA: <the idea, one clear sentence>
SCORE: <1-10>
FORMAT: <Reel | Carousel | Caption | Story>
WHY: <one sentence — why this hook works>`

const MINE_PROMPT = `You are a content strategist for a photographer/creator. Below is raw material — rough ideas, saved comments, audience questions, and notes on past posts that performed well.

RAW MATERIAL:
{RAW}

Turn this into a ranked idea bank. For each idea:
- Write ONE clear, concrete idea — specific enough to actually shoot or write, not a vague theme
- Score it 1-10 for hook strength — how likely the opening line stops a scroll
- Recommend ONE format: Reel, Carousel, Caption, or Story
- Give a one-line reason for the score

Extract as many distinct ideas as the material supports (aim for 8-12). Sort highest score first.

Format each idea EXACTLY like this, repeated for every idea:

${IDEA_BLOCK_FORMAT}

No preamble, no summary after — just the ranked blocks.`

const ANGLE_PROMPT = `You are a content strategist for a photographer/creator. Below is one content idea. Find the sharpest angle before anything gets written.

IDEA:
{IDEA}

Generate 5 different hooks (opening lines) for this idea. For each:
- The hook itself — the literal opening line, ready to use
- Why it works, in one sentence
- The best format for this specific hook: Reel, Carousel, or Caption

Format EXACTLY like this, repeated for each of the 5 hooks:

### N
HOOK: <the opening line>
WHY: <one sentence>
FORMAT: <Reel | Carousel | Caption>

Then finish with exactly this block:

### RECOMMENDATION
Ship hook #<N> first because <one sentence reason>.

No other text before, between, or after.`

function buildLearnPrompt(topPosts, bottomPosts) {
  return `You are a content strategist reviewing performance data for a photographer/creator.

TOP PERFORMING POSTS THIS PERIOD:
${topPosts}

LOWEST PERFORMING POSTS THIS PERIOD:
${bottomPosts}

Produce exactly three sections, headed exactly as shown:

PATTERNS
What do the top posts have in common? Be specific — hook style, topic, format, posting pattern. 3-5 bullet points.

STOP DOING
What's dragging the bottom posts down? 2-3 bullet points, specific and actionable.

NEXT WEEK'S IDEA BANK
Based on what worked, generate 8 new ranked ideas for next week. Use this EXACT format for each, repeated, sorted highest score first:

${IDEA_BLOCK_FORMAT}
(WHY should tie back to a pattern from the top posts.)

No text outside these three sections.`
}

function formatIntake(intake) {
  const fields = [
    ['Shoot name / subject', intake.subject],
    ['What was it for', intake.purpose],
    ['The vibe in 3 words', intake.vibe],
    ['Any story behind it', intake.story],
    ['Number of usable images', intake.imageCount],
    ['Goal for these posts', intake.goal],
    ['Trending hooks / keywords to lean into', intake.trends],
  ]
  return fields
    .filter(([, v]) => v?.toString().trim())
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n')
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  if (!ANTHROPIC_KEY) return res.status(500).json({ error: 'ANTHROPIC_API_KEY is not configured' })

  let body
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
  } catch {
    return res.status(400).json({ error: 'Invalid JSON body' })
  }

  const { action, posts, voiceProfile, intake, raw, idea, topPosts, bottomPosts } = body || {}

  let systemPrompt = null
  let userContent = null

  if (action === 'voice') {
    if (!posts?.trim()) return res.status(400).json({ error: '"posts" is required' })
    userContent = VOICE_PROMPT.replace('{POSTS}', posts.trim())
  } else if (action === 'generate') {
    if (!voiceProfile?.trim()) return res.status(400).json({ error: '"voiceProfile" is required' })
    if (!intake) return res.status(400).json({ error: '"intake" is required' })
    systemPrompt = voiceProfile.trim()
    userContent = buildGenerationPrompt(formatIntake(intake))
  } else if (action === 'mine') {
    if (!raw?.trim()) return res.status(400).json({ error: '"raw" is required' })
    if (voiceProfile?.trim()) systemPrompt = voiceProfile.trim()
    userContent = MINE_PROMPT.replace('{RAW}', raw.trim())
  } else if (action === 'angle') {
    if (!idea?.trim()) return res.status(400).json({ error: '"idea" is required' })
    if (voiceProfile?.trim()) systemPrompt = voiceProfile.trim()
    userContent = ANGLE_PROMPT.replace('{IDEA}', idea.trim())
  } else if (action === 'learn') {
    if (!topPosts?.trim() || !bottomPosts?.trim()) return res.status(400).json({ error: '"topPosts" and "bottomPosts" are required' })
    if (voiceProfile?.trim()) systemPrompt = voiceProfile.trim()
    userContent = buildLearnPrompt(topPosts.trim(), bottomPosts.trim())
  } else {
    return res.status(400).json({ error: 'action must be one of "voice", "generate", "mine", "angle", "learn"' })
  }

  const apiBody = {
    model: MODEL,
    max_tokens: 8192,
    stream: true,
    messages: [{ role: 'user', content: userContent }],
  }
  if (systemPrompt) apiBody.system = systemPrompt

  let claudeRes
  try {
    claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify(apiBody),
    })
  } catch {
    return res.status(502).json({ error: 'Failed to reach Claude API' })
  }

  if (!claudeRes.ok) {
    const errText = await claudeRes.text()
    return res.status(502).json({ error: `Claude API error ${claudeRes.status}: ${errText.slice(0, 200)}` })
  }

  // Proxy the Anthropic SSE stream directly to the client
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no')

  const reader = claudeRes.body.getReader()
  const decoder = new TextDecoder()

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      res.write(decoder.decode(value, { stream: true }))
    }
  } finally {
    res.end()
  }
}
