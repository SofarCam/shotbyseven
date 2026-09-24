import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiArrowRight, HiCalendar, HiClock, HiLocationMarker, HiPhotograph } from 'react-icons/hi'
import useSEO from '../hooks/useSEO'
import Navbar from './Navbar'
import Footer from './Footer'
import CustomCursor from './CustomCursor'
import FilmGrain from './FilmGrain'
import Breadcrumbs from './Breadcrumbs'
import { sendContactEmail } from '../utils/emailService'
import { trackLead } from '../utils/analytics'
import { HOLIDAY_MINIS, formatMiniDate, upcomingMiniDates } from '../holidayMinis'
import { BUSINESS } from '../config/business'

const BREADCRUMBS = [{ name: 'Home', path: '/' }, { name: 'Holiday Minis', path: '/holiday-minis' }]
const TIME_PREFS = ['Morning', 'Midday', 'Afternoon', 'Any time']

const faqs = [
  {
    q: 'Who can come?',
    a: `Families, couples, friends, creators, even pets. Up to ${HOLIDAY_MINIS.maxPeople} people per session.`,
  },
  {
    q: 'Will I get my photos in time for holiday cards?',
    a: `Your online gallery is delivered within ${HOLIDAY_MINIS.deliveryDays} days of the session.`,
  },
  {
    q: 'What should we wear?',
    a: 'Coordinated, not matching. Pick 2–3 colors and build around them. Avoid big logos. Check the "What to Wear" guide on the blog for more.',
  },
]

function RequestForm({ dates }) {
  const bookable = dates.length > 0
  const [form, setForm] = useState({ name: '', email: '', phone: '', date: dates[0] || '', people: '2', time: TIME_PREFS[3], notes: '' })
  const [sending, setSending] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const update = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSending(true)
    setError('')
    const message = [
      bookable ? `Holiday Mini request — ${formatMiniDate(form.date)}` : 'Holiday Mini — notify me when the date is set',
      `People: ${form.people}`,
      `Preferred time: ${form.time}`,
      '',
      form.notes || 'No additional details',
    ].join('\n')
    try {
      await sendContactEmail({ name: form.name, email: form.email, phone: form.phone, preferredContact: 'Text', message })
      trackLead({ source: 'holiday_minis' })
      fetch('/api/crm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'HOLIDAY_MINI',
          name: form.name,
          email: form.email,
          phone: form.phone,
          date: bookable ? form.date : '',
          people: form.people,
          time_preference: form.time,
          message: form.notes,
        }),
      }).catch(() => {})
      setSubmitted(true)
    } catch {
      setError(`Something went wrong. Email ${BUSINESS.email} or DM @${BUSINESS.instagramHandle}.`)
    } finally {
      setSending(false)
    }
  }

  if (submitted) {
    return (
      <div className="border border-gold/30 bg-gold/5 p-10 text-center">
        <p className="font-heading text-xs tracking-[0.25em] uppercase text-gold mb-3">You&apos;re on the list</p>
        <p className="text-cream/60 font-body">
          {bookable ? 'Expect a text or email within 24 hours to lock in your time.' : "You'll be the first to know when the date is set."}
        </p>
      </div>
    )
  }

  const input =
    'w-full bg-transparent border-b border-cream/15 focus:border-gold outline-none py-3 text-cream text-sm font-body placeholder:text-cream/20 transition-colors'
  const label = 'block font-heading text-[10px] tracking-[0.2em] uppercase text-cream/40 mb-1'

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-6">
        <div>
          <label htmlFor="hm-name" className={label}>Name</label>
          <input id="hm-name" name="name" autoComplete="name" required value={form.name} onChange={update} className={input} />
        </div>
        <div>
          <label htmlFor="hm-email" className={label}>Email</label>
          <input id="hm-email" name="email" type="email" autoComplete="email" required value={form.email} onChange={update} className={input} />
        </div>
        <div>
          <label htmlFor="hm-phone" className={label}>Phone (for time confirmations)</label>
          <input id="hm-phone" name="phone" type="tel" autoComplete="tel" value={form.phone} onChange={update} className={input} />
        </div>
        <div>
          <label htmlFor="hm-people" className={label}>How many people?</label>
          <select id="hm-people" name="people" value={form.people} onChange={update} className={`${input} bg-ink`}>
            {Array.from({ length: HOLIDAY_MINIS.maxPeople }, (_, i) => String(i + 1)).map((n) => <option key={n}>{n}</option>)}
          </select>
        </div>
        {bookable && (
          <div>
            <label htmlFor="hm-date" className={label}>Date</label>
            <select id="hm-date" name="date" value={form.date} onChange={update} className={`${input} bg-ink`}>
              {dates.map((d) => <option key={d} value={d}>{formatMiniDate(d)}</option>)}
            </select>
          </div>
        )}
        <div className={bookable ? '' : 'sm:col-span-2'}>
          <label htmlFor="hm-time" className={label}>Preferred time</label>
          <select id="hm-time" name="time" value={form.time} onChange={update} className={`${input} bg-ink`}>
            {TIME_PREFS.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="hm-notes" className={label}>Anything else? (pets, ideas, questions)</label>
        <textarea id="hm-notes" name="notes" rows={3} value={form.notes} onChange={update} className={`${input} resize-none`} />
      </div>
      {error && <p className="text-red-400/80 text-sm font-body">{error}</p>}
      <button
        type="submit"
        disabled={sending}
        className="inline-flex items-center gap-2 px-10 py-4 bg-gold text-ink font-heading text-xs tracking-[0.25em] uppercase hover:bg-gold/90 transition-colors disabled:opacity-50"
      >
        {sending ? 'Sending...' : bookable ? 'Request a Time' : 'Notify Me'} <HiArrowRight />
      </button>
      <p className="text-cream/25 text-xs font-body">
        By submitting, you agree to be contacted about Holiday Minis. See our{' '}
        <Link to="/privacy" className="underline hover:text-gold/60">Privacy Policy</Link>.
      </p>
    </form>
  )
}

