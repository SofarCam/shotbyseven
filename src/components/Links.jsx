import { Link } from 'react-router-dom'
import { FaInstagram } from 'react-icons/fa'
import useSEO from '../hooks/useSEO'
import { getAboutImage } from '../imageConfig'
import { trackEvent } from '../utils/analytics'
import { upcomingMiniDates, formatMiniDate, HOLIDAY_MINIS } from '../holidayMinis'

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
    <main className="min-h-screen bg-ink text-cream flex justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <img
            src={getAboutImage()}
            alt="Cameron Currence, Shot by Seven photographer"
            className="w-24 h-24 rounded-full object-cover object-top mx-auto mb-5 border border-gold/30"
          />
          <h1 className="font-display text-3xl font-bold">
            Shot by <span className="italic text-gold">Seven</span>
          </h1>
          <p className="font-heading text-[10px] tracking-[0.3em] uppercase text-cream/40 mt-2">
            Charlotte, NC Photographer
          </p>
        </div>

        <nav aria-label="Shot by Seven links" className="space-y-3">
          {links.map((l) => (
            <Link
              key={l.label}
              to={l.to}
              onClick={() => trackEvent('link_in_bio_click', { link: l.label })}
              className={`block text-center px-6 py-4 border transition-colors ${
                l.featured
                  ? 'bg-gold text-ink border-gold hover:bg-gold/90'
                  : 'border-cream/15 hover:border-gold/50'
              }`}
            >
              <span className="block font-heading text-xs tracking-[0.2em] uppercase">{l.label}</span>
              {l.sub && (
                <span className={`block text-xs font-body mt-1 ${l.featured ? 'text-ink/70' : 'text-cream/40'}`}>
                  {l.sub}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <div className="text-center mt-10">
          <a
            href="https://instagram.com/shotbyseven777"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Shot by Seven on Instagram"
            className="inline-flex items-center gap-2 text-cream/40 hover:text-gold transition-colors text-sm"
          >
            <FaInstagram /> @shotbyseven777
          </a>
        </div>
      </div>
    </main>
  )
}
