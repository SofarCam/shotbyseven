import { motion, useInView } from 'framer-motion'
import { useRef, useState } from 'react'
import { GemMarker } from './HiddenGems'
import { HiLocationMarker, HiCalendar, HiClock, HiUser, HiCamera, HiCheckCircle, HiMail, HiGift } from 'react-icons/hi'
import { sendBookingEmail } from '../utils/emailService'
import BookingCalendar from './BookingCalendar'

const CRM_URL = import.meta.env.VITE_CRM_WEBHOOK_URL
const STRIPE_DEPOSIT_URL = import.meta.env.VITE_STRIPE_DEPOSIT_URL
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

const logToCRM = async (data) => {
  if (!CRM_URL) return
  try {
    await fetch(CRM_URL, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  } catch (e) {
    console.warn('CRM log failed (non-blocking):', e)
  }
}

const sessionTypes = [
  { id: 'portrait', label: 'Portrait/Headshots', basePrice: 150, minDuration: 1 },
  { id: 'couples', label: 'Couples/Engagement', basePrice: 200, minDuration: 1.5 },
  { id: 'graduation', label: 'Graduation', basePrice: 250, minDuration: 2 },
  { id: 'maternity', label: 'Maternity/Family', basePrice: 300, minDuration: 2 },
  { id: 'event', label: 'Event Coverage', basePrice: 250, minDuration: 3 },
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
    isCreator: false,
    creatorHandle: '',
    creatorPlatform: 'instagram',
    name: '',
    email: '',
    phone: '',
    vision: '',
    budget: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [submittedBookingId, setSubmittedBookingId] = useState('')
  const [submittedStripeUrl, setSubmittedStripeUrl] = useState('')
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState('')
  const [previousBookings, setPreviousBookings] = useState(null) // null = not looked up yet
  const [lookupLoading, setLookupLoading] = useState(false)
  const [uploadedPhotos, setUploadedPhotos] = useState([]) // [{url, thumbnail}]
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const checkLoyalty = async (email) => {
    if (!CRM_URL || !email || !email.includes('@')) return
    setLookupLoading(true)
    try {
      const res = await fetch(`${CRM_URL}?action=lookup&email=${encodeURIComponent(email)}`)
      const data = await res.json()
      setPreviousBookings(data.count || 0)
    } catch (e) {
      console.warn('Loyalty lookup failed (non-blocking):', e)
      setPreviousBookings(0)
    } finally {
      setLookupLoading(false)
    }
  }

  const handlePhotoUpload = async (files) => {
    setUploadError('')
    const remaining = 3 - uploadedPhotos.length
    if (remaining <= 0) { setUploadError('Max 3 photos already uploaded.'); return }
    const toUpload = Array.from(files).slice(0, remaining)

    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
      setUploadError('Photo upload not configured yet — describe your vision in text or email references to shotbyseven777@gmail.com.')
      return
    }

    setIsUploading(true)
    for (const file of toUpload) {
      if (!file.type.startsWith('image/')) { setUploadError('JPG/PNG only.'); continue }
      if (file.size > 5 * 1024 * 1024) { setUploadError(`${file.name} is over 5MB — try a smaller file.`); continue }
      const fd = new FormData()
      fd.append('file', file)
      fd.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
      try {
        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, { method: 'POST', body: fd })
        const data = await res.json()
        if (data.secure_url) {
          const thumb = data.secure_url.replace('/upload/', '/upload/w_200,h_200,c_fill/')
          setUploadedPhotos(prev => [...prev, { url: data.secure_url, thumbnail: thumb }])
        } else {
          setUploadError('Upload failed — try again.')
        }
      } catch {
        setUploadError('Upload failed — check connection and try again.')
      }
    }
    setIsUploading(false)
  }

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

  const effectiveCount = previousBookings !== null ? previousBookings : parseInt(formData.sessionsCount) || 0
  const hasLoyaltyDiscount = effectiveCount >= 3
  const basePrice = getBasePrice()
  const finalPrice = hasLoyaltyDiscount ? Math.round(basePrice * 0.5) : basePrice
  const depositAmount = 100

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSending(true)
    setSendError('')

    // Generate unique 9-char booking ID
    const bookingId = (Date.now().toString(36) + Math.random().toString(36).substring(2, 6)).toUpperCase().substring(0, 9)
    const portalUrl = `https://shotbyseven.com/portal/${bookingId}`
    const stripeUrl = STRIPE_DEPOSIT_URL
      ? `${STRIPE_DEPOSIT_URL}?client_reference_id=${bookingId}&prefilled_email=${encodeURIComponent(formData.email)}`
      : null

    const selectedType = sessionTypes.find(t => t.id === formData.sessionType)
    const selectedLocation = charlotteLocations.find(l => l.id === formData.location)
    const loyaltyStatus = hasLoyaltyDiscount
      ? '50% OFF Applied (' + effectiveCount + ' previous sessions) — $' + basePrice + ' → $' + finalPrice
      : 'None (' + effectiveCount + ' sessions so far)'
    const datesString = [
      formData.theirDates[0] ? '1. ' + formData.theirDates[0] + ' (' + formData.theirTimes[0] + ')' : '',
      formData.theirDates[1] ? '2. ' + formData.theirDates[1] + ' (' + formData.theirTimes[1] + ')' : '',
      formData.theirDates[2] ? '3. ' + formData.theirDates[2] + ' (' + formData.theirTimes[2] + ')' : '',
    ].filter(Boolean).join('\n')

    const packageInfo = {
      label: (selectedType ? selectedType.label : 'Not selected') + ' — ' + formData.duration + 'hrs @ ' + (selectedLocation ? selectedLocation.label : ''),
      price: '$' + finalPrice + (hasLoyaltyDiscount ? ' (50% loyalty discount applied)' : ''),
    }

    const enrichedFormData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone || 'Not provided',
      preferredContact: 'Email',
      date: datesString,
      eventType: formData.headcount + (formData.headcount === '1' ? ' person' : ' people'),
      bookingId,
      portalUrl,
      stripeUrl,
      depositAmount,
      photoReferences: uploadedPhotos.length > 0 ? uploadedPhotos.map(p => p.url).join('\n') : '',
      photoCount: uploadedPhotos.length,
      message: [
        'BOOKING ID: ' + bookingId,
        'AVAILABILITY:\n' + datesString,
        'LOYALTY: ' + loyaltyStatus,
        'VISION: ' + (formData.vision || 'Open to creative direction'),
        'BUDGET: ' + (formData.budget || 'Not specified'),
        uploadedPhotos.length > 0 ? 'PHOTO REFERENCES (' + uploadedPhotos.length + '):\n' + uploadedPhotos.map((p, i) => (i + 1) + '. ' + p.url).join('\n') : '',
      ].filter(Boolean).join('\n\n'),
    }

    try {
      await sendBookingEmail(enrichedFormData, packageInfo)
      // Log to Google Sheets CRM (fire-and-forget, non-blocking)
      logToCRM({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || '',
        session_type: packageInfo.label,
        duration: formData.duration + ' hrs',
        headcount: formData.headcount,
        location: charlotteLocations.find(l => l.id === formData.location)?.label || '',
        dates: datesString,
        sessions_count: String(effectiveCount),
        loyalty_status: hasLoyaltyDiscount ? '50% OFF Applied' : 'None',
        vision: formData.vision || '',
        budget: formData.budget || '',
        booking_id: bookingId,
        portal_url: portalUrl,
        deposit_amount: String(depositAmount),
      })
      setSubmittedBookingId(bookingId)
      setSubmittedStripeUrl(stripeUrl)
      setSubmitted(true)
    } catch (err) {
      console.error('Booking email failed:', err)
      setSendError('Failed to send. Please email shotbyseven777@gmail.com directly.')
    } finally {
      setSending(false)
    }
  }

  if (submitted) {
    return (
      <section id="smart-booking" className="py-32 px-6 lg:px-12 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <HiCheckCircle className="w-20 h-20 text-gold mx-auto mb-8" />
          <h2 className="font-display text-4xl font-bold text-cream mb-4">Request Sent!</h2>
          <p className="text-cream/60 max-w-md mx-auto mb-6">
            Your booking request has been sent! I&apos;ll respond within 24 hours.
          </p>
          {/* Booking ID — save this! */}
          <div className="mb-6 p-4 border border-gold/30 bg-gold/5 max-w-md mx-auto text-left">
            <p className="text-cream/50 font-heading text-[10px] tracking-[0.2em] uppercase mb-1">Your Booking ID</p>
            <p className="text-gold font-mono text-2xl tracking-widest font-bold">{submittedBookingId}</p>
            <p className="text-cream/30 text-[10px] font-body mt-1">Save this — you&apos;ll need it to check your status at shotbyseven.com/portal</p>
          </div>

          {hasLoyaltyDiscount && (
            <div className="bg-gold/10 border border-gold/40 p-4 max-w-md mx-auto mb-6 flex items-center gap-3">
              <HiGift className="text-gold w-5 h-5 flex-shrink-0" />
              <p className="text-gold font-heading text-sm tracking-wide">50% loyalty discount has been noted!</p>
            </div>
          )}

          {/* Step 1: Contract */}
          <div className="border border-cream/10 bg-cream/3 p-5 max-w-md mx-auto mb-4 text-left">
            <p className="font-heading text-[10px] tracking-[0.25em] uppercase text-cream/30 mb-1">Step 1</p>
            <p className="text-cream font-heading text-xs tracking-wide mb-2">Sign Your Contract</p>
            <p className="text-cream/50 text-sm font-body leading-relaxed">
              Check your email — I&apos;ll send a contract link to review and sign before your session. No shoot happens without a signed agreement.
            </p>
          </div>

          {/* Step 2: Deposit */}
          <div className="border border-gold/30 bg-gold/5 p-5 max-w-md mx-auto mb-6 text-left">
            <p className="font-heading text-[10px] tracking-[0.25em] uppercase text-gold/50 mb-1">Step 2</p>
            <p className="text-gold font-heading text-xs tracking-wide mb-2">Secure Your Date</p>
            <p className="text-cream/50 text-sm font-body leading-relaxed mb-3">
              A non-refundable deposit of <span className="text-cream font-bold">${depositAmount}</span> is required to lock in your date. Your date is not confirmed until the deposit is received. The remaining balance of <span className="text-cream/80">${finalPrice - depositAmount}</span> is due on shoot day.
              {hasLoyaltyDiscount && ' Your 50% loyalty discount has already been applied.'}
            </p>
            {submittedStripeUrl ? (
              <>
                <div className="bg-gold/10 border border-gold/20 px-4 py-2 mb-3 flex items-center gap-2">
                  <span className="text-gold/70 text-[10px] font-heading tracking-[0.15em] uppercase">Enter exactly</span>
                  <span className="text-gold font-bold text-lg">${depositAmount}</span>
                  <span className="text-gold/70 text-[10px] font-heading tracking-[0.15em] uppercase">at checkout</span>
                </div>
                <a
                  href={submittedStripeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full py-3 bg-gold text-ink font-heading text-xs tracking-[0.2em] uppercase text-center hover:bg-gold/90 transition-colors duration-200"
                >
                  Pay ${depositAmount} Deposit →
                </a>
              </>
            ) : (
              <p className="text-cream/30 text-xs font-body italic">Deposit link coming soon — Cam will send it via email.</p>
            )}
          </div>

          <div className="border border-cream/10 p-5 max-w-md mx-auto">
            <p className="text-cream/40 text-sm mb-2">Questions? Reach out directly:</p>
            <a href="mailto:shotbyseven777@gmail.com" className="text-gold hover:text-gold/80 transition-colors">
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
                <p className="text-cream/60">Pick an available slot — or scroll to find a time that works for you.</p>
              </div>

              <BookingCalendar
                selectedDate={formData.theirDates[0]}
                selectedTime={formData.theirTimes[0]}
                onSelect={({ date, time }) => {
                  const newDates = formData.theirDates.slice()
                  const newTimes = formData.theirTimes.slice()
                  newDates[0] = date || ''
                  newTimes[0] = time || ''
                  setFormData(Object.assign({}, formData, { theirDates: newDates, theirTimes: newTimes }))
                }}
              />

              {/* Fallback manual entry for 2nd/3rd preference */}
              <div>
                <p className="font-heading text-[9px] tracking-[0.2em] uppercase text-cream/20 mb-3">
                  Add backup dates (optional)
                </p>
                {[1, 2].map((i) => (
                  <div key={i} className="grid sm:grid-cols-2 gap-3 mb-3">
                    <input
                      type="date"
                      value={formData.theirDates[i]}
                      onChange={(e) => {
                        const newDates = formData.theirDates.slice()
                        newDates[i] = e.target.value
                        setFormData(Object.assign({}, formData, { theirDates: newDates }))
                      }}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full bg-transparent border border-cream/10 px-4 py-2 text-cream/50 focus:border-gold outline-none text-sm"
                    />
                    <select
                      value={formData.theirTimes[i]}
                      onChange={(e) => {
                        const newTimes = formData.theirTimes.slice()
                        newTimes[i] = e.target.value
                        setFormData(Object.assign({}, formData, { theirTimes: newTimes }))
                      }}
                      className="w-full bg-transparent border border-cream/10 px-4 py-2 text-cream/50 focus:border-gold outline-none text-sm"
                    >
                      <option value="morning" className="bg-ink">Morning (9am–12pm)</option>
                      <option value="afternoon" className="bg-ink">Afternoon (12pm–5pm)</option>
                      <option value="evening" className="bg-ink">Evening (5pm–9pm)</option>
                    </select>
                  </div>
                ))}
              </div>

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

              {(previousBookings !== null || lookupLoading) && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 py-3 px-4 border border-cream/10 bg-cream/5"
                >
                  {lookupLoading ? (
                    <span className="text-cream/40 text-sm font-heading tracking-wide">Checking your history...</span>
                  ) : previousBookings === 0 ? (
                    <span className="text-cream/50 text-sm flex items-center gap-2">
                      <HiGift className="w-4 h-4 text-gold" /> First time booking — welcome!
                    </span>
                  ) : (
                    <span className="text-gold text-sm flex items-center gap-2 font-heading tracking-wide">
                      <HiGift className="w-4 h-4" />
                      Welcome back! {previousBookings} session{previousBookings !== 1 ? 's' : ''} with Cam
                      {hasLoyaltyDiscount && ' — 50% loyalty discount unlocked! 🎉'}
                    </span>
                  )}
                </motion.div>
              )}

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
                  onBlur={(e) => checkLoyalty(e.target.value)}
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

              {/* Photo Upload */}
              <div>
                <label className="block text-cream/60 text-sm mb-3">Inspiration / Reference Photos <span className="text-cream/30">(optional, max 3)</span></label>
                {CLOUDINARY_CLOUD_NAME ? (
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => { e.preventDefault(); if (!isUploading && uploadedPhotos.length < 3) handlePhotoUpload(e.dataTransfer.files) }}
                    onClick={() => { if (!isUploading && uploadedPhotos.length < 3) document.getElementById('photo-upload-input').click() }}
                    className={'border-2 border-dashed p-6 text-center transition-colors ' + (uploadedPhotos.length < 3 && !isUploading ? 'border-cream/20 hover:border-gold/50 cursor-pointer' : 'border-cream/10 cursor-default')}
                  >
                    {isUploading ? (
                      <p className="text-gold/70 text-sm font-heading tracking-wide animate-pulse">Uploading...</p>
                    ) : uploadedPhotos.length >= 3 ? (
                      <p className="text-cream/30 text-sm">3 photos uploaded ✓</p>
                    ) : (
                      <>
                        <p className="text-cream/50 text-sm">Drag photos here or <span className="text-gold underline">click to browse</span></p>
                        <p className="text-cream/25 text-xs mt-1">Max 3 photos · 5MB each · JPG or PNG</p>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="border border-cream/10 bg-cream/3 p-4">
                    <p className="text-cream/40 text-xs font-body">Photo upload coming soon — paste inspo links in your vision above, or email references to <span className="text-gold">shotbyseven777@gmail.com</span></p>
                  </div>
                )}
                <input type="file" id="photo-upload-input" multiple accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => { handlePhotoUpload(e.target.files); e.target.value = '' }} />
                {uploadedPhotos.length > 0 && (
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {uploadedPhotos.map((photo, idx) => (
                      <div key={idx} className="relative group">
                        <img src={photo.thumbnail} alt={'Ref ' + (idx + 1)} className="w-20 h-20 object-cover border border-cream/10" />
                        <button
                          type="button"
                          onClick={() => setUploadedPhotos(prev => prev.filter((_, i) => i !== idx))}
                          className="absolute -top-1 -right-1 w-5 h-5 bg-red-500/80 text-white text-xs flex items-center justify-center hover:bg-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >×</button>
                      </div>
                    ))}
                  </div>
                )}
                {uploadError && (
                  <p className="text-red-400/70 text-xs font-body mt-2">{uploadError}</p>
                )}
              </div>

              <div>
                <label className="block text-cream/60 text-sm mb-2">Budget range</label>
                <input type="text" value={formData.budget}
                  onChange={(e) => setFormData(Object.assign({}, formData, { budget: e.target.value }))}
                  className="w-full bg-transparent border border-cream/20 px-4 py-3 text-cream focus:border-gold outline-none"
                  placeholder="e.g. $200-$400"
                />
              </div>

              {sendError && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400/80 text-xs font-heading tracking-wider text-center">
                  {sendError}
                </motion.p>
              )}

              <div className="flex gap-4">
                <button type="button" onClick={() => setStep(2)}
                  disabled={sending}
                  className="flex-1 font-heading text-xs tracking-[0.2em] uppercase text-cream border border-cream/20 px-8 py-4 hover:border-gold transition-colors disabled:opacity-50">
                  Back
                </button>
                <button type="submit"
                  disabled={sending}
                  className="flex-1 font-heading text-xs tracking-[0.2em] uppercase text-ink bg-gold px-8 py-4 hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  {sending ? 'Sending...' : 'Submit Request'}
                </button>
              </div>
            </motion.div>
          )}

        </form>
      </motion.div>
    </section>
  )
}