export default function HolidayMinis() {
  const m = HOLIDAY_MINIS
  const dates = upcomingMiniDates()
  const bookable = dates.length > 0
  const dateLabel = bookable
    ? dates.map(formatMiniDate).join(' · ') + (m.moreDatesComing ? ' · more dates coming' : '')
    : 'Dates announced soon'

  useSEO({
    title: 'Holiday Mini Sessions in Charlotte | Shot by Seven',
    description: `Holiday mini photo sessions at NoDa Art House in Charlotte, NC: ${m.minutes} minutes, unlimited shots, ${m.photos} edited photos, $${m.price}. Families, couples, friends, and pets welcome.`,
    path: '/holiday-minis',
    breadcrumbs: BREADCRUMBS,
  })

  const details = [
    { icon: HiCalendar, text: dateLabel },
    { icon: HiClock, text: bookable ? m.timeWindow : `${m.minutes}-minute sessions` },
    { icon: HiLocationMarker, text: m.location },
    { icon: HiPhotograph, text: `Unlimited shots · ${m.photos} edited photos · gallery in ${m.deliveryDays} days` },
  ]

  return (
    <>
      <CustomCursor />
      <FilmGrain />
      <Navbar />

      <main className="bg-ink min-h-screen text-cream">
        <section className="pt-40 pb-20 px-6 lg:px-12 max-w-6xl mx-auto">
          <Breadcrumbs items={BREADCRUMBS} />
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-heading text-[10px] tracking-[0.3em] uppercase text-gold mb-5"
          >
            Limited Dates · NoDa Art House
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-cream leading-[1.05] mb-8 max-w-4xl"
          >
            Holiday <span className="italic text-gold">Mini Sessions</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-cream/50 text-lg leading-relaxed max-w-2xl mb-10 font-body"
          >
            {m.minutes} minutes in a styled holiday set with unlimited shots. Walk out with {m.photos} edited photos, ready for cards, gifts, and your feed. Families, couples, friends, and pets welcome.
          </motion.p>

          <div className="grid sm:grid-cols-2 gap-4 max-w-3xl mb-10">
            {details.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 border border-cream/10 px-5 py-4">
                <Icon className="text-gold text-lg shrink-0" />
                <span className="text-cream/70 text-sm font-body">{text}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <p className="font-display text-5xl font-bold text-cream">${m.price}</p>
            {bookable && m.checkoutUrl ? (
              <a
                href={m.checkoutUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-10 py-4 bg-gold text-ink font-heading text-xs tracking-[0.25em] uppercase hover:bg-gold/90 transition-colors"
              >
                Reserve Your Spot <HiArrowRight />
              </a>
            ) : (
              <a
                href="#request"
                className="inline-flex items-center gap-2 px-10 py-4 bg-gold text-ink font-heading text-xs tracking-[0.25em] uppercase hover:bg-gold/90 transition-colors"
              >
                {bookable ? 'Request a Time' : 'Get Notified'} <HiArrowRight />
              </a>
            )}
          </div>
        </section>

        <section id="request" className="py-24 bg-warm-black scroll-mt-24">
          <div className="max-w-3xl mx-auto px-6 lg:px-12">
            <p className="font-heading text-[10px] tracking-[0.3em] uppercase text-gold mb-4">
              {bookable ? 'Save Your Spot' : 'Be First in Line'}
            </p>
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-cream mb-4">
              {bookable ? 'Request a Time' : 'Get Notified When Booking Opens'}
            </h2>
            <p className="text-cream/40 font-body mb-10">
              {bookable
                ? 'Slots go in order of requests. You’ll get a text or email to confirm your exact time.'
                : 'Holiday dates are limited. Join the list and you’ll hear first.'}
            </p>
            <RequestForm dates={dates} />
          </div>
        </section>

        <section className="py-24 px-6 lg:px-12 max-w-3xl mx-auto">
          <p className="font-heading text-[10px] tracking-[0.3em] uppercase text-gold mb-4">Questions</p>
          <h2 className="font-display text-4xl font-bold text-cream mb-10">FAQ</h2>
          <div className="space-y-8">
            {faqs.map((f) => (
              <div key={f.q}>
                <h3 className="font-heading text-sm tracking-wide text-cream/85 mb-2">{f.q}</h3>
                <p className="text-cream/50 text-sm leading-relaxed font-body">{f.a}</p>
              </div>
            ))}
          </div>
          <p className="text-cream/30 text-sm font-body mt-12">
            Looking for a full session instead? <Link to="/#smart-booking" className="text-gold/70 hover:text-gold underline underline-offset-4">Book here</Link>.
          </p>
        </section>
      </main>

      <Footer />
    </>
  )
}
