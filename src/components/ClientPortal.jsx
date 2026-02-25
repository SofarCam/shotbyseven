import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { HiCheckCircle, HiClock, HiMail, HiPhone, HiExternalLink, HiDocumentText, HiPhotograph, HiLockClosed } from 'react-icons/hi'

const CRM_URL = import.meta.env.VITE_CRM_WEBHOOK_URL
const STRIPE_DEPOSIT_URL = import.meta.env.VITE_STRIPE_DEPOSIT_URL

const STATUS_STEPS = [
  { key: 'submitted', label: 'Request Received' },
  { key: 'contract', label: 'Contract Sent' },
  { key: 'deposit', label: 'Deposit Paid' },
  { key: 'confirmed', label: 'Session Confirmed' },
  { key: 'gallery', label: 'Gallery Ready' },
]

function StatusBar({ currentStatus }) {
  const currentIndex = STATUS_STEPS.findIndex(s => s.key === currentStatus)
  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between relative">
        <div className="absolute top-3 left-0 right-0 h-[1px] bg-cream/10" />
        <div
          className="absolute top-3 left-0 h-[1px] bg-gold transition-all duration-700"
          style={{ width: `${Math.max(0, (currentIndex / (STATUS_STEPS.length - 1)) * 100)}%` }}
        />
        {STATUS_STEPS.map((step, i) => {
          const done = i <= currentIndex
          return (
            <div key={step.key} className="flex flex-col items-center gap-2 z-10">
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${
                done ? 'bg-gold border-gold' : 'bg-ink border-cream/20'
              }`}>
                {done && <HiCheckCircle className="w-4 h-4 text-ink" />}
              </div>
              <span className={`font-heading text-[8px] tracking-[0.15em] uppercase hidden sm:block ${
                done ? 'text-gold' : 'text-cream/20'
              }`}>
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function LoginForm({ onLogin, loading, error }) {
  const [email, setEmail] = useState('')
  const [bookingId, setBookingId] = useState('')

  // Auto-fill booking ID from URL: /portal/ABC123 or /portal?id=ABC123
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const idFromQuery = params.get('id')
    const idFromPath = window.location.pathname.split('/').pop()
    const id = idFromQuery || (idFromPath && idFromPath !== 'portal' ? idFromPath : '')
    if (id) setBookingId(id.toUpperCase())
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    onLogin(email, bookingId)
  }

  return (
    <section className="min-h-screen bg-ink flex items-center justify-center px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-12">
          <HiLockClosed className="w-8 h-8 text-gold mx-auto mb-4" />
          <span className="font-heading text-xs tracking-[0.3em] uppercase text-gold mb-3 block">Shot by Seven</span>
          <h1 className="font-display text-4xl font-bold text-cream mb-3">Client Portal</h1>
          <p className="text-cream/40 text-sm font-body">Enter your email and booking ID to view your session status.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-heading text-[10px] tracking-[0.2em] uppercase text-cream/40 mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full bg-transparent border border-cream/20 px-4 py-3 text-cream focus:border-gold outline-none font-body"
              placeholder="you@email.com"
            />
          </div>
          <div>
            <label className="block font-heading text-[10px] tracking-[0.2em] uppercase text-cream/40 mb-2">Booking ID</label>
            <input
              type="text"
              value={bookingId}
              onChange={e => setBookingId(e.target.value)}
              required
              className="w-full bg-transparent border border-cream/20 px-4 py-3 text-cream focus:border-gold outline-none font-body"
              placeholder="e.g. SBS-2026-001"
            />
            <p className="text-cream/25 text-xs font-body mt-1">Check your booking confirmation email for your ID.</p>
          </div>

          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400/70 text-xs font-heading tracking-wider text-center">
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full font-heading text-xs tracking-[0.2em] uppercase text-ink bg-gold px-8 py-4 hover:bg-gold/90 transition-colors disabled:opacity-50 mt-2"
          >
            {loading ? 'Looking up...' : 'View My Booking →'}
          </button>
        </form>

        <p className="text-center text-cream/25 text-xs font-body mt-8">
          Questions? <a href="mailto:shotbyseven777@gmail.com" className="text-gold hover:text-gold/80 transition-colors">shotbyseven777@gmail.com</a>
        </p>
      </motion.div>
    </section>
  )
}

export default function ClientPortal() {
  const [view, setView] = useState('login') // login | dashboard | notfound
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [booking, setBooking] = useState(null)

  const handleLogin = async (email, bookingId) => {
    setLoading(true)
    setError('')
    try {
      if (CRM_URL) {
        const res = await fetch(`${CRM_URL}?action=portal&email=${encodeURIComponent(email)}&bookingId=${encodeURIComponent(bookingId)}`)
        const data = await res.json()
        if (data && data.found) {
          setBooking(data)
          setView('dashboard')
          return
        }
      }
      // Fallback: show a pending status if CRM doesn't support portal lookup yet
      setBooking({
        name: email.split('@')[0],
        email,
        bookingId,
        status: 'submitted',
        sessionType: 'Photography Session',
        depositAmount: null,
        depositPaid: false,
        contractUrl: null,
        galleryUrl: null,
        shootDate: null,
        totalAmount: null,
      })
      setView('dashboard')
    } catch (e) {
      setError('Could not look up your booking. Please check your details and try again.')
    } finally {
      setLoading(false)
    }
  }

  if (view === 'login') {
    return <LoginForm onLogin={handleLogin} loading={loading} error={error} />
  }

  const depositAmount = booking.depositAmount || 100
  const remainingBalance = booking.totalAmount ? booking.totalAmount - depositAmount : null

  return (
    <section className="min-h-screen bg-ink px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="max-w-2xl mx-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <span className="font-heading text-[10px] tracking-[0.3em] uppercase text-gold block mb-1">Shot by Seven</span>
            <h1 className="font-display text-3xl font-bold text-cream">Client Portal</h1>
          </div>
          <button
            onClick={() => setView('login')}
            className="font-heading text-[10px] tracking-[0.15em] uppercase text-cream/30 hover:text-gold transition-colors border border-cream/10 hover:border-gold/30 px-3 py-2"
          >
            Sign Out
          </button>
        </div>

        {/* Booking ID + Name */}
        <div className="border border-cream/10 bg-cream/3 p-5 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-heading text-[10px] tracking-[0.2em] uppercase text-cream/30 mb-1">Welcome back</p>
              <p className="text-cream font-display text-xl font-bold capitalize">{booking.name}</p>
              <p className="text-cream/40 text-xs font-body mt-0.5">{booking.sessionType}</p>
            </div>
            <div className="text-right">
              <p className="font-heading text-[10px] tracking-[0.2em] uppercase text-cream/30 mb-1">Booking ID</p>
              <p className="text-gold font-heading text-sm tracking-wide">{booking.bookingId}</p>
              {booking.shootDate && (
                <p className="text-cream/40 text-xs font-body mt-1">{booking.shootDate}</p>
              )}
            </div>
          </div>
        </div>

        {/* Status Bar */}
        <StatusBar currentStatus={booking.status} />

        {/* Contract */}
        <div className={`border p-5 mb-4 ${booking.contractUrl ? 'border-gold/30 bg-gold/5' : 'border-cream/10'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <HiDocumentText className={`w-5 h-5 ${booking.contractUrl ? 'text-gold' : 'text-cream/20'}`} />
              <div>
                <p className="font-heading text-xs tracking-wide text-cream">Contract</p>
                <p className="text-cream/40 text-xs font-body mt-0.5">
                  {booking.contractUrl ? 'Ready to sign — check your email' : 'Cam will send this to your email shortly'}
                </p>
              </div>
            </div>
            {booking.contractUrl ? (
              <a
                href={booking.contractUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-heading text-[10px] tracking-[0.15em] uppercase text-ink bg-gold px-4 py-2 hover:bg-gold/90 transition-colors flex items-center gap-1"
              >
                Sign <HiExternalLink className="w-3 h-3" />
              </a>
            ) : (
              <span className="font-heading text-[10px] tracking-[0.15em] uppercase text-cream/20 border border-cream/10 px-4 py-2">
                Pending
              </span>
            )}
          </div>
        </div>

        {/* Deposit */}
        <div className={`border p-5 mb-4 ${booking.depositPaid ? 'border-gold/30 bg-gold/5' : 'border-cream/10'}`}>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <HiCheckCircle className={`w-5 h-5 ${booking.depositPaid ? 'text-gold' : 'text-cream/20'}`} />
              <div>
                <p className="font-heading text-xs tracking-wide text-cream">Deposit</p>
                <p className="text-cream/40 text-xs font-body mt-0.5">
                  {booking.depositPaid
                    ? `$${depositAmount} received — date secured ✓`
                    : `$${depositAmount} due to lock in your date`}
                </p>
                {remainingBalance && !booking.depositPaid && (
                  <p className="text-cream/30 text-xs font-body mt-0.5">Remaining balance: ${remainingBalance} due on shoot day</p>
                )}
              </div>
            </div>
            {booking.depositPaid ? (
              <span className="font-heading text-[10px] tracking-[0.15em] uppercase text-gold border border-gold/30 px-4 py-2">
                Paid ✓
              </span>
            ) : STRIPE_DEPOSIT_URL ? (
              <a
                href={STRIPE_DEPOSIT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-heading text-[10px] tracking-[0.15em] uppercase text-ink bg-gold px-4 py-2 hover:bg-gold/90 transition-colors"
              >
                Pay ${depositAmount} →
              </a>
            ) : (
              <span className="font-heading text-[10px] tracking-[0.15em] uppercase text-cream/20 border border-cream/10 px-4 py-2">
                Pending
              </span>
            )}
          </div>
        </div>

        {/* Gallery */}
        <div className={`border p-5 mb-8 ${booking.galleryUrl ? 'border-gold/30 bg-gold/5' : 'border-cream/10'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <HiPhotograph className={`w-5 h-5 ${booking.galleryUrl ? 'text-gold' : 'text-cream/20'}`} />
              <div>
                <p className="font-heading text-xs tracking-wide text-cream">Your Gallery</p>
                <p className="text-cream/40 text-xs font-body mt-0.5">
                  {booking.galleryUrl ? 'Ready — delivered via PicTime' : 'Available within 7 days of your session'}
                </p>
              </div>
            </div>
            {booking.galleryUrl ? (
              <a
                href={booking.galleryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-heading text-[10px] tracking-[0.15em] uppercase text-ink bg-gold px-4 py-2 hover:bg-gold/90 transition-colors flex items-center gap-1"
              >
                View <HiExternalLink className="w-3 h-3" />
              </a>
            ) : (
              <span className="font-heading text-[10px] tracking-[0.15em] uppercase text-cream/20 border border-cream/10 px-4 py-2 flex items-center gap-1">
                <HiClock className="w-3 h-3" /> Soon
              </span>
            )}
          </div>
        </div>

        {/* Contact */}
        <div className="border border-cream/10 p-5">
          <p className="font-heading text-[10px] tracking-[0.2em] uppercase text-cream/30 mb-3">Questions? Reach out directly</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a href="mailto:shotbyseven777@gmail.com" className="flex items-center gap-2 text-gold hover:text-gold/80 transition-colors text-sm font-body">
              <HiMail className="w-4 h-4" /> shotbyseven777@gmail.com
            </a>
            <a href="https://instagram.com/shotbyseven777" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-cream/40 hover:text-gold transition-colors text-sm font-body">
              <HiExternalLink className="w-4 h-4" /> @shotbyseven777
            </a>
          </div>
        </div>

      </motion.div>
    </section>
  )
}
