import { useState, useRef } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { HiPlus, HiMinus } from 'react-icons/hi'

const faqs = [
  {
    q: 'How much do you charge?',
    a: '$50/hr with a $100 minimum. Pricing varies by session type and duration — use the Smart Booking form to get an exact quote before you commit.',
  },
  {
    q: 'How long until I get my photos?',
    a: '48–72 hours for a sneak peek set. Your full edited gallery is delivered within one week via PicTime — where you can view, favorite, download, and order prints.',
  },
  {
    q: 'Do you offer prints?',
    a: 'Yes. Your gallery comes with a built-in print store through PicTime. Canvas wraps, framed prints, and digital downloads all available.',
  },
  {
    q: 'What if it rains or weather is bad?',
    a: 'We reschedule at no charge — just give me 24hrs notice. Studio sessions are also available as a backup option (studio fee applies).',
  },
  {
    q: 'Can I bring a friend or partner?',
    a: 'Absolutely. No extra charge for a plus one. Just let me know headcount when booking so I can plan the session timing.',
  },
  {
    q: 'How do I book?',
    a: 'Use the Smart Booking form on this page. Tell me your session type, dates, and vision — I\'ll confirm within 24 hours.',
  },
  {
    q: 'Do you travel outside Charlotte?',
    a: 'Yes. Travel within 100 miles is $50 flat. Beyond that it\'s $1/mile. Destination sessions are available — just ask.',
  },
  {
    q: "What's your style?",
    a: 'Bold, warm, and editorial. I love golden hour light, real moments, and shots that feel like a movie still. Check the gallery above to see what that looks like.',
  },
]

function FAQItem({ item, index }) {
  const [open, setOpen] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.06 }}
      className="border-b border-cream/10 last:border-b-0"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 gap-4 text-left group"
        aria-expanded={open}
      >
        <span className="font-heading text-sm tracking-wide text-cream/80 group-hover:text-cream transition-colors duration-200">
          {item.q}
        </span>
        <span className="shrink-0 text-gold/60 group-hover:text-gold transition-colors duration-200">
          {open ? <HiMinus className="w-4 h-4" /> : <HiPlus className="w-4 h-4" />}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-cream/50 text-sm leading-relaxed font-body">
              {item.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function FAQ() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="faq" ref={ref} className="py-32 px-6 lg:px-12 bg-ink">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="mb-16"
        >
          <p className="font-heading text-[10px] tracking-[0.25em] uppercase text-gold mb-4">
            Quick Answers
          </p>
          <h2 className="font-display text-5xl md:text-6xl font-bold text-cream leading-tight">
            FAQ
          </h2>
        </motion.div>

        {/* Accordion */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="border-t border-cream/10"
        >
          {faqs.map((item, i) => (
            <FAQItem key={i} item={item} index={i} />
          ))}
        </motion.div>

        {/* CTA */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-10 text-cream/30 text-sm font-body"
        >
          Still have questions?{' '}
          <a
            href="#contact"
            className="text-gold/70 hover:text-gold underline underline-offset-4 transition-colors duration-200"
          >
            Send me a message
          </a>
          .
        </motion.p>

      </div>
    </section>
  )
}
