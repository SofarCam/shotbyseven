// Scroll to a page section, preferring Lenis (smooth-scroll engine) when it's
// active so programmatic jumps don't get yanked back by Lenis's rAF loop.
// Falls back to native smooth scroll on routes without Lenis or reduced motion.
export function scrollToSection(target, { offset = 0 } = {}) {
  const el = typeof target === 'string' ? document.getElementById(target) : target
  if (!el) return

  const lenis = typeof window !== 'undefined' ? window.lenis : null
  if (lenis) {
    lenis.scrollTo(el, { offset, duration: 1.2 })
  } else {
    el.scrollIntoView({ behavior: 'smooth' })
  }
}
