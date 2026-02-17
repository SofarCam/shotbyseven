import { motion, useInView } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import { getAboutImage } from '../imageConfig'
import { GemMarker } from './HiddenGems'

const stats = [
  { number: 100, suffix: '+', label: 'Sessions' },
  { number: 8, suffix: '+', label: 'Years' },
  { number: 200, suffix: '+', label: 'Clients' },
]

function AnimatedCounter({ target, suffix, isInView }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!isInView) return
    let start = 0
    const duration = 2000
    const increment = target / (duration / 16)
    const timer = setInterval(() => {
      start += increment
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [isInView, target])

  return (
    <span className="font-display text-3xl md:text-4xl font-bold text-gold tabular-nums">
      {count}{suffix}
    </span>
  )
}

export default function About() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="about" className="py-32 px-6 lg:px-12 max-w-7xl mx-auto">
      <div ref={ref} className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <div className="aspect-[3/4] overflow-hidden" data-cursor="viewfinder">
            <motion.img
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.6 }}
              src={getAboutImage()}
              alt="Photographer at work"
              className="w-full h-full object-cover"
            />
          </div>
          {/* Decorative frame elements */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.5, duration: 1 }}
            className="absolute -bottom-6 -right-6 w-48 h-48 border border-gold/20 -z-10"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.7, duration: 1 }}
            className="absolute -top-6 -left-6 w-32 h-32 bg-gold/5 -z-10"
          />
          {/* Film strip edge */}
          <div className="absolute -left-3 top-8 bottom-8 w-[2px] bg-gradient-to-b from-transparent via-gold/20 to-transparent" />
          {/* Hidden gem #0 - tucked in bottom corner of photo */}
          <div className="absolute bottom-2 left-2">
            <GemMarker gemIndex={0} />
          </div>
        </motion.div>

        <div>
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="font-heading text-xs tracking-[0.3em] uppercase text-gold mb-4 block"
          >
            The Photographer
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-8 text-cream"
          >
            Every frame tells
            <br />
            <span className="italic text-gold glow-text">a story</span>
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="space-y-4 text-cream/40 text-base leading-relaxed mb-12"
          >
            <p>
              Cameron, also known as Seven, is a Charlotte-based photographer
              specializing in portrait, fashion, and creative studio work. He brings
              bold concepts to life — whether it's a graduation celebration, a
              maternity session, or a full editorial shoot.
            </p>
            <p>
              Every session is crafted with intention, energy, and a deep connection
              to the moment. His goal is to make you feel confident in front of the
              camera and give you images you'll be proud of forever.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="grid grid-cols-3 gap-8"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ borderColor: 'rgba(253,248,240,0.05)' }}
                animate={isInView ? { borderColor: 'rgba(212,160,74,0.15)' } : {}}
                transition={{ delay: 1 + i * 0.2, duration: 1 }}
                className="border-t pt-4"
              >
                <AnimatedCounter target={stat.number} suffix={stat.suffix} isInView={isInView} />
                <p className="font-heading text-[10px] tracking-[0.2em] uppercase text-cream/30 mt-1">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
