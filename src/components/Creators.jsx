import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { HiArrowRight, HiCamera, HiFilm, HiSparkles, HiRefresh } from 'react-icons/hi'
import useSEO from '../hooks/useSEO'
import Navbar from './Navbar'
import Footer from './Footer'
import CustomCursor from './CustomCursor'
import FilmGrain from './FilmGrain'
import Breadcrumbs from './Breadcrumbs'
import { sendContactEmail } from '../utils/emailService'
import { trackLead } from '../utils/analytics'
import { BUSINESS } from '../config/business'

const BREADCRUMBS = [{ name: 'Home', path: '/' }, { name: 'Creators', path: '/creators' }]

// Stripe Payment Links, set in Vercel. When a link isn't configured yet the
// button scrolls to the request form instead, so the page never dead-ends.
const CHECKOUT = {
  mini: import.meta.env.VITE_STRIPE_CREATOR_MINI_URL,
  seven77: import.meta.env.VITE_STRIPE_777_URL,
  membership: import.meta.env.VITE_STRIPE_MEMBERSHIP_URL,
  motion: import.meta.env.VITE_STRIPE_MOTION_URL,
  reels: import.meta.env.VITE_STRIPE_REELS_URL,
}

const offers = [
  {
    id: 'mini',
    icon: HiCamera,
    name: 'Creator Mini',
    price: '$149',
    cadence: 'one session',
    pitch: 'A fast refresh for your feed. Walk in, get directed, walk out with a new set.',
    includes: ['30-minute session', '15 edited photos', '1 look', 'Online gallery within 7 days'],
    cta: 'Book a Creator Mini',
  },
  {
    id: 'seven77',
    icon: HiSparkles,
    name: 'The 777',
    price: '$777',
    cadence: 'one session',
    pitch: 'The signature experience: a full editorial shoot plus a month of content written in your voice.',
    includes: [
      '15-min pre-shoot alignment call',
      '90-minute session, studio or outdoor',
      '77 images to choose from',
      '7 fully retouched selects',
      '30 days of captions in your voice',
      '7-day delivery',
    ],
    cta: 'Book The 777',
    featured: true,
  },
  {
    id: 'membership',
    icon: HiRefresh,
    name: 'Creator Membership',
    price: '$950',
    cadence: 'per month · 3-month minimum',
    pitch: 'Fresh content every month without thinking about it. For creators who post constantly.',
    includes: [
      'One shoot per month (up to 2 hrs)',
      '40 edited photos per month',
      '4 edited vertical reels per month',
      'Monthly caption pack in your voice',
      'Priority booking',
    ],
    cta: 'Start a Membership',
  },
]

const addOns = [
  { id: 'motion', name: 'Motion', price: '+$75', desc: '5 raw vertical clips from your session: ready to cut into reels in CapCut.' },
  { id: 'reels', name: 'Reel Pack', price: '+$195', desc: '3 fully edited vertical reels, cut to music with captions.' },
]

