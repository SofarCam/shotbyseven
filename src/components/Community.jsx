import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiArrowRight, HiCamera, HiCalendar, HiSparkles, HiUserGroup } from 'react-icons/hi'
import { FaInstagram } from 'react-icons/fa'
import useSEO from '../hooks/useSEO'
import Navbar from './Navbar'
import Footer from './Footer'
import CustomCursor from './CustomCursor'
import FilmGrain from './FilmGrain'
import Breadcrumbs from './Breadcrumbs'
import { sendContactEmail } from '../utils/emailService'
import { trackLead } from '../utils/analytics'

// Instagram group chat invite link, set in Vercel. Without it, sign-ups are
// told they'll be added by DM (their handle comes through with the form).
const GROUP_INVITE_URL = import.meta.env.VITE_IG_COMMUNITY_URL

const BREADCRUMBS = [{ name: 'Home', path: '/' }, { name: 'Model Community', path: '/community' }]

const perks = [
  { icon: HiCamera, title: 'Model Calls', desc: 'Be first to hear when a concept needs models: editorial, fashion, studio, and outdoor shoots.' },
  { icon: HiSparkles, title: 'Free Test Shoots', desc: 'Community members get first shot at free test shoots when they open up. Build your portfolio.' },
  { icon: HiCalendar, title: 'Events & Meetups', desc: 'Studio days, mini session events, and what’s coming up next, before it’s posted anywhere else.' },
  { icon: HiUserGroup, title: 'Real Connections', desc: 'Models from first-timers to experienced, plus the creatives you’ll want to work with.' },
]

const EXPERIENCE = ['Brand new', 'Some experience', 'Experienced']
const INTERESTS = ['Free test shoots', 'Model calls', 'Paid work (when available)', 'Events & meetups']

function JoinForm() {
  const [form, setForm] = useState({ name: '', instagramHandle: '', email: '', experience: EXPERIENCE[0], adult: false })
  const [interests, setInterests] = useState([INTERESTS[0], INTERESTS[1]])
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const update = (e) => {
    const { name, value, type, checked } = e.target
    setForm((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }))
  }
  const toggleInterest = (i) => setInterests((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]))
  const handle = form.instagramHandle.replace(/^@/, '').trim()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.adult) {
      setError('The community is for models 18 and older.')
      return
    }
    setSending(true)
    setError('')
    try {
      await sendContactEmail({
        name: form.name,
        email: form.email,
        instagramHandle: handle,
        preferredContact: 'Instagram DM',
        message: [
          'New Model Community sign-up',
          `Experience: ${form.experience}`,
          `Interested in: ${interests.join(', ') || 'Not specified'}`,
          'Confirmed 18+: yes',
        ].join('\n'),
      })
      trackLead({ source: 'community' })
      fetch('/api/crm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'COMMUNITY',
          name: form.name,
          email: form.email,
          instagram: `@${handle}`,
          experience: form.experience,
          interests: interests.join(', '),
          adult_confirmed: true,
        }),
      }).catch(() => {})
      setDone(true)
    } catch {
      setError('Something went wrong. DM @shotbyseven777 on Instagram and we’ll add you.')
    } finally {
      setSending(false)
    }
  }

  if (done) {
    return (
      <div className="border border-gold/30 bg-gold/5 p-10 text-center">
        <p className="font-heading text-xs tracking-[0.25em] uppercase text-gold mb-3">You&apos;re in</p>
        {GROUP_INVITE_URL ? (
          <>
            <p className="text-cream/60 font-body mb-6">Last step: tap below to join the Instagram group chat.</p>
            <a
              href={GROUP_INVITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gold text-ink font-heading text-xs tracking-[0.2em] uppercase hover:bg-gold/90 transition-colors"
            >
              <FaInstagram /> Join the Group Chat
            </a>
          </>
        ) : (
          <p className="text-cream/60 font-body">
            You&apos;ll get a DM from @shotbyseven777 within 24 hours adding you to the group chat.
          </p>
        )}
      </div>
    )
  }

  const input = 'w-full bg-transparent border-b border-cream/15 focus:border-gold outline-none py-3 text-cream text-sm font-body placeholder:text-cream/20 transition-colors'
  const label = 'block font-heading text-[10px] tracking-[0.2em] uppercase text-cream/40 mb-1'

  return (
    <form onSubmit={handleSubmit} className="space-y-7">
      <div className="grid sm:grid-cols-2 gap-6">
        <div>
          <label htmlFor="cm-name" className={label}>Name</label>
          <input id="cm-name" name="name" autoComplete="name" required value={form.name} onChange={update} className={input} />
        </div>
        <div>
          <label htmlFor="cm-ig" className={label}>Instagram handle</label>
          <input id="cm-ig" name="instagramHandle" required placeholder="@yourhandle" value={form.instagramHandle} onChange={update} className={input} />
        </div>
        <div>
          <label htmlFor="cm-email" className={label}>Email</label>
          <input id="cm-email" name="email" type="email" autoComplete="email" required value={form.email} onChange={update} className={input} />
        </div>
        <div>
          <label htmlFor="cm-exp" className={label}>Modeling experience</label>
          <select id="cm-exp" name="experience" value={form.experience} onChange={update} className={`${input} bg-ink`}>
            {EXPERIENCE.map((x) => <option key={x}>{x}</option>)}
          </select>
        </div>
      </div>

      <fieldset>
        <legend className={label}>I&apos;m interested in</legend>
        <div className="flex flex-wrap gap-2 mt-2">
          {INTERESTS.map((i) => {
            const on = interests.includes(i)
            return (
              <button
                type="button"
                key={i}
                onClick={() => toggleInterest(i)}
                aria-pressed={on}
                className={`px-4 py-2 rounded-full border text-xs font-body transition-colors ${
                  on ? 'bg-gold/15 border-gold text-cream' : 'border-cream/15 text-cream/50 hover:border-cream/40'
                }`}
              >
                {i}
              </button>
            )
          })}
        </div>
      </fieldset>

      <label className="flex items-start gap-3 cursor-pointer">
        <input type="checkbox" name="adult" checked={form.adult} onChange={update} className="mt-1 accent-[#d4a04a]" />
        <span className="text-cream/60 text-sm font-body">I&apos;m 18 or older.</span>
      </label>

      {error && <p className="text-red-400/80 text-sm font-body">{error}</p>}

      <button
        type="submit"
        disabled={sending}
        className="inline-flex items-center gap-2 px-10 py-4 bg-gold text-ink font-heading text-xs tracking-[0.25em] uppercase hover:bg-gold/90 transition-colors disabled:opacity-50"
      >
        {sending ? 'Joining...' : 'Join the Community'} <HiArrowRight />
      </button>
      <p className="text-cream/25 text-xs font-body">
        We&apos;ll only use your info for community updates and shoot opportunities. See our{' '}
        <Link to="/privacy" className="underline hover:text-gold/60">Privacy Policy</Link>.
      </p>
    </form>
  )
}

