import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { HiArrowRight } from 'react-icons/hi'
import useSEO from '../hooks/useSEO'
import Navbar from './Navbar'
import Footer from './Footer'
import CustomCursor from './CustomCursor'
import FilmGrain from './FilmGrain'
import Breadcrumbs from './Breadcrumbs'
import { sendContactEmail } from '../utils/emailService'
import { trackLead } from '../utils/analytics'
import { BUSINESS } from '../config/business'

const BREADCRUMBS = [{ name: 'Home', path: '/' }, { name: 'Seven System', path: '/system' }]

const tiers = [
  {
    id: 'starter',
    name: 'Starter',
    setup: '$199',
    monthly: '$39/mo',
    pitch: 'For creatives who live on Instagram and just need the link to work.',
    includes: ['Link-in-bio page in your brand', 'Booking request form', 'Deposit payment link'],
  },
  {
    id: 'pro',
    name: 'Pro',
    setup: '$499',
    monthly: '$79/mo',
    pitch: 'A full website that books, collects deposits, and handles paperwork for you.',
    includes: [
      'Full website',
      'Booking with deposits',
      'Contracts with e-signature',
      'Client portal',
      'Lead tracker (every inquiry logged)',
    ],
    featured: true,
  },
  {
    id: 'pro-ai',
    name: 'Pro + AI',
    setup: '$699',
    monthly: '$119/mo',
    pitch: 'Everything in Pro, plus AI that answers DMs and drafts your posts.',
    includes: ['Everything in Pro', 'AI Instagram DM auto-responder', 'Content engine: captions in your voice'],
  },
]

const signature = {
  name: 'Signature',
  setup: '$3,500',
  monthly: '$299/mo',
  includes: [
    'Everything in Pro + AI',
    'A brand photo shoot with me (2 hrs, 40 edited photos), so your site is built on your own photos, not stock',
    'A custom design with its own signature feel',
    'Google Business Profile set up and optimized',
    '30 days of launch content from the shoot',
    'A monthly 1:1 strategy call',
  ],
}

// Features that already run shotbyseven.com, so prospects can try them live.
const proof = [
  { label: 'Link-in-bio page', to: '/links' },
  { label: 'Booking with deposits', to: '/#smart-booking' },
  { label: 'Client portal', to: '/portal' },
  { label: 'Digital product shop', to: '/shop' },
]

const faqs = [
  {
    q: 'Who is this for?',
    a: 'Service businesses that run on Instagram and bookings: photographers, makeup artists, stylists, nail techs, barbers, trainers, and other creatives.',
  },
  {
    q: 'What does the monthly fee cover?',
    a: 'Hosting, keeping everything running, and small updates like new prices, photos, or dates. You pay your own domain (about $12 a year) and Stripe’s standard card fees.',
  },
  {
    q: 'Can’t swing the setup fee?',
    a: 'Choose no setup fee with a 6-month minimum on the monthly plan instead.',
  },
  {
    q: 'How long does a build take?',
    a: 'It depends on the tier and how quickly you send your photos, prices, and details. Apply and you’ll get a timeline on the call.',
  },
]

function Section({ children, className = '' }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function FAQItem({ item }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-cream/10 last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="w-full flex items-center justify-between py-5 gap-4 text-left group"
      >
        <span className="font-heading text-sm tracking-wide text-cream/80 group-hover:text-cream transition-colors">{item.q}</span>
        <span className="shrink-0 text-gold/60 group-hover:text-gold transition-colors text-lg">{open ? '−' : '+'}</span>
      </button>
      {open && <p className="pb-5 text-cream/50 text-sm leading-relaxed font-body">{item.a}</p>}
    </div>
  )
}

const TIER_OPTIONS = ['Starter', 'Pro', 'Pro + AI', 'Signature', 'Not sure yet']

