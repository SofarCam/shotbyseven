import { motion, useInView } from 'framer-motion'
import { useRef, useState } from 'react'
import { GemMarker } from './HiddenGems'
import { HiLocationMarker, HiCalendar, HiClock, HiUser, HiCheckCircle, HiExternalLink } from 'react-icons/hi'

const studioPackages = [
  { id: '1hr', label: '1 Hour Studio Rental', price: 60, description: 'Perfect for headshots, quick portraits' },
  { id: '2hr', label: '2 Hour Studio Rental', price: 110, description: 'Most popular — ideal for most sessions' },
  { id: '3hr', label: '3 Hour Studio Rental', price: 150, description: 'Extended creative time' },
  { id: '4hr', label: '4 Hour Studio Rental', price: 190, description: 'Full production blocks' },
  { id: '6hr', label: '6 Hour Studio Rental', price: 280, description: 'Music videos, full-day shoots' },
]

export default function StudioBooking() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    package: '',
    theirDates: ['', '', ''],
    theirTimes: ['afternoon', 'afternoon', 'afternoon'],
    name: '',
    email: '',
    phone: '',
    shootType: '',
    specialRequests: '',
  })
  const [submitted, setSubmitted] = useState(false)

  const selectedPackage = studioPackages.find(p => p.id === formData.package)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
    
    const subject = `NoDa Studio Inquiry: ${selectedPackage?.label}`
    const body = `
Studio Rental Request

Package: ${selectedPackage?.label}
Price: $${selectedPackage?.price}

Preferred Dates:
${formData.theirDates.filter(d => d).join(', ')}
Preferred Times: ${formData.theirTimes.filter(t => t).join(', ')}

Shoot Type: ${formData.shootType || 'Not specified'}

Contact:
Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone}

Special Requests: ${formData.specialRequests || 'None'}

---

Next Steps:
1. Cam will check NoDa Art House availability
2. Once confirmed, you'll receive the direct booking link: https://www.nodaarthouse.com/book-online
3. Pay deposit to secure your slot
    `.trim()
    
    window.location.href = `mailto:shotbyseven777@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  if (submitted) {
    return (
      <section id="studio-booking" className="py-32 px-6 lg:px-12 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <HiCheckCircle className="w-20 h-20 text-gold mx-auto mb-8" />
          <h2 className="font-display text-4xl font-bold text-cream mb-4">
            Request Sent!
          </h2>
          <p className="text-cream/60 max-w-md mx-auto mb-8">
            Cam will check NoDa Art House availability for your dates and respond within 24 hours.
          </p>
          <div className="border border-gold/20 p-6 max-w-lg mx-auto">
            <p className="text-cream/40 text-sm mb-4">Direct NoDa Booking Link (for after Cam confirms):</p>
            <a 
              href="https://www.nodaarthouse.com/book-online"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-gold hover:text-gold-light transition-colors"
            >
              <HiExternalLink className="w-4 h-4" />
              nodaarthouse.com/book-online
            </a>
          </div>
        </motion.div>
      </section>
    )
  }

  return (
    <section id="studio-booking" className="py-32 px-6 lg:px-12 max-w-4xl mx-auto" ref={ref}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
      >
        <div className="text-center mb-12">
          <span className="font-heading text-xs tracking-[0.3em] uppercase text-gold mb-4 block">
            NoDa Art House
          </span>
          <h2 className="font-display text-5xl md:text-6xl font-bold text-cream mb-4">
            Book <span className="italic text-gold">Studio</span> Time
            <GemMarker gemIndex={5} className="inline-block relative -top-3 ml-2" />
          </h2>
          <p className="text-cream/40 max-w-lg mx-auto">
            Rent Studio A at NoDa Art House. Tell me when you're free — I'll check availability.
          </p>
        </div>

        {/* Progress */}
        <div className="flex justify-center gap-2 mb-12">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-colors ${
                step >= i ? 'bg-gold' : 'bg-cream/20'
              }`}
            />
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Step 1: Package Selection */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div>
                <label className="block font-heading text-xs tracking-[0.2em] uppercase text-gold mb-4">
                  <HiClock className="inline mr-2" />Select Rental Duration
                </label>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {studioPackages.map((pkg) => (
                    <button
                      key={pkg.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, package: pkg.id })}
                      className={`p-4 border text-left transition-all ${
                        formData.package === pkg.id
                          ? 'border-gold bg-gold/10'
                          : 'border-cream/10 hover:border-gold/30'
                      }`}
                    >
                      <p className="font-display text-cream">{pkg.label}</p>
                      <p className="text-gold text-lg font-bold">${pkg.price}</p>
                      <p className="text-cream/40 text-xs mt-1">{pkg.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-cream/5 border border-cream/10 p-6">
                <p className="text-cream/60 text-sm mb-2">
                  <HiLocationMarker className="inline mr-2 text-gold" />
                  <strong>NoDa Art House</strong> — 3109 Cullman Ave, Charlotte, NC
                </p>
                <p className="text-cream/40 text-xs">
                  Studio includes: Lighting equipment, backdrops, tripod, dressing area.
                  Max 20 guests. Parking available.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!formData.package}
                className="w-full font-heading text-xs tracking-[0.2em] uppercase text-ink bg-gold px-8 py-4 hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next: Your Availability
              </button>
            </motion.div>
          )}

          {/* Step 2: Their Availability */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div className="text-center mb-6">
                <p className="text-cream/60">
                  When are <strong>YOU</strong> free? Pick up to 3 options.
                </p>
              </div>

              {[0, 1, 2].map((i) => (
                <div key={i} className="grid sm:grid-cols-2 gap-4 border border-cream/10 p-4">
                  <div>
                    <label className="block text-cream/60 text-sm mb-2">
                      Preferred Date {i + 1} {i === 0 && '*'}
                    </label>
                    <input
                      type="date"
                      value={formData.theirDates[i]}
                      onChange={(e) => {
                        const newDates = [...formData.theirDates]
                        newDates[i] = e.target.value
                        setFormData({ ...formData, theirDates: newDates })
                      }}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full bg-transparent border border-cream/20 px-4 py-3 text-cream focus:border-gold outline-none"
                      required={i === 0}
                    />
                  </div>
                  <div>
                    <label className="block text-cream/60 text-sm mb-2">Preferred Time</label>
                    <select
                      value={formData.theirTimes[i]}
                      onChange={(e) => {
                        const newTimes = [...formData.theirTimes]
                        newTimes[i] = e.target.value
                        setFormData({ ...formData, theirTimes: newTimes })
                      }}
                      className="w-full bg-transparent border border-cream/20 px-4 py-3 text-cream focus:border-gold outline-none"
                    >
                      <option value="morning" className="bg-ink">Morning (9am-12pm)</option>
                      <option value="afternoon" className="bg-ink">Afternoon (12pm-5pm)</option>
                      <option value="evening" className="bg-ink">Evening (5pm-9pm)</option>
                    </select>
                  </div>
                </div>
              ))}

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 font-heading text-xs tracking-[0.2em] uppercase text-cream border border-cream/20 px-8 py-4 hover:border-gold transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={!formData.theirDates[0]}
                  className="flex-1 font-heading text-xs tracking-[0.2em] uppercase text-ink bg-gold px-8 py-4 hover:bg-gold-light transition-colors disabled:opacity-50"
                >
                  Next: Contact Info
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Contact + Submit */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="bg-gold/5 border border-gold/20 p-4 mb-6">
                <p className="text-gold text-sm">
                  <strong>Summary:</strong> {selectedPackage?.label} — ${selectedPackage?.price}
                </p>
                <p className="text-cream/60 text-xs mt-1">
                  Dates: {formData.theirDates.filter(d => d).join(', ')}
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-cream/60 text-sm mb-2">
                    <HiUser className="inline mr-2" />Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full bg-transparent border border-cream/20 px-4 py-3 text-cream focus:border-gold outline-none"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-cream/60 text-sm mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-transparent border border-cream/20 px-4 py-3 text-cream focus:border-gold outline-none"
                    placeholder="(555) 555-5555"
                  />
                </div>
              </div>

              <div>
                <label className="block text-cream/60 text-sm mb-2">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full bg-transparent border border-cream/20 px-4 py-3 text-cream focus:border-gold outline-none"
                  placeholder="you@email.com"
                />
              </div>

              <div>
                <label className="block text-cream/60 text-sm mb-2">
                  What type of shoot?
                </label>
                <input
                  type="text"
                  value={formData.shootType}
                  onChange={(e) => setFormData({ ...formData, shootType: e.target.value })}
                  className="w-full bg-transparent border border-cream/20 px-4 py-3 text-cream focus:border-gold outline-none"
                  placeholder="Portrait, music video, product, etc."
                />
              </div>

              <div>
                <label className="block text-cream/60 text-sm mb-2">
                  Special Requests
                </label>
                <textarea
                  value={formData.specialRequests}
                  onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                  rows={3}
                  className="w-full bg-transparent border border-cream/20 px-4 py-3 text-cream focus:border-gold outline-none resize-none"
                  placeholder="Specific backdrop needs, equipment, etc."
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 font-heading text-xs tracking-[0.2em] uppercase text-cream border border-cream/20 px-8 py-4 hover:border-gold transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 font-heading text-xs tracking-[0.2em] uppercase text-ink bg-gold px-8 py-4 hover:bg-gold-light transition-colors"
                >
                  Submit Request
                </button>
              </div>
            </motion.div>
          )}
        </form>
      </motion.div>
    </section>
  )
}
