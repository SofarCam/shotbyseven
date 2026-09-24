import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { FaInstagram } from 'react-icons/fa'
import { getInstagramImages } from '../imageConfig'

const HANDLE = '@shotbyseven777'
const PROFILE_URL = 'https://instagram.com/shotbyseven777'

export default function InstagramStrip() {
  const images = getInstagramImages()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="py-24 px-6 lg:px-12 max-w-7xl mx-auto">
      <div ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <span className="font-heading text-xs tracking-[0.3em] uppercase text-gold mb-4 block">
            Follow Along
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-cream mb-3">
            {HANDLE}
          </h2>
          <p className="text-cream/30 text-sm">
            Fresh sessions, behind-the-scenes, and client reveals — posted first on Instagram.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-3 mb-10"
        >
          {images.map((src, i) => (
            <motion.a
              key={src}
              href={PROFILE_URL}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.06 }}
              className="group relative aspect-square overflow-hidden cursor-none"
              data-cursor="viewfinder"
            >
              <img
                src={src}
                alt={`Recent Instagram post ${i + 1} from Shot by Seven, Charlotte NC photographer`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/50 transition-colors duration-300 flex items-center justify-center">
                <FaInstagram className="text-cream text-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </motion.a>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center"
        >
          <a
            href={PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-heading text-xs tracking-[0.2em] uppercase px-8 py-4 border border-cream/20 text-cream hover:border-gold/50 hover:text-gold transition-all duration-300"
          >
            <FaInstagram />
            Follow {HANDLE}
          </a>
        </motion.div>
      </div>
    </section>
  )
}
