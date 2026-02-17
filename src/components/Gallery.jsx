import { motion, useInView, AnimatePresence } from 'framer-motion'
import { useRef, useState, useCallback } from 'react'
import { HiX, HiChevronLeft, HiChevronRight } from 'react-icons/hi'
import { getGalleryImages } from '../imageConfig'
import { GemMarker } from './HiddenGems'

const categories = ['All', 'Portrait', 'Fashion', 'Studio', 'Graduation', 'Sports', 'B&W', 'Engagement']

function TiltCard({ children, className, onClick }) {
  const ref = useRef(null)

  const handleMouseMove = useCallback((e) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    el.style.transform = `perspective(600px) rotateY(${x * 14}deg) rotateX(${-y * 14}deg) scale3d(1.04,1.04,1.04)`
  }, [])

  const handleMouseLeave = useCallback(() => {
    const el = ref.current
    if (el) el.style.transform = 'perspective(600px) rotateY(0) rotateX(0) scale3d(1,1,1)'
  }, [])

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={`transition-transform duration-200 ease-out ${className}`}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {children}
    </div>
  )
}

export default function Gallery() {
  const images = getGalleryImages()
  const [activeCategory, setActiveCategory] = useState('All')
  const [lightboxIndex, setLightboxIndex] = useState(null)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  const filtered = activeCategory === 'All'
    ? images
    : images.filter((img) => img.category === activeCategory)

  const closeLightbox = () => setLightboxIndex(null)
  const next = () => setLightboxIndex((prev) => (prev + 1) % filtered.length)
  const prev = () => setLightboxIndex((prev) => (prev - 1 + filtered.length) % filtered.length)

  return (
    <section id="gallery" className="py-32 px-6 lg:px-12 max-w-7xl mx-auto">
      <div ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="font-heading text-xs tracking-[0.3em] uppercase text-gold mb-4 block">
            Portfolio
          </span>
          <h2 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-cream inline-flex items-baseline gap-2">
            Selected <span className="italic text-gold glow-text">Work</span>
            <GemMarker gemIndex={1} className="relative -top-4" />
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="flex items-center justify-center gap-2 mb-12 flex-wrap"
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`font-heading text-xs tracking-[0.2em] uppercase px-5 py-2.5 transition-all duration-300 ${
                activeCategory === cat
                  ? 'bg-gold text-ink'
                  : 'text-cream/40 hover:text-gold'
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        <motion.div layout className="masonry-grid">
          <AnimatePresence mode="popLayout">
            {filtered.map((img, i) => (
              <motion.div
                key={img.src}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
              >
                <TiltCard
                  onClick={() => setLightboxIndex(i)}
                  className="group overflow-hidden cursor-none"
                >
                  <div className="relative overflow-hidden" data-cursor="viewfinder">
                    <img
                      src={img.src}
                      alt={`${img.category} photography`}
                      className={`w-full object-cover transition-transform duration-700 group-hover:scale-105 ${
                        img.aspect === 'tall' ? 'h-[500px]' :
                        img.aspect === 'wide' ? 'h-[300px]' : 'h-[400px]'
                      }`}
                      loading="lazy"
                    />
                    {/* Golden hour hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                      <div>
                        <span className="font-heading text-[10px] tracking-[0.3em] uppercase text-gold block">
                          {img.category}
                        </span>
                        <span className="font-heading text-[8px] tracking-[0.2em] uppercase text-cream/30 mt-1 block">
                          Click to expand
                        </span>
                      </div>
                    </div>
                    {/* Shine effect on hover */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none bg-gradient-to-tr from-transparent via-gold/5 to-transparent" />
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] bg-ink/98 flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            <button
              onClick={closeLightbox}
              className="absolute top-6 right-6 text-cream/40 hover:text-gold transition-colors"
            >
              <HiX size={28} />
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); prev() }}
              className="absolute left-6 text-cream/30 hover:text-gold transition-colors"
            >
              <HiChevronLeft size={36} />
            </button>

            <motion.img
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              src={filtered[lightboxIndex]?.src}
              alt="Gallery preview"
              className="max-h-[85vh] max-w-[85vw] object-contain"
              onClick={(e) => e.stopPropagation()}
            />

            <button
              onClick={(e) => { e.stopPropagation(); next() }}
              className="absolute right-6 text-cream/30 hover:text-gold transition-colors"
            >
              <HiChevronRight size={36} />
            </button>

            <div className="absolute bottom-6 font-heading text-[10px] tracking-[0.3em] text-cream/30">
              {lightboxIndex + 1} / {filtered.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
