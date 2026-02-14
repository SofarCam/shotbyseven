import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'

export default function Hero() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '40%'])
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.15])

  return (
    <section
      ref={ref}
      className="relative h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background */}
      <motion.div style={{ y, scale }} className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/40 to-ink z-10" />
        <div
          className="w-full h-full bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=1920&q=80')`,
            filter: 'saturate(0.8) contrast(1.1)',
          }}
        />
        {/* Golden hour overlay */}
        <div className="absolute inset-0 z-10 bg-gradient-to-br from-transparent via-amber/5 to-gold/10" />
      </motion.div>

      {/* Content */}
      <motion.div style={{ opacity }} className="relative z-20 text-center px-6 max-w-5xl">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3.4, duration: 0.8 }}
          className="font-heading text-[11px] tracking-[0.4em] uppercase text-gold/70 mb-6"
        >
          Photography & Visual Storytelling
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3.6, duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold leading-[0.9] text-cream mb-4"
        >
          Shot by
          <br />
          <span className="italic text-gold glow-text">Seven</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 4.2, duration: 1 }}
          className="font-body text-base text-cream/40 max-w-md mx-auto mb-10"
        >
          Capturing bold, timeless moments through a lens of warmth and intention.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 4.6, duration: 0.8 }}
          className="flex items-center justify-center gap-6"
        >
          <a
            href="#gallery"
            className="font-heading text-xs tracking-[0.2em] uppercase px-8 py-4 bg-gold text-ink hover:bg-gold-light transition-colors duration-300"
          >
            View Work
          </a>
          <a
            href="#booking"
            className="font-heading text-xs tracking-[0.2em] uppercase px-8 py-4 border border-cream/20 text-cream hover:border-gold/50 hover:text-gold transition-all duration-300"
          >
            Book a Session
          </a>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 5.2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3"
      >
        <span className="font-heading text-[9px] tracking-[0.4em] uppercase text-cream/30">
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-[1px] h-10 bg-gradient-to-b from-gold/40 to-transparent"
        />
      </motion.div>
    </section>
  )
}
