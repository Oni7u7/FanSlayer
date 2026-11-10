/**
 * Fondo "Túnel pixel" (receta 4 del dado, versión minimalista y retro).
 * Dos canvas de baja resolución escalados con image-rendering: pixelated:
 *   - lejano: pocas estrellas de un pixel que titilan lento
 *   - cercano: 6–10 marcos cuadrados que avanzan despacio hacia la cámara
 * Colores desde los tokens CSS para que el modo claro funcione solo.
 */

const PIXEL = 4 // tamaño de cada pixel en pantalla

const token = (name, fallback) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback

function hexToRgb(hex) {
  const m = hex.replace('#', '')
  const n = parseInt(m.length === 3 ? m.split('').map((c) => c + c).join('') : m, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function setup(canvas) {
  const ctx = canvas.getContext('2d')
  const w = Math.ceil(canvas.clientWidth / PIXEL)
  const h = Math.ceil(canvas.clientHeight / PIXEL)
  canvas.width = w
  canvas.height = h
  ctx.imageSmoothingEnabled = false
  return { ctx, w, h }
}

export function createPixelScene({ far, near }, { mobile, reduce, variant, input }) {
  let calm = variant === 'calm'
  let colors = {}
  const readColors = () => {
    const light = window.matchMedia('(prefers-color-scheme: light)').matches
    colors = {
      star: hexToRgb(token('--text-faint', '#8a92ad')),
      gold: hexToRgb(token('--gold', '#ffcc4d')),
      pink: hexToRgb(token('--pink', '#ff5c8a')),
      k: light ? 0.6 : 1,
    }
  }
  readColors()

  let farS = setup(far)
  let nearS = setup(near)

  // Estrellas: posiciones fijas en la rejilla de baja resolución
  const starCount = mobile ? 36 : 72
  const stars = Array.from({ length: starCount }, () => ({
    x: Math.random(),
    y: Math.random(),
    phase: Math.random() * Math.PI * 2,
    gold: Math.random() < 0.12,
  }))

  // Túnel: marcos cuadrados con profundidad z (lejos = grande)
  const ringCount = mobile ? 6 : 10
  const SPACING = 1 / ringCount
  const rings = Array.from({ length: ringCount }, (_, i) => ({ z: (i + 1) * SPACING }))

  const drawStars = (t) => {
    const { ctx, w, h } = farS
    ctx.clearRect(0, 0, w, h)
    for (const s of stars) {
      // Titileo escalonado (on/off), como en las consolas viejas
      const on = reduce ? 1 : Math.sin(t * 0.6 + s.phase) > -0.3 ? 1 : 0.35
      const [r, g, b] = s.gold ? colors.gold : colors.star
      ctx.fillStyle = `rgba(${r},${g},${b},${(calm ? 0.45 : 0.75) * on * colors.k})`
      ctx.fillRect(Math.floor(s.x * w), Math.floor(s.y * h), 1, 1)
    }
  }

  const drawTunnel = (dt) => {
    const { ctx, w, h } = nearS
    ctx.clearRect(0, 0, w, h)
    const speed = reduce ? 0 : (calm ? 0.012 : 0.024) * dt
    // El centro del túnel sigue un poco al puntero
    const cx = w / 2 + input.px() * w * 0.08
    const cy = h * 0.46 + input.py() * h * 0.06
    const maxR = Math.max(w, h) * 0.75

    rings.sort((a, b) => b.z - a.z)
    rings.forEach((ring, i) => {
      ring.z -= speed
      if (ring.z <= 0.02) ring.z += 1
      // Perspectiva: cerca (z pequeño) = grande y visible; lejos = chico y tenue
      const k = 0.06 / ring.z
      const half = Math.round(Math.min(maxR, 6 * k * Math.min(w, h) * 0.2))
      if (half < 2) return
      // Variante tranquila: la mitad de los marcos
      if (calm && i % 2) return
      const fade = Math.min(1, ring.z * 3) * Math.min(1, (1 - ring.z) * 4)
      const [r, g, b] = i % 3 === 0 ? colors.pink : colors.gold
      ctx.fillStyle = `rgba(${r},${g},${b},${(calm ? 0.07 : 0.12) * fade * colors.k})`
      const x0 = Math.round(cx - half)
      const y0 = Math.round(cy - half)
      const size = half * 2
      // Marco de 1 pixel (4 px en pantalla): solo rectángulos, nítido y barato
      ctx.fillRect(x0, y0, size, 1)
      ctx.fillRect(x0, y0 + size, size + 1, 1)
      ctx.fillRect(x0, y0, 1, size)
      ctx.fillRect(x0 + size, y0, 1, size)
    })
  }

  let raf = 0
  let last = performance.now()
  const frame = (now) => {
    const dt = Math.min(3, (now - last) / 16.67)
    last = now
    drawStars(now / 1000)
    drawTunnel(dt)
  }
  const loop = (now) => {
    frame(now)
    raf = requestAnimationFrame(loop)
  }
  const onVisibility = () => {
    cancelAnimationFrame(raf)
    last = performance.now()
    if (!document.hidden && !reduce) raf = requestAnimationFrame(loop)
  }
  const onResize = () => {
    farS = setup(far)
    nearS = setup(near)
    if (reduce) frame(performance.now())
  }

  window.addEventListener('resize', onResize)
  if (reduce) {
    frame(performance.now())
  } else {
    raf = requestAnimationFrame(loop)
    document.addEventListener('visibilitychange', onVisibility)
  }

  return {
    setVariant(v) {
      calm = v === 'calm'
      if (reduce) frame(performance.now())
    },
    refreshColors() {
      readColors()
      if (reduce) frame(performance.now())
    },
    dispose() {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', onVisibility)
    },
  }
}
