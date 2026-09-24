import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { HiArrowRight, HiDownload } from 'react-icons/hi'
import useSEO from '../hooks/useSEO'
import Navbar from './Navbar'
import Footer from './Footer'
import CustomCursor from './CustomCursor'
import FilmGrain from './FilmGrain'
import Breadcrumbs from './Breadcrumbs'
import { sendContactEmail } from '../utils/emailService'
import { trackLead, trackEvent } from '../utils/analytics'
import { FREE_GUIDE, PRODUCTS } from '../shopConfig'

const BREADCRUMBS = [{ name: 'Home', path: '/' }, { name: 'Shop', path: '/shop' }]

const faqs = [
  {
    q: 'How do I get my guide after I buy?',
    a: 'Right after checkout you land on a download page. Bookmark it: the download link on that page keeps working. Stripe also emails you a receipt.',
  },
  {
    q: 'Is it a printed book?',
    a: 'No, every guide is a PDF. It works on your phone, tablet, or computer, and you can print it.',
  },
  {
    q: 'Who are the guides for?',
    a: 'New models, content creators, and anyone who freezes up in front of a camera. Everything in them comes from real shoots.',
  },
]

function Section({ children, className = '', id }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div
      ref={ref}
      id={id}
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

const inputClass =
  'w-full bg-transparent border-b border-cream/15 focus:border-gold outline-none py-3 text-cream text-sm font-body placeholder:text-cream/20 transition-colors'
const labelClass = 'block font-heading text-[10px] tracking-[0.2em] uppercase text-cream/40 mb-1'

// Shared email capture for the free guide and paid-product waitlists.
// `kind` is 'free' (free guide) or 'waitlist' (paid product not on sale yet).
function EmailCapture({ kind, product, idPrefix, cta, success }) {
  const [form, setForm] = useState({ name: '', email: '' })
  const [sending, setSending] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const update = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSending(true)
    setError('')
    const label = kind === 'free' ? `Free guide: ${product.name}` : `Waitlist: ${product.name}`
    try {
      await sendContactEmail({
        name: form.name,
        email: form.email,
        preferredContact: 'Email',
        message: `${label}\n\nSigned up on /shop.`,
      })
      trackLead({ source: 'shop', product: product.slug, kind })
      fetch('/api/crm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: kind === 'free' ? 'FREE_GUIDE' : 'SHOP_WAITLIST',
          name: form.name,
          email: form.email,
          product: product.slug,
        }),
      }).catch(() => {})
      setSubmitted(true)
    } catch {
      setError('Something went wrong. Email shotbyseven777@gmail.com or DM @shotbyseven777.')
    } finally {
      setSending(false)
    }
  }

  if (submitted) return success

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor={`${idPrefix}-name`} className={labelClass}>First name</label>
          <input id={`${idPrefix}-name`} name="name" autoComplete="given-name" required value={form.name} onChange={update} className={inputClass} />
        </div>
        <div>
          <label htmlFor={`${idPrefix}-email`} className={labelClass}>Email</label>
          <input id={`${idPrefix}-email`} name="email" type="email" autoComplete="email" required value={form.email} onChange={update} className={inputClass} />
        </div>
      </div>
      {error && <p className="text-red-400/80 text-sm font-body">{error}</p>}
      <button
        type="submit"
        disabled={sending}
        className="inline-flex items-center gap-2 px-8 py-4 bg-gold text-ink font-heading text-xs tracking-[0.25em] uppercase hover:bg-gold/90 transition-colors disabled:opacity-50"
      >
        {sending ? 'Sending...' : cta} <HiArrowRight />
      </button>
      <p className="text-cream/25 text-xs font-body">
        You&apos;ll also get occasional emails about new guides and open shoot dates. Unsubscribe anytime. See our{' '}
        <Link to="/privacy" className="underline hover:text-gold/60">Privacy Policy</Link>.
      </p>
    </form>
  )
}

