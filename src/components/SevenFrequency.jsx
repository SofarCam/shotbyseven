import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { scrollToSection } from '../utils/scroll'

const pillars = [
  {
    number: '7',
    title: 'Intention First',
    body: 'Every session starts with a brief alignment call — your energy, your goals, your vision. We go in with purpose, not just a camera.',
  },
  {
    number: '7',
    title: 'High Frequency Environment',
    body: 'Good music, zero pressure, and a photographer who matches your energy. When you feel it, the camera feels it.',
  },
  {
    number: '7',
    title: 'Images That Resonate',
    body: '7 signature selects, fully retouched. Not the most photos — the right ones. The ones that feel like you on your best day.',
  },
]

export default function SevenFrequency() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="seven-frequency" className="py-32 bg-warm-black relative overflow-hidden" ref={ref}>

      {/* Background numerals */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden" aria-hidden="true">
        <span className="absolute -left-8 top-1/2 -translate-y-1/2 font-display font-bold text-[20rem] text-cream/[0.015] leading-none">7</span>
        <span className="absolute -right-8 top-1/4 font-display font-bold text-[14rem] text-gold/[0.04] leading-none">7</span>
        <span className="absolute right-1/4 bottom-0 font-display font-bold text-[10rem] text-cream/[0.02] leading-none">7</span>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9 }}
          className="max-w-2xl mb-20"
        >
          <span className="font-heading text-xs tracking-[0.3em] uppercase text-gold mb-4 block">
            The 777 Philosophy
          </span>
          <h2 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-cream leading-tight mb-8">
            Shot at <span className="italic text-gold">High Frequency</span>
          </h2>
          <p className="text-cream/40 text-lg leading-relaxed">
            777 isn&apos;t just a number — it&apos;s alignment. Divine timing. The moment when your energy
            and your image meet and there&apos;s no gap between who you are and what people see.
            That&apos;s what every session is built toward.
          </p>
        </motion.div>

        {/* Pillars */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {pillars.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.15 * i + 0.2, duration: 0.8 }}
              className="border-t border-gold/20 pt-8"
            >
              <p className="font-display text-4xl font-bold text-gold/30 mb-6 leading-none">{p.number}</p>
              <h3 className="font-display text-xl font-bold text-cream mb-3">{p.title}</h3>
              <p className="text-cream/35 text-sm leading-relaxed">{p.body}</p>
            </motion.div>
          ))}
        </div>

        {/* The 777 Package card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6, duration: 0.9 }}
          className="border border-gold/30 bg-gradient-to-br from-gold/5 to-transparent p-10 md:p-16 flex flex-col md:flex-row gap-12 items-start"
        >
          <div className="flex-1">
            <span className="font-heading text-[10px] tracking-[0.3em] uppercase text-gold/60 block mb-4">
              Signature Package
            </span>
            <h3 className="font-display text-4xl md:text-5xl font-bold text-cream mb-2">
              The 777
            </h3>
            <p className="font-display text-2xl text-gold mb-8">$777</p>
            <p className="text-cream/40 leading-relaxed max-w-md mb-8">
              The full-frequency experience. Designed for coaches, creators, entrepreneurs, and
              anyone who knows their energy is their brand — and needs photos that prove it.
            </p>
            <ul className="space-y-3">
              {[
                'Pre-shoot alignment consultation (15 min)',
                '90-minute session — studio or outdoor',
                '77 images delivered for review',
                '7 fully retouched signature selects',
                'One month of AI-generated, voice-matched social content',
                '7-day delivery guarantee',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-cream/50">
                  <span className="text-gold mt-0.5 flex-shrink-0">—</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex-shrink-0 flex flex-col gap-4 md:min-w-[200px]">
            <div className="text-center border border-gold/20 p-6">
              <p className="font-display text-6xl font-bold text-gold leading-none mb-2">777</p>
              <p className="font-heading text-[9px] tracking-[0.2em] uppercase text-cream/25">
                Alignment · Frequency · Truth
              </p>
            </div>
            <button
              onClick={() => scrollToSection('smart-booking')}
              className="w-full font-heading text-[10px] tracking-[0.2em] uppercase text-ink bg-gold px-6 py-4 hover:bg-gold/90 transition-colors"
            >
              Book The 777 →
            </button>
            <p className="text-cream/20 text-[10px] text-center font-heading tracking-wide">
              Limited availability · Charlotte & beyond
            </p>
          </div>
        </motion.div>

        {/* Brand statement */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.9, duration: 1 }}
          className="mt-16 text-center"
        >
          <p className="font-display text-2xl md:text-3xl text-cream/20 italic max-w-2xl mx-auto leading-relaxed">
            &ldquo;When the photographer matches your frequency,
            the photos feel different.&rdquo;
          </p>
        </motion.div>

      </div>
    </section>
  )
}
