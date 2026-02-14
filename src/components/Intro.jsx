import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

export default function Intro({ onComplete }) {
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 1400),
      setTimeout(() => setPhase(3), 2800),
      setTimeout(() => onComplete(), 3800),
    ]
    return () => timers.forEach(clearTimeout)
  }, [onComplete])

  return (
    <AnimatePresence>
      {phase < 3 && (
        <motion.div
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="fixed inset-0 z-[200] bg-ink flex items-center justify-center overflow-hidden"
        >
          {/* Aperture blades */}
          <div className="absolute inset-0 flex items-center justify-center">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ rotate: i * 45, scaleY: 1 }}
                animate={{
                  rotate: i * 45 + (phase >= 2 ? 5 : 0),
                  scaleY: phase >= 2 ? 0 : 1,
                }}
                transition={{ duration: 1, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
                className="absolute w-[200vmax] h-[200vmax] origin-center"
                style={{
                  background: `linear-gradient(to bottom, #0D0B09 48%, transparent 48%, transparent 52%, #0D0B09 52%)`,
                }}
              />
            ))}
          </div>

          {/* Focus pull ring */}
          <motion.div
            initial={{ scale: 3, opacity: 0 }}
            animate={{
              scale: phase >= 1 ? 1 : 3,
              opacity: phase >= 1 ? (phase >= 2 ? 0 : 0.15) : 0,
            }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute w-[400px] h-[400px] md:w-[500px] md:h-[500px] rounded-full border border-gold/30"
          />
          <motion.div
            initial={{ scale: 4, opacity: 0 }}
            animate={{
              scale: phase >= 1 ? 1.3 : 4,
              opacity: phase >= 1 ? (phase >= 2 ? 0 : 0.08) : 0,
            }}
            transition={{ duration: 1.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="absolute w-[400px] h-[400px] md:w-[500px] md:h-[500px] rounded-full border border-cream/10"
          />

          {/* Shutter click line flash */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{
              scaleX: phase >= 1 ? [0, 1, 0] : 0,
              opacity: phase >= 1 ? [0, 1, 0] : 0,
            }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="absolute w-full h-[1px] bg-gold/60"
          />

          {/* Center content */}
          <div className="relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.7, filter: 'blur(20px)' }}
              animate={{
                opacity: phase >= 1 ? 1 : 0,
                scale: phase >= 1 ? 1 : 0.7,
                filter: phase >= 1 ? 'blur(0px)' : 'blur(20px)',
              }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Viewfinder frame */}
              <div className="relative inline-block">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: phase >= 1 ? 1 : 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                >
                  <div className="w-4 h-4 border-t-2 border-l-2 border-gold absolute -top-5 -left-5" />
                  <div className="w-4 h-4 border-t-2 border-r-2 border-gold absolute -top-5 -right-5" />
                  <div className="w-4 h-4 border-b-2 border-l-2 border-gold absolute -bottom-5 -left-5" />
                  <div className="w-4 h-4 border-b-2 border-r-2 border-gold absolute -bottom-5 -right-5" />
                  {/* Center crosshair */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="w-[1px] h-4 bg-gold/30 absolute -top-8 left-0" />
                    <div className="w-[1px] h-4 bg-gold/30 absolute -bottom-8 left-0" />
                    <div className="w-4 h-[1px] bg-gold/30 absolute top-0 -left-8" />
                    <div className="w-4 h-[1px] bg-gold/30 absolute top-0 -right-8" />
                  </div>
                </motion.div>

                <h1 className="font-display text-6xl md:text-8xl font-bold text-cream px-10 py-6">
                  SEVEN<span className="text-gold">.</span>
                </h1>
              </div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 15, letterSpacing: '0.2em' }}
              animate={{
                opacity: phase >= 1 ? 0.5 : 0,
                y: phase >= 1 ? 0 : 15,
                letterSpacing: phase >= 1 ? '0.5em' : '0.2em',
              }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="font-heading text-[10px] uppercase text-cream/50 mt-8"
            >
              Enter the frame
            </motion.p>

            {/* f-stop indicator */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: phase >= 2 ? 0.3 : 0 }}
              transition={{ duration: 0.6 }}
              className="font-heading text-[9px] tracking-[0.3em] text-gold/40 mt-4"
            >
              f/1.4 · 1/125 · ISO 400
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
