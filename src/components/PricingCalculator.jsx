import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const sessionTypes = [
  { id: 'portrait',   label: 'Portrait / Headshots',    basePrice: 150, minDuration: 1,   icon: '🎭' },
  { id: 'couples',    label: 'Couples / Engagement',     basePrice: 200, minDuration: 1.5, icon: '💍' },
  { id: 'graduation', label: 'Graduation',               basePrice: 250, minDuration: 2,   icon: '🎓' },
  { id: 'maternity',  label: 'Maternity / Family',       basePrice: 300, minDuration: 2,   icon: '🌿' },
  { id: 'fashion',    label: 'Fashion / Editorial',      basePrice: 350, minDuration: 2,   icon: '✨' },
  { id: 'sports',     label: 'Sports / Action',          basePrice: 200, minDuration: 1.5, icon: '⚡' },
  { id: 'event',      label: 'Event Coverage',           basePrice: 250, minDuration: 3,   icon: '🎪' },
]

const durations = [1, 1.5, 2, 2.5, 3, 4, 5, 6]

export default function PricingCalculator({ onBookNow }) {
  const [sessionType, setSessionType] = useState(null)
  const [duration, setDuration] = useState(2)
  const [studio, setStudio] = useState(false)
  const [returning, setReturning] = useState(false)

  const selected = sessionTypes.find(t => t.id === sessionType)
  const minDuration = selected ? selected.minDuration : 1
  const effectiveDuration = Math.max(duration, minDuration)

  const calcPrice = () => {
    if (!selected) return null
    let price = selected.basePrice
    if (effectiveDuration > selected.minDuration) {
      price += (effectiveDuration - selected.minDuration) * 75
    }
    if (studio) price += effectiveDuration * 60
    if (returning) price = Math.round(price * 0.5)
    return price
  }

  const price = calcPrice()
  const deposit = price ? 100 : null
  const remaining = price ? price - 100 : null

  const handleBookNow = () => {
    if (onBookNow && sessionType) onBookNow(sessionType)
    const el = document.getElementById('smart-booking')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section id="pricing-calculator" className="py-24 px-6 lg:px-12 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="text-center mb-14"
      >
        <p className="font-heading text-[10px] tracking-[0.3em] uppercase text-gold/60 mb-3">Instant Quote</p>
        <h2 className="font-display text-4xl lg:text-5xl font-bold text-cream mb-4">
          What&apos;s Your Session?
        </h2>
        <p className="text-cream/40 text-sm max-w-md mx-auto">
          Pick your session type, set the time, and see your price in real time. No surprises.
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-10 items-start">
        {/* Left — controls */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="space-y-8"
        >
          {/* Session type */}
          <div>
            <p className="font-heading text-[10px] tracking-[0.25em] uppercase text-cream/30 mb-4">Session Type</p>
            <div className="grid grid-cols-2 gap-2">
              {sessionTypes.map(t => (
                <button
                  key={t.id}
                  onClick={() => {
                    setSessionType(t.id)
                    if (duration < t.minDuration) setDuration(t.minDuration)
                  }}
                  className={`text-left px-4 py-3 border transition-all duration-200 ${
                    sessionType === t.id
                      ? 'border-gold bg-gold/10 text-cream'
                      : 'border-cream/10 text-cream/50 hover:border-cream/30 hover:text-cream/80'
                  }`}
                >
                  <span className="mr-2 text-base">{t.icon}</span>
                  <span className="font-heading text-[10px] tracking-[0.15em] uppercase">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div>
            <p className="font-heading text-[10px] tracking-[0.25em] uppercase text-cream/30 mb-4">
              Duration
              {selected && <span className="text-gold/50 ml-2">(min {selected.minDuration}hr)</span>}
            </p>
            <div className="flex flex-wrap gap-2">
              {durations.map(d => {
                const locked = d < minDuration
                return (
                  <button
                    key={d}
                    disabled={locked}
                    onClick={() => !locked && setDuration(d)}
                    className={`px-4 py-2 border font-heading text-[10px] tracking-[0.15em] uppercase transition-all duration-200 ${
                      effectiveDuration === d && !locked
                        ? 'border-gold bg-gold/10 text-cream'
                        : locked
                        ? 'border-cream/5 text-cream/20 cursor-not-allowed'
                        : 'border-cream/10 text-cream/50 hover:border-cream/30 hover:text-cream/80'
                    }`}
                  >
                    {d}hr
                  </button>
                )
              })}
            </div>
          </div>

          {/* Add-ons */}
          <div>
            <p className="font-heading text-[10px] tracking-[0.25em] uppercase text-cream/30 mb-4">Add-ons</p>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div
                  onClick={() => setStudio(!studio)}
                  className={`w-5 h-5 border flex items-center justify-center transition-all duration-200 cursor-pointer ${
                    studio ? 'border-gold bg-gold/20' : 'border-cream/20 group-hover:border-cream/40'
                  }`}
                >
                  {studio && <div className="w-2 h-2 bg-gold" />}
                </div>
                <div onClick={() => setStudio(!studio)}>
                  <p className="font-heading text-[10px] tracking-[0.15em] uppercase text-cream/70">Studio A — NoDa Art House</p>
                  <p className="text-cream/30 text-xs mt-0.5">+$60/hr · Professional studio space</p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <div
                  onClick={() => setReturning(!returning)}
                  className={`w-5 h-5 border flex items-center justify-center transition-all duration-200 cursor-pointer ${
                    returning ? 'border-gold bg-gold/20' : 'border-cream/20 group-hover:border-cream/40'
                  }`}
                >
                  {returning && <div className="w-2 h-2 bg-gold" />}
                </div>
                <div onClick={() => setReturning(!returning)}>
                  <p className="font-heading text-[10px] tracking-[0.15em] uppercase text-cream/70">Returning Client (3+ sessions)</p>
                  <p className="text-cream/30 text-xs mt-0.5">50% loyalty discount · Automatically verified at checkout</p>
                </div>
              </label>
            </div>
          </div>
        </motion.div>

        {/* Right — price display */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:sticky lg:top-24"
        >
          <div className="border border-cream/10 bg-cream/[0.02] p-8">
            <p className="font-heading text-[10px] tracking-[0.3em] uppercase text-cream/30 mb-6">Your Quote</p>

            <AnimatePresence mode="wait">
              {!sessionType ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-8"
                >
                  <p className="text-cream/20 text-sm font-body">Select a session type to see pricing</p>
                </motion.div>
              ) : (
                <motion.div
                  key={`${sessionType}-${effectiveDuration}-${studio}-${returning}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  {/* Session summary */}
                  <div className="space-y-3 mb-8">
                    <div className="flex justify-between items-center">
                      <span className="text-cream/40 text-sm font-body">{selected.label}</span>
                      <span className="text-cream/70 text-sm font-body">${selected.basePrice}</span>
                    </div>

                    {effectiveDuration > selected.minDuration && (
                      <div className="flex justify-between items-center">
                        <span className="text-cream/40 text-sm font-body">
                          +{(effectiveDuration - selected.minDuration)}hr extra
                        </span>
                        <span className="text-cream/70 text-sm font-body">
                          +${(effectiveDuration - selected.minDuration) * 75}
                        </span>
                      </div>
                    )}

                    {studio && (
                      <div className="flex justify-between items-center">
                        <span className="text-cream/40 text-sm font-body">Studio A ({effectiveDuration}hr)</span>
                        <span className="text-cream/70 text-sm font-body">+${effectiveDuration * 60}</span>
                      </div>
                    )}

                    {returning && (
                      <div className="flex justify-between items-center">
                        <span className="text-gold/70 text-sm font-body">Loyalty discount (50%)</span>
                        <span className="text-gold text-sm font-body">-50%</span>
                      </div>
                    )}
                  </div>

                  {/* Divider */}
                  <div className="border-t border-cream/10 mb-6" />

                  {/* Total */}
                  <div className="flex justify-between items-end mb-2">
                    <span className="font-heading text-[10px] tracking-[0.2em] uppercase text-cream/40">Total</span>
                    <motion.span
                      key={price}
                      initial={{ scale: 1.1, color: '#C9A84C' }}
                      animate={{ scale: 1, color: '#F5F0E8' }}
                      transition={{ duration: 0.3 }}
                      className="font-display text-4xl font-bold text-cream"
                    >
                      ${price}
                    </motion.span>
                  </div>

                  <p className="text-cream/25 text-xs font-body text-right mb-8">
                    {effectiveDuration}hr {selected.label.toLowerCase()}
                    {studio ? ' · Studio A' : ''}
                    {returning ? ' · Loyalty rate' : ''}
                  </p>

                  {/* Deposit breakdown */}
                  <div className="bg-gold/5 border border-gold/20 p-4 mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-heading text-[10px] tracking-[0.2em] uppercase text-gold/60">Due to book</span>
                      <span className="text-gold font-bold">${deposit}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-heading text-[10px] tracking-[0.2em] uppercase text-cream/30">Due on shoot day</span>
                      <span className="text-cream/60">${remaining}</span>
                    </div>
                  </div>

                  {/* CTA */}
                  <button
                    onClick={handleBookNow}
                    className="w-full py-4 bg-gold text-ink font-heading text-xs tracking-[0.25em] uppercase hover:bg-gold/90 transition-colors duration-200"
                  >
                    Book This Session →
                  </button>

                  <p className="text-cream/20 text-[10px] text-center mt-3 font-body">
                    Loyalty discount verified automatically at checkout
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* What's included */}
          {sessionType && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="mt-4 border border-cream/10 p-6"
            >
              <p className="font-heading text-[10px] tracking-[0.2em] uppercase text-cream/30 mb-4">Every session includes</p>
              <ul className="space-y-2">
                {[
                  'Professional editing + color grading',
                  'Online gallery delivery (PicTime)',
                  'High-res downloads, print-ready files',
                  'Contract + booking confirmation',
                ].map(item => (
                  <li key={item} className="flex items-start gap-2 text-cream/50 text-sm font-body">
                    <span className="text-gold mt-0.5">—</span>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  )
}
