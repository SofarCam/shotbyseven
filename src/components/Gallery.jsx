import { motion, useInView, AnimatePresence } from 'framer-motion'
import { useRef, useState, useCallback, useMemo, useEffect } from 'react'
import { HiX, HiChevronLeft, HiChevronRight } from 'react-icons/hi'
import { getGalleryImages } from '../imageConfig'
import { GemMarker } from './HiddenGems'

const categories = ['All', 'Studio', 'Fashion', 'Outdoor', 'Swimwear', 'Maternity/Baby', 'Graduation', 'Sports', 'B&W', 'Proposal/Wedding']

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
  const [lightboxShoot, setLightboxShoot] = useState(null)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  const filtered = activeCategory === 'All'
    ? images
    : images.filter((img) => img.category === activeCategory)

  // Group images by shoot — show only first image per shoot as the "cover"
  const displayImages = useMemo(() => {
    const seen = new Set()
    const result = []
    for (const img of filtered) {
      const key = img.shoot ? `${img.category}_${img.shoot}` : img.src
      if (!seen.has(key)) {
        seen.add(key)
        const shootImages = img.shoot
          ? filtered.filter(i => i.shoot === img.shoot && i.category === img.category)
          : [img]
        result.push({ ...img, shootImages, shootCount: shootImages.length })
      }
    }
    return result
  }, [filtered])

  const openLightbox = useCallback((displayImg) => {
    setLightboxShoot({ images: displayImg.shootImages, index: 0 })
  }, [])

  const closeLightbox = () => setLightboxShoot(null)
  const next = () => setLightboxShoot(prev => prev ? { ...prev, index: (prev.index + 1) % prev.images.length } : null)
  const prevImg = () => setLightboxShoot(prev => prev ? { ...prev, index: (prev.index - 1 + prev.images.length) % prev.images.length } : null)

  // Keyboard navigation
  useEffect(() => {
    if (!lightboxShoot) return
    const handleKey = (e) => {
      if (e.key === 'ArrowRight') next()
      else if (e.key === 'ArrowLeft') prevImg()
      else if (e.key === 'Escape') closeLightbox()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [lightboxShoot])

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
            {displayImages.map((img, i) => (
              <motion.div
                key={img.src}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
              >
                <TiltCard
                  onClick={() => openLightbox(img)}
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
                          {img.shootCount > 1 ? `${img.shootCount} photos — View shoot` : 'Click to expand'}
                        </span>
                      </div>
                    </div>
                    {/* Multi-photo shoot badge */}
                    {img.shootCount > 1 && (
                      <div className="absolute top-3 right-3 bg-ink/70 backdrop-blur-sm border border-gold/20 px-2.5 py-1 flex items-center gap-1.5">
                        <div className="flex -space-x-1">
                          {[...Array(Math.min(img.shootCount, 3))].map((_, j) => (
                            <div key={j} className="w-1.5 h-1.5 rounded-full bg-gold/60 border border-ink/50" />
                          ))}
                        </div>
                        <span className="font-heading text-[9px] tracking-wider text-gold/70">
                          {img.shootCount}
                        </span>
                      </div>
                    )}
                    {/* Shine effect on hover */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none bg-gradient-to-tr from-transparent via-gold/5 to-transparent" />
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Lightbox with shoot slideshow */}
      <AnimatePresence>
        {lightboxShoot && (
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
              className="absolute top-6 right-6 text-cream/40 hover:text-gold transition-colors z-10"
            >
              <HiX size={28} />
            </button>

            {lightboxShoot.images.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); prevImg() }}
                className="absolute left-6 text-cream/30 hover:text-gold transition-colors z-10"
              >
                <HiChevronLeft size={36} />
              </button>
            )}

            <motion.img
              key={lightboxShoot.images[lightboxShoot.index]?.src}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              src={lightboxShoot.images[lightboxShoot.index]?.src}
              alt="Gallery preview"
              className="max-h-[85vh] max-w-[85vw] object-contain"
              onClick={(e) => e.stopPropagation()}
            />

            {lightboxShoot.images.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); next() }}
                className="absolute right-6 text-cream/30 hover:text-gold transition-colors z-10"
              >
                <HiChevronRight size={36} />
              </button>
            )}

            <div className="absolute bottom-6 flex flex-col items-center gap-3">
              {/* Shoot dot indicators */}
              {lightboxShoot.images.length > 1 && (
                <div className="flex items-center gap-2">
                  {lightboxShoot.images.map((_, i) => (
                    <button
                      key={i}
                      onClick={(e) => { e.stopPropagation(); setLightboxShoot(prev => ({ ...prev, index: i })) }}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        i === lightboxShoot.index ? 'bg-gold scale-125' : 'bg-cream/20 hover:bg-cream/40'
                      }`}
                    />
                  ))}
                </div>
              )}
              <div className="font-heading text-[10px] tracking-[0.3em] text-cream/30">
                {lightboxShoot.index + 1} / {lightboxShoot.images.length}
                {lightboxShoot.images.length > 1 && (
                  <span className="text-gold/40 ml-3">✦ Full Shoot</span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
