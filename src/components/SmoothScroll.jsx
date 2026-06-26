import { useEffect } from 'react'
import Lenis from 'lenis'

// Buttery inertial scrolling. Mounts once on the homepage. Plays nicely with
// Framer Motion's useScroll (Lenis drives native window scroll, not transforms)
// so the Hero parallax keeps working. Disabled when the user prefers reduced motion.
export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    // Tear down any lingering instance first. React StrictMode double-invokes
    // effects in dev, and a previous mount's Lenis (whose rAF loop pins scroll
    // to its own target) can otherwise zombie and block scrolling entirely.
    if (window.lenis) {
      window.lenis.destroy()
      delete window.lenis
    }

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      anchors: true,
    })

    // Exposed so programmatic jumps (scrollToSection) can drive Lenis instead
    // of native scrollIntoView, which Lenis would otherwise fight.
    window.lenis = lenis

    let rafId
    const raf = (time) => {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
      if (window.lenis === lenis) delete window.lenis
    }
  }, [])

  return null
}
