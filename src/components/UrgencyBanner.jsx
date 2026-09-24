import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HiX } from 'react-icons/hi'
import { Link } from 'react-router-dom'
import { upcomingMiniDates, formatMiniDate } from '../holidayMinis'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

function getNextMonth() {
  const now = new Date()
  const next = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  return MONTHS[next.getMonth()]
}

export default function UrgencyBanner() {
  const [dismissed, setDismissed] = useState(() => {
    try { return sessionStorage.getItem('urgency_dismissed') === '1' } catch { return false }
  })

  const dismiss = () => {
    setDismissed(true)
    try { sessionStorage.setItem('urgency_dismissed', '1') } catch { /* storage unavailable */ }
  }

  const month = getNextMonth()
  // Promote Holiday Minis whenever a date is on the calendar, and all of Oct–Dec
  const nextMini = upcomingMiniDates()[0]
  const holidaySeason = Boolean(nextMini) || new Date().getMonth() >= 9

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden"
        >
          <div className="relative bg-gold/10 border-y border-gold/20 py-3 px-6 text-center">
            {holidaySeason ? (
              <Link
                to="/holiday-minis"
                className="font-heading text-[11px] tracking-[0.2em] uppercase text-gold hover:text-gold-light transition-colors"
              >
                Holiday Mini Sessions{nextMini ? ` · ${formatMiniDate(nextMini)}` : ' at NoDa Art House'}
                <span className="hidden sm:inline"> &nbsp;·&nbsp; {nextMini ? 'Save your spot' : 'Get on the list'}</span>
              </Link>
            ) : (
              <a
                href="#smart-booking"
                className="font-heading text-[11px] tracking-[0.2em] uppercase text-gold hover:text-gold-light transition-colors"
              >
                {month} sessions booking now — limited availability
                <span className="hidden sm:inline"> &nbsp;·&nbsp; Reserve your date</span>
              </a>
            )}
            <button
              onClick={dismiss}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gold/40 hover:text-gold transition-colors"
              aria-label="Dismiss"
            >
              <HiX className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
