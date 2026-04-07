import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

const CustomCursor = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const [isTouch, setIsTouch] = useState(false)

  const cursorX = useMotionValue(-100)
  const cursorY = useMotionValue(-100)

  // Smooth outer ring (lag effect)
  const springX = useSpring(cursorX, { stiffness: 80, damping: 18, mass: 0.5 })
  const springY = useSpring(cursorY, { stiffness: 80, damping: 18, mass: 0.5 })

  useEffect(() => {
    // Disable on touch devices
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      setIsTouch(true)
      return
    }

    const handleMouseMove = (e) => {
      cursorX.set(e.clientX)
      cursorY.set(e.clientY)
      setIsVisible(true)
    }

    const handleMouseLeave = () => setIsVisible(false)
    const handleMouseEnter = () => setIsVisible(true)

    const handleHover = (e) => {
      const el = e.target

      if (
        el.tagName === 'BUTTON' ||
        el.tagName === 'A' ||
        el.closest('button') ||
        el.closest('a') ||
        el.getAttribute('role') === 'button' ||
        window.getComputedStyle(el).cursor === 'pointer'
      ) {
        setIsHovering(true)
      } else {
        setIsHovering(false)
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseleave', handleMouseLeave)
    window.addEventListener('mouseenter', handleMouseEnter)
    window.addEventListener('mouseover', handleHover)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseleave', handleMouseLeave)
      window.removeEventListener('mouseenter', handleMouseEnter)
      window.removeEventListener('mouseover', handleHover)
    }
  }, [])

  if (isTouch) return null

  return (
    <>
      {/* Outer Ring */}
      <motion.div
        animate={{
          scale: isHovering ? 2 : 1,
          opacity: isVisible ? 1 : 0,
        }}
        transition={{
          scale: { type: 'spring', stiffness: 200, damping: 20 },
          opacity: { duration: 0.2 },
        }}
        className="fixed z-[99999] pointer-events-none rounded-full"
        style={{
          left: springX,
          top: springY,
          x: '-50%',
          y: '-50%',
          width: '36px',
          height: '36px',
          border: '1.5px solid rgba(99,102,241,0.6)',
          background:
            'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
          boxShadow: isHovering
            ? '0 0 25px rgba(99,102,241,0.5), 0 0 50px rgba(139,92,246,0.3)'
            : '0 0 10px rgba(99,102,241,0.2)',
          backdropFilter: isHovering ? 'none' : 'blur(1px)',
        }}
      />

      {/* Inner Dot */}
      <motion.div
        animate={{
          scale: isHovering ? 0.3 : 1,
          opacity: isVisible ? 1 : 0,
        }}
        transition={{
          scale: { duration: 0.15 },
          opacity: { duration: 0.2 },
        }}
        className="fixed z-[100000] pointer-events-none rounded-full"
        style={{
          left: cursorX,
          top: cursorY,
          x: '-50%',
          y: '-50%',
          width: '6px',
          height: '6px',
          background: 'rgba(129, 140, 248, 1)',
          boxShadow: '0 0 10px rgba(129,140,248,0.9)',
        }}
      />
    </>
  )
}

export default CustomCursor