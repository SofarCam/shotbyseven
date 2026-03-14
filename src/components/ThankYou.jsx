import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  HiCheckCircle,
  HiCalendar,
  HiCamera,
  HiShare,
  HiArrowRight,
  HiGift,
  HiClipboardDocument,
} from 'react-icons/hi2'
import { FaInstagram } from 'react-icons/fa'
import FilmGrain from './FilmGrain'
import CustomCursor from './CustomCursor'

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] },
})

/* ── Referral link generator ── */
function generateReferralCode(bookingId) {
  // Simple referral code based on booking ID
  return bookingId ? `REF-${bookingId.slice(0, 6).toUpperCase()}` : null
}

/* ── Copy to clipboard button ── */
function CopyButton({ text, label }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
    }
  }
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2 px-4 py-2 border border-gold/30 text-gold/80 hover:border-gold hover:text-gold transition-all duration-200 text-xs font-heading tracking-[0.15em] uppercase"
    >
      <HiClipboardDocument className="w-3.5 h-3.5" />
      {copied ? 'Copied!' : label}
    </button>
  )
}

/* ── What happens next steps ── */
const NEXT_STEPS = [
  {
    icon: HiCheckCircle,
    title: 'Deposit Paid',
    desc: 'Your date is locked in. You should receive a Stripe receipt.',
    color: 'text-emerald-400',
  },
  {
    icon: HiClipboardDocument,
    title: 'Contract (within 24hrs)',
    desc: "I'll email you a contract to sign before your session. Check your inbox.",
    color: 'text-gold',
  },
  {
    icon: HiCamera,
    title: 'Prep Email (48hrs before)',
    desc: "What to wear, where to park, what to bring. I'll have you fully prepped.",
    color: 'text-blue-400',
  },
  {
    icon: HiCalendar,
    title: 'Shoot Day',
    desc: "Show up, be yourself. I'll take care of everything else.",
    color: 'text-cream/60',
  },
]

