import { useEffect, useState } from 'react'
import { prefersReducedMotion, useInView } from './useReveal'

const OPTIONS = { threshold: 0.1 }

/**
 * Muestra los frames de un personaje en bucle, solo mientras está en pantalla.
 * Con reduced motion se queda en el primer frame.
 */
export default function SpriteLoop({ frames, alt, interval = 170, className = '' }) {
  const [ref, inView] = useInView(OPTIONS)
  const [frame, setFrame] = useState(0)

  useEffect(() => {
    if (!inView || prefersReducedMotion()) return
    const id = setInterval(() => setFrame((f) => (f + 1) % frames.length), interval)
    return () => clearInterval(id)
  }, [inView, frames.length, interval])

  return (
    <div ref={ref} className={`sprite-loop ${className}`}>
      {frames.map((src, i) => (
        <img
          key={src}
          src={src}
          alt={i === 0 ? alt : ''}
          aria-hidden={i === 0 ? undefined : true}
          loading="lazy"
          className={i === frame ? 'is-active' : ''}
        />
      ))}
    </div>
  )
}
