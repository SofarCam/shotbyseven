import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { HiCamera, HiStar, HiFilm, HiGlobe } from 'react-icons/hi'

const services = [
  {
    icon: HiCamera,
    title: 'Portrait Sessions',
    description: 'Headshots, personal branding, and lifestyle portraits that capture your authentic self.',
    price: 'From $350',
  },
  {
    icon: HiStar,
    title: 'Fashion & Editorial',
    description: 'High-fashion shoots, lookbooks, and editorial spreads for brands and publications.',
    price: 'From $800',
  },
  {
    icon: HiFilm,
    title: 'Commercial',
    description: 'Product photography, brand campaigns, and corporate visual content that converts.',
    price: 'From $1,200',
  },
  {
    icon: HiGlobe,
    title: 'Aerial Photography',
    description: 'Stunning drone perspectives for real estate, events, and creative projects.',
    price: 'From $500',
  },
]

export default function Services() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

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

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, i) => {
            const Icon = service.icon
            return (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.15 * i, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -6 }}
                className="group border border-cream/5 p-8 hover:border-gold/30 transition-all duration-500 golden-gradient"
              >
                <Icon className="text-gold text-2xl mb-6 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="font-display text-lg font-bold text-cream mb-3">{service.title}</h3>
                <p className="text-cream/30 text-sm leading-relaxed mb-6">{service.description}</p>
                <span className="font-heading text-[10px] tracking-[0.2em] uppercase text-gold">
                  {service.price}
                </span>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
