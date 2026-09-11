import { Link } from 'react-router-dom'
import { HiCamera } from 'react-icons/hi'
import useSEO from '../hooks/useSEO'

export default function NotFound() {
  useSEO({
    title: 'Page Not Found | Shot by Seven',
    description: 'This page doesn\'t exist. Head back to the homepage to browse the portfolio or book a session.',
    path: typeof window !== 'undefined' ? window.location.pathname : '/404',
    noindex: true,
  })

  return (
    <div className="min-h-screen bg-warm-black text-cream flex items-center justify-center px-6 py-16">
      <div className="max-w-md mx-auto text-center">
        <HiCamera className="text-gold text-4xl mx-auto mb-6" />
        <span className="font-heading text-xs tracking-[0.3em] uppercase text-gold mb-4 block">
          404
        </span>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-cream mb-4">
          Nothing <span className="italic text-gold">here</span>
        </h1>
        <p className="text-cream/40 leading-relaxed mb-10">
          That page doesn't exist, or it moved. Let's get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/"
            className="font-heading text-xs tracking-[0.2em] uppercase px-8 py-4 bg-gold text-ink hover:bg-gold-light transition-colors duration-300"
          >
            Back to Home
          </Link>
          <Link
            to="/#gallery"
            className="font-heading text-xs tracking-[0.2em] uppercase px-8 py-4 border border-cream/20 text-cream hover:border-gold/50 hover:text-gold transition-all duration-300"
          >
            View Portfolio
          </Link>
        </div>

        <p className="text-center text-sm mt-8">
          <Link to="/blog" className="text-gold/70 hover:text-gold transition-colors">
            Studio Journal
          </Link>
          <span className="text-cream/20 mx-2">·</span>
          <Link to="/#smart-booking" className="text-gold/70 hover:text-gold transition-colors">
            Book a Session
          </Link>
        </p>
      </div>
    </div>
  )
}
