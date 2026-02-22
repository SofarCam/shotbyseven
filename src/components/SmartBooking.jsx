import { motion, useInView } from 'framer-motion'
import { useRef, useState } from 'react'
import { GemMarker } from './HiddenGems'
import { HiLocationMarker, HiCalendar, HiClock, HiUser, HiCamera, HiCheckCircle, HiMail, HiGift } from 'react-icons/hi'

const sessionTypes = [
  { id: 'portrait', label: 'Portrait/Headshots', basePrice: 150, minDuration: 1 },
  { id: 'couples', label: 'Couples/Engagement', basePrice: 200, minDuration: 1.5 },
  { id: 'graduation', label: 'Graduation', basePrice: 250, minDuration: 2 },
  { id: 'maternity', label: 'Maternity/Family', basePrice: 300, minDuration: 2 },
  { id: 'event', label: 'Event Coverage', basePrice: 400, minDuration: 3 },
  { id: 'fashion', label: 'Fashion/Editorial', basePrice: 350, minDuration: 2 },
  { id: 'sports', label: 'Sports/Action', basePrice: 200, minDuration: 1.5 },
]

const charlotteLocations = [
  { id: 'client', label: 'Your Preferred Location' },
  { id: 'uptown', label: 'Charlotte Uptown' },
  { id: 'noda', label: 'NoDa Arts District' },
  { id: 'freedom', label: 'Freedom Park' },
  { id: 'romare', label: 'Romare Bearden Park' },
  { id: 'studio', label: 'Studio A — NoDa Art House (+$60/hr)' },
]

