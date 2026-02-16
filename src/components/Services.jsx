import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { HiCamera, HiStar, HiFilm, HiGlobe, HiRefresh } from 'react-icons/hi'

const services = [
  {
    id: 'portrait',
    icon: HiCamera,
    title: 'Portrait Sessions',
    description: 'Headshots, personal branding, and lifestyle portraits that capture your authentic self.',
    price: 'Starting at $150',
  },
  {
    id: 'graduation',
    icon: HiStar,
    title: 'Graduation',
    description: 'Celebrate your milestone with stunning cap & gown portraits and creative graduation shoots.',
    price: 'Starting at $250',
  },
  {
    id: 'studio',
    icon: HiFilm,
    title: 'Studio Concepts',
    description: 'Creative studio sessions — editorial, fashion, maternity, and artistic concepts brought to life.',
    price: 'Starting at $200',
  },
  {
    id: 'events',
    icon: HiGlobe,
    title: 'Events',
    description: 'Weddings, proposals, birthdays, corporate events, parties & special occasions captured with artistry.',
    price: 'Prices Vary',
  },
  {
    id: 'monthly',
    icon: HiRefresh,
    title: 'Monthly Package',
    description: 'Multiple shoots per month at a flat rate. Perfect for content creators, brands, and artists who need consistent visuals.',
    price: 'Flat Rate',
  },
]

export default function Services({ onServiceSelect }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  const handleCardClick = (serviceId) => {
    if (onServiceSelect) {
      onServiceSelect(serviceId)
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

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {services.map((service, i) => {
            const Icon = service.icon
            return (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.15 * i, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -6 }}
                onClick={() => handleCardClick(service.id)}
                className="group border border-cream/5 p-8 hover:border-gold/30 transition-all duration-500 golden-gradient cursor-pointer"
              >
                <Icon className="text-gold text-2xl mb-6 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="font-display text-lg font-bold text-cream mb-3">{service.title}</h3>
                <p className="text-cream/30 text-sm leading-relaxed mb-6">{service.description}</p>
                <div className="flex items-center justify-between">
                  <span className="font-heading text-[10px] tracking-[0.2em] uppercase text-gold">
                    {service.price}
                  </span>
                  <span className="font-heading text-[9px] tracking-[0.15em] uppercase text-cream/20 group-hover:text-gold/50 transition-colors">
                    Book Now →
                  </span>
                </div>
              </motion.div>
            )
          })}
        </div>

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
        </motion.div>
      </div>
    </section>
  )
}
