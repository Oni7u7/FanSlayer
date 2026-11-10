import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react'
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
 * Fondo 3D único de la app (capa fija detrás de todo).
 * variant: "full" en la landing, "calm" en las pantallas de trabajo.
 * Capas: aurora (lejana) → escena three.js (media) → haces de luz (cercana) → viñeta y grano.
 */
export default function AmbientBackground({ variant = 'full' }) {
  const reduce = useReducedMotion() ?? false
  const mobile = useIsMobile()
  const canvasRef = useRef(null)
  const sceneRef = useRef(null)

  // Parallax: puntero (solo puntero fino) + scroll, suavizados con spring
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

  // Capas CSS con parallax distinto (la lejana se mueve poco, la cercana más)
  const farX = useTransform(px, (v) => (reduce ? 0 : v * -14))
  const farY = useTransform([py, scroll], ([a, s]) => (reduce ? 0 : a * -10 - s * 60))
  const nearX = useTransform(px, (v) => (reduce ? 0 : v * 28))
  const nearY = useTransform([py, scroll], ([a, s]) => (reduce ? 0 : a * 18 - s * 160))

  // Escena three.js cargada en diferido para no frenar el primer render
  useEffect(() => {
    let cancelled = false
    let handle = null
    import('./stageScene').then(({ createStageScene }) => {
      if (cancelled || !canvasRef.current) return
      try {
        handle = createStageScene(canvasRef.current, {
          mobile,
          reduce,
          variant,
          input: { px: () => (reduce ? 0 : px.get()), py: () => (reduce ? 0 : py.get()), scroll: () => (reduce ? 0 : scroll.get()) },
        })
        sceneRef.current = handle
      } catch (err) {
        // Sin WebGL: quedan la aurora y los haces, que son CSS
        console.warn('Fondo 3D sin WebGL:', err)
      }
    })
    const mq = window.matchMedia('(prefers-color-scheme: light)')
    const onScheme = () => sceneRef.current?.refreshColors()
    mq.addEventListener('change', onScheme)
    return () => {
      cancelled = true
      mq.removeEventListener('change', onScheme)
      handle?.dispose()
      sceneRef.current = null
    }
    // variant se aplica con setVariant para no recrear la escena
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mobile, reduce, px, py, scroll])

  useEffect(() => {
    sceneRef.current?.setVariant(variant)
  }, [variant])

  const animate = reduce ? '' : ' amb-animate'

  return (
    <div aria-hidden="true" className={`amb-root amb-${variant}`}>
      <motion.div className="amb-aurora" style={{ x: farX, y: farY }}>
        <span className={`amb-blob amb-blob-1${animate}`} />
        <span className={`amb-blob amb-blob-2${animate}`} />
        {!mobile && <span className={`amb-blob amb-blob-3${animate}`} />}
      </motion.div>

      <canvas ref={canvasRef} className="amb-canvas" />

      <motion.div className="amb-beams" style={{ x: nearX, y: nearY }}>
        <span className={`amb-beam amb-beam-1${animate}`} />
        {!mobile && <span className={`amb-beam amb-beam-2${animate}`} />}
      </motion.div>

      <div className="amb-grain" />
      <div className="amb-vignette" />
    </div>
  )
}