export default function Community() {
  useSEO({
    title: 'Charlotte Model Community | Shot by Seven',
    description: 'Join the Shot by Seven model community in Charlotte, NC: model calls, free test shoots, and events for models 18+, from first-timers to experienced.',
    path: '/community',
    breadcrumbs: BREADCRUMBS,
  })

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
            Charlotte, NC · Models 18+
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-display text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] mb-8 max-w-4xl"
          >
            The Shot by Seven<br />
            <span className="italic text-gold">Model Community</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-cream/50 text-lg leading-relaxed max-w-2xl mb-10 font-body"
          >
            A group of Charlotte models, from first-timers to experienced, who hear first about model calls, free test shoots, and events. Join and you&apos;ll be added to the community group chat.
          </motion.p>
          <a
            href="#join"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gold text-ink font-heading text-xs tracking-[0.25em] uppercase hover:bg-gold/90 transition-colors"
          >
            Join the Community <HiArrowRight />
          </a>
        </section>

        <section className="py-20 bg-warm-black">
          <div className="max-w-6xl mx-auto px-6 lg:px-12 grid sm:grid-cols-2 gap-6">
            {perks.map((p, i) => {
              const Icon = p.icon
              return (
                <motion.div
                  key={p.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.6 }}
                  className="border border-cream/10 p-8"
                >
                  <Icon className="text-gold text-2xl mb-4" />
                  <h2 className="font-display text-xl font-bold mb-2">{p.title}</h2>
                  <p className="text-cream/45 text-sm leading-relaxed font-body">{p.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </section>

        <section id="join" className="py-24 px-6 lg:px-12 max-w-3xl mx-auto scroll-mt-24">
          <p className="font-heading text-[10px] tracking-[0.3em] uppercase text-gold mb-4">Join</p>
          <h2 className="font-display text-4xl lg:text-5xl font-bold mb-4">Get in the Group</h2>
          <p className="text-cream/40 font-body mb-10">Takes 30 seconds. No cost, no commitment.</p>
          <JoinForm />
        </section>
      </main>

      <Footer />
    </>
  )
}
