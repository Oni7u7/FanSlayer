import { useEffect } from 'react'
import Lenis from 'lenis'

/**
 * Scroll suave con inercia (Lenis) solo mientras la landing está montada.
 * Respeta prefers-reduced-motion (scroll 1:1 y saltos instantáneos) y
 * maneja los enlaces #ancla con el offset de la barra fija.
 */
export default function useSmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.085,
      wheelMultiplier: 0.9,
      anchors: { offset: -72 },
      respectReducedMotion: true,
    })
    return () => lenis.destroy()
  }, [])
}
