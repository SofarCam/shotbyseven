import { Link } from 'react-router-dom'
import { FaInstagram } from 'react-icons/fa'
import useSEO from '../hooks/useSEO'
import { trackEvent } from '../utils/analytics'
import { upcomingMiniDates, formatMiniDate, HOLIDAY_MINIS } from '../holidayMinis'

const COVER = '/photos/webp/links-cover.webp'
const COVER_BG = '/photos/webp/links-cover-bg.webp'

export default function Links() {
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
    { to: '/creators', label: 'Creator Packages', sub: 'Photos, reels & captions for creators' },
    { to: '/#smart-booking', label: 'Book a Session', sub: 'Portraits, grads, maternity & more' },
    { to: '/#gallery', label: 'See the Portfolio' },
    { to: '/gift', label: 'Gift Cards' },
    { to: '/blog', label: 'Studio Journal', sub: 'Shoot breakdowns & session tips' },
  ].filter(Boolean)

  return (
    <main className="relative min-h-screen bg-ink text-cream flex justify-center px-6 py-10 overflow-hidden">
      {/* Blurred cover behind frosted-glass buttons */}
      <img
        src={COVER_BG}
        alt=""
        aria-hidden="true"
        className="fixed inset-0 w-full h-full object-cover scale-110 blur-2xl"
      />
      <div className="fixed inset-0 bg-ink/35" />

      <div className="relative w-full max-w-md">
        <h1 className="sr-only">Shot by Seven</h1>
        <img
          src={COVER}
          alt="Shotbyseven777 magazine-style cover: More Than Just Pictures. Portraits, outdoors, studio, lifestyle, events."
          width={1024}
          height={1536}
          className="w-full h-auto rounded-2xl shadow-2xl border border-cream/20 mb-6"
        />

        <nav aria-label="Shot by Seven links" className="space-y-3">
          {links.map((l) => (
            <Link
              key={l.label}
              to={l.to}
              onClick={() => trackEvent('link_in_bio_click', { link: l.label })}
              className={`block text-center px-6 py-4 rounded-xl border backdrop-blur-md transition-colors ${
                l.featured
                  ? 'bg-gold/80 text-ink border-gold/60 hover:bg-gold/90'
                  : 'bg-cream/10 border-cream/25 hover:bg-cream/20 hover:border-gold/50'
              }`}
            >
              <span className="block font-heading text-xs tracking-[0.2em] uppercase">{l.label}</span>
              {l.sub && (
                <span className={`block text-xs font-body mt-1 ${l.featured ? 'text-ink/75' : 'text-cream/70'}`}>
                  {l.sub}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <div className="text-center mt-8">
          <a
            href="https://instagram.com/shotbyseven777"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Shot by Seven on Instagram"
            className="inline-flex items-center gap-2 text-cream/80 hover:text-gold transition-colors text-sm"
          >
            <FaInstagram /> @shotbyseven777
          </a>
        </div>
      </div>
    </main>
  )
}
