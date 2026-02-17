import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useCallback } from 'react'
import { HiX } from 'react-icons/hi'
import { getHiddenGems } from '../imageConfig'

// Persistent storage for found gems
function getFoundGems() {
  try {
    const saved = localStorage.getItem('shotbyseven_found_gems')
    return saved ? JSON.parse(saved) : []
  } catch { return [] }
}

function saveFoundGems(gems) {
  localStorage.setItem('shotbyseven_found_gems', JSON.stringify(gems))
}

function hasSubmittedEmail() {
  return localStorage.getItem('shotbyseven_gem_email') === 'true'
}

function markEmailSubmitted() {
  localStorage.setItem('shotbyseven_gem_email', 'true')
}

// The floating gem marker that appears on the page
export function GemMarker({ gemIndex, className = '' }) {
  const [found, setFound] = useState(false)
  const [showReveal, setShowReveal] = useState(false)
  const gems = getHiddenGems()
  const gem = gems[gemIndex]

  useEffect(() => {
    const foundGems = getFoundGems()
    if (foundGems.includes(gemIndex)) setFound(true)
  }, [gemIndex])

  const handleClick = useCallback((e) => {
    e.stopPropagation()
    if (found) return
    const foundGems = getFoundGems()
    if (!foundGems.includes(gemIndex)) {
      foundGems.push(gemIndex)
      saveFoundGems(foundGems)
    }
    setFound(true)
    setShowReveal(true)

    // Dispatch custom event so GemTracker updates
    window.dispatchEvent(new CustomEvent('gem-found', { detail: { gemIndex, total: gems.length, found: foundGems.length } }))
  }, [found, gemIndex, gems.length])

  if (!gem) return null

  return (
    <>
      <motion.button
        onClick={handleClick}
        className={`relative z-30 group ${className}`}
        whileHover={{ scale: 1.3 }}
        whileTap={{ scale: 0.9 }}
        title={found ? 'Gem collected!' : 'Something hidden here...'}
      >
        <motion.span
          animate={found ? {} : {
            opacity: [0.3, 1, 0.3],
            textShadow: [
              '0 0 4px rgba(212,160,74,0.3)',
              '0 0 12px rgba(212,160,74,0.8)',
              '0 0 4px rgba(212,160,74,0.3)',
            ],
          }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className={`text-lg select-none ${found ? 'text-gold/40' : 'text-gold cursor-pointer'}`}
        >
          {found ? '◆' : '✦'}
        </motion.span>
        {!found && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute -top-1 -right-1 w-2 h-2 bg-gold rounded-full"
            style={{ animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite' }}
          />
        )}
      </motion.button>

      {/* Reveal modal */}
      <AnimatePresence>
        {showReveal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-ink/95 flex items-center justify-center p-6"
            onClick={() => setShowReveal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: 'spring', damping: 25 }}
              className="relative max-w-lg w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowReveal(false)}
                className="absolute -top-10 right-0 text-cream/40 hover:text-gold transition-colors"
              >
                <HiX size={24} />
              </button>

              <div className="border border-gold/20 bg-ink overflow-hidden">
                <div className="relative">
                  <img
                    src={gem.src}
                    alt={gem.label}
                    className="w-full h-auto max-h-[60vh] object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent" />
                </div>
                <div className="p-6 text-center">
                  <span className="text-gold text-lg">✦</span>
                  <h3 className="font-display text-2xl font-bold text-cream mt-2">
                    Hidden Gem Found!
                  </h3>
                  <p className="font-heading text-xs tracking-[0.2em] uppercase text-gold/60 mt-1">
                    &ldquo;{gem.label}&rdquo;
                  </p>
                  <p className="text-cream/30 text-sm mt-3">
                    {getFoundGems().length} of {gems.length} gems discovered
                  </p>
                  {getFoundGems().length === gems.length && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-gold text-sm mt-2 font-heading tracking-wider"
                    >
                      You found them all! Check the gem tracker below.
                    </motion.p>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// The floating gem tracker / progress bar that shows at the bottom of the screen
export function GemTracker() {
  const gems = getHiddenGems()
  const [foundCount, setFoundCount] = useState(0)
  const [showUnlock, setShowUnlock] = useState(false)
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    setFoundCount(getFoundGems().length)
    setSubmitted(hasSubmittedEmail())

    const handleGemFound = () => {
      const count = getFoundGems().length
      setFoundCount(count)
      if (count === gems.length && !hasSubmittedEmail()) {
        setTimeout(() => setShowUnlock(true), 2000)
      }
    }

    window.addEventListener('gem-found', handleGemFound)
    return () => window.removeEventListener('gem-found', handleGemFound)
  }, [gems.length])

  const handleEmailSubmit = (e) => {
    e.preventDefault()
    if (!email) return

    // Send to EmailJS or just store locally for now
    // In production, connect this to your email service
    try {
      const subscribers = JSON.parse(localStorage.getItem('shotbyseven_subscribers') || '[]')
      subscribers.push({ email, source: 'hidden_gems', date: new Date().toISOString() })
      localStorage.setItem('shotbyseven_subscribers', JSON.stringify(subscribers))
    } catch { /* ignore */ }

    markEmailSubmitted()
    setSubmitted(true)
    setShowUnlock(false)
  }

  // Don't show if no gems found yet or already submitted email
  if (foundCount === 0 && !submitted) return null

  return (
    <>
      {/* Floating tracker pill */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-6 left-6 z-[90]"
      >
        <motion.button
          onClick={() => setIsExpanded(!isExpanded)}
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-2 bg-ink/90 border border-gold/20 backdrop-blur-sm px-4 py-2.5 group hover:border-gold/40 transition-colors"
        >
          <span className="text-gold text-sm">✦</span>
          <span className="font-heading text-[10px] tracking-[0.15em] uppercase text-cream/50 group-hover:text-cream/70 transition-colors">
            {foundCount}/{gems.length} Gems
          </span>
          <div className="flex gap-0.5 ml-1">
            {gems.map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-colors duration-500 ${
                  i < foundCount ? 'bg-gold' : 'bg-cream/10'
                }`}
              />
            ))}
          </div>
        </motion.button>

        {/* Expanded hints panel */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, y: 10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: 10, height: 0 }}
              className="mt-2 bg-ink/95 border border-gold/10 backdrop-blur-sm overflow-hidden"
            >
              <div className="p-4">
                <p className="font-heading text-[9px] tracking-[0.2em] uppercase text-gold/50 mb-3">
                  Hidden throughout this site
                </p>
                {gems.map((gem, i) => {
                  const isFound = getFoundGems().includes(i)
                  return (
                    <div key={i} className="flex items-center gap-2 py-1.5">
                      <span className={`text-xs ${isFound ? 'text-gold' : 'text-cream/15'}`}>
                        {isFound ? '◆' : '◇'}
                      </span>
                      <span className={`font-heading text-[10px] tracking-wider ${
                        isFound ? 'text-cream/60' : 'text-cream/20'
                      }`}>
                        {isFound ? gem.label : gem.hint}
                      </span>
                    </div>
                  )
                })}
                {foundCount === gems.length && !submitted && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => setShowUnlock(true)}
                    className="mt-3 w-full py-2 bg-gold/10 border border-gold/30 font-heading text-[10px] tracking-[0.2em] uppercase text-gold hover:bg-gold/20 transition-colors"
                  >
                    Claim Your Reward
                  </motion.button>
                )}
                {submitted && (
                  <p className="mt-3 font-heading text-[10px] tracking-wider text-gold/50 text-center">
                    You&apos;re on the list ✦
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Unlock / Email capture modal */}
      <AnimatePresence>
        {showUnlock && !submitted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-ink/95 flex items-center justify-center p-6"
            onClick={() => setShowUnlock(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', damping: 25 }}
              className="max-w-md w-full border border-gold/30 bg-ink p-8 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-4xl text-gold mb-4 inline-block"
              >
                ✦
              </motion.div>
              <h3 className="font-display text-3xl font-bold text-cream mb-2">
                All Gems <span className="text-gold italic">Found</span>
              </h3>
              <p className="text-cream/40 text-sm mb-6">
                You discovered all 5 hidden gems scattered across the site.
                Join the inner circle for exclusive behind-the-scenes content,
                early access to bookings, and first looks at new work.
              </p>

              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                  className="w-full bg-transparent border-b border-cream/10 focus:border-gold py-3 text-cream outline-none transition-colors placeholder-cream/15 text-center"
                />
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 bg-gold text-ink font-heading text-xs tracking-widest uppercase hover:bg-gold-light transition-colors"
                >
                  Join the Inner Circle
                </motion.button>
              </form>

              <button
                onClick={() => setShowUnlock(false)}
                className="mt-4 font-heading text-[10px] tracking-[0.2em] uppercase text-cream/20 hover:text-cream/40 transition-colors"
              >
                Maybe Later
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
