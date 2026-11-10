import { useEffect, useRef, useState } from 'react'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/**
 * Marca un elemento como visible la primera vez que entra al viewport.
 * Con reduced motion (o sin IntersectionObserver) devuelve visible de inmediato.
 */
export function useReveal(options = { threshold: 0.2 }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(() => prefersReducedMotion() || typeof IntersectionObserver === 'undefined')

  useEffect(() => {
    if (visible || !ref.current) return
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true)
        io.disconnect()
      }
    }, options)
    io.observe(ref.current)
    return () => io.disconnect()
  }, [visible, options])

  return [ref, visible]
}

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

export { prefersReducedMotion }
