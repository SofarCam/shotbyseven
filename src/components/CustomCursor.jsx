import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function CustomCursor() {
  const [isHovering, setIsHovering] = useState(false)
  const [isOnImage, setIsOnImage] = useState(false)
  const [isHidden, setIsHidden] = useState(false)

  const cursorX = useMotionValue(-100)
  const cursorY = useMotionValue(-100)

  const springConfig = { damping: 20, stiffness: 400 }
  const ringX = useSpring(cursorX, springConfig)
  const ringY = useSpring(cursorY, springConfig)

  useEffect(() => {
    const moveCursor = (e) => {
      cursorX.set(e.clientX)
      cursorY.set(e.clientY)
    }

    const handleOver = (e) => {
      const t = e.target
      if (t.tagName === 'IMG' || t.dataset.cursor === 'viewfinder' || t.closest('[data-cursor="viewfinder"]')) {
        setIsOnImage(true)
        setIsHovering(false)
      } else if (t.tagName === 'A' || t.tagName === 'BUTTON' || t.closest('a') || t.closest('button')) {
        setIsHovering(true)
        setIsOnImage(false)
      }
    }

    const handleOut = () => {
      setIsHovering(false)
      setIsOnImage(false)
    }

    const handleLeave = () => setIsHidden(true)
    const handleEnter = () => setIsHidden(false)

    window.addEventListener('mousemove', moveCursor)
    document.addEventListener('mouseover', handleOver)
    document.addEventListener('mouseout', handleOut)
    document.documentElement.addEventListener('mouseleave', handleLeave)
    document.documentElement.addEventListener('mouseenter', handleEnter)

    return () => {
      window.removeEventListener('mousemove', moveCursor)
      document.removeEventListener('mouseover', handleOver)
      document.removeEventListener('mouseout', handleOut)
      document.documentElement.removeEventListener('mouseleave', handleLeave)
      document.documentElement.removeEventListener('mouseenter', handleEnter)
    }
  }, [cursorX, cursorY])

  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
    return null
  }

  if (isOnImage) {
    return (
      <motion.div
        style={{ left: ringX, top: ringY, x: '-50%', y: '-50%', opacity: isHidden ? 0 : 1 }}
        className="fixed pointer-events-none z-[9999]"
      >
        <div className="w-[60px] h-[60px] border border-gold/70 rounded-full relative">
          <div className="absolute top-1/2 left-0 w-2 h-[0.5px] bg-gold/50 -translate-y-1/2" />
          <div className="absolute top-1/2 right-0 w-2 h-[0.5px] bg-gold/50 -translate-y-1/2" />
          <div className="absolute left-1/2 top-0 w-[0.5px] h-2 bg-gold/50 -translate-x-1/2" />
          <div className="absolute left-1/2 bottom-0 w-[0.5px] h-2 bg-gold/50 -translate-x-1/2" />
          <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-gold rounded-full -translate-x-1/2 -translate-y-1/2" />
        </div>
      </motion.div>
    )
  }

  return (
    <>
      <motion.div
        style={{
          left: cursorX, top: cursorY, x: '-50%', y: '-50%',
          opacity: isHidden ? 0 : 1,
          scale: isHovering ? 0 : 1,
        }}
        className="fixed w-2 h-2 bg-gold rounded-full pointer-events-none z-[9999] mix-blend-difference"
      />
      <motion.div
        style={{
          left: ringX, top: ringY, x: '-50%', y: '-50%',
          opacity: isHidden ? 0 : 0.6,
          scale: isHovering ? 1.5 : 1,
        }}
        className="fixed pointer-events-none z-[9998]"
      >
        <div className={`rounded-full border transition-all duration-200 ${
          isHovering ? 'w-12 h-12 border-gold bg-gold/10' : 'w-8 h-8 border-gold/40'
        }`} />
      </motion.div>
    </>
  )
}
