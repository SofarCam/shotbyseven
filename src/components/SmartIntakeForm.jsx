import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { sendBookingEmail } from '../utils/emailService'

const SHOOT_TYPES = [
  { id: 'portrait', label: 'Portrait / Headshots', hint: 'Personal branding, LinkedIn, lifestyle' },
  { id: 'fashion', label: 'Fashion / Editorial', hint: 'Lighting equipment available' },
  { id: 'music-video', label: 'Music Video', hint: '6+ hour availability + full power in studio' },
  { id: 'product', label: 'Product / Commercial', hint: 'White cyclorama option available' },
  { id: 'event', label: 'Event Coverage', hint: 'Birthdays, corporate, special occasions' },
  { id: 'other', label: 'Other', hint: 'Tell us more in special requests' },
]

const DURATIONS = [
  { id: '1hr', label: '1 Hour', price: '$60' },
  { id: '2hrs', label: '2 Hours', price: '$110' },
  { id: '3hrs', label: '3 Hours', price: '$150' },
  { id: '4-6hrs', label: '4–6 Hours', price: 'Custom quote' },
]

const HEADCOUNTS = [
  { id: 'solo', label: 'Just me' },
  { id: '2-5', label: '2–5 people' },
  { id: '6-10', label: '6–10 people' },
  { id: '11-20', label: '11–20 people', warning: 'Near max studio capacity' },
]

const TIME_OF_DAY = [
  { id: 'morning', label: 'Morning' },
  { id: 'afternoon', label: 'Afternoon' },
  { id: 'evening', label: 'Evening' },
]

const PHOTOGRAPHER_OPTIONS = [
  { id: 'yes', label: 'Yes — book Cam too' },
  { id: 'maybe', label: 'Maybe — show me pricing' },
  { id: 'no', label: 'No — bringing my own' },
]

const EMPTY_DATE = { date: '', timeOfDay: '' }