export default function SmartBooking() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    sessionType: '',
    duration: 2,
    headcount: '1',
    theirDates: ['', '', ''],
    theirTimes: ['afternoon', 'afternoon', 'afternoon'],
    location: '',
    sessionsCount: '',
    name: '',
    email: '',
    phone: '',
    vision: '',
    budget: '',
  })
  const [submitted, setSubmitted] = useState(false)

  const getBasePrice = () => {
    const type = sessionTypes.find(t => t.id === formData.sessionType)
    if (!type) return 0
    let price = type.basePrice
    if (formData.duration > type.minDuration) {
      price += (formData.duration - type.minDuration) * 75
    }
    if (formData.location === 'studio') {
      price += formData.duration * 60
    }
    return price
  }

  const hasLoyaltyDiscount = parseInt(formData.sessionsCount) >= 3
  const basePrice = getBasePrice()
  const finalPrice = hasLoyaltyDiscount ? Math.round(basePrice * 0.5) : basePrice

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
    const selectedType = sessionTypes.find(t => t.id === formData.sessionType)
    const selectedLocation = charlotteLocations.find(l => l.id === formData.location)
    const subject = 'Photo Session Booking: ' + (selectedType ? selectedType.label : 'Session')
    const loyaltyLine = hasLoyaltyDiscount
      ? '50% LOYALTY DISCOUNT APPLIED — ' + formData.sessionsCount + ' sessions completed\nOriginal: $' + basePrice + ' -> Discounted: $' + finalPrice
      : 'Sessions with Cam so far: ' + (formData.sessionsCount || '0') + ' (book 3 for 50% off your 4th)'
    const priceLine = hasLoyaltyDiscount
      ? 'DISCOUNTED TOTAL: $' + finalPrice
      : 'ESTIMATED TOTAL: $' + finalPrice
    const body = [
      'Hey Seven,',
      '',
      'I want to book a photo session!',
      '',
      'SESSION DETAILS:',
      '- Type: ' + (selectedType ? selectedType.label : 'Not selected'),
      '- Duration: ' + formData.duration + ' hours',
      '- Headcount: ' + formData.headcount + (formData.headcount === '1' ? ' person' : ' people'),
      '- Location: ' + (selectedLocation ? selectedLocation.label : 'Not selected'),
      '',
      'WHEN I AM FREE:',
      '1. ' + (formData.theirDates[0] || 'TBD') + ' (' + formData.theirTimes[0] + ')',
      '2. ' + (formData.theirDates[1] || 'TBD') + ' (' + formData.theirTimes[1] + ')',
      '3. ' + (formData.theirDates[2] || 'TBD') + ' (' + formData.theirTimes[2] + ')',
      '',
      'LOYALTY STATUS:',
      loyaltyLine,
      '',
      priceLine,
      '',
      'MY VISION: ' + (formData.vision || 'Open to creative direction'),
      'BUDGET: ' + (formData.budget || 'Not specified'),
      '',
      'MY INFO:',
      '- Name: ' + formData.name,
      '- Email: ' + formData.email,
      '- Phone: ' + (formData.phone || 'Not provided'),
      '',
      '--',
      'Sent via SmartBooking on shotbyseven.com',
    ].join('\n')
    window.location.href = 'mailto:shotbyseven777@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body)
  }

  if (submitted) {
    return (
      <section id="smart-booking" className="py-32 px-6 lg:px-12 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <HiCheckCircle className="w-20 h-20 text-gold mx-auto mb-8" />
          <h2 className="font-display text-4xl font-bold text-cream mb-4">Request Sent!</h2>
          <p className="text-cream/60 max-w-md mx-auto mb-6">
            Check your email to send the booking request. I&apos;ll respond within 24 hours.
          </p>
          {hasLoyaltyDiscount && (
            <div className="bg-gold/10 border border-gold/40 p-4 max-w-md mx-auto mb-4 flex items-center gap-3">
              <HiGift className="text-gold w-5 h-5 flex-shrink-0" />
              <p className="text-gold font-heading text-sm tracking-wide">50% loyalty discount has been noted!</p>
            </div>
          )}
          <div className="bg-gold/5 border border-gold/20 p-6 max-w-md mx-auto">
            <p className="text-cream/40 text-sm mb-2">If email did not open:</p>
            <a href="mailto:shotbyseven777@gmail.com" className="text-gold hover:text-gold-light transition-colors">
              shotbyseven777@gmail.com
            </a>
          </div>
        </motion.div>
      </section>
    )
  }

  return (
    <section id="smart-booking" className="py-32 px-6 lg:px-12 max-w-4xl mx-auto" ref={ref}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
      >
        <div className="text-center mb-12">
          <span className="font-heading text-xs tracking-[0.3em] uppercase text-gold mb-4 block">Smart Booking</span>
          <h2 className="font-display text-5xl md:text-6xl font-bold text-cream mb-4">
            Book a <span className="italic text-gold">Session</span>
            <GemMarker gemIndex={5} className="inline-block relative -top-3 ml-2" />
          </h2>
          <p className="text-cream/40 max-w-lg mx-auto">
            Tell me when YOU&apos;re free — I&apos;ll match it with my calendar and respond within 24 hours.
          </p>
        </div>

        <div className="flex justify-center gap-2 mb-12">
          {[1, 2, 3].map((i) => (
            <div key={i} className={'w-3 h-3 rounded-full transition-colors duration-300 ' + (step >= i ? 'bg-gold' : 'bg-cream/20')} />
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">

          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
              <div>
                <label className="block font-heading text-xs tracking-[0.2em] uppercase text-gold mb-4">
                  <HiCamera className="inline mr-2" />Session Type
                </label>
                <div className="grid sm:grid-cols-2 gap-3">
                  {sessionTypes.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setFormData(Object.assign({}, formData, { sessionType: type.id }))}
                      className={'p-4 border text-left transition-all ' + (formData.sessionType === type.id ? 'border-gold bg-gold/10' : 'border-cream/10 hover:border-gold/30')}
                    >
                      <p className={'font-display ' + (formData.sessionType === type.id ? 'text-cream' : 'text-cream/70')}>{type.label}</p>
                      <p className="text-gold text-sm">From ${type.basePrice}</p>
                    </button>
                  ))}
                </div>
              </div>

              {formData.sessionType && (
                <>
                  <div>
                    <label className="block font-heading text-xs tracking-[0.2em] uppercase text-gold mb-4">
                      <HiClock className="inline mr-2" />Duration: {formData.duration} hours
                    </label>
                    <input
                      type="range"
                      min={sessionTypes.find(t => t.id === formData.sessionType) ? sessionTypes.find(t => t.id === formData.sessionType).minDuration : 1}
                      max={8}
                      step={0.5}
                      value={formData.duration}
                      onChange={(e) => setFormData(Object.assign({}, formData, { duration: parseFloat(e.target.value) }))}
                      className="w-full accent-gold"
                    />
                    <div className="flex justify-between text-cream/30 text-xs mt-2">
                      <span>{sessionTypes.find(t => t.id === formData.sessionType) ? sessionTypes.find(t => t.id === formData.sessionType).minDuration : 1}hr min</span>
                      <span className="font-heading font-bold text-sm text-cream/60">Est. ${finalPrice}</span>
                      <span>8hr max</span>
                    </div>
                  </div>

                  <div>
                    <label className="block font-heading text-xs tracking-[0.2em] uppercase text-gold mb-4">
                      <HiUser className="inline mr-2" />How many people?
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {['1', '2', '3-5', '6-10', '11-20'].map((count) => (
                        <button
                          key={count}
                          type="button"
                          onClick={() => setFormData(Object.assign({}, formData, { headcount: count }))}
                          className={'font-heading text-[10px] tracking-[0.1em] uppercase px-4 py-2 border transition-all ' + (formData.headcount === count ? 'border-gold bg-gold/10 text-gold' : 'border-cream/10 text-cream/40 hover:border-gold/30')}
                        >
                          {count === '1' ? 'Just me' : count + ' people'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-heading text-xs tracking-[0.2em] uppercase text-gold mb-4">
                      <HiLocationMarker className="inline mr-2" />Location
                    </label>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {charlotteLocations.map((loc) => (
                        <button
                          key={loc.id}
                          type="button"
                          onClick={() => setFormData(Object.assign({}, formData, { location: loc.id }))}
                          className={'p-4 border text-left transition-all ' + (formData.location === loc.id ? 'border-gold bg-gold/10' : 'border-cream/10 hover:border-gold/30')}
                        >
                          <p className={'font-heading text-[10px] tracking-[0.1em] uppercase ' + (formData.location === loc.id ? 'text-gold' : 'text-cream/50')}>
                            {loc.label}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    disabled={!formData.location || !formData.headcount}
                    className="w-full font-heading text-xs tracking-[0.2em] uppercase text-ink bg-gold px-8 py-4 hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next: Your Availability
                  </button>
                </>
              )}
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
              <div className="text-center mb-6">
                <p className="text-cream/60">When are <strong className="text-cream">YOU</strong> free? Pick up to 3 options.</p>
              </div>

              {[0, 1, 2].map((i) => (
                <div key={i} className="grid sm:grid-cols-2 gap-4 border border-cream/10 p-4">
                  <div>
                    <label className="block text-cream/60 text-sm mb-2">
                      <HiCalendar className="inline mr-1" />Preferred Date {i + 1}{i === 0 ? ' *' : ''}
                    </label>
                    <input
                      type="date"
                      value={formData.theirDates[i]}
                      onChange={(e) => {
                        const newDates = formData.theirDates.slice()
                        newDates[i] = e.target.value
                        setFormData(Object.assign({}, formData, { theirDates: newDates }))
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
                        const newTimes = formData.theirTimes.slice()
                        newTimes[i] = e.target.value
                        setFormData(Object.assign({}, formData, { theirTimes: newTimes }))
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
                <button type="button" onClick={() => setStep(1)}
                  className="flex-1 font-heading text-xs tracking-[0.2em] uppercase text-cream border border-cream/20 px-8 py-4 hover:border-gold transition-colors">
                  Back
                </button>
                <button type="button" onClick={() => setStep(3)}
                  disabled={!formData.theirDates[0]}
                  className="flex-1 font-heading text-xs tracking-[0.2em] uppercase text-ink bg-gold px-8 py-4 hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  Next: Contact Info
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">

              <div className={'border p-4 ' + (hasLoyaltyDiscount ? 'bg-gold/10 border-gold/40' : 'bg-gold/5 border-gold/20')}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gold text-sm font-bold">
                      {sessionTypes.find(t => t.id === formData.sessionType) ? sessionTypes.find(t => t.id === formData.sessionType).label : ''} — {formData.duration}hrs
                    </p>
                    <p className="text-cream/50 text-xs mt-0.5">
                      {charlotteLocations.find(l => l.id === formData.location) ? charlotteLocations.find(l => l.id === formData.location).label : ''} · {formData.theirDates.filter(function(d) { return d }).join(', ')}
                    </p>
                  </div>
                  <div className="text-right">
                    {hasLoyaltyDiscount ? (
                      <>
                        <p className="text-cream/30 text-xs line-through">${basePrice}</p>
                        <p className="text-gold font-bold">${finalPrice}</p>
                      </>
                    ) : (
                      <p className="text-gold font-bold">Est. ${finalPrice}</p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-heading text-xs tracking-[0.2em] uppercase text-gold mb-2">
                  <HiGift className="inline mr-2" />Previous sessions with Cam?
                </label>
                <p className="text-cream/30 text-xs mb-3">Book 3 sessions — get your 4th at 50% off</p>
                <input
                  type="number"
                  min="0"
                  value={formData.sessionsCount}
                  onChange={(e) => setFormData(Object.assign({}, formData, { sessionsCount: e.target.value }))}
                  placeholder="0"
                  className="w-32 bg-transparent border border-cream/20 px-4 py-3 text-cream focus:border-gold outline-none"
                />
                {hasLoyaltyDiscount && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 flex items-center gap-2 text-gold"
                  >
                    <HiGift className="w-4 h-4" />
                    <span className="font-heading text-xs tracking-wider">
                      50% loyalty discount unlocked — ${basePrice} drops to ${finalPrice}!
                    </span>
                  </motion.div>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-cream/60 text-sm mb-2"><HiUser className="inline mr-1" />Name *</label>
                  <input type="text" value={formData.name}
                    onChange={(e) => setFormData(Object.assign({}, formData, { name: e.target.value }))}
                    required
                    className="w-full bg-transparent border border-cream/20 px-4 py-3 text-cream focus:border-gold outline-none"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-cream/60 text-sm mb-2">Phone</label>
                  <input type="tel" value={formData.phone}
                    onChange={(e) => setFormData(Object.assign({}, formData, { phone: e.target.value }))}
                    className="w-full bg-transparent border border-cream/20 px-4 py-3 text-cream focus:border-gold outline-none"
                    placeholder="(555) 555-5555"
                  />
                </div>
              </div>

              <div>
                <label className="block text-cream/60 text-sm mb-2"><HiMail className="inline mr-1" />Email *</label>
                <input type="email" value={formData.email}
                  onChange={(e) => setFormData(Object.assign({}, formData, { email: e.target.value }))}
                  required
                  className="w-full bg-transparent border border-cream/20 px-4 py-3 text-cream focus:border-gold outline-none"
                  placeholder="you@email.com"
                />
              </div>

              <div>
                <label className="block text-cream/60 text-sm mb-2">Your vision for the shoot</label>
                <textarea value={formData.vision}
                  onChange={(e) => setFormData(Object.assign({}, formData, { vision: e.target.value }))}
                  rows={3}
                  className="w-full bg-transparent border border-cream/20 px-4 py-3 text-cream focus:border-gold outline-none resize-none"
                  placeholder="Mood, style, inspiration, references..."
                />
              </div>

              <div>
                <label className="block text-cream/60 text-sm mb-2">Budget range</label>
                <input type="text" value={formData.budget}
                  onChange={(e) => setFormData(Object.assign({}, formData, { budget: e.target.value }))}
                  className="w-full bg-transparent border border-cream/20 px-4 py-3 text-cream focus:border-gold outline-none"
                  placeholder="e.g. $200-$400"
                />
              </div>

              <div className="flex gap-4">
                <button type="button" onClick={() => setStep(2)}
                  className="flex-1 font-heading text-xs tracking-[0.2em] uppercase text-cream border border-cream/20 px-8 py-4 hover:border-gold transition-colors">
                  Back
                </button>
                <button type="submit"
                  className="flex-1 font-heading text-xs tracking-[0.2em] uppercase text-ink bg-gold px-8 py-4 hover:bg-gold-light transition-colors">
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
