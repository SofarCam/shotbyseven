import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import CustomCursor from './CustomCursor'
import FilmGrain from './FilmGrain'
import ScrollProgress from './ScrollProgress'
import SmartIntakeForm from './SmartIntakeForm'

export default function StudioPage() {
  return (
    <>
      <CustomCursor />
      <FilmGrain />
      <ScrollProgress />
      <Navbar />

      <main className="min-h-screen bg-ink pt-24 pb-32">
        {/* Header */}
        <div className="text-center py-16 px-6 border-b border-cream/5 mb-12">
          <p className="font-heading text-[10px] tracking-[0.35em] uppercase text-gold/60 mb-3">
            Studio A — NoDa Art House
          </p>
          <h1 className="font-display text-4xl lg:text-5xl font-bold text-cream mb-4">
            Book the Studio
          </h1>
          <p className="text-cream/30 text-sm max-w-sm mx-auto mb-6">
            $60/hr · Charlotte, NC · Max 20 people<br />
            Seven checks availability and responds within 5 minutes.
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
