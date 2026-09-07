import { useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  HiClipboard, HiCheck, HiRefresh, HiSave, HiLightningBolt, HiCamera,
  HiDownload, HiTrash, HiClock, HiChevronDown, HiCalendar, HiPaperAirplane,
} from 'react-icons/hi'

const LS_VOICE_KEY = 'sbs_voice_profile'
const LS_HISTORY_KEY = 'sbs_content_history'

// Trigger a client-side download of text as a file
function downloadText(filename, text) {
  const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function slugify(s) {
  return (s || 'content').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'content'
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch { return '' }
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function CopyBtn({ text, label = 'Copy' }) {
  const [copied, setCopied] = useState(false)
  const copy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [text])
  return (
    <button
      onClick={copy}
      className="flex items-center gap-1.5 font-heading text-[10px] tracking-[0.15em] uppercase text-cream/30 hover:text-gold transition-colors"
    >
      {copied ? <HiCheck className="w-3 h-3 text-gold" /> : <HiClipboard className="w-3 h-3" />}
      {copied ? 'Copied!' : label}
    </button>
  )
}

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="block font-heading text-[10px] tracking-[0.2em] uppercase text-cream/40 mb-1">{label}</label>
      {hint && <p className="text-cream/25 text-[11px] font-body mb-2">{hint}</p>}
      {children}
    </div>
  )
}

const inputCls =
  'w-full bg-transparent border border-cream/15 focus:border-gold/50 px-4 py-3 text-cream text-sm font-body outline-none transition-colors placeholder-cream/15'
const areaCls = `${inputCls} resize-none leading-relaxed`

// Parse the full generated output into labeled sections for per-section copy buttons
function parseSections(text) {
  const markers = [
    { key: 'captions', title: 'Captions', search: '1. CAPTIONS' },
    { key: 'carousels', title: 'Carousel Concepts', search: '2. CAROUSEL CONCEPTS' },
    { key: 'reels', title: 'Reel Hooks', search: '3. REEL HOOKS' },
    { key: 'email', title: 'Email', search: '4. EMAIL' },
  ]
  const upper = text.toUpperCase()
  const results = []
  for (let i = 0; i < markers.length; i++) {
    const start = upper.indexOf(markers[i].search)
    if (start === -1) continue
    let end = text.length
    for (let j = i + 1; j < markers.length; j++) {
      const next = upper.indexOf(markers[j].search, start + 1)
      if (next !== -1) { end = next; break }
    }
    const content = text.slice(start, end).trim()
    if (content.length > 40) results.push({ key: markers[i].key, title: markers[i].title, content })
  }
  return results
}

