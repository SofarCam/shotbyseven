import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'

const featured = [
  { src: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&q=80', label: 'Portrait I' },
  { src: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=80', label: 'Fashion I' },
  { src: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80', label: 'Editorial' },
  { src: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&q=80', label: 'Portrait II' },
  { src: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&q=80', label: 'Fashion II' },
  { src: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&q=80', label: 'Aerial' },
]

export default function FeaturedStrip() {
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  })

  const x = useTransform(scrollYProgress, [0, 1], ['10%', '-30%'])

  return (
    <section ref={containerRef} className="py-20 overflow-hidden">
      <div className="px-6 lg:px-12 max-w-7xl mx-auto mb-8">
        <span className="font-heading text-[10px] tracking-[0.3em] uppercase text-gold/50">
          Featured Work
        </span>
      </div>

      <motion.div style={{ x }} className="flex gap-4 px-6">
        {featured.map((img, i) => (
          <div
            key={i}
            className="group relative flex-shrink-0 w-[300px] md:w-[400px] overflow-hidden"
            data-cursor="viewfinder"
          >
            <div className="aspect-[4/5] overflow-hidden">
              <img
                src={img.src}
                alt={img.label}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
              <span className="font-heading text-[10px] tracking-[0.3em] uppercase text-gold">
                {img.label}
              </span>
            </div>
          </div>
        ))}
      </motion.div>
    </section>
  )
}
