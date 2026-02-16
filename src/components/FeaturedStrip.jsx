import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { useRef, useState, useEffect, useCallback } from 'react'
import { getFeaturedImages } from '../imageConfig'

export default function FeaturedStrip() {
  const featured = getFeaturedImages()
  const [current, setCurrent] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const containerRef = useRef(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  })

  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '20%'])

  // Auto-advance slideshow
  useEffect(() => {
    if (isHovered) return
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % featured.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [featured.length, isHovered])

  const goTo = useCallback((i) => setCurrent(i), [])

  return (
    <section
      ref={containerRef}
      className="relative h-[85vh] overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background slides with crossfade */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          <motion.div style={{ y: bgY }} className="absolute inset-0 -top-[10%] -bottom-[10%]">
            <img
              src={featured[current]?.src}
              alt={featured[current]?.label}
              className="w-full h-full object-cover"
              style={{ filter: 'saturate(0.85) contrast(1.05)' }}
            />
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-ink/60 z-10" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink/50 via-transparent to-ink/50 z-10" />

      {/* Content */}
      <div className="relative z-20 h-full flex flex-col justify-end pb-16 px-6 lg:px-12 max-w-7xl mx-auto">
        {/* Label */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="font-heading text-[10px] tracking-[0.4em] uppercase text-gold/70 block mb-3">
              Featured Work
            </span>
            <h3 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold text-cream leading-[0.9]">
              {featured[current]?.label}
            </h3>
          </motion.div>
        </AnimatePresence>

        {/* Progress dots + counter */}
        <div className="flex items-center gap-4 mt-10">
          <span className="font-heading text-[10px] tracking-[0.2em] text-cream/30 tabular-nums">
            {String(current + 1).padStart(2, '0')} / {String(featured.length).padStart(2, '0')}
          </span>
          <div className="flex gap-1.5">
            {featured.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className="relative h-[3px] rounded-full overflow-hidden transition-all duration-500"
                style={{ width: i === current ? 40 : 12 }}
              >
                <div className="absolute inset-0 bg-cream/10 rounded-full" />
                {i === current && (
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 4, ease: 'linear' }}
                    key={`progress-${current}`}
                    className="absolute inset-0 bg-gold rounded-full"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Side navigation arrows */}
      <div className="absolute inset-y-0 left-0 z-20 flex items-center pl-4 opacity-0 hover:opacity-100 transition-opacity">
        <button
          onClick={() => setCurrent((prev) => (prev - 1 + featured.length) % featured.length)}
          className="w-12 h-12 border border-cream/10 bg-ink/40 backdrop-blur flex items-center justify-center text-cream/40 hover:text-gold hover:border-gold/30 transition-colors"
        >
          ‹
        </button>
      </div>
      <div className="absolute inset-y-0 right-0 z-20 flex items-center pr-4 opacity-0 hover:opacity-100 transition-opacity">
        <button
          onClick={() => setCurrent((prev) => (prev + 1) % featured.length)}
          className="w-12 h-12 border border-cream/10 bg-ink/40 backdrop-blur flex items-center justify-center text-cream/40 hover:text-gold hover:border-gold/30 transition-colors"
        >
          ›
        </button>
      </div>

      {/* Film strip decoration */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gold/20 to-transparent z-20" />
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gold/20 to-transparent z-20" />
    </section>
  )
}
