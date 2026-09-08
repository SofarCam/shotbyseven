import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { hasResponded, getConsent, setConsent, acceptAll, rejectAll } from '../utils/consent'

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)
  const [managing, setManaging] = useState(false)
  const [analytics, setAnalytics] = useState(false)
  const [marketing, setMarketing] = useState(false)

  useEffect(() => {
    if (!hasResponded()) {
      setVisible(true)
    }
  }, [])

  const openPreferences = () => {
    const existing = getConsent()
    setAnalytics(existing?.analytics ?? true)
    setMarketing(existing?.marketing ?? true)
    setManaging(true)
    setVisible(true)
  }

  // Expose a way for the footer link to reopen this without prop drilling
  useEffect(() => {
    window.__openCookiePreferences = openPreferences
    return () => { delete window.__openCookiePreferences }
  }, [])

  const handleAcceptAll = () => {
    acceptAll()
    setVisible(false)
    setManaging(false)
  }

  const handleRejectAll = () => {
    rejectAll()
    setVisible(false)
    setManaging(false)
  }

  const handleSavePreferences = () => {
    setConsent({ analytics, marketing })
    setVisible(false)
    setManaging(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-0 inset-x-0 z-[100] bg-warm-black border-t border-gold/20 shadow-2xl shadow-ink/60"
          role="dialog"
          aria-label="Cookie preferences"
          aria-modal="false"
        >
          <div className="max-w-4xl mx-auto px-6 py-6">
            {!managing ? (
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8">
                <p className="text-cream/60 text-sm font-body leading-relaxed flex-1">
                  We use cookies for site analytics (Google Analytics) and ad tracking (Meta Pixel) to understand traffic and measure bookings.
                  These are off by default. Read our{' '}
                  <Link to="/privacy" className="text-gold hover:text-gold-light underline underline-offset-2">Privacy Policy</Link> for details.
                </p>
                <div className="flex items-center gap-3 flex-shrink-0 flex-wrap">
                  <button
                    onClick={() => setManaging(true)}
                    className="font-heading text-[10px] tracking-[0.15em] uppercase text-cream/40 hover:text-cream px-4 py-2.5 border border-cream/15 hover:border-cream/30 transition-colors"
                  >
                    Manage
                  </button>
                  <button
                    onClick={handleRejectAll}
                    className="font-heading text-[10px] tracking-[0.15em] uppercase text-cream/40 hover:text-cream px-4 py-2.5 border border-cream/15 hover:border-cream/30 transition-colors"
                  >
                    Reject Non-Essential
                  </button>
                  <button
                    onClick={handleAcceptAll}
                    className="font-heading text-[10px] tracking-[0.15em] uppercase text-ink bg-gold hover:bg-gold-light px-5 py-2.5 transition-colors"
                  >
                    Accept All
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="font-display text-lg font-bold text-cream mb-1">Cookie Preferences</h2>
                <p className="text-cream/40 text-xs font-body mb-5">
                  Choose what you're comfortable with. You can change this anytime from the link in the footer.
                </p>

                <div className="space-y-4 mb-6">
                  <div className="flex items-start justify-between gap-4 border-b border-cream/8 pb-4">
                    <div>
                      <p className="font-heading text-xs tracking-wide text-cream">Necessary</p>
                      <p className="text-cream/35 text-xs font-body mt-1 max-w-lg">
                        Required for the site to function — booking flow steps, admin login sessions, remembering you dismissed a banner. Cannot be turned off.
                      </p>
                    </div>
                    <div className="flex-shrink-0 mt-1 w-10 h-6 rounded-full bg-gold/30 flex items-center px-0.5 cursor-not-allowed" aria-hidden="true">
                      <div className="w-5 h-5 rounded-full bg-gold ml-auto" />
                    </div>
                  </div>

                  <label className="flex items-start justify-between gap-4 border-b border-cream/8 pb-4 cursor-pointer">
                    <div>
                      <p className="font-heading text-xs tracking-wide text-cream">Analytics</p>
                      <p className="text-cream/35 text-xs font-body mt-1 max-w-lg">
                        Google Analytics — helps us understand which pages get visited and where bookings come from. No effect on your experience if declined.
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={analytics}
                      onClick={() => setAnalytics(!analytics)}
                      className={`flex-shrink-0 mt-1 w-10 h-6 rounded-full flex items-center px-0.5 transition-colors ${analytics ? 'bg-gold' : 'bg-cream/15'}`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-ink transition-transform ${analytics ? 'translate-x-4' : ''}`} />
                    </button>
                  </label>

                  <label className="flex items-start justify-between gap-4 cursor-pointer">
                    <div>
                      <p className="font-heading text-xs tracking-wide text-cream">Marketing</p>
                      <p className="text-cream/35 text-xs font-body mt-1 max-w-lg">
                        Meta (Facebook/Instagram) Pixel — used to measure and improve ad performance. Declining means our ads may be less relevant to you.
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={marketing}
                      onClick={() => setMarketing(!marketing)}
                      className={`flex-shrink-0 mt-1 w-10 h-6 rounded-full flex items-center px-0.5 transition-colors ${marketing ? 'bg-gold' : 'bg-cream/15'}`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-ink transition-transform ${marketing ? 'translate-x-4' : ''}`} />
                    </button>
                  </label>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <button
                    onClick={handleSavePreferences}
                    className="font-heading text-[10px] tracking-[0.15em] uppercase text-ink bg-gold hover:bg-gold-light px-5 py-2.5 transition-colors"
                  >
                    Save Preferences
                  </button>
                  <button
                    onClick={handleRejectAll}
                    className="font-heading text-[10px] tracking-[0.15em] uppercase text-cream/40 hover:text-cream px-4 py-2.5 border border-cream/15 hover:border-cream/30 transition-colors"
                  >
                    Reject Non-Essential
                  </button>
                  <button
                    onClick={() => setManaging(false)}
                    className="font-heading text-[10px] tracking-[0.15em] uppercase text-cream/25 hover:text-cream/50 px-4 py-2.5 transition-colors"
                  >
                    Back
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
