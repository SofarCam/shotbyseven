import { motion, useInView } from 'framer-motion'
import { useRef, useState } from 'react'
import { HiLocationMarker, HiExternalLink } from 'react-icons/hi'

// ============================================
// SETUP: Replace this with your Calendly URL
// 1. Go to calendly.com and create a free account
// 2. Set up your event types (Portrait, Fashion, etc.)
// 3. Paste your Calendly URL below
// ============================================
const CALENDLY_URL = '' // e.g. 'https://calendly.com/shotbyseven'

const packages = [
  { id: 'portrait', label: 'Portrait Session', duration: 'Hourly $50', price: 'From $150', description: 'Headshots, personal branding, lifestyle' },
  { id: 'graduation', label: 'Graduation', duration: 'Cap & gown + creative', price: 'From $250', description: 'Celebrate your milestone in style' },
  { id: 'studio', label: 'Studio Concepts', duration: 'Creative direction', price: 'From $200', description: 'Editorial, fashion, artistic sessions at NoDa Art House' },
  { id: 'events', label: 'Events', duration: 'Varies', price: 'Varies', description: 'Birthdays, corporate, parties, special occasions' },
  { id: 'travel', label: 'Travel Work', duration: 'Custom', price: 'Inquiry', description: 'Destination shoots — tell me where and I\'ll reach out' },
]

export default function Booking() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [formData, setFormData] = useState({ name: '', email: '', date: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
  }

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
            Book a <span className="italic text-gold">Session</span>
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

        {/* If Calendly is configured, embed it */}
        {CALENDLY_URL ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="max-w-3xl mx-auto"
          >
            <iframe
              src={`${CALENDLY_URL}?hide_gdpr_banner=1&background_color=0d0b09&text_color=fdf8f0&primary_color=d4a04a`}
              width="100%"
              height="700"
              frameBorder="0"
              title="Book a session"
              className="rounded-none"
            />
          </motion.div>
        ) : (
          <>
            {/* Package selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-16"
            >
              {packages.map((pkg) => (
                <motion.button
                  key={pkg.id}
                  whileHover={{ y: -4 }}
                  onClick={() => setSelectedPackage(pkg)}
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

            {/* Booking form */}
            {selectedPackage && !submitted && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-lg mx-auto"
              >
                <div className="border border-cream/10 p-1 mb-8">
                  <div className="bg-gold/5 p-4 flex items-center justify-between">
                    <div>
                      <p className="font-display text-lg font-bold text-cream">{selectedPackage.label}</p>
                      <p className="text-cream/30 text-xs">{selectedPackage.duration} at NoDa Art House</p>
                    </div>
                    <span className="font-display text-xl font-bold text-gold">{selectedPackage.price}</span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="font-heading text-[10px] tracking-[0.2em] uppercase text-cream/30 block mb-2">Name</label>
                    <input
                      type="text" name="name" value={formData.name} onChange={handleChange} required
                      className="w-full bg-transparent border-b border-cream/10 focus:border-gold py-3 text-cream outline-none transition-colors placeholder-cream/15"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="font-heading text-[10px] tracking-[0.2em] uppercase text-cream/30 block mb-2">Email</label>
                    <input
                      type="email" name="email" value={formData.email} onChange={handleChange} required
                      className="w-full bg-transparent border-b border-cream/10 focus:border-gold py-3 text-cream outline-none transition-colors placeholder-cream/15"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <label className="font-heading text-[10px] tracking-[0.2em] uppercase text-cream/30 block mb-2">Preferred Date</label>
                    <input
                      type="date" name="date" value={formData.date} onChange={handleChange} required
                      className="w-full bg-transparent border-b border-cream/10 focus:border-gold py-3 text-cream outline-none transition-colors placeholder-cream/15"
                    />
                  </div>
                  <div>
                    <label className="font-heading text-[10px] tracking-[0.2em] uppercase text-cream/30 block mb-2">
                      {selectedPackage?.id === 'travel' ? 'Travel Inquiry — Where are you looking to shoot?' : 'Details'}
                    </label>
                    <textarea
                      name="message" value={formData.message} onChange={handleChange} rows={3} required={selectedPackage?.id === 'travel'}
                      className="w-full bg-transparent border-b border-cream/10 focus:border-gold py-3 text-cream outline-none transition-colors resize-none placeholder-cream/15"
                      placeholder={selectedPackage?.id === 'travel' ? 'Where is the travel shoot? What kind of session are you looking for?' : 'Tell me about your vision...'}
                    />
                  </div>
                  <p className="text-cream/15 text-xs">
                    Sessions are held at NoDa Art House, Charlotte NC. Availability will be confirmed within 24 hours.
                  </p>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-4 bg-gold text-ink font-heading text-sm tracking-widest uppercase hover:bg-gold-light transition-colors duration-300"
                  >
                    Request Booking
                  </motion.button>
                </form>
              </motion.div>
            )}

            {/* Success */}
            {submitted && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-lg mx-auto text-center py-16"
              >
                <div className="font-display text-6xl text-gold mb-6">&#10003;</div>
                <h3 className="font-display text-2xl font-bold text-cream mb-3">Request Sent</h3>
                <p className="text-cream/40 text-sm mb-8">
                  I&apos;ll confirm your {selectedPackage?.label} at NoDa Art House within 24 hours.
                  Check your email at {formData.email} for details.
                </p>
                <button
                  onClick={() => { setSubmitted(false); setSelectedPackage(null); setFormData({ name: '', email: '', date: '', message: '' }) }}
                  className="font-heading text-xs tracking-[0.2em] uppercase text-gold hover:text-gold-light transition-colors"
                >
                  Book Another Session
                </button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </section>
  )
}
