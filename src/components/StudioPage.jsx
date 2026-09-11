import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { HiLocationMarker } from 'react-icons/hi'
import useSEO from '../hooks/useSEO'
import Breadcrumbs from './Breadcrumbs'

const BREADCRUMBS = [{ name: 'Home', path: '/' }, { name: 'Studio', path: '/studio' }]
const STUDIO_ADDRESS = '3109 Cullman Ave, Charlotte, NC 28206'
const MAPS_EMBED_URL = `https://www.google.com/maps?q=${encodeURIComponent(STUDIO_ADDRESS)}&output=embed`
const MAPS_DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(STUDIO_ADDRESS)}`
import Navbar from './Navbar'
import Footer from './Footer'
import CustomCursor from './CustomCursor'
import FilmGrain from './FilmGrain'
import ScrollProgress from './ScrollProgress'
import SmartIntakeForm from './SmartIntakeForm'

export default function StudioPage() {
  useSEO({
    title: 'Book Studio A at NoDa Art House | Shot by Seven',
    description: 'Rent Studio A at NoDa Art House in Charlotte, NC — $60/hr, max 20 people. Check availability and book instantly.',
    path: '/studio',
    breadcrumbs: BREADCRUMBS,
  })

  return (
    <>
      <CustomCursor />
      <FilmGrain />
      <ScrollProgress />
      <Navbar />

      <main className="min-h-screen bg-ink pt-24 pb-32">
        {/* Header */}
        <div className="text-center py-16 px-6 border-b border-cream/5 mb-12">
          <Breadcrumbs items={BREADCRUMBS} className="justify-center" />
          <p className="font-heading text-[10px] tracking-[0.35em] uppercase text-gold/60 mb-3">
            Studio A — NoDa Art House
          </p>
          <h1 className="font-display text-4xl lg:text-5xl font-bold text-cream mb-4">
            Book the Studio
          </h1>
          <p className="text-cream/30 text-sm max-w-sm mx-auto mb-6">
            $60/hr · Charlotte, NC · Max 20 people<br />
            Seven checks availability and responds within 24 hours.
          </p>

          {/* Quick facts */}
          <div className="flex flex-wrap justify-center gap-6 text-cream/20 text-xs font-heading tracking-widest uppercase mt-6">
            <span>Natural + studio lighting</span>
            <span className="text-cream/10">·</span>
            <span>Multiple backdrop options</span>
            <span className="text-cream/10">·</span>
            <span>White cyclorama available</span>
            <span className="text-cream/10">·</span>
            <span>$60/hr · Billed separately</span>
          </div>
        </div>

        {/* Map + directions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-lg mx-auto px-6 mb-12"
        >
          <div className="border border-cream/10 overflow-hidden">
            <iframe
              title="NoDa Art House location map"
              src={MAPS_EMBED_URL}
              className="w-full h-56 grayscale-[40%] contrast-125"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <a
            href={MAPS_DIRECTIONS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center justify-center gap-2 font-heading text-[10px] tracking-[0.2em] uppercase text-gold/70 hover:text-gold transition-colors"
          >
            <HiLocationMarker /> {STUDIO_ADDRESS} · Get Directions
          </a>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="max-w-lg mx-auto px-6"
        >
          <SmartIntakeForm selectedPackage={{ id: 'studio', label: 'Studio A — NoDa Art House', price: '$60/hr' }} />
        </motion.div>

        {/* Bottom note */}
        <div className="max-w-lg mx-auto px-6 mt-12 pt-8 border-t border-cream/5">
          <p className="text-cream/15 text-xs text-center font-body leading-relaxed">
            Studio rental is booked and paid directly through{' '}
            <a
              href="https://www.nodaarthouse.com/book-online"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cream/25 hover:text-gold/50 transition-colors underline"
            >
              NoDa Art House
            </a>
            . Seven will send you the direct booking link with your dates confirmed.
            Cam's photography session fees are separate from studio rental.
          </p>
          <p className="text-center mt-6">
            <Link
              to="/"
              className="font-heading text-[9px] tracking-[0.25em] uppercase text-cream/20 hover:text-gold/50 transition-colors"
            >
              ← Back to shotbyseven.com
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </>
  )
}
