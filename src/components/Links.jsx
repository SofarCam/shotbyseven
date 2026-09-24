import { Link } from 'react-router-dom'
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion'
import { FaInstagram } from 'react-icons/fa'
import useSEO from '../hooks/useSEO'
import FilmGrain from './FilmGrain'
import { trackEvent } from '../utils/analytics'
import { upcomingMiniDates, formatMiniDate, HOLIDAY_MINIS } from '../holidayMinis'

const COVER = '/photos/webp/links-cover.webp'
const COVER_BG = '/photos/webp/links-cover-bg.webp'
const EASE = [0.22, 1, 0.36, 1]

const list = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.9 } },
}
const item = {
  hidden: { opacity: 0, y: 24, filter: 'blur(6px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: EASE } },
}

function TiltCover({ reduce }) {
  const px = useMotionValue(0.5)
  const py = useMotionValue(0.5)
  const rotateY = useSpring(useTransform(px, [0, 1], [-10, 10]), { stiffness: 150, damping: 15 })
  const rotateX = useSpring(useTransform(py, [0, 1], [8, -8]), { stiffness: 150, damping: 15 })

  const track = (clientX, clientY, el) => {
    const r = el.getBoundingClientRect()
    px.set((clientX - r.left) / r.width)
    py.set((clientY - r.top) / r.height)
  }
  const reset = () => { px.set(0.5); py.set(0.5) }

  return (
    <div style={{ perspective: 1000 }} className="mb-6">
      <motion.div
        initial={reduce ? false : { opacity: 0, y: -40, rotateX: 25, scale: 1.08, filter: 'blur(12px)' }}
        animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1, filter: 'blur(0px)' }}
        transition={{ duration: 1.1, ease: EASE }}
      >
        <motion.div
          style={reduce ? undefined : { rotateX, rotateY, transformStyle: 'preserve-3d' }}
          onPointerMove={reduce ? undefined : (e) => track(e.clientX, e.clientY, e.currentTarget)}
          onPointerLeave={reduce ? undefined : reset}
          onPointerUp={reduce ? undefined : reset}
          className="relative rounded-2xl touch-pan-y"
        >
          <img
            src={COVER}
            alt="Shotbyseven777 magazine-style cover: More Than Just Pictures. Portraits, outdoors, studio, lifestyle, events."
            width={1024}
            height={1536}
            className="block w-full h-auto rounded-2xl shadow-2xl shadow-ink/70 border border-cream/20"
          />
          <div className="cover-sheen" aria-hidden="true" />
        </motion.div>
      </motion.div>
    </div>
  )
}

export default function Links() {
  const reduce = useReducedMotion()

  useSEO({
    title: 'Shot by Seven | Links',
    description: 'Book a session, grab a Holiday Mini, or see creator packages from Shot by Seven, a Charlotte, NC photographer.',
    path: '/links',
    noindex: true,
  })

  const nextMini = upcomingMiniDates()[0]

  const links = [
    nextMini && {
      to: '/holiday-minis',
      label: 'Holiday Minis',
      sub: `${formatMiniDate(nextMini)} · $${HOLIDAY_MINIS.price}`,
      featured: true,
    },
    { to: '/community', label: 'Join the Model Community', sub: 'Model calls, free test shoots & events', community: true },
    { to: '/creators', label: 'Creator Packages', sub: 'Photos, reels & captions for creators' },
    { to: '/#smart-booking', label: 'Book a Session', sub: 'Portraits, grads, maternity & more' },
    { to: '/#gallery', label: 'See the Portfolio' },
    { to: '/gift', label: 'Gift Cards' },
    { to: '/blog', label: 'Studio Journal', sub: 'Shoot breakdowns & session tips' },
  ].filter(Boolean)

  return (
    <main className="relative min-h-screen bg-ink text-cream flex justify-center px-6 py-10 overflow-hidden">
      {/* Blurred, slowly drifting cover behind the glass buttons */}
      <img
        src={COVER_BG}
        alt=""
        aria-hidden="true"
        className="fixed inset-0 w-full h-full object-cover blur-2xl bg-drift"
      />
      <div className="fixed inset-0 bg-ink/35" />
      <FilmGrain />

      <div className="relative w-full max-w-md">
        <h1 className="sr-only">Shot by Seven</h1>
        <TiltCover reduce={reduce} />

        <motion.nav
          aria-label="Shot by Seven links"
          className="space-y-3"
          variants={reduce ? undefined : list}
          initial={reduce ? false : 'hidden'}
          animate="show"
        >
          {links.map((l) => (
            <motion.div key={l.label} variants={reduce ? undefined : item} whileTap={reduce ? undefined : { scale: 0.97 }}>
              <Link
                to={l.to}
                onClick={() => trackEvent('link_in_bio_click', { link: l.label })}
                className={`group relative block overflow-hidden text-center px-6 py-4 rounded-xl border backdrop-blur-md transition-all duration-300 ${
                  l.featured
                    ? 'bg-gold/80 text-ink border-gold/60 hover:bg-gold/90 shadow-lg shadow-gold/20'
                    : l.community
                      ? 'bg-cream/15 border-gold/50 hover:bg-cream/20 hover:-translate-y-0.5'
                      : 'bg-cream/10 border-cream/25 hover:bg-cream/20 hover:border-gold/50 hover:-translate-y-0.5'
                }`}
              >
                {l.featured && <span className="gold-shimmer absolute inset-0" aria-hidden="true" />}
                <span className="relative flex items-center justify-center gap-2 font-heading text-xs tracking-[0.2em] uppercase">
                  {l.featured && (
                    <span className="relative flex h-2 w-2" aria-hidden="true">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-ink/60 motion-safe:animate-ping" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-ink" />
                    </span>
                  )}
                  {l.label}
                </span>
                {l.sub && (
                  <span className={`relative block text-xs font-body mt-1 ${l.featured ? 'text-ink/75' : 'text-cream/70'}`}>
                    {l.featured ? `Booking now · ${l.sub}` : l.sub}
                  </span>
                )}
              </Link>
            </motion.div>
          ))}
        </motion.nav>

        <motion.div
          className="text-center mt-8"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 0.8 }}
        >
          <a
            href="https://instagram.com/shotbyseven777"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Shot by Seven on Instagram"
            className="inline-flex items-center gap-2 text-cream/80 hover:text-gold transition-colors text-sm"
          >
            <FaInstagram /> @shotbyseven777
          </a>
        </motion.div>
      </div>
    </main>
  )
}
