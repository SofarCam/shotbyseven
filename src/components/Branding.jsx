import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { HiCamera, HiLightningBolt, HiRefresh, HiSparkles, HiArrowRight } from 'react-icons/hi'
import Navbar from './Navbar'
import Footer from './Footer'
import CustomCursor from './CustomCursor'
import FilmGrain from './FilmGrain'

const deliverables = [
  { icon: HiCamera, title: 'Full Session Coverage', desc: '2–4 hours of dedicated shooting time, multiple looks and locations, tailored to your brand palette.' },
  { icon: HiSparkles, title: 'On-Brand Image Library', desc: '20–40 fully edited selects per session — enough to fill weeks of content without scrambling.' },
  { icon: HiLightningBolt, title: 'AI Content Engine', desc: 'Every shoot syncs with the Content Engine to generate a full month of voice-matched captions and post ideas.' },
  { icon: HiRefresh, title: 'Quarterly Rhythm', desc: 'Book quarterly or bi-monthly to keep your visual presence fresh — no more reusing the same three photos.' },
]

const forWho = [
  'Coaches & Consultants',
  'Healers & Wellness Practitioners',
  'Real Estate Agents',
  'Fitness Trainers',
  'Content Creators',
  'Entrepreneurs & Founders',
  'Authors & Speakers',
  'Creative Professionals',
]

const process = [
  {
    step: '01',
    title: 'Brand Alignment Call',
    desc: 'We talk about your audience, your energy, your color palette, and what you want people to feel when they land on your page.',
  },
  {
    step: '02',
    title: 'Location & Look Planning',
    desc: 'Studio or outdoor — we plan the settings, outfits, and props that match your brand story, not just look pretty.',
  },
  {
    step: '03',
    title: 'The Shoot',
    desc: 'High-energy, relaxed, editorial. I direct you the whole time. You bring the vision — I bring the camera and the light.',
  },
  {
    step: '04',
    title: 'Gallery + Content Drop',
    desc: 'Your gallery is live within one week. Feed it into the Content Engine and your social calendar fills itself.',
  },
]

const faqs = [
  {
    q: 'How often should I book personal branding sessions?',
    a: 'Quarterly is the sweet spot for most entrepreneurs — new season, new looks, new content. Some clients book bi-monthly when they\'re launching or scaling fast.',
  },
  {
    q: 'What\'s included in the $350 starting price?',
    a: 'The $350 base covers a 2-hour session with professional editing and gallery delivery. Studio rental ($60/hr) and travel beyond Charlotte are add-ons. Most branding clients invest $350–$550 per session.',
  },
  {
    q: 'Can I use these images for my website?',
    a: 'Yes — you get full commercial rights to every image in your gallery. Use them on your website, social, email, ads, press kits, anywhere.',
  },
  {
    q: 'Do I need a professional makeup artist?',
    a: 'Not required, but highly recommended for studio sessions. I can refer you to artists who work regularly in the Charlotte area.',
  },
  {
    q: 'What if I don\'t know what "my brand" looks like?',
    a: 'That\'s what the brand alignment call is for. We figure it out together. Most clients come in with a vague idea and leave the shoot with clarity.',
  },
]

function FAQItem({ item }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-cream/10 last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 gap-4 text-left group"
      >
        <span className="font-heading text-sm tracking-wide text-cream/80 group-hover:text-cream transition-colors">{item.q}</span>
        <span className="shrink-0 text-gold/60 group-hover:text-gold transition-colors text-lg">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <p className="pb-5 text-cream/50 text-sm leading-relaxed font-body">{item.a}</p>
      )}
    </div>
  )
}

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