function FreeGuideSuccess() {
  return (
    <div className="border border-gold/30 bg-gold/5 p-8">
      <p className="font-heading text-xs tracking-[0.25em] uppercase text-gold mb-3">
        {FREE_GUIDE.available ? 'It’s yours' : 'You’re on the list'}
      </p>
      {FREE_GUIDE.available ? (
        <>
          <p className="text-cream/60 font-body mb-6">Download it now, and try two or three poses in the mirror this week.</p>
          <a
            href={FREE_GUIDE.fileUrl}
            download
            onClick={() => trackEvent('free_guide_download')}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gold text-ink font-heading text-xs tracking-[0.25em] uppercase hover:bg-gold/90 transition-colors"
          >
            Download the Guide <HiDownload />
          </a>
        </>
      ) : (
        <p className="text-cream/60 font-body">
          The guide is getting its final illustrations. You&apos;ll get it by email the day it&apos;s live.
        </p>
      )}
      <p className="text-cream/40 text-sm font-body mt-6">
        Want all 40 poses?{' '}
        <a href="#guides" className="text-gold hover:text-gold/80">See The Model Posing Guide</a>
      </p>
    </div>
  )
}

function ProductCard({ product, index }) {
  const [showWaitlist, setShowWaitlist] = useState(false)
  const onSale = Boolean(product.checkoutUrl)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.6 }}
      className="grid md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-8 md:gap-12 items-center border border-gold/30 bg-gold/5 p-6 sm:p-10"
    >
      <img
        src={product.cover}
        alt={`${product.name} cover`}
        width={600}
        height={776}
        loading="lazy"
        className="w-full max-w-xs mx-auto shadow-2xl shadow-black/60 border border-cream/10"
      />
      <div>
        <p className="font-heading text-[10px] tracking-[0.2em] uppercase text-cream/40 mb-2">{product.format}</p>
        <h3 className="font-display text-3xl lg:text-4xl font-bold text-cream mb-3">{product.name}</h3>
        <p className="font-display text-4xl font-bold text-gold mb-5">${product.price}</p>
        <p className="text-cream/55 font-body leading-relaxed mb-6">{product.tagline}</p>
        <ul className="space-y-2 text-sm font-body text-cream/60 mb-8">
          {product.includes.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="text-gold">✦</span>
              {item}
            </li>
          ))}
        </ul>
        {onSale ? (
          <a
            href={product.checkoutUrl}
            onClick={() => trackEvent('shop_checkout_click', { product: product.slug })}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gold text-ink font-heading text-xs tracking-[0.25em] uppercase hover:bg-gold/90 transition-colors"
          >
            Get the Guide · ${product.price} <HiArrowRight />
          </a>
        ) : showWaitlist ? (
          <EmailCapture
            kind="waitlist"
            product={product}
            idPrefix={`wl-${product.slug}`}
            cta="Notify Me"
            success={
              <div className="border border-gold/30 p-6">
                <p className="font-heading text-xs tracking-[0.25em] uppercase text-gold mb-2">You&apos;re on the list</p>
                <p className="text-cream/60 font-body text-sm">You&apos;ll get an email the day it&apos;s available.</p>
              </div>
            }
          />
        ) : (
          <div>
            <p className="font-heading text-[10px] tracking-[0.2em] uppercase text-gold mb-4">Coming soon</p>
            <button
              onClick={() => setShowWaitlist(true)}
              className="inline-flex items-center gap-2 px-8 py-4 border border-cream/20 text-cream/80 font-heading text-xs tracking-[0.25em] uppercase hover:border-gold/50 hover:text-cream transition-colors"
            >
              Notify Me When It Drops <HiArrowRight />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default function Shop() {
  useSEO({
    title: 'Posing Guides for Models & Creators | Shot by Seven Shop',
    description:
      'Posing guides from a Charlotte photographer. Get the free guide, 10 Poses That Work on Everyone, or The Model Posing Guide with 40 poses and flows.',
    path: '/shop',
    breadcrumbs: BREADCRUMBS,
  })

  return (
    <>
      <CustomCursor />
      <FilmGrain />
      <Navbar />

      <main className="bg-ink min-h-screen text-cream">
        {/* Hero */}
        <section className="relative pt-40 pb-20 px-6 lg:px-12 max-w-6xl mx-auto">
          <Breadcrumbs items={BREADCRUMBS} />
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-heading text-[10px] tracking-[0.3em] uppercase text-gold mb-5"
          >
            The Shop · Guides From Real Shoots
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-cream leading-[1.05] mb-8 max-w-4xl"
          >
            Pose Like You&apos;ve<br />
            <span className="italic text-gold">Done This Before</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-cream/50 text-lg leading-relaxed max-w-2xl mb-10 font-body"
          >
            The same direction I give on set, written down so you can practice before your next shoot. Start with the free guide.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <a
              href="#free-guide"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gold text-ink font-heading text-xs tracking-[0.25em] uppercase hover:bg-gold/90 transition-colors"
            >
              Get the Free Guide <HiArrowRight />
            </a>
            <a
              href="#guides"
              className="inline-flex items-center gap-2 px-8 py-4 border border-cream/20 text-cream/70 font-heading text-xs tracking-[0.25em] uppercase hover:border-gold/50 hover:text-cream transition-all"
            >
              See All Guides
            </a>
          </motion.div>
        </section>

        {/* Free guide */}
        <section id="free-guide" className="py-24 bg-warm-black scroll-mt-24">
          <div className="max-w-6xl mx-auto px-6 lg:px-12">
            <Section className="grid md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-10 md:gap-14 items-center">
              <img
                src={FREE_GUIDE.cover}
                alt={`${FREE_GUIDE.name} cover`}
                width={600}
                height={776}
                loading="lazy"
                className="w-full max-w-xs mx-auto shadow-2xl shadow-black/60 border border-cream/10"
              />
              <div>
                <p className="font-heading text-[10px] tracking-[0.3em] uppercase text-gold mb-4">Free Guide</p>
                <h2 className="font-display text-4xl lg:text-5xl font-bold text-cream mb-5">{FREE_GUIDE.name}</h2>
                <p className="text-cream/55 font-body leading-relaxed mb-6">{FREE_GUIDE.tagline}</p>
                <ul className="space-y-2 text-sm font-body text-cream/60 mb-8">
                  {FREE_GUIDE.includes.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="text-gold">✦</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <EmailCapture
                  kind="free"
                  product={FREE_GUIDE}
                  idPrefix="free"
                  cta={FREE_GUIDE.available ? 'Send Me the Guide' : 'Get It First'}
                  success={<FreeGuideSuccess />}
                />
              </div>
            </Section>
          </div>
        </section>

        {/* Paid guides */}
        <section id="guides" className="py-24 px-6 lg:px-12 max-w-6xl mx-auto scroll-mt-24">
          <Section className="mb-12">
            <p className="font-heading text-[10px] tracking-[0.3em] uppercase text-gold mb-4">Guides</p>
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-cream">Go Deeper</h2>
          </Section>
          <div className="space-y-8">
            {PRODUCTS.map((p, i) => (
              <ProductCard key={p.slug} product={p} index={i} />
            ))}
          </div>
        </section>

        {/* In person */}
        <section className="py-24 bg-warm-black">
          <div className="max-w-6xl mx-auto px-6 lg:px-12">
            <Section className="max-w-3xl">
              <p className="font-heading text-[10px] tracking-[0.3em] uppercase text-gold mb-4">In Person</p>
              <h2 className="font-display text-4xl lg:text-5xl font-bold text-cream mb-6">Want Me to Direct You?</h2>
              <p className="text-cream/50 font-body leading-relaxed mb-8">
                A guide gets you started. On set, I watch the angles, fix your hands, and catch the in-between moments you&apos;d never get alone.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/creators"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gold text-ink font-heading text-xs tracking-[0.25em] uppercase hover:bg-gold/90 transition-colors"
                >
                  Book a Creator Mini · $149 <HiArrowRight />
                </Link>
                <Link
                  to="/community"
                  className="inline-flex items-center gap-2 px-8 py-4 border border-cream/20 text-cream/70 font-heading text-xs tracking-[0.25em] uppercase hover:border-gold/50 hover:text-cream transition-all"
                >
                  Join the Model Community
                </Link>
              </div>
            </Section>
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