export default function SmartIntakeForm({ selectedPackage }) {
  const [step, setStep] = useState(1)
  const [sending, setSending] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [sendError, setSendError] = useState('')

  const [form, setForm] = useState({
    shootType: '',
    duration: '',
    headcount: '',
    dates: [{ ...EMPTY_DATE }],
    wantsPhotographer: '',
    name: '',
    email: '',
    specialRequests: '',
  })

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const setDate = (index, field, value) => {
    const updated = form.dates.map((d, i) => i === index ? { ...d, [field]: value } : d)
    setForm(prev => ({ ...prev, dates: updated }))
  }

  const addDate = () => {
    if (form.dates.length < 3) setForm(prev => ({ ...prev, dates: [...prev.dates, { ...EMPTY_DATE }] }))
  }

  const removeDate = (index) => {
    if (form.dates.length > 1) {
      setForm(prev => ({ ...prev, dates: prev.dates.filter((_, i) => i !== index) }))
    }
  }

  const step1Valid = form.shootType && form.duration && form.headcount
  const step2Valid = form.dates[0].date && form.dates[0].timeOfDay
  const step3Valid = form.name && form.email && form.email.includes('@') && form.wantsPhotographer

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSending(true)
    setSendError('')

    const payload = {
      ...form,
      package: selectedPackage?.label || 'Studio Session',
      submittedAt: new Date().toISOString(),
    }

    // Try Seven's API first — fall back to EmailJS
    let sent = false
    try {
      const res = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) sent = true
    } catch {
      // API not live yet — fall through to EmailJS
    }

    if (!sent) {
      try {
        const emailData = {
          name: form.name,
          email: form.email,
          phone: '',
          preferredContact: 'Email',
          date: form.dates[0]?.date || '',
          message: `Shoot Type: ${form.shootType}\nDuration: ${form.duration}\nHeadcount: ${form.headcount}\nTime Preference: ${form.dates.map(d => `${d.date} (${d.timeOfDay})`).join(', ')}\nWants Photographer: ${form.wantsPhotographer}\nSpecial Requests: ${form.specialRequests || 'None'}`,
        }
        await sendBookingEmail(emailData, selectedPackage || { label: 'Studio Session', price: 'TBD' })
        sent = true
      } catch {
        setSendError('Failed to send. Email shotbyseven777@gmail.com directly.')
        setSending(false)
        return
      }
    }

    setSending(false)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg mx-auto text-center py-16"
      >
        <div className="font-display text-6xl text-gold mb-6">&#10003;</div>
        <h3 className="font-display text-2xl font-bold text-cream mb-3">Inquiry Sent</h3>
        <p className="text-cream/40 text-sm mb-2">
          Seven will review your request and respond to <span className="text-cream/60">{form.email}</span> within 5 minutes.
        </p>
        <p className="text-cream/25 text-xs mb-8">
          Studio rental at NoDa Art House is $60/hr, billed separately from session pricing.
        </p>
        <button
          onClick={() => { setSubmitted(false); setStep(1); setForm({ shootType: '', duration: '', headcount: '', dates: [{ ...EMPTY_DATE }], wantsPhotographer: '', name: '', email: '', specialRequests: '' }) }}
          className="font-heading text-xs tracking-[0.2em] uppercase text-gold hover:text-gold-light transition-colors"
        >
          Submit Another Inquiry
        </button>
      </motion.div>
    )
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-4 mb-10">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-4">
            <button
              onClick={() => s < step && setStep(s)}
              className={`font-heading text-[10px] tracking-[0.2em] uppercase transition-colors ${
                step === s ? 'text-gold' : s < step ? 'text-cream/40 hover:text-cream/60 cursor-pointer' : 'text-cream/15 cursor-default'
              }`}
            >
              {s === 1 ? 'Session' : s === 2 ? 'Availability' : 'Contact'}
            </button>
            {s < 3 && <span className="text-cream/15 text-xs">—</span>}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* ── STEP 1: Session Details ── */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            {/* Shoot type */}
            <div>
              <label className="font-heading text-[10px] tracking-[0.2em] uppercase text-cream/30 block mb-3">
                What type of shoot?
              </label>
              <div className="grid grid-cols-2 gap-2">
                {SHOOT_TYPES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => set('shootType', t.id)}
                    className={`text-left px-4 py-3 border transition-all duration-200 ${
                      form.shootType === t.id
                        ? 'border-gold bg-gold/5 text-cream'
                        : 'border-cream/10 text-cream/40 hover:border-gold/30 hover:text-cream/60'
                    }`}
                  >
                    <span className="font-heading text-[10px] tracking-[0.1em] uppercase block">{t.label}</span>
                    {form.shootType === t.id && (
                      <span className="text-gold/50 text-[9px] mt-1 block">{t.hint}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="font-heading text-[10px] tracking-[0.2em] uppercase text-cream/30 block mb-3">
                Estimated duration
              </label>
              <div className="grid grid-cols-2 gap-2">
                {DURATIONS.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => set('duration', d.id)}
                    className={`text-left px-4 py-3 border transition-all duration-200 ${
                      form.duration === d.id
                        ? 'border-gold bg-gold/5'
                        : 'border-cream/10 hover:border-gold/30'
                    }`}
                  >
                    <span className={`font-heading text-[10px] tracking-[0.1em] uppercase block ${form.duration === d.id ? 'text-cream' : 'text-cream/40'}`}>{d.label}</span>
                    <span className={`text-[10px] mt-0.5 block ${form.duration === d.id ? 'text-gold' : 'text-cream/20'}`}>{d.price}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Headcount */}
            <div>
              <label className="font-heading text-[10px] tracking-[0.2em] uppercase text-cream/30 block mb-3">
                How many people?
              </label>
              <div className="flex flex-wrap gap-2">
                {HEADCOUNTS.map((h) => (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => set('headcount', h.id)}
                    className={`font-heading text-[10px] tracking-[0.1em] uppercase px-4 py-2 border transition-all duration-200 ${
                      form.headcount === h.id
                        ? 'border-gold bg-gold/10 text-gold'
                        : 'border-cream/10 text-cream/30 hover:border-gold/30 hover:text-cream/50'
                    }`}
                  >
                    {h.label}
                  </button>
                ))}
              </div>
              {form.headcount === '11-20' && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-gold/60 text-xs mt-2 font-heading tracking-wider"
                >
                  ⚠ Near max studio capacity — confirm with NoDa Art House
                </motion.p>
              )}
            </div>

            <button
              type="button"
              disabled={!step1Valid}
              onClick={() => setStep(2)}
              className="w-full py-4 bg-gold text-ink font-heading text-sm tracking-widest uppercase hover:bg-gold-light transition-colors duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next — Availability
            </button>
          </motion.div>
        )}

        {/* ── STEP 2: Availability ── */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <p className="text-cream/30 text-xs font-heading tracking-wider">
              Add up to 3 preferred dates — Seven will check NoDa Art House availability for each.
            </p>

            {form.dates.map((d, i) => (
              <div key={i} className="border border-cream/10 p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-heading text-[10px] tracking-[0.2em] uppercase text-cream/30">
                    {i === 0 ? '1st Choice' : i === 1 ? '2nd Choice' : '3rd Choice'}
                  </span>
                  {i > 0 && (
                    <button
                      type="button"
                      onClick={() => removeDate(i)}
                      className="text-cream/20 hover:text-cream/50 text-xs transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <input
                  type="date"
                  value={d.date}
                  onChange={(e) => setDate(i, 'date', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full bg-transparent border-b border-cream/10 focus:border-gold py-2 text-cream outline-none transition-colors mb-3"
                />
                <div className="flex gap-2 mt-2">
                  {TIME_OF_DAY.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setDate(i, 'timeOfDay', t.id)}
                      className={`font-heading text-[10px] tracking-[0.1em] uppercase px-3 py-2 border transition-all duration-200 ${
                        d.timeOfDay === t.id
                          ? 'border-gold bg-gold/10 text-gold'
                          : 'border-cream/10 text-cream/30 hover:border-gold/30'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {form.dates.length < 3 && (
              <button
                type="button"
                onClick={addDate}
                className="font-heading text-[10px] tracking-[0.2em] uppercase text-cream/30 hover:text-gold transition-colors border border-cream/10 hover:border-gold/30 px-4 py-2 w-full"
              >
                + Add Another Date
              </button>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-4 border border-cream/10 text-cream/40 font-heading text-sm tracking-widest uppercase hover:border-cream/30 hover:text-cream/60 transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                disabled={!step2Valid}
                onClick={() => setStep(3)}
                className="flex-1 py-4 bg-gold text-ink font-heading text-sm tracking-widest uppercase hover:bg-gold-light transition-colors duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Next — Contact
              </button>
            </div>
          </motion.div>
        )}

        {/* ── STEP 3: Contact + Submit ── */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Photographer toggle */}
              <div>
                <label className="font-heading text-[10px] tracking-[0.2em] uppercase text-cream/30 block mb-3">
                  Do you also want to book Cam for photography?
                </label>
                <div className="flex flex-col gap-2">
                  {PHOTOGRAPHER_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => set('wantsPhotographer', opt.id)}
                      className={`text-left px-4 py-3 border transition-all duration-200 font-heading text-[10px] tracking-[0.1em] uppercase ${
                        form.wantsPhotographer === opt.id
                          ? 'border-gold bg-gold/10 text-gold'
                          : 'border-cream/10 text-cream/30 hover:border-gold/30 hover:text-cream/50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="font-heading text-[10px] tracking-[0.2em] uppercase text-cream/30 block mb-2">Your name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  required
                  placeholder="Your name"
                  className="w-full bg-transparent border-b border-cream/10 focus:border-gold py-3 text-cream outline-none transition-colors placeholder-cream/15"
                />
              </div>

              {/* Email */}
              <div>
                <label className="font-heading text-[10px] tracking-[0.2em] uppercase text-cream/30 block mb-2">
                  Your email — Seven will respond here
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  required
                  placeholder="your@email.com"
                  className="w-full bg-transparent border-b border-cream/10 focus:border-gold py-3 text-cream outline-none transition-colors placeholder-cream/15"
                />
              </div>

              {/* Special requests */}
              <div>
                <label className="font-heading text-[10px] tracking-[0.2em] uppercase text-cream/30 block mb-2">
                  Special requests <span className="text-cream/20 normal-case tracking-normal">(optional)</span>
                </label>
                <textarea
                  value={form.specialRequests}
                  onChange={(e) => set('specialRequests', e.target.value)}
                  rows={3}
                  placeholder="Lighting setup, backdrops, props, specific equipment..."
                  className="w-full bg-transparent border-b border-cream/10 focus:border-gold py-3 text-cream outline-none transition-colors resize-none placeholder-cream/15"
                />
              </div>

              <p className="text-cream/15 text-xs">
                Seven will check NoDa Art House availability and respond within 5 minutes. Studio rental ($60/hr) is billed separately from Cam's session pricing.
              </p>

              {sendError && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-400/80 text-xs font-heading tracking-wider"
                >
                  {sendError}
                </motion.p>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 py-4 border border-cream/10 text-cream/40 font-heading text-sm tracking-widest uppercase hover:border-cream/30 hover:text-cream/60 transition-colors"
                >
                  Back
                </button>
                <motion.button
                  type="submit"
                  disabled={sending || !step3Valid}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 py-4 bg-gold text-ink font-heading text-sm tracking-widest uppercase hover:bg-gold-light transition-colors duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {sending ? 'Sending...' : 'Submit to Seven'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}