export default function Branding() {
  return (
    <>
      <CustomCursor />
      <FilmGrain />
      <Navbar />

      <main className="bg-ink min-h-screen text-cream">

        {/* Hero */}
        <section className="relative pt-40 pb-28 px-6 lg:px-12 max-w-6xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-heading text-[10px] tracking-[0.3em] uppercase text-gold mb-5"
          >
            Charlotte, NC · Personal Branding Photography
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-cream leading-[1.05] mb-8 max-w-4xl"
          >
            Your Brand Deserves<br />
            <span className="italic text-gold">Photos That Match It</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-cream/50 text-lg leading-relaxed max-w-2xl mb-10 font-body"
          >
            Personal branding sessions for Charlotte coaches, entrepreneurs, healers, and creators who are done reusing the same three photos. Build a library of on-brand images that fill months of content — not just one round of shots.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link
              to="/#smart-booking"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gold text-ink font-heading text-xs tracking-[0.25em] uppercase hover:bg-gold/90 transition-colors"
            >
              Book a Session <HiArrowRight />
            </Link>
            <a
              href="/#pricing-calculator"
              className="inline-flex items-center gap-2 px-8 py-4 border border-cream/20 text-cream/70 font-heading text-xs tracking-[0.25em] uppercase hover:border-gold/50 hover:text-cream transition-all"
            >
              See Pricing
            </a>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-20 grid grid-cols-3 gap-8 border-t border-cream/10 pt-10 max-w-lg"
          >
            {[
              { n: '2–4hr', label: 'Per Session' },
              { n: '20–40', label: 'Edited Selects' },
              { n: '1 mo', label: 'of Content' },
            ].map(({ n, label }) => (
              <div key={label}>
                <p className="font-display text-3xl font-bold text-gold">{n}</p>
                <p className="font-heading text-[10px] tracking-[0.2em] uppercase text-cream/30 mt-1">{label}</p>
              </div>
            ))}
          </motion.div>
        </section>

        {/* Who It's For */}
        <section className="py-20 bg-warm-black">
          <div className="max-w-6xl mx-auto px-6 lg:px-12">
            <Section className="mb-12">
              <p className="font-heading text-[10px] tracking-[0.3em] uppercase text-gold mb-4">Made For</p>
              <h2 className="font-display text-4xl lg:text-5xl font-bold text-cream">Who Books This Session</h2>
            </Section>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {forWho.map((who, i) => (
                <motion.div
                  key={who}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07, duration: 0.5 }}
                  className="border border-cream/10 px-4 py-3 text-center"
                >
                  <span className="font-heading text-[10px] tracking-[0.15em] uppercase text-cream/60">{who}</span>
                </motion.div>
              ))}
            </div>
            <Section className="mt-8">
              <p className="text-cream/30 text-sm font-body">
                If your image is your business — and for most entrepreneurs it is — this session is for you.
              </p>
            </Section>
          </div>
        </section>

        {/* What You Get */}
        <section className="py-24 px-6 lg:px-12 max-w-6xl mx-auto">
          <Section className="mb-14">
            <p className="font-heading text-[10px] tracking-[0.3em] uppercase text-gold mb-4">Deliverables</p>
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-cream">What You Walk Away With</h2>
          </Section>
          <div className="grid sm:grid-cols-2 gap-6">
            {deliverables.map((d, i) => {
              const Icon = d.icon
              return (
                <motion.div
                  key={d.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.6 }}
                  className="border border-cream/10 p-8 hover:border-gold/30 transition-colors duration-300"
                >
                  <Icon className="text-gold text-2xl mb-5" />
                  <h3 className="font-display text-xl font-bold text-cream mb-3">{d.title}</h3>
                  <p className="text-cream/40 text-sm leading-relaxed font-body">{d.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </section>

        {/* The Process */}
        <section className="py-24 bg-warm-black">
          <div className="max-w-6xl mx-auto px-6 lg:px-12">
            <Section className="mb-14">
              <p className="font-heading text-[10px] tracking-[0.3em] uppercase text-gold mb-4">How It Works</p>
              <h2 className="font-display text-4xl lg:text-5xl font-bold text-cream">The Process</h2>
            </Section>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {process.map((p, i) => (
                <motion.div
                  key={p.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12, duration: 0.6 }}
                  className="relative"
                >
                  <p className="font-display text-6xl font-bold text-gold/10 mb-4 leading-none">{p.step}</p>
                  <h3 className="font-display text-lg font-bold text-cream mb-3">{p.title}</h3>
                  <p className="text-cream/40 text-sm leading-relaxed font-body">{p.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Content Engine callout */}
        <section className="py-24 px-6 lg:px-12 max-w-6xl mx-auto">
          <Section>
            <div className="border border-gold/20 bg-gold/5 p-10 lg:p-14">
              <div className="max-w-2xl">
                <p className="font-heading text-[10px] tracking-[0.3em] uppercase text-gold mb-4">Included with Every Session</p>
                <h2 className="font-display text-3xl lg:text-4xl font-bold text-cream mb-5">
                  Pair It with the Content Engine
                </h2>
                <p className="text-cream/50 text-base leading-relaxed font-body mb-8">
                  After your shoot, feed your gallery into the Content Engine — Shot by Seven's AI tool that learns your voice and generates a full month of caption drafts, post ideas, and hashtag sets from your actual photos. No generic copy. No guessing. Just content that sounds like you.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    to="/#smart-booking"
                    className="inline-flex items-center gap-2 px-7 py-3 bg-gold text-ink font-heading text-xs tracking-[0.25em] uppercase hover:bg-gold/90 transition-colors"
                  >
                    Book a Branding Session <HiArrowRight />
                  </Link>
                </div>
              </div>
            </div>
          </Section>
        </section>

        {/* Pricing */}
        <section className="py-24 bg-warm-black">
          <div className="max-w-6xl mx-auto px-6 lg:px-12">
            <Section className="mb-10">
              <p className="font-heading text-[10px] tracking-[0.3em] uppercase text-gold mb-4">Investment</p>
              <h2 className="font-display text-4xl lg:text-5xl font-bold text-cream">Pricing</h2>
            </Section>
            <div className="grid sm:grid-cols-3 gap-5">
              {[
                { label: 'Starter', price: '$350', hours: '2 hrs', selects: '15–20 selects', note: 'Outdoor only' },
                { label: 'Standard', price: '$500', hours: '3 hrs', selects: '25–30 selects', note: 'Studio or outdoor', featured: true },
                { label: 'Full Day', price: '$750+', hours: '5–6 hrs', selects: '40+ selects', note: 'Multiple looks + studio' },
              ].map((tier) => (
                <motion.div
                  key={tier.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className={`p-8 border ${tier.featured ? 'border-gold/40 bg-gold/5' : 'border-cream/10'}`}
                >
                  {tier.featured && (
                    <span className="font-heading text-[9px] tracking-[0.15em] uppercase text-ink bg-gold px-2 py-0.5 mb-4 inline-block">
                      Most Popular
                    </span>
                  )}
                  <p className="font-heading text-[10px] tracking-[0.2em] uppercase text-cream/40 mb-3">{tier.label}</p>
                  <p className="font-display text-4xl font-bold text-cream mb-5">{tier.price}</p>
                  <ul className="space-y-2 text-sm font-body text-cream/50">
                    <li>{tier.hours}</li>
                    <li>{tier.selects}</li>
                    <li>{tier.note}</li>
                    <li>Online gallery (PicTime)</li>
                    <li>Commercial usage rights</li>
                  </ul>
                </motion.div>
              ))}
            </div>
            <Section className="mt-6">
              <p className="text-cream/30 text-xs font-body">
                Studio rental at NoDa Art House is +$60/hr and not included. Travel within 100 miles is $50 flat.
                Use the <a href="/#pricing-calculator" className="text-gold/70 hover:text-gold underline underline-offset-4 transition-colors">Pricing Calculator</a> for an exact quote.
              </p>
            </Section>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-24 px-6 lg:px-12 max-w-3xl mx-auto">
          <Section className="mb-12">
            <p className="font-heading text-[10px] tracking-[0.3em] uppercase text-gold mb-4">Questions</p>
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-cream">FAQ</h2>
          </Section>
          <div className="border-t border-cream/10">
            {faqs.map((item) => (
              <FAQItem key={item.q} item={item} />
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 bg-warm-black">
          <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center">
            <Section>
              <p className="font-heading text-[10px] tracking-[0.3em] uppercase text-gold mb-5">Ready?</p>
              <h2 className="font-display text-4xl lg:text-5xl font-bold text-cream mb-6">
                Let&apos;s Build Your Visual Brand
              </h2>
              <p className="text-cream/40 text-base font-body mb-10 max-w-xl mx-auto">
                Charlotte entrepreneurs are building their business on content. The ones who win have images that match their energy. Book your session and let&apos;s get you there.
              </p>
              <Link
                to="/#smart-booking"
                className="inline-flex items-center gap-2 px-10 py-4 bg-gold text-ink font-heading text-xs tracking-[0.25em] uppercase hover:bg-gold/90 transition-colors"
              >
                Book a Personal Branding Session <HiArrowRight />
              </Link>
            </Section>
          </div>
        </section>

      </main>

      <Footer />
    </>
  )
}