function ApplyForm() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    instagramHandle: '',
    business: '',
    tier: 'Not sure yet',
    website: '',
    timeSink: '',
  })
  const [sending, setSending] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const update = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  const handle = form.instagramHandle.replace(/^@/, '').trim()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSending(true)
    setError('')
    const message = [
      `Seven System application: ${form.tier}`,
      `Business: ${form.business}`,
      `Current site: ${form.website || 'None'}`,
      '',
      `Biggest time sink: ${form.timeSink || 'Not given'}`,
    ].join('\n')
    try {
      await sendContactEmail({
        name: form.name,
        email: form.email,
        instagramHandle: handle,
        preferredContact: 'Email',
        message,
      })
      trackLead({ source: 'seven_system', tier: form.tier })
      fetch('/api/crm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'SEVEN_SYSTEM',
          name: form.name,
          email: form.email,
          instagram: handle ? `@${handle}` : '',
          business: form.business,
          tier: form.tier,
          website: form.website,
          message: form.timeSink,
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
        <p className="font-heading text-xs tracking-[0.25em] uppercase text-gold mb-3">Application in</p>
        <p className="text-cream/60 font-body">You&apos;ll hear back within 24 hours to set up a quick call.</p>
      </div>
    )
  }

  const inputClass =
    'w-full bg-transparent border-b border-cream/15 focus:border-gold outline-none py-3 text-cream text-sm font-body placeholder:text-cream/20 transition-colors'
  const labelClass = 'block font-heading text-[10px] tracking-[0.2em] uppercase text-cream/40 mb-1'

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-6">
        <div>
          <label htmlFor="ss-name" className={labelClass}>Name</label>
          <input id="ss-name" name="name" autoComplete="name" required value={form.name} onChange={update} className={inputClass} />
        </div>
        <div>
          <label htmlFor="ss-email" className={labelClass}>Email</label>
          <input id="ss-email" name="email" type="email" autoComplete="email" required value={form.email} onChange={update} className={inputClass} />
        </div>
        <div>
          <label htmlFor="ss-ig" className={labelClass}>Instagram handle</label>
          <input id="ss-ig" name="instagramHandle" placeholder="@yourbusiness" value={form.instagramHandle} onChange={update} className={inputClass} />
        </div>
        <div>
          <label htmlFor="ss-business" className={labelClass}>What&apos;s your business?</label>
          <input id="ss-business" name="business" required placeholder="Makeup artist, barber, trainer..." value={form.business} onChange={update} className={inputClass} />
        </div>
        <div>
          <label htmlFor="ss-tier" className={labelClass}>Tier</label>
          <select id="ss-tier" name="tier" value={form.tier} onChange={update} className={`${inputClass} bg-ink`}>
            {TIER_OPTIONS.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="ss-site" className={labelClass}>Current website (if any)</label>
          <input id="ss-site" name="website" placeholder="yoursite.com" value={form.website} onChange={update} className={inputClass} />
        </div>
      </div>
      <div>
        <label htmlFor="ss-sink" className={labelClass}>What eats most of your time right now?</label>
        <textarea id="ss-sink" name="timeSink" rows={3} placeholder="Answering DMs, chasing deposits, posting..." value={form.timeSink} onChange={update} className={`${inputClass} resize-none`} />
      </div>
      {error && <p className="text-red-400/80 text-sm font-body">{error}</p>}
      <button
        type="submit"
        disabled={sending}
        className="inline-flex items-center gap-2 px-10 py-4 bg-gold text-ink font-heading text-xs tracking-[0.25em] uppercase hover:bg-gold/90 transition-colors disabled:opacity-50"
      >
        {sending ? 'Sending...' : 'Apply'} <HiArrowRight />
      </button>
      <p className="text-cream/25 text-xs font-body">
        By submitting, you agree to be contacted about your application. See our{' '}
        <Link to="/privacy" className="underline hover:text-gold/60">Privacy Policy</Link>.
      </p>
    </form>
  )
}