export default function ThankYou() {
  const [params] = useSearchParams()
  const bookingId = params.get('id') || ''
  const stripeUrl = params.get('stripe') || ''
  const depositAmount = params.get('deposit') || '100'
  const hasLoyalty = params.get('loyalty') === '1'
  const sessionType = params.get('type') || 'Session'

  const referralCode = generateReferralCode(bookingId)
  const referralUrl = `https://shotbyseven.com?ref=${referralCode}`
  const referralMessage = `Just booked a session with Shot by Seven in Charlotte 📸 Use my referral link and we both save: ${referralUrl}`

  // Track that deposit page was opened
  useEffect(() => {
    if (stripeUrl) {
      // Already auto-opened by SmartBooking — this is just the confirmation page
    }
  }, [stripeUrl])

  return (
    <>
      <CustomCursor />
      <FilmGrain />

      <div className="min-h-screen bg-[#0a0a0a] text-cream px-6 py-20 flex flex-col items-center">

        {/* Header */}
        <motion.div {...fade(0)} className="text-center mb-16 max-w-lg">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="mb-6"
          >
            <HiCheckCircle className="w-16 h-16 text-gold mx-auto" />
          </motion.div>

          <motion.p {...fade(0.1)} className="font-heading text-[10px] tracking-[0.35em] uppercase text-gold/60 mb-3">
            You&apos;re booked
          </motion.p>
          <motion.h1 {...fade(0.2)} className="font-display text-5xl md:text-6xl font-bold text-cream mb-4">
            Let&apos;s <span className="italic text-gold">Make It.</span>
          </motion.h1>
          <motion.p {...fade(0.3)} className="text-cream/40 font-body text-sm leading-relaxed">
            {sessionType} request confirmed. Here&apos;s everything you need to know before your session.
          </motion.p>
        </motion.div>

        <div className="w-full max-w-lg space-y-4">

          {/* Deposit CTA — if not yet paid */}
          {stripeUrl && (
            <motion.div {...fade(0.35)} className="border-2 border-gold bg-gold/10 p-6 text-center">
              <p className="font-heading text-[10px] tracking-[0.25em] uppercase text-gold/70 mb-2">
                Step 1 — Lock In Your Date
              </p>
              <p className="text-cream/70 font-body text-sm mb-4">
                Pay your <span className="text-gold font-bold">${depositAmount} deposit</span> to confirm your spot.
                {hasLoyalty && <span className="text-gold"> 50% loyalty discount applied.</span>}
              </p>
              <a
                href={stripeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-4 bg-gold text-ink font-heading text-sm tracking-[0.2em] uppercase text-center hover:bg-gold/90 transition-colors duration-200 font-bold"
              >
                Pay ${depositAmount} Deposit Now →
              </a>
              <p className="text-cream/25 text-[10px] font-body mt-2">
                Secure checkout via Stripe · No account needed
              </p>
            </motion.div>
          )}

          {/* Booking ID */}
          {bookingId && (
            <motion.div {...fade(0.4)} className="border border-cream/10 bg-cream/3 p-5">
              <p className="font-heading text-[10px] tracking-[0.25em] uppercase text-cream/30 mb-2">
                Your Booking ID
              </p>
              <div className="flex items-center justify-between">
                <p className="text-gold font-mono text-2xl tracking-widest font-bold">{bookingId}</p>
                <CopyButton text={bookingId} label="Copy" />
              </div>
              <p className="text-cream/25 text-[10px] font-body mt-2">
                Track your booking at{' '}
                <Link to="/portal" className="text-gold/60 hover:text-gold underline">
                  shotbyseven.com/portal
                </Link>
              </p>
            </motion.div>
          )}

          {/* What happens next */}
          <motion.div {...fade(0.45)} className="border border-cream/10 p-6">
            <p className="font-heading text-[10px] tracking-[0.25em] uppercase text-cream/30 mb-5">
              What Happens Next
            </p>
            <div className="space-y-5">
              {NEXT_STEPS.map((step, i) => {
                const Icon = step.icon
                return (
                  <div key={i} className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-0.5">
                      <Icon className={`w-4 h-4 ${step.color}`} />
                    </div>
                    <div>
                      <p className="font-heading text-xs tracking-wide text-cream/80 mb-0.5">
                        {step.title}
                      </p>
                      <p className="font-body text-xs text-cream/35 leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>

          {/* Referral block */}
          {referralCode && (
            <motion.div {...fade(0.5)} className="border border-gold/20 bg-gold/5 p-6">
              <div className="flex items-center gap-2 mb-3">
                <HiGift className="w-4 h-4 text-gold" />
                <p className="font-heading text-[10px] tracking-[0.25em] uppercase text-gold/70">
                  Give $25 · Get $25
                </p>
              </div>
              <p className="font-body text-sm text-cream/60 leading-relaxed mb-4">
                Refer a friend to Shot by Seven. When they book, you both get <span className="text-gold font-medium">$25 off</span> your next session.
              </p>
              <div className="bg-ink/60 border border-cream/8 p-3 mb-4 font-mono text-xs text-cream/50 break-all">
                {referralUrl}
              </div>
              <div className="flex gap-2 flex-wrap">
                <CopyButton text={referralUrl} label="Copy Link" />
                <CopyButton text={referralMessage} label="Copy Message" />
                <a
                  href={`https://instagram.com/direct/new/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 border border-cream/15 text-cream/50 hover:border-cream/40 hover:text-cream/80 transition-all duration-200 text-xs font-heading tracking-[0.15em] uppercase"
                >
                  <FaInstagram className="w-3.5 h-3.5" />
                  Share on IG
                </a>
              </div>
            </motion.div>
          )}

          {/* Follow on IG */}
          <motion.div {...fade(0.55)} className="border border-cream/8 p-5 flex items-center justify-between">
            <div>
              <p className="font-heading text-xs tracking-wide text-cream/60 mb-0.5">Follow the journey</p>
              <p className="font-body text-xs text-cream/30">Behind the scenes, client work, Charlotte vibes</p>
            </div>
            <a
              href="https://instagram.com/shotbyseven777"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 bg-cream/5 border border-cream/15 hover:border-gold/40 hover:text-gold transition-all duration-200 text-cream/60 text-xs font-heading tracking-[0.15em] uppercase"
            >
              <FaInstagram className="w-3.5 h-3.5" />
              @shotbyseven777
            </a>
          </motion.div>

          {/* Questions */}
          <motion.div {...fade(0.6)} className="text-center pt-2 pb-6">
            <p className="text-cream/25 text-xs font-body mb-1">Questions before your session?</p>
            <a
              href="mailto:shotbyseven777@gmail.com"
              className="text-gold/60 hover:text-gold text-sm font-body transition-colors"
            >
              shotbyseven777@gmail.com
            </a>
          </motion.div>

          {/* Back to site */}
          <motion.div {...fade(0.65)} className="text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-cream/25 hover:text-cream/60 text-xs font-heading tracking-[0.15em] uppercase transition-colors"
            >
              ← Back to shotbyseven.com
            </Link>
          </motion.div>

        </div>
      </div>
    </>
  )
}
