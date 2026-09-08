import { Link } from 'react-router-dom'
import { GemMarker } from './HiddenGems'

export default function Footer() {
  return (
    <footer className="border-t border-cream/5 py-12 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Top row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <a href="/" className="font-display text-xl font-bold tracking-tight text-cream">
            SEVEN<span className="text-gold">.</span>
          </a>

          <div className="flex flex-wrap items-center justify-center gap-6">
            <a
              href="https://instagram.com/shotbyseven777"
              target="_blank"
              rel="noopener noreferrer"
              className="font-heading text-[10px] tracking-[0.2em] uppercase text-cream/20 hover:text-gold transition-colors duration-300"
            >
              Instagram
            </a>
            <a
              href="https://shotbyseven777.pic-time.com/client"
              target="_blank"
              rel="noopener noreferrer"
              className="font-heading text-[10px] tracking-[0.2em] uppercase text-cream/20 hover:text-gold transition-colors duration-300"
            >
              Client Gallery
            </a>
            <Link
              to="/blog"
              className="font-heading text-[10px] tracking-[0.2em] uppercase text-cream/20 hover:text-gold transition-colors duration-300"
            >
              Journal
            </Link>
            <Link
              to="/studio"
              className="font-heading text-[10px] tracking-[0.2em] uppercase text-cream/20 hover:text-gold transition-colors duration-300"
            >
              Book Studio
            </Link>
            <Link
              to="/portal"
              className="font-heading text-[10px] tracking-[0.2em] uppercase text-cream/20 hover:text-gold transition-colors duration-300"
            >
              Client Portal
            </Link>
            <Link
              to="/branding"
              className="font-heading text-[10px] tracking-[0.2em] uppercase text-cream/20 hover:text-gold transition-colors duration-300"
            >
              Branding
            </Link>
            <Link
              to="/gift"
              className="font-heading text-[10px] tracking-[0.2em] uppercase text-cream/20 hover:text-gold transition-colors duration-300"
            >
              Gift Cards
            </Link>
          </div>
        </div>

        {/* Legal row */}
        <div className="border-t border-cream/5 pt-6 pb-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          <Link to="/privacy" className="text-cream/20 hover:text-gold text-[10px] font-heading tracking-widest uppercase transition-colors">
            Privacy Policy
          </Link>
          <Link to="/terms" className="text-cream/20 hover:text-gold text-[10px] font-heading tracking-widest uppercase transition-colors">
            Terms of Service
          </Link>
          <Link to="/accessibility" className="text-cream/20 hover:text-gold text-[10px] font-heading tracking-widest uppercase transition-colors">
            Accessibility
          </Link>
          <button
            onClick={() => window.__openCookiePreferences?.()}
            className="text-cream/20 hover:text-gold text-[10px] font-heading tracking-widest uppercase transition-colors"
          >
            Cookie Preferences
          </button>
        </div>

        {/* Bottom row */}
        <div className="border-t border-cream/5 pt-6 flex items-center justify-between">
          <p className="text-cream/15 text-xs font-body">
            &copy; {new Date().getFullYear()} Shot by Seven · Charlotte, NC
          </p>
          <div className="flex items-center gap-3">
            <p className="text-cream/10 text-[10px] font-heading tracking-widest uppercase">
              shotbyseven777@gmail.com
            </p>
            <GemMarker gemIndex={4} />
          </div>
        </div>
      </div>
    </footer>
  )
}