// Stream from /api/content-engine, call onChunk(accumulatedText) on each delta
async function streamClaude(action, body, onChunk) {
  const res = await fetch('/api/content-engine', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...body }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new Error(err.error || 'API error')
  }
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buf = ''
  let text = ''
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buf += decoder.decode(value, { stream: true })
    const lines = buf.split('\n')
    buf = lines.pop()
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      const raw = line.slice(6).trim()
      if (raw === '[DONE]') continue
      try {
        const evt = JSON.parse(raw)
        if (evt.type === 'content_block_delta' && evt.delta?.type === 'text_delta') {
          text += evt.delta.text
          onChunk(text)
        }
      } catch { /* ignore parse errors on non-JSON SSE events */ }
    }
  }
  return text
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function ContentEngine() {
  const [tab, setTab] = useState('voice')
  const [voiceProfile, setVoiceProfile] = useState(() => {
    try { return localStorage.getItem(LS_VOICE_KEY) || '' } catch { return '' }
  })
  const [voiceEdited, setVoiceEdited] = useState(false)
  const [voiceSaved, setVoiceSaved] = useState(false)
  const [posts, setPosts] = useState('')
  const [intake, setIntake] = useState({
    subject: '', purpose: '', vibe: '', story: '', imageCount: '', goal: '', trends: '',
  })
  const [voiceOutput, setVoiceOutput] = useState('')
  const [contentOutput, setContentOutput] = useState('')
  const [loading, setLoading] = useState(null) // null | 'voice' | 'content'
  const [error, setError] = useState('')
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem(LS_HISTORY_KEY) || '[]') } catch { return [] }
  })
  const [expandedId, setExpandedId] = useState(null)
  const voiceScrollRef = useRef(null)
  const contentScrollRef = useRef(null)

  const saveToHistory = useCallback((output) => {
    if (!output?.trim()) return
    const entry = {
      id: Date.now().toString(36),
      date: new Date().toISOString(),
      subject: intake.subject?.trim() || 'Untitled shoot',
      goal: intake.goal?.trim() || '',
      output,
    }
    setHistory((prev) => {
      const next = [entry, ...prev].slice(0, 30) // keep last 30
      try { localStorage.setItem(LS_HISTORY_KEY, JSON.stringify(next)) } catch { /* storage full/unavailable */ }
      return next
    })
  }, [intake])

  const deleteHistoryEntry = useCallback((id) => {
    setHistory((prev) => {
      const next = prev.filter((h) => h.id !== id)
      try { localStorage.setItem(LS_HISTORY_KEY, JSON.stringify(next)) } catch { /* ignore */ }
      return next
    })
  }, [])

  // ── Scheduler (Postiz) ────────────────────────────────────────
  const [channels, setChannels] = useState([])
  const [channelsLoading, setChannelsLoading] = useState(false)
  const [channelsError, setChannelsError] = useState('')
  const [selectedChannels, setSelectedChannels] = useState([])
  const [scheduleCaption, setScheduleCaption] = useState('')
  const [scheduleImages, setScheduleImages] = useState('')
  const [scheduleDate, setScheduleDate] = useState('')
  const [scheduling, setScheduling] = useState(false)
  const [scheduleMsg, setScheduleMsg] = useState(null) // { type: 'ok' | 'err', text }

  const loadChannels = useCallback(async () => {
    setChannelsLoading(true); setChannelsError('')
    try {
      const res = await fetch('/api/postiz')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
      setChannels(data.channels || [])
      if (!data.channels?.length) setChannelsError('No channels connected in Postiz yet. Connect one in Postiz first.')
    } catch (e) {
      setChannelsError(e.message)
    } finally {
      setChannelsLoading(false)
    }
  }, [])

  const toggleChannel = (id) =>
    setSelectedChannels((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])

  const sendToScheduler = useCallback((text) => {
    setScheduleCaption(text)
    setScheduleMsg(null)
    setTab('schedule')
    if (channels.length === 0 && !channelsLoading) loadChannels()
  }, [channels.length, channelsLoading, loadChannels])

  const handleSchedule = async () => {
    setScheduleMsg(null)
    if (!scheduleCaption.trim()) { setScheduleMsg({ type: 'err', text: 'Add caption text first.' }); return }
    if (selectedChannels.length === 0) { setScheduleMsg({ type: 'err', text: 'Pick at least one channel.' }); return }
    if (!scheduleDate) { setScheduleMsg({ type: 'err', text: 'Pick a date and time.' }); return }
    const when = new Date(scheduleDate)
    if (isNaN(when.getTime()) || when.getTime() < Date.now()) {
      setScheduleMsg({ type: 'err', text: 'Pick a valid future date/time.' }); return
    }
    const imageUrls = scheduleImages.split(/[\n,]/).map((s) => s.trim()).filter(Boolean)
    setScheduling(true)
    try {
      const res = await fetch('/api/postiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'schedule', content: scheduleCaption, channelIds: selectedChannels, date: when.toISOString(), imageUrls }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
      setScheduleMsg({ type: 'ok', text: 'Scheduled ✓ — it\'s queued in Postiz.' })
      setScheduleCaption('')
      setScheduleImages('')
    } catch (e) {
      setScheduleMsg({ type: 'err', text: e.message })
    } finally {
      setScheduling(false)
    }
  }

  const persistVoice = useCallback((text) => {
    try { localStorage.setItem(LS_VOICE_KEY, text) } catch { /* storage unavailable */ }
    setVoiceSaved(true)
    setVoiceEdited(false)
    setTimeout(() => setVoiceSaved(false), 2500)
  }, [])

  const handleGenerateVoice = async () => {
    if (!posts.trim()) return
    setLoading('voice')
    setError('')
    setVoiceOutput('')
    try {
      const final = await streamClaude('voice', { posts }, (chunk) => {
        setVoiceOutput(chunk)
        if (voiceScrollRef.current) voiceScrollRef.current.scrollTop = voiceScrollRef.current.scrollHeight
      })
      setVoiceProfile(final)
      persistVoice(final)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(null)
    }
  }

  const handleSaveVoice = () => {
    persistVoice(voiceProfile)
  }

  const handleGenerateContent = async () => {
    if (!voiceProfile.trim()) {
      setError('Complete Step 01 first — add your voice profile.')
      return
    }
    setLoading('content')
    setError('')
    setContentOutput('')
    try {
      const final = await streamClaude('generate', { voiceProfile, intake }, (chunk) => {
        setContentOutput(chunk)
        if (contentScrollRef.current) contentScrollRef.current.scrollTop = contentScrollRef.current.scrollHeight
      })
      saveToHistory(final)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(null)
    }
  }

  const setIntakeField = (field) => (e) => setIntake((prev) => ({ ...prev, [field]: e.target.value }))

  const contentSections = !loading && contentOutput ? parseSections(contentOutput) : []

  return (
    <section className="min-h-screen bg-ink">
      <div className="max-w-3xl mx-auto px-6 py-20">

        {/* Header */}
        <div className="mb-10">
          <span className="font-heading text-[10px] tracking-[0.35em] uppercase text-gold/70 block mb-3">
            Shot by Seven
          </span>
          <h1 className="font-display text-4xl font-bold text-cream mb-2">Content Engine</h1>
          <p className="text-cream/30 text-sm font-body">Voice-matched social content from every shoot.</p>
        </div>

        {/* Tab switcher */}
        <div className="flex mb-10 border border-cream/10 w-fit">
          {[
            { id: 'voice', label: '01  Voice Profile', Icon: HiCamera },
            { id: 'generate', label: '02  Generate', Icon: HiLightningBolt },
            { id: 'history', label: `03  History${history.length ? ` (${history.length})` : ''}`, Icon: HiClock },
            { id: 'schedule', label: '04  Schedule', Icon: HiCalendar },
          ].map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => { setTab(id); setError('') }}
              className={`flex items-center gap-2 font-heading text-[10px] tracking-[0.2em] uppercase px-6 py-3 transition-colors ${
                tab === id ? 'bg-gold text-ink' : 'text-cream/40 hover:text-cream'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Error banner */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 border border-red-500/25 bg-red-500/5 px-4 py-3"
          >
            <p className="text-red-400/80 text-xs font-heading tracking-wider">{error}</p>
          </motion.div>
        )}

        {/* ── VOICE PROFILE TAB ── */}
        {tab === 'voice' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">

            {/* Saved profile editor */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="font-heading text-xs tracking-[0.2em] uppercase text-cream/70">
                    Saved Voice Profile
                  </h2>
                  <p className="text-cream/25 text-[11px] font-body mt-0.5">
                    {voiceProfile
                      ? voiceSaved ? 'Saved to browser ✓' : 'Edit directly or generate below'
                      : 'None yet — generate one below or paste it here'}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  {voiceProfile && <CopyBtn text={voiceProfile} />}
                  {voiceEdited && (
                    <button
                      onClick={handleSaveVoice}
                      className="flex items-center gap-1.5 font-heading text-[10px] tracking-[0.15em] uppercase text-gold hover:text-gold/70 transition-colors"
                    >
                      <HiSave className="w-3 h-3" />
                      {voiceSaved ? 'Saved ✓' : 'Save'}
                    </button>
                  )}
                </div>
              </div>
              <textarea
                value={voiceProfile}
                onChange={(e) => { setVoiceProfile(e.target.value); setVoiceEdited(true) }}
                rows={voiceProfile ? 14 : 4}
                placeholder="Paste a voice profile here, or generate one from your posts below."
                className={`${areaCls} text-cream/75`}
              />
            </div>

            <div className="border-t border-cream/5 pt-8">
              <h2 className="font-heading text-xs tracking-[0.2em] uppercase text-cream/60 mb-1">
                Build from Posts
              </h2>
              <p className="text-cream/25 text-[11px] font-body mb-5">
                Paste 10–15 of your best captions. Claude will analyze them and produce a reusable Voice Profile — saved automatically.
              </p>
              <textarea
                value={posts}
                onChange={(e) => setPosts(e.target.value)}
                rows={9}
                placeholder={"Post 1:\nLate light, last frames of the day...\n\n---\n\nPost 2:\nMet Maya at the corner of 5th & chaos..."}
                className={areaCls}
              />
              <button
                onClick={handleGenerateVoice}
                disabled={loading === 'voice' || !posts.trim()}
                className="mt-4 font-heading text-xs tracking-[0.25em] uppercase text-ink bg-gold px-8 py-3 hover:bg-gold/90 transition-colors disabled:opacity-30 flex items-center gap-2"
              >
                {loading === 'voice' ? (
                  <><HiRefresh className="w-4 h-4 animate-spin" /> Analyzing your voice...</>
                ) : (
                  <><HiLightningBolt className="w-4 h-4" /> Build Voice Profile</>
                )}
              </button>

              {/* Streaming output */}
              {(loading === 'voice' || voiceOutput) && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-heading text-[10px] tracking-[0.2em] uppercase text-cream/30">
                      {loading === 'voice' ? 'Analyzing...' : 'Done — saved to browser ✓'}
                    </span>
                    {voiceOutput && <CopyBtn text={voiceOutput} />}
                  </div>
                  <div
                    ref={voiceScrollRef}
                    className="border border-cream/10 p-4 max-h-72 overflow-y-auto font-body text-sm text-cream/70 whitespace-pre-wrap leading-relaxed"
                  >
                    {voiceOutput}
                    {loading === 'voice' && <span className="text-gold animate-pulse">▍</span>}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ── GENERATE CONTENT TAB ── */}
        {tab === 'generate' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">

            {/* Voice profile status */}
            <div className={`border p-4 flex items-start gap-3 ${voiceProfile ? 'border-gold/20 bg-gold/3' : 'border-cream/10'}`}>
              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${voiceProfile ? 'bg-gold' : 'bg-cream/20'}`} />
              <div className="min-w-0">
                <p className="text-sm font-body text-cream/60">
                  {voiceProfile
                    ? 'Voice profile active — content will match your style.'
                    : 'No voice profile set. Complete Step 01 first for on-brand results.'}
                </p>
                {voiceProfile && (
                  <p className="text-cream/25 text-[11px] font-body mt-1 truncate">
                    {voiceProfile.slice(0, 130)}…
                  </p>
                )}
              </div>
            </div>

            {/* Intake form */}
            <Field label="Shoot name / subject">
              <input
                type="text"
                value={intake.subject}
                onChange={setIntakeField('subject')}
                placeholder='e.g. "Maya — downtown golden hour portraits"'
                className={inputCls}
              />
            </Field>

            <Field label="What was it for?">
              <input
                type="text"
                value={intake.purpose}
                onChange={setIntakeField('purpose')}
                placeholder="client work, personal project, brand collab, test shoot…"
                className={inputCls}
              />
            </Field>

            <Field label="The vibe in 3 words">
              <input
                type="text"
                value={intake.vibe}
                onChange={setIntakeField('vibe')}
                placeholder="e.g. moody, intimate, cinematic"
                className={inputCls}
              />
            </Field>

            <Field label="Any story behind it?" hint="1–2 sentences — what happened, what made it special">
              <textarea
                value={intake.story}
                onChange={setIntakeField('story')}
                rows={3}
                placeholder="She'd just moved to the city and wanted to capture this moment before everything changed…"
                className={areaCls}
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Usable images">
                <input
                  type="number"
                  value={intake.imageCount}
                  onChange={setIntakeField('imageCount')}
                  placeholder="e.g. 40"
                  className={inputCls}
                />
              </Field>
              <Field label="Goal for these posts">
                <input
                  type="text"
                  value={intake.goal}
                  onChange={setIntakeField('goal')}
                  placeholder="bookings, reach, authority…"
                  className={inputCls}
                />
              </Field>
            </div>

            <Field label="Trending hooks / keywords" hint="Optional — paste angles or keywords from vidIQ research to ride current trends">
              <textarea
                value={intake.trends}
                onChange={setIntakeField('trends')}
                rows={2}
                placeholder="e.g. 'POV: your photographer said trust me', 'Charlotte fall mini sessions', 'unposed candid trend'"
                className={areaCls}
              />
            </Field>

            <button
              onClick={handleGenerateContent}
              disabled={loading === 'content' || !voiceProfile.trim()}
              className="w-full font-heading text-xs tracking-[0.25em] uppercase text-ink bg-gold py-4 hover:bg-gold/90 transition-colors disabled:opacity-30 flex items-center justify-center gap-2 mt-2"
            >
              {loading === 'content' ? (
                <><HiRefresh className="w-4 h-4 animate-spin" /> Writing your content...</>
              ) : (
                <><HiLightningBolt className="w-4 h-4" /> Generate Month of Content →</>
              )}
            </button>

            {/* Results */}
            {(loading === 'content' || contentOutput) && (
              <div className="pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="font-heading text-xs tracking-[0.2em] uppercase text-cream/60">
                    {loading === 'content' ? 'Writing your content...' : 'Your Content Month'}
                  </h2>
                  {contentOutput && !loading && (
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => downloadText(`shotbyseven-content-${slugify(intake.subject)}.md`, contentOutput)}
                        className="flex items-center gap-1.5 font-heading text-[10px] tracking-[0.15em] uppercase text-cream/30 hover:text-gold transition-colors"
                      >
                        <HiDownload className="w-3 h-3" /> Download
                      </button>
                      <CopyBtn text={contentOutput} label="Copy All" />
                    </div>
                  )}
                  {contentOutput && loading === 'content' && <CopyBtn text={contentOutput} label="Copy All" />}
                </div>

                {contentSections.length > 0 ? (
                  contentSections.map((s) => (
                    <div key={s.key} className="border border-cream/10">
                      <div className="flex items-center justify-between px-4 py-2.5 border-b border-cream/8 bg-cream/2">
                        <span className="font-heading text-[10px] tracking-[0.2em] uppercase text-gold">{s.title}</span>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => sendToScheduler(s.content)}
                            className="flex items-center gap-1.5 font-heading text-[10px] tracking-[0.15em] uppercase text-cream/30 hover:text-gold transition-colors"
                          >
                            <HiPaperAirplane className="w-3 h-3 rotate-90" /> Scheduler
                          </button>
                          <CopyBtn text={s.content} />
                        </div>
                      </div>
                      <div className="p-4 font-body text-sm text-cream/75 whitespace-pre-wrap leading-relaxed max-h-[480px] overflow-y-auto">
                        {s.content}
                      </div>
                    </div>
                  ))
                ) : (
                  <div
                    ref={contentScrollRef}
                    className="border border-cream/10 p-4 max-h-[640px] overflow-y-auto font-body text-sm text-cream/75 whitespace-pre-wrap leading-relaxed"
                  >
                    {contentOutput}
                    {loading === 'content' && <span className="text-gold animate-pulse">▍</span>}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* ── HISTORY TAB ── */}
        {tab === 'history' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            {history.length === 0 ? (
              <div className="border border-cream/10 p-8 text-center">
                <HiClock className="w-6 h-6 text-cream/20 mx-auto mb-3" />
                <p className="text-cream/40 text-sm font-body">No saved content yet.</p>
                <p className="text-cream/25 text-[11px] font-body mt-1">
                  Every month you generate in Step 02 is saved here automatically.
                </p>
              </div>
            ) : (
              history.map((h) => {
                const open = expandedId === h.id
                return (
                  <div key={h.id} className="border border-cream/10">
                    <div className="flex items-center justify-between px-4 py-3 gap-3">
                      <button
                        onClick={() => setExpandedId(open ? null : h.id)}
                        className="flex items-center gap-3 min-w-0 text-left group flex-1"
                      >
                        <HiChevronDown className={`w-4 h-4 text-cream/30 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
                        <span className="min-w-0">
                          <span className="block font-body text-sm text-cream/80 truncate group-hover:text-cream transition-colors">
                            {h.subject}
                          </span>
                          <span className="block text-cream/25 text-[11px] font-heading tracking-wider uppercase">
                            {formatDate(h.date)}{h.goal ? ` · ${h.goal}` : ''}
                          </span>
                        </span>
                      </button>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <CopyBtn text={h.output} />
                        <button
                          onClick={() => downloadText(`shotbyseven-content-${slugify(h.subject)}.md`, h.output)}
                          className="text-cream/30 hover:text-gold transition-colors"
                          aria-label="Download"
                        >
                          <HiDownload className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteHistoryEntry(h.id)}
                          className="text-cream/30 hover:text-red-400/80 transition-colors"
                          aria-label="Delete"
                        >
                          <HiTrash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    {open && (
                      <div className="border-t border-cream/8 p-4 font-body text-sm text-cream/70 whitespace-pre-wrap leading-relaxed max-h-[560px] overflow-y-auto">
                        {h.output}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </motion.div>
        )}

        {/* ── SCHEDULE TAB ── */}
        {tab === 'schedule' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <p className="text-cream/30 text-sm font-body">
              Schedule a caption straight to your social channels via Postiz. Generate content in Step 02, hit
              <span className="text-cream/50"> Scheduler</span> on any section, then set the channel and time.
            </p>

            {/* Channels */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-heading text-xs tracking-[0.2em] uppercase text-cream/60">Channels</h2>
                <button
                  onClick={loadChannels}
                  disabled={channelsLoading}
                  className="flex items-center gap-1.5 font-heading text-[10px] tracking-[0.15em] uppercase text-gold hover:text-gold/70 transition-colors disabled:opacity-40"
                >
                  <HiRefresh className={`w-3 h-3 ${channelsLoading ? 'animate-spin' : ''}`} />
                  {channels.length ? 'Reload' : 'Load channels'}
                </button>
              </div>
              {channelsError && (
                <p className="text-red-400/70 text-[11px] font-body mb-3">{channelsError}</p>
              )}
              {channels.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {channels.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => toggleChannel(c.id)}
                      className={`px-4 py-2 border font-heading text-[10px] tracking-[0.15em] uppercase transition-all ${
                        selectedChannels.includes(c.id)
                          ? 'border-gold bg-gold/10 text-cream'
                          : 'border-cream/10 text-cream/50 hover:border-cream/30'
                      }`}
                    >
                      {c.name}{c.provider ? ` · ${c.provider}` : ''}
                    </button>
                  ))}
                </div>
              ) : (
                !channelsError && !channelsLoading && (
                  <p className="text-cream/25 text-[11px] font-body">Load your connected Postiz channels to pick where this posts.</p>
                )
              )}
            </div>

            {/* Caption */}
            <Field label="Caption" hint="Trim the section down to the single caption you want to publish">
              <textarea
                value={scheduleCaption}
                onChange={(e) => setScheduleCaption(e.target.value)}
                rows={7}
                placeholder="Your caption text…"
                className={areaCls}
              />
            </Field>

            {/* Image URLs */}
            <Field label="Image URLs" hint="One per line — Instagram & TikTok require at least one image. Paste your gallery / Cloudinary links.">
              <textarea
                value={scheduleImages}
                onChange={(e) => setScheduleImages(e.target.value)}
                rows={3}
                placeholder={"https://res.cloudinary.com/…/photo1.jpg\nhttps://res.cloudinary.com/…/photo2.jpg"}
                className={areaCls}
              />
            </Field>

            {/* Date */}
            <Field label="Publish at">
              <input
                type="datetime-local"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                className={`${inputCls} [color-scheme:dark]`}
              />
            </Field>

            {scheduleMsg && (
              <div className={`border px-4 py-3 ${scheduleMsg.type === 'ok' ? 'border-gold/25 bg-gold/5' : 'border-red-500/25 bg-red-500/5'}`}>
                <p className={`text-xs font-heading tracking-wider ${scheduleMsg.type === 'ok' ? 'text-gold' : 'text-red-400/80'}`}>
                  {scheduleMsg.text}
                </p>
              </div>
            )}

            <button
              onClick={handleSchedule}
              disabled={scheduling}
              className="w-full font-heading text-xs tracking-[0.25em] uppercase text-ink bg-gold py-4 hover:bg-gold/90 transition-colors disabled:opacity-30 flex items-center justify-center gap-2"
            >
              {scheduling ? (
                <><HiRefresh className="w-4 h-4 animate-spin" /> Scheduling…</>
              ) : (
                <><HiPaperAirplane className="w-4 h-4 rotate-90" /> Schedule Post</>
              )}
            </button>
          </motion.div>
        )}

      </div>
    </section>
  )
}