export default function SevenSystem() {
  useSEO({
    title: 'Seven System: Websites & Booking Automation for Creatives | Shot by Seven',
    description:
      'Done-for-you websites with booking, deposits, contracts, and AI DM replies for photographers, makeup artists, stylists, and other creatives. From $199 setup.',
    path: '/system',
    breadcrumbs: BREADCRUMBS,
  })

  return (
    <>
      <CustomCursor />
      <FilmGrain />
      <Navbar />

      <main className="bg-ink min-h-screen text-cream">
        {/* Hero */}
        <section className="relative pt-40 pb-24 px-6 lg:px-12 max-w-6xl mx-auto">
          <Breadcrumbs items={BREADCRUMBS} />
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-heading text-[10px] tracking-[0.3em] uppercase text-gold mb-5"
          >
            Seven System · For Creatives Who Book Clients
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-cream leading-[1.05] mb-8 max-w-4xl"
          >
            Your Business,<br />
            <span className="italic text-gold">Running Without You</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-cream/50 text-lg leading-relaxed max-w-2xl mb-10 font-body"
          >
            A website that takes bookings, collects deposits, sends contracts, and answers DMs while you work. The same system that runs this site, built for your business.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <a
              href="#tiers"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gold text-ink font-heading text-xs tracking-[0.25em] uppercase hover:bg-gold/90 transition-colors"
            >
              See Pricing <HiArrowRight />
            </a>
            <a
              href="#apply"
              className="inline-flex items-center gap-2 px-8 py-4 border border-cream/20 text-cream/70 font-heading text-xs tracking-[0.25em] uppercase hover:border-gold/50 hover:text-cream transition-all"
            >
              Apply
            </a>
          </motion.div>
        </section>

        {/* Proof: this site */}
        <section className="py-20 bg-warm-black">
          <div className="max-w-6xl mx-auto px-6 lg:px-12">
            <Section>
              <p className="font-heading text-[10px] tracking-[0.3em] uppercase text-gold mb-4">Try It First</p>
              <h2 className="font-display text-3xl lg:text-4xl font-bold text-cream mb-4">You&apos;re looking at it</h2>
              <p className="text-cream/50 font-body max-w-2xl mb-8">
                Every feature below runs Shot by Seven today. Click through them the way your clients would.
              </p>
              <div className="flex flex-wrap gap-3">
                {proof.map((p) => (
                  <Link
                    key={p.label}
                    to={p.to}
                    className="inline-flex items-center gap-2 px-6 py-3 border border-cream/15 text-cream/70 font-heading text-[11px] tracking-[0.2em] uppercase hover:border-gold/50 hover:text-cream transition-all"
                  >
                    {p.label} <HiArrowRight />
                  </Link>
                ))}
              </div>
            </Section>
          </div>
        </section>

        {/* Tiers */}
        <section id="tiers" className="py-24 px-6 lg:px-12 max-w-6xl mx-auto scroll-mt-24">
          <Section className="mb-14">
            <p className="font-heading text-[10px] tracking-[0.3em] uppercase text-gold mb-4">Pricing</p>
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-cream">Pick Your Setup</h2>
          </Section>
          <div className="grid lg:grid-cols-3 gap-6">
            {tiers.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className={`flex flex-col p-8 border ${t.featured ? 'border-gold/40 bg-gold/5' : 'border-cream/10'}`}
              >
                {t.featured && (
                  <span className="self-start font-heading text-[9px] tracking-[0.15em] uppercase text-ink bg-gold px-2 py-0.5 mb-4">
                    Most Popular
                  </span>
                )}
                <h3 className="font-display text-2xl font-bold text-cream mb-3">{t.name}</h3>
                <p className="font-display text-4xl font-bold text-cream">{t.setup}</p>
                <p className="font-heading text-[10px] tracking-[0.15em] uppercase text-cream/30 mb-5">setup · then {t.monthly}</p>
                <p className="text-cream/50 text-sm leading-relaxed font-body mb-6">{t.pitch}</p>
                <ul className="space-y-2 text-sm font-body text-cream/60 mb-8 flex-1">
                  {t.includes.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="text-gold">✦</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <a
                  href="#apply"
                  className={`inline-flex items-center justify-center gap-2 w-full px-6 py-3.5 font-heading text-xs tracking-[0.2em] uppercase transition-colors ${
                    t.featured ? 'bg-gold text-ink hover:bg-gold/90' : 'border border-cream/20 text-cream/80 hover:border-gold/50 hover:text-cream'
                  }`}
                >
                  Apply for {t.name} <HiArrowRight />
                </a>
              </motion.div>
            ))}
          </div>
          <p className="text-cream/35 text-sm font-body mt-6">No setup fee option: 6-month minimum on any monthly plan.</p>

          {/* Signature */}
          <Section className="mt-14">
            <div className="border border-gold/40 bg-gradient-to-br from-gold/10 to-transparent p-8 lg:p-12 grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-10">
              <div>
                <p className="font-heading text-[10px] tracking-[0.3em] uppercase text-gold mb-4">The Top Tier</p>
                <h3 className="font-display text-4xl font-bold text-cream mb-3">{signature.name}</h3>
                <p className="font-display text-4xl font-bold text-gold">{signature.setup}</p>
                <p className="font-heading text-[10px] tracking-[0.15em] uppercase text-cream/30 mb-6">setup · then {signature.monthly}</p>
                <p className="text-cream/55 font-body leading-relaxed mb-8">
                  A photographer builds your brand from the photos up: the shoot, the site, the launch content, and a monthly strategy call to keep it growing.
                </p>
                <a
                  href="#apply"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gold text-ink font-heading text-xs tracking-[0.25em] uppercase hover:bg-gold/90 transition-colors"
                >
                  Apply for Signature <HiArrowRight />
                </a>
              </div>
              <ul className="space-y-3 text-sm font-body text-cream/65 self-center">
                {signature.includes.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="text-gold">✦</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </Section>
        </section>

        {/* Apply */}
        <section id="apply" className="py-24 bg-warm-black scroll-mt-24">
          <div className="max-w-3xl mx-auto px-6 lg:px-12">
            <Section className="mb-10">
              <p className="font-heading text-[10px] tracking-[0.3em] uppercase text-gold mb-4">Apply</p>
              <h2 className="font-display text-4xl lg:text-5xl font-bold text-cream mb-4">Let&apos;s Build Yours</h2>
              <p className="text-cream/40 font-body">Tell me about your business. Replies within 24 hours.</p>
            </Section>
            <ApplyForm />
          </div>
        </section>

        {/* FAQ */}
        <section className="py-24">
          <div className="max-w-3xl mx-auto px-6 lg:px-12">
            <Section className="mb-12">
              <p className="font-heading text-[10px] tracking-[0.3em] uppercase text-gold mb-4">Questions</p>
              <h2 className="font-display text-4xl lg:text-5xl font-bold text-cream">FAQ</h2>
            </Section>
            <div className="border-t border-cream/10">
              {faqs.map((item) => (
                <FAQItem key={item.q} item={item} />
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
