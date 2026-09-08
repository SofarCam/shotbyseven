import { useState, useRef } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { HiPlus, HiMinus } from 'react-icons/hi'

const faqs = [
  {
    q: 'How do I book?',
    a: 'Use the Smart Booking form on this page. Tell me your session type, dates, and vision — I\'ll confirm within 24 hours. A $50 deposit holds your date ($100 for sessions $300+).',
  },
  {
    q: 'Where are you located?',
    a: 'I\'m based in Charlotte, NC. Studio sessions are held at NoDa Art House — 3109 Cullman Ave, Charlotte, NC 28206 — in the heart of the NoDa arts district. Outdoor sessions take place at locations across Charlotte and the surrounding area. I also travel — within 100 miles is a $50 flat fee.',
  },
  {
    q: 'How much do you charge?',
    a: 'Mini sessions start at $75 (1hr). Professional headshots start at $150 (1hr). Most portrait and lifestyle sessions are $50/hr with a 2-hour minimum ($100+). Graduation and maternity/family start at $250. The 777 Package is $777 flat — the all-in signature experience. Studio rental at NoDa Art House is $60/hr (not included), and travel within 100 miles is a $50 flat fee. Use the Pricing Calculator on this page for an instant quote.',
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
    q: 'Do you travel outside Charlotte?',
    a: 'Yes. Travel within 100 miles is $50 flat. Beyond that it\'s $1/mile. Destination sessions are available — just ask.',
  },
  {
    q: "What's your style?",
    a: 'Bold, warm, and editorial. I love golden hour light, real moments, and shots that feel like a movie still. Check the gallery above to see what that looks like.',
  },
  {
    q: 'How do I book Studio A at NoDa Art House?',
    a: 'Use the Book Studio form at shotbyseven.com/studio. Seven (my AI assistant) will check availability for your dates and send you the direct NoDa Art House booking link. Studio rental is $70/hr, billed separately from session fees.',
  },
  {
    q: 'What is The 777 Package?',
    a: 'The 777 is the signature full-frequency experience — $777 flat. It includes a 15-min pre-shoot alignment consultation, a 90-minute session (studio or outdoor), 77 images delivered for review, 7 fully retouched selects, a full month of AI-generated voice-matched social content, and 7-day delivery. It\'s designed for coaches, creators, and entrepreneurs who want photos that match their energy. Book it through the Smart Booking form and select "The 777 Package."',
  },
  {
    q: 'Do you offer mini sessions?',
    a: 'Yes — mini sessions are 1-hour focused shoots starting at $75. They\'re great for updated headshots, seasonal portraits, or trying a shoot before committing to a full session. Book through the Smart Booking form and select "Mini Session."',
  },
  {
    q: 'Do you do headshots?',
    a: 'Yes. Professional headshots start at $150 for a 1-hour session — 1–2 outfits, multiple selects, studio or outdoor. Delivered within 24 hours. Great for LinkedIn, press, corporate bios, and business profiles. Charlotte professionals book this mid-week to fill the gap in their calendar.',
  },
  {
    q: 'What is Personal Branding photography?',
    a: 'Personal branding sessions are quarterly or bi-annual shoots that build a library of on-brand lifestyle images for your social media, website, and email list — not just one round of photos, but a consistent visual presence. Starting at $350 for a 2-hour session. Pairs with the Content Engine tool to generate a full month of voice-matched captions and content from every shoot. Perfect for coaches, healers, real estate agents, fitness trainers, and entrepreneurs who know their image is their brand.',
  },
  {
    q: 'Do you sell gift cards?',
    a: 'Yes — gift cards are available in any amount starting at $75, redeemable for any session type with no expiration date. Visit shotbyseven.com/gift to purchase.',
  },
  {
    q: 'Do you offer a loyalty discount?',
    a: 'Yes — returning clients with 3 or more sessions get 50% off their next booking. The discount is verified automatically when you enter your email at checkout.',
  },
  {
    q: 'Do you have a referral program?',
    a: 'Yes — refer a friend and you both get $25 off your next session. After you book, you\'ll get a unique referral link on your confirmation page. Share it, and when your friend books, reach out and I\'ll apply the discount to both of you.',
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
