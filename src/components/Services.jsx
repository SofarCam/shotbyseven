import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { HiCamera, HiStar, HiFilm, HiGlobe, HiRefresh, HiLightningBolt, HiIdentification, HiBriefcase, HiGift, HiSparkles } from 'react-icons/hi'
import { GemMarker } from './HiddenGems'

const services = [
  {
    id: '777',
    icon: HiSparkles,
    title: 'The 777 Package',
    description: 'The full-frequency experience — alignment consultation, 90-min session, 77 images, 7 retouched selects, one month of AI-generated content. $777 flat.',
    price: '$777 — All In',
    badge: '777',
    featured: true,
  },
  {
    id: 'mini',
    icon: HiLightningBolt,
    title: 'Mini Sessions',
    description: 'Quick, focused 1-hour sessions perfect for updated headshots, seasonal portraits, or trying out a shoot before booking full. Great entry point.',
    price: 'Starting at $75',
    badge: 'New',
  },
  {
    id: 'headshots',
    icon: HiIdentification,
    title: 'Professional Headshots',
    description: 'LinkedIn, corporate, and press-ready headshots delivered within 24 hours. 1–2 outfits, multiple selects, studio or outdoor — optimized for Charlotte professionals.',
    price: 'Starting at $150',
    badge: 'New',
  },
  {
    id: 'personal-branding',
    icon: HiBriefcase,
    title: 'Personal Branding',
    description: 'Quarterly content sessions for coaches, creators, and entrepreneurs who need a library of on-brand images — paired with AI-generated captions and a month of social content.',
    price: 'Starting at $350',
    badge: 'New',
    link: '/branding',
  },
  {
    id: 'portrait',
    icon: HiCamera,
    title: 'Lifestyle Portraits',
    description: 'Couples, families, maternity, and lifestyle portraits in Charlotte, NC — studio and outdoor locations tailored to your story.',
    price: 'Starting at $100',
  },
  {
    id: 'graduation',
    icon: HiStar,
    title: 'Graduation',
    description: 'Celebrate your milestone with stunning cap & gown portraits and creative graduation shoots around Charlotte.',
    price: 'Starting at $250',
  },
  {
    id: 'studio',
    icon: HiFilm,
    title: 'Studio Concepts',
    description: 'Creative studio sessions at NoDa Art House in Charlotte — editorial, fashion, maternity, and artistic concepts brought to life.',
    price: 'From $100 + $60/hr studio',
  },
  {
    id: 'events',
    icon: HiGlobe,
    title: 'Events',
    description: 'Birthdays and simple events book online at the hourly rate. Weddings, corporate, and large events get a custom quote.',
    price: 'From $100 · Weddings/corporate: custom quote',
  },
  {
    id: 'monthly',
    icon: HiRefresh,
    title: 'Monthly Package',
    description: '4 sessions per month (2hr each) at a bundled rate. Perfect for content creators, brands, and artists who need consistent visuals.',
    price: '$350/mo',
  },
]

export default function Services({ onServiceSelect }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const navigate = useNavigate()

  const handleCardClick = (service) => {
    if (service.link) {
      navigate(service.link)
      return
    }
    if (onServiceSelect) {
      onServiceSelect(service.id)
    }
  }

  return (
    <section id="services" className="py-32 bg-warm-black">
      <div ref={ref} className="max-w-7xl mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <span className="font-heading text-xs tracking-[0.3em] uppercase text-gold mb-4 block">
            What I Offer
          </span>
          <h2 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-cream">
            Services & <span className="italic text-gold">Packages</span>
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {services.map((service, i) => {
            const Icon = service.icon
            return (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.1 * i, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -6 }}
                onClick={() => handleCardClick(service)}
                className={'group p-8 transition-all duration-500 cursor-pointer relative ' + (service.featured ? 'border border-gold/40 bg-gradient-to-br from-gold/8 to-transparent hover:border-gold/60' : 'border border-cream/5 hover:border-gold/30 golden-gradient')}
              >
                {service.badge && (
                  <span className={'absolute top-4 right-4 font-heading text-[9px] tracking-[0.15em] uppercase px-2 py-0.5 ' + (service.badge === '777' ? 'text-ink bg-gold' : 'text-ink bg-gold')}>
                    {service.badge}
                  </span>
                )}
                <Icon className="text-gold text-2xl mb-6 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="font-display text-lg font-bold text-cream mb-3">{service.title}</h3>
                <p className="text-cream/30 text-sm leading-relaxed mb-6">{service.description}</p>
                <div className="flex items-center justify-between">
                  <span className="font-heading text-[10px] tracking-[0.2em] uppercase text-gold">
                    {service.price}
                  </span>
                  <span className="font-heading text-[10px] tracking-[0.15em] uppercase text-gold/60 group-hover:text-gold transition-colors">
                    {service.link ? 'Learn More →' : 'Book Now →'}
                  </span>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Gift Cards CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.85, duration: 0.8 }}
          className="mt-6 border border-gold/20 bg-gold/5 p-5 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <HiGift className="text-gold text-2xl flex-shrink-0" />
            <div>
              <p className="font-display font-bold text-cream text-sm">Give the gift of a session</p>
              <p className="text-cream/40 text-xs mt-0.5">Gift cards available in any amount — redeemable for any shoot.</p>
            </div>
          </div>
          <Link
            to="/gift"
            className="font-heading text-[10px] tracking-[0.2em] uppercase text-ink bg-gold px-6 py-3 hover:bg-gold/90 transition-colors whitespace-nowrap flex-shrink-0"
          >
            Buy a Gift Card →
          </Link>
        </motion.div>

        {/* Studio fee notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="mt-10 text-center border border-cream/5 rounded p-4 bg-warm-black/50"
        >
          <p className="font-heading text-[10px] tracking-[0.2em] uppercase text-cream/30">
            <span className="text-gold">Studio Note</span> — Sessions requiring studio space are hosted at{' '}
            <a href="https://www.nodaarthouse.org" target="_blank" rel="noopener noreferrer" className="text-gold/60 hover:text-gold underline transition-colors">
              NoDa Art House
            </a>{' '}
            in Charlotte, NC. Studio rental is $60/hr and is not included in session pricing.
          </p>
          <div className="mt-4 flex items-center justify-center gap-4">
            <Link
              to="/studio"
              className="font-heading text-[10px] tracking-[0.2em] uppercase text-gold/70 hover:text-gold border border-gold/30 hover:border-gold/60 px-5 py-2 transition-all duration-200"
            >
              Book Studio A →
            </Link>
            <GemMarker gemIndex={2} />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
