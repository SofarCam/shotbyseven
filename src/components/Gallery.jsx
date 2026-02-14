import { motion, useInView, AnimatePresence } from 'framer-motion'
import { useRef, useState, useCallback } from 'react'
import { HiX, HiChevronLeft, HiChevronRight } from 'react-icons/hi'

const categories = ['All', 'Portrait', 'Fashion', 'Commercial', 'Aerial']

// ============================================
// YOUR PHOTOS: Replace these URLs with your actual images
// - src: direct URL to your photo (Pic-Time, Google Drive, etc.)
// - category: 'Portrait' | 'Fashion' | 'Commercial' | 'Aerial'
// - aspect: 'tall' (3:4) | 'wide' (16:9) | 'square' (1:1)
// - title: optional label shown on hover
//
// To add your photos from Pic-Time:
// 1. Right-click an image on shotbyseven777.pic-time.com
// 2. Copy image address
// 3. Paste as the 'src' value below
// ============================================
const images = [
  { src: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&q=80', category: 'Portrait', aspect: 'tall', title: 'Replace with your photo' },
  { src: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80', category: 'Fashion', aspect: 'wide', title: 'Replace with your photo' },
  { src: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80', category: 'Fashion', aspect: 'tall', title: 'Replace with your photo' },
  { src: 'https://images.unsplash.com/photo-1604514628550-37477afdf4e3?w=800&q=80', category: 'Portrait', aspect: 'square', title: 'Replace with your photo' },
  { src: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80', category: 'Aerial', aspect: 'wide', title: 'Replace with your photo' },
  { src: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80', category: 'Portrait', aspect: 'tall', title: 'Replace with your photo' },
  { src: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80', category: 'Commercial', aspect: 'square', title: 'Replace with your photo' },
  { src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80', category: 'Portrait', aspect: 'tall', title: 'Replace with your photo' },
  { src: 'https://images.unsplash.com/photo-1473186505569-9c61870c11f9?w=800&q=80', category: 'Aerial', aspect: 'wide', title: 'Replace with your photo' },
  { src: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&q=80', category: 'Fashion', aspect: 'tall', title: 'Replace with your photo' },
  { src: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&q=80', category: 'Commercial', aspect: 'wide', title: 'Replace with your photo' },
  { src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80', category: 'Portrait', aspect: 'square', title: 'Replace with your photo' },
]

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
          <h2 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-cream">
            Selected <span className="italic text-gold glow-text">Work</span>
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
