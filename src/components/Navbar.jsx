import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HiMenuAlt4, HiX } from 'react-icons/hi'

const navLinks = [
  { label: 'Work', href: '#gallery' },
  { label: 'About', href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'Book', href: '#booking' },
  { label: 'Contact', href: '#contact' },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, delay: 3.2, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? 'bg-ink/90 backdrop-blur-md' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between h-20">
          <a href="#" className="font-display text-2xl font-bold tracking-tight text-cream">
            SEVEN<span className="text-gold">.</span>
          </a>

          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="font-heading text-xs font-medium tracking-[0.2em] uppercase text-cream/50 hover:text-gold transition-colors duration-300 relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-gold transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-cream p-2"
            aria-label="Toggle menu"
          >
            {isOpen ? <HiX size={24} /> : <HiMenuAlt4 size={24} />}
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ clipPath: 'circle(0% at calc(100% - 2rem) 2rem)' }}
            animate={{ clipPath: 'circle(150% at calc(100% - 2rem) 2rem)' }}
            exit={{ clipPath: 'circle(0% at calc(100% - 2rem) 2rem)' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-40 bg-ink flex flex-col items-center justify-center gap-8"
          >
            {navLinks.map((link, i) => (
              <motion.a
                key={link.label}
                href={link.href}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.08, duration: 0.5 }}
                onClick={() => setIsOpen(false)}
                className="font-display text-4xl text-cream hover:text-gold transition-colors"
              >
                {link.label}
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
