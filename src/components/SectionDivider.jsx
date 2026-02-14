import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

export default function SectionDivider() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-40px' })

  return (
    <div ref={ref} className="py-4">
      <motion.div
        initial={{ scaleY: 0 }}
        animate={isInView ? { scaleY: 1 } : {}}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="section-line origin-top"
      />
    </div>
  )
}