const faqs = [
  {
    q: 'Where do sessions happen?',
    a: `Studio A at NoDa Art House (${BUSINESS.studio.street}, ${BUSINESS.studio.city}) or on location around Charlotte. Studio time on regular sessions is billed separately at $60/hr.`,
  },
  {
    q: 'What does "captions in your voice" mean?',
    a: 'You share a handful of your past posts. Shot by Seven\'s Content Engine studies how you write, then drafts captions, hooks, and post ideas from your new photos that sound like you, not like a generic AI.',
  },
  {
    q: 'How does the membership work?',
    a: 'You\'re billed monthly with a 3-month minimum. Each month we book one shoot, and your photos, reels, and captions arrive together. After three months it continues month to month until you cancel.',
  },
  {
    q: 'Can I add video to a single session?',
    a: 'Yes. Add Motion for raw vertical clips you edit yourself, or the Reel Pack for finished reels.',
  },
  {
    q: 'Do you do free collabs?',
    a: 'A limited number each month, with creators whose audience is a genuine fit. Apply below; every application gets read.',
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

function CheckoutButton({ id, children, featured }) {
  const url = CHECKOUT[id]
  const className = `inline-flex items-center justify-center gap-2 w-full px-6 py-3.5 font-heading text-xs tracking-[0.2em] uppercase transition-colors ${
    featured ? 'bg-gold text-ink hover:bg-gold/90' : 'border border-cream/20 text-cream/80 hover:border-gold/50 hover:text-cream'
  }`
  if (url) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className={className}>
        {children} <HiArrowRight />
      </a>
    )
  }
  return (
    <a href="#request" className={className}>
      {children} <HiArrowRight />
    </a>
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

const REQUEST_TYPES = ['Creator Mini', 'The 777', 'Creator Membership', 'Collab application']
const AUDIENCE_SIZES = ['Under 1K', '1K–5K', '5K–20K', '20K–100K', '100K+']

function RequestForm() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    instagramHandle: '',
    audience: AUDIENCE_SIZES[1],
    type: REQUEST_TYPES[0],
    niche: '',
    message: '',
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
      `Request: ${form.type}`,
      `Audience: ${form.audience}`,
      `Niche: ${form.niche || 'Not given'}`,
      '',
      form.message || 'No additional details',
    ].join('\n')

    try {
      await sendContactEmail({
        name: form.name,
        email: form.email,
        instagramHandle: handle,
        preferredContact: 'Instagram DM',
        message,
      })
      trackLead({ source: 'creators', request_type: form.type })
      fetch('/api/crm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: form.type === 'Collab application' ? 'COLLAB' : 'CREATOR_LEAD',
          name: form.name,
          email: form.email,
          instagram: handle ? `@${handle}` : '',
          audience: form.audience,
          niche: form.niche,
          request: form.type,
          message: form.message,
        }),
      }).catch(() => {})
      setSubmitted(true)
    } catch {
      setError(`Something went wrong. DM @${BUSINESS.instagramHandle} on Instagram or email ${BUSINESS.email}.`)
    } finally {
      setSending(false)
    }
  }

  if (submitted) {
    return (
      <div className="border border-gold/30 bg-gold/5 p-10 text-center">
        <p className="font-heading text-xs tracking-[0.25em] uppercase text-gold mb-3">Got it</p>
        <p className="text-cream/60 font-body">
          Your request is in. Expect a reply by Instagram DM or email within 24 hours.
        </p>
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
          <label htmlFor="cr-name" className={labelClass}>Name</label>
          <input id="cr-name" name="name" autoComplete="name" required value={form.name} onChange={update} className={inputClass} />
        </div>
        <div>
          <label htmlFor="cr-email" className={labelClass}>Email</label>
          <input id="cr-email" name="email" type="email" autoComplete="email" required value={form.email} onChange={update} className={inputClass} />
        </div>
        <div>
          <label htmlFor="cr-ig" className={labelClass}>Instagram handle</label>
          <input id="cr-ig" name="instagramHandle" required placeholder="@yourhandle" value={form.instagramHandle} onChange={update} className={inputClass} />
        </div>
        <div>
          <label htmlFor="cr-audience" className={labelClass}>Audience size</label>
          <select id="cr-audience" name="audience" value={form.audience} onChange={update} className={`${inputClass} bg-ink`}>
            {AUDIENCE_SIZES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="cr-type" className={labelClass}>I&apos;m interested in</label>
          <select id="cr-type" name="type" value={form.type} onChange={update} className={`${inputClass} bg-ink`}>
            {REQUEST_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="cr-niche" className={labelClass}>Your niche</label>
          <input id="cr-niche" name="niche" placeholder="Fashion, fitness, beauty, music..." value={form.niche} onChange={update} className={inputClass} />
        </div>
      </div>
      <div>
        <label htmlFor="cr-message" className={labelClass}>
          {form.type === 'Collab application' ? 'Pitch the collab: concept + what you’ll post' : 'Anything else? Dates, ideas, links'}
        </label>
        <textarea id="cr-message" name="message" rows={4} value={form.message} onChange={update} className={`${inputClass} resize-none`} />
      </div>
      {error && <p className="text-red-400/80 text-sm font-body">{error}</p>}
      <button
        type="submit"
        disabled={sending}
        className="inline-flex items-center gap-2 px-10 py-4 bg-gold text-ink font-heading text-xs tracking-[0.25em] uppercase hover:bg-gold/90 transition-colors disabled:opacity-50"
      >
        {sending ? 'Sending...' : 'Send Request'} <HiArrowRight />
      </button>
      <p className="text-cream/25 text-xs font-body">
        By submitting, you agree to be contacted about your request. See our{' '}
        <Link to="/privacy" className="underline hover:text-gold/60">Privacy Policy</Link>.
      </p>
    </form>
  )
}

export default function Creators() {
  useSEO({
    title: 'Content Creator Photography & Video in Charlotte | Shot by Seven',
    description:
      'Photo and short-form video for content creators in Charlotte, NC. Creator Minis from $149, The 777 editorial experience, and a monthly Creator Membership with captions written in your voice.',
    path: '/creators',
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
            Charlotte, NC · For Content Creators
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-cream leading-[1.05] mb-8 max-w-4xl"
          >
            Content That Looks Like<br />
            <span className="italic text-gold">You Made It Big</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-cream/50 text-lg leading-relaxed max-w-2xl mb-10 font-body"
          >
            Editorial photos, vertical video, and captions written in your voice, built for creators who post a lot and want every post to hit. Book one session or get fresh content every month.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <a
              href="#offers"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gold text-ink font-heading text-xs tracking-[0.25em] uppercase hover:bg-gold/90 transition-colors"
            >
              See Packages <HiArrowRight />
            </a>
            <a
              href="#collabs"
              className="inline-flex items-center gap-2 px-8 py-4 border border-cream/20 text-cream/70 font-heading text-xs tracking-[0.25em] uppercase hover:border-gold/50 hover:text-cream transition-all"
            >
              Apply to Collab
            </a>
          </motion.div>
        </section>

        {/* Offers */}
        <section id="offers" className="py-24 bg-warm-black scroll-mt-24">
          <div className="max-w-6xl mx-auto px-6 lg:px-12">
            <Section className="mb-14">
              <p className="font-heading text-[10px] tracking-[0.3em] uppercase text-gold mb-4">Packages</p>
              <h2 className="font-display text-4xl lg:text-5xl font-bold text-cream">Pick Your Level</h2>
            </Section>
            <div className="grid lg:grid-cols-3 gap-6">
              {offers.map((o, i) => {
                const Icon = o.icon
                return (
                  <motion.div
                    key={o.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.6 }}
                    className={`flex flex-col p-8 border ${o.featured ? 'border-gold/40 bg-gold/5' : 'border-cream/10'}`}
                  >
                    {o.featured && (
                      <span className="self-start font-heading text-[9px] tracking-[0.15em] uppercase text-ink bg-gold px-2 py-0.5 mb-4">
                        Signature
                      </span>
                    )}
                    <Icon className="text-gold text-2xl mb-5" />
                    <h3 className="font-display text-2xl font-bold text-cream mb-1">{o.name}</h3>
                    <p className="font-display text-4xl font-bold text-cream mt-3">{o.price}</p>
                    <p className="font-heading text-[10px] tracking-[0.15em] uppercase text-cream/30 mb-5">{o.cadence}</p>
                    <p className="text-cream/50 text-sm leading-relaxed font-body mb-6">{o.pitch}</p>
                    <ul className="space-y-2 text-sm font-body text-cream/60 mb-8 flex-1">
                      {o.includes.map((item) => (
                        <li key={item} className="flex gap-2">
                          <span className="text-gold">✦</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                    <CheckoutButton id={o.id} featured={o.featured}>{o.cta}</CheckoutButton>
                  </motion.div>
                )
              })}
            </div>

            {/* Add-ons */}
            <Section className="mt-14">
              <div className="flex items-center gap-3 mb-6">
                <HiFilm className="text-gold text-xl" />
                <h3 className="font-display text-2xl font-bold text-cream">Add Video to Any Session</h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                {addOns.map((a) => (
                  <div key={a.id} className="border border-cream/10 p-6 flex flex-col">
                    <div className="flex items-baseline justify-between mb-2">
                      <p className="font-display text-xl font-bold text-cream">{a.name}</p>
                      <p className="font-display text-xl font-bold text-gold">{a.price}</p>
                    </div>
                    <p className="text-cream/45 text-sm font-body mb-5 flex-1">{a.desc}</p>
                    <CheckoutButton id={a.id}>Add {a.name}</CheckoutButton>
                  </div>
                ))}
              </div>
            </Section>
          </div>
        </section>

        {/* Proof */}
        <section className="py-24 px-6 lg:px-12 max-w-6xl mx-auto">
          <Section>
            <p className="font-heading text-[10px] tracking-[0.3em] uppercase text-gold mb-4">Recent Work</p>
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-cream mb-6">See It Before You Book</h2>
            <p className="text-cream/50 font-body max-w-2xl mb-8">
              Real shoots, start to finish: the concept, the setup, and what came out of it.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/blog/court-couture-jersey-editorial"
                className="inline-flex items-center gap-2 px-7 py-3 border border-cream/20 text-cream/70 font-heading text-xs tracking-[0.2em] uppercase hover:border-gold/50 hover:text-cream transition-all"
              >
                Court Couture <HiArrowRight />
              </Link>
              <Link
                to="/blog/petal-and-shadow-rose-studio-shoot"
                className="inline-flex items-center gap-2 px-7 py-3 border border-cream/20 text-cream/70 font-heading text-xs tracking-[0.2em] uppercase hover:border-gold/50 hover:text-cream transition-all"
              >
                Petal &amp; Shadow <HiArrowRight />
              </Link>
              <Link
                to="/#gallery"
                className="inline-flex items-center gap-2 px-7 py-3 border border-cream/20 text-cream/70 font-heading text-xs tracking-[0.2em] uppercase hover:border-gold/50 hover:text-cream transition-all"
              >
                Full Portfolio <HiArrowRight />
              </Link>
            </div>
          </Section>
        </section>

        {/* Collabs */}
        <section id="collabs" className="py-24 bg-warm-black scroll-mt-24">
          <div className="max-w-6xl mx-auto px-6 lg:px-12">
            <Section className="max-w-3xl">
              <p className="font-heading text-[10px] tracking-[0.3em] uppercase text-gold mb-4">Collabs</p>
              <h2 className="font-display text-4xl lg:text-5xl font-bold text-cream mb-6">Let&apos;s Make Something Together</h2>
              <p className="text-cream/50 font-body leading-relaxed mb-8">
                I take on a small number of collab shoots each month with creators whose audience is a genuine fit. If we collab, here&apos;s the deal:
              </p>
              <ul className="space-y-3 text-cream/60 font-body text-sm">
                <li className="flex gap-3"><span className="text-gold">✦</span>We plan a concept together: something we&apos;re both proud to post</li>
                <li className="flex gap-3"><span className="text-gold">✦</span>You get a set of edited photos from the shoot</li>
                <li className="flex gap-3"><span className="text-gold">✦</span>We post it as an Instagram collab post, plus a story tag</li>
                <li className="flex gap-3"><span className="text-gold">✦</span>Engaged audiences matter more than follower count</li>
              </ul>
              <p className="text-cream/30 text-sm font-body mt-8">
                Apply with the form below and choose &ldquo;Collab application.&rdquo;
              </p>
            </Section>
          </div>
        </section>

        {/* Request form */}
        <section id="request" className="py-24 px-6 lg:px-12 max-w-3xl mx-auto scroll-mt-24">
          <Section className="mb-10">
            <p className="font-heading text-[10px] tracking-[0.3em] uppercase text-gold mb-4">Get Started</p>
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-cream mb-4">Request Your Spot</h2>
            <p className="text-cream/40 font-body">Booking a package or pitching a collab: start here. Replies within 24 hours.</p>
          </Section>
          <RequestForm />
        </section>

        {/* FAQ */}
        <section className="py-24 bg-warm-black">
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
