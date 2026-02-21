import { motion, useInView } from 'framer-motion'
import { useRef, useState } from 'react'
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi'
import { GemMarker } from './HiddenGems'

const testimonials = [
  {
    text: "Seven captured my graduation better than I ever dreamed. He already had a whole vision before we even started — the cap and gown shots were clean but the creative ones are what I keep coming back to. My whole family wants prints.",
    name: 'Destiny R.',
    role: 'Graduation Session — Charlotte, NC',
  },
  {
    text: "I was so nervous for my maternity shoot. Seven made me feel like myself the entire time — no awkward poses, just natural and beautiful. When I got the gallery back I literally broke down crying. These photos are everything.",
    name: 'Jasmine T.',
    role: 'Maternity Session — NoDa Art House',
  },
  {
    text: "I hired Seven for a brand shoot and I swear he understood my vision better than I did. The images were cinematic, on brand, and delivered fast. We went from 0 to a whole aesthetic in one session.",
    name: 'Marcus L.',
    role: 'Brand Content — Monthly Package',
  },
  {
    text: "Seven shot my proposal at the dome and I'm still speechless. He was invisible the whole time — I didn't even know where he was — but somehow caught every single reaction perfectly. She said yes and we have it all on camera.",
    name: 'DeShawn & Kayla',
    role: 'Proposal Photography — Charlotte',
  },
  {
    text: "Booked Seven for a studio concept shoot and showed up with just a mood board. He ran with it completely. The final images looked like an editorial spread. People thought I hired a whole production team.",
    name: 'Imani W.',
    role: 'Studio Concept Session — NoDa Art House',
  },
]

export default function Testimonials() {
  const [current, setCurrent] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  const next = () => setCurrent((prev) => (prev + 1) % testimonials.length)
  const prev = () => setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length)

  return (
    <section className="py-32 bg-warm-black">
      <div ref={ref} className="max-w-4xl mx-auto px-6 lg:px-12 text-center">
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="font-heading text-xs tracking-[0.3em] uppercase text-gold mb-4 block"
        >
          Kind Words
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1, duration: 0.8 }}
          className="font-display text-5xl md:text-6xl font-bold text-cream mb-16"
        >
          Client <span className="italic text-gold">Stories</span> <GemMarker gemIndex={3} className="inline-block relative -top-3" />
        </motion.h2>

        <div className="relative">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <div className="font-display text-5xl text-gold/20 mb-6">&ldquo;</div>
            <p className="font-body text-xl md:text-2xl leading-relaxed text-cream/60 mb-8 max-w-3xl mx-auto">
              {testimonials[current].text}
            </p>
            <p className="font-display text-lg font-bold text-cream">{testimonials[current].name}</p>
            <p className="font-heading text-[10px] tracking-[0.2em] uppercase text-cream/30 mt-1">
              {testimonials[current].role}
            </p>
          </motion.div>

          <div className="flex items-center justify-center gap-4 mt-12">
            <button
              onClick={prev}
              className="w-12 h-12 border border-cream/10 flex items-center justify-center hover:border-gold/30 text-cream/30 hover:text-gold transition-colors"
            >
              <HiChevronLeft size={20} />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`h-[2px] rounded-full transition-all duration-300 ${
                    i === current ? 'bg-gold w-8' : 'bg-cream/10 w-2'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={next}
              className="w-12 h-12 border border-cream/10 flex items-center justify-center hover:border-gold/30 text-cream/30 hover:text-gold transition-colors"
            >
              <HiChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
