import { motion, useInView } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import { HiLocationMarker, HiExternalLink } from 'react-icons/hi'
import { sendBookingEmail } from '../utils/emailService'
import { GemMarker } from './HiddenGems'

// Calendly removed — Smart Intake Form + SofarSeven AI coming soon
// See SHARED-TASKS.md for spec

const packages = [
  { id: 'portrait', label: 'Portrait Session', duration: 'Hourly', price: 'From $150', description: 'Headshots, personal branding, lifestyle' },
  { id: 'graduation', label: 'Graduation', duration: 'Cap & gown + creative', price: 'From $250', description: 'Celebrate your milestone in style' },
  { id: 'studio', label: 'Studio Concepts', duration: 'Creative direction', price: 'From $200', description: 'Editorial, fashion, maternity, artistic sessions' },
  { id: 'events', label: 'Events', duration: 'Varies', price: 'Varies', description: 'Weddings, proposals, birthdays, corporate & special occasions' },
  { id: 'monthly', label: 'Monthly Package', duration: 'Multiple shoots/mo', price: 'Flat Rate', description: 'Consistent content for creators & brands' },
  { id: 'travel', label: 'Travel Work', duration: 'Custom', price: 'Inquiry', description: 'Destination shoots — tell me where' },
]

export default function Booking({ preSelectedService, onServiceChange }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const [selectedPackage, setSelectedPackage] = useState(null)

  // Handle pre-selection from Services section
  useEffect(() => {
    if (preSelectedService) {
      const pkg = packages.find(p => p.id === preSelectedService)
      if (pkg) setSelectedPackage(pkg)
    }
  }, [preSelectedService])

  return (
    <section id="booking" className="py-32 px-6 lg:px-12 max-w-6xl mx-auto">
      <div ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <span className="font-heading text-xs tracking-[0.3em] uppercase text-gold mb-4 block">
            Ready to Create?
          </span>
          <h2 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-cream">
            Book a <span className="italic text-gold">Session</span> <GemMarker gemIndex={5} className="inline-block relative -top-3" />
          </h2>
        </motion.div>

        {/* NoDa Art House location badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="flex items-center justify-center gap-2 mb-16"
        >
          <HiLocationMarker className="text-gold text-sm" />
          <span className="font-heading text-[10px] tracking-[0.2em] uppercase text-cream/40">
            Shot at NoDa Art House — Charlotte, NC
          </span>
          <a
            href="https://www.nodaarthouse.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold/50 hover:text-gold transition-colors"
          >
            <HiExternalLink size={12} />
          </a>
        </motion.div>

        {/* Package selection — pick your session type first */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12"
        >
          {packages.map((pkg) => (
            <motion.button
              key={pkg.id}
              whileHover={{ y: -4 }}
              onClick={() => {
                setSelectedPackage(pkg)
                if (onServiceChange) onServiceChange(pkg.id)
              }}
              className={`text-left p-6 border transition-all duration-300 ${
                selectedPackage?.id === pkg.id
                  ? 'border-gold bg-gold/5'
                  : 'border-cream/10 hover:border-gold/30'
              }`}
            >
              <h3 className="font-display text-lg font-bold text-cream mb-1">{pkg.label}</h3>
              <p className="text-cream/20 text-xs mb-2">{pkg.description}</p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-cream/30 text-xs">{pkg.duration}</span>
                <span className="font-heading text-[10px] tracking-[0.2em] uppercase text-gold">{pkg.price}</span>
              </div>
            </motion.button>
          ))}
        </motion.div>

        {/* Calendly embed — appears after a package is selected */}
        {selectedPackage && (
          <motion.div
            key={selectedPackage.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto"
          >
            {selectedPackage.id === 'studio' && (
              <p className="text-center font-heading text-[10px] tracking-[0.25em] uppercase text-gold/60 mb-6">
                Studio sessions hosted at NoDa Art House — Charlotte, NC
              </p>
            )}
            <iframe
              src={`${CALENDLY_URL}?hide_gdpr_banner=1&background_color=0d0b09&text_color=fdf8f0&primary_color=d4a04a`}
              width="100%"
              height="700"
              frameBorder="0"
              title={`Book a ${selectedPackage.label}`}
              className="rounded-none"
            />
          </motion.div>
        )}
      </div>
    </section>
  )
}
