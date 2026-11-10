import { useEffect, useRef, useState } from 'react'

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/** true mientras el elemento está en pantalla (para pausar animaciones fuera de vista). */
export function useInView(options = { threshold: 0.1 }) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    if (!ref.current || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), options)
    io.observe(ref.current)
    return () => io.disconnect()
  }, [options])

  return [ref, inView]
}
