import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react'
import { createPixelScene } from './pixelScene'
import './ambient.css'

function useIsMobile() {
  const [mobile, setMobile] = useState(() => window.matchMedia('(max-width: 767px)').matches)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const update = () => setMobile(mq.matches)
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])
  return mobile
}

/**
 * Fondo único de la app: cielo de estrellas pixel (capa lejana) y túnel de marcos
 * cuadrados (capa cercana). Cada capa se desplaza distinto con el puntero y el scroll.
 * variant: "full" en la landing, "calm" en las pantallas de trabajo.
 */
export default function AmbientBackground({ variant = 'full' }) {
  const reduce = useReducedMotion() ?? false
  const mobile = useIsMobile()
  const farRef = useRef(null)
  const nearRef = useRef(null)
  const sceneRef = useRef(null)

  const rx = useMotionValue(0)
  const ry = useMotionValue(0)
  const px = useSpring(rx, { stiffness: 40, damping: 18 })
  const py = useSpring(ry, { stiffness: 40, damping: 18 })
  const { scrollYProgress } = useScroll()
  const scroll = useSpring(scrollYProgress, { stiffness: 60, damping: 20 })

  useEffect(() => {
    if (reduce || !window.matchMedia('(pointer: fine)').matches) return
    const onMove = (e) => {
      rx.set((e.clientX / window.innerWidth - 0.5) * 2)
      ry.set((e.clientY / window.innerHeight - 0.5) * 2)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [reduce, rx, ry])

  // Parallax por profundidad: las estrellas se mueven poco, el túnel más
  const farX = useTransform(px, (v) => (reduce ? 0 : v * -8))
  const farY = useTransform([py, scroll], ([a, s]) => (reduce ? 0 : a * -6 - s * 40))
  const nearY = useTransform(scroll, (s) => (reduce ? 0 : s * -120))

  useEffect(() => {
    if (!farRef.current || !nearRef.current) return
    const scene = createPixelScene(
      { far: farRef.current, near: nearRef.current },
      {
        mobile,
        reduce,
        variant,
        input: { px: () => (reduce ? 0 : px.get()), py: () => (reduce ? 0 : py.get()) },
      }
    )
    sceneRef.current = scene
    const mq = window.matchMedia('(prefers-color-scheme: light)')
    const onScheme = () => scene.refreshColors()
    mq.addEventListener('change', onScheme)
    return () => {
      mq.removeEventListener('change', onScheme)
      scene.dispose()
      sceneRef.current = null
    }
    // variant se aplica con setVariant para no recrear la escena
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mobile, reduce, px, py])

  useEffect(() => {
    sceneRef.current?.setVariant(variant)
  }, [variant])

  return (
    <div aria-hidden="true" className={`amb-root amb-${variant}`}>
      <motion.canvas ref={farRef} className="amb-canvas amb-far" style={{ x: farX, y: farY }} />
      <motion.canvas ref={nearRef} className="amb-canvas amb-near" style={{ y: nearY }} />
      <div className="amb-vignette" />
    </div>
  )
}
