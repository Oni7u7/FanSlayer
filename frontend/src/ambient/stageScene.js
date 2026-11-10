/**
 * Escena three.js del fondo: "Constelación sobre el escenario".
 * Receta 1 del dado (constelación) construida en three.js + bola de disco low-poly
 * de la receta 6, porque el usuario pidió three.js. Colores desde los tokens CSS.
 */
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  EdgesGeometry,
  Group,
  IcosahedronGeometry,
  LineBasicMaterial,
  LineSegments,
  NormalBlending,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  WebGLRenderer,
} from 'three'

const token = (name, fallback) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback

function makeFireflies(count, radius) {
  const positions = new Float32Array(count * 3)
  const phases = new Float32Array(count)
  for (let i = 0; i < count; i++) {
    // Cascarón esférico aplanado: más ancho que alto, como un domo de luces
    const u = Math.random() * Math.PI * 2
    const v = Math.acos(2 * Math.random() - 1)
    const r = radius * (0.55 + Math.random() * 0.45)
    positions[i * 3] = Math.sin(v) * Math.cos(u) * r * 1.6
    positions[i * 3 + 1] = Math.cos(v) * r * 0.9
    positions[i * 3 + 2] = Math.sin(v) * Math.sin(u) * r
    phases[i] = Math.random() * Math.PI * 2
  }
  return { positions, phases }
}

/** Une puntos cercanos en "constelaciones" (se calcula una vez). */
function makeConstellation(positions, maxDist, maxLinks) {
  const n = positions.length / 3
  const segs = []
  for (let i = 0; i < n && segs.length / 6 < maxLinks; i++) {
    for (let j = i + 1; j < n; j++) {
      const dx = positions[i * 3] - positions[j * 3]
      const dy = positions[i * 3 + 1] - positions[j * 3 + 1]
      const dz = positions[i * 3 + 2] - positions[j * 3 + 2]
      if (dx * dx + dy * dy + dz * dz < maxDist * maxDist) {
        segs.push(
          positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2],
          positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2],
        )
        break
      }
    }
  }
  return new Float32Array(segs)
}

/**
 * Monta la escena en `canvas`. `input` expone getters de parallax (px, py en -1..1, scroll 0..1).
 * Devuelve { setVariant, refreshColors, dispose }.
 */
export function createStageScene(canvas, { mobile, reduce, variant, input }) {
  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: !mobile, powerPreference: 'low-power' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.setClearColor(0x000000, 0)

  const scene = new Scene()
  const camera = new PerspectiveCamera(55, 1, 0.1, 100)
  camera.position.set(0, 0, 9)

  const world = new Group()
  scene.add(world)

  // Bola de disco low-poly: aristas del icosaedro (pocas aristas, barato)
  const ballGeo = new EdgesGeometry(new IcosahedronGeometry(1.7, mobile ? 1 : 2))
  const ballMat = new LineBasicMaterial({ transparent: true, opacity: 0.38 })
  const ball = new LineSegments(ballGeo, ballMat)
  const ballGroup = new Group()
  ballGroup.add(ball)
  world.add(ballGroup)

  // Halo interior: segundo icosaedro más chico girando al revés
  const coreGeo = new EdgesGeometry(new IcosahedronGeometry(0.9, 0))
  const coreMat = new LineBasicMaterial({ transparent: true, opacity: 0.55 })
  const core = new LineSegments(coreGeo, coreMat)
  ballGroup.add(core)

  // Luciérnagas + constelación
  const count = mobile ? 260 : 560
  const { positions, phases } = makeFireflies(count, 6.5)
  const ffGeo = new BufferGeometry()
  ffGeo.setAttribute('position', new BufferAttribute(positions, 3))
  const ffMat = new PointsMaterial({
    size: mobile ? 0.06 : 0.05,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
    blending: AdditiveBlending,
    sizeAttenuation: true,
  })
  const fireflies = new Points(ffGeo, ffMat)
  world.add(fireflies)

  const linkGeo = new BufferGeometry()
  linkGeo.setAttribute('position', new BufferAttribute(makeConstellation(positions, 1.15, mobile ? 70 : 160), 3))
  const linkMat = new LineBasicMaterial({ transparent: true, opacity: 0.16, depthWrite: false, blending: AdditiveBlending })
  const links = new LineSegments(linkGeo, linkMat)
  world.add(links)

  let calm = variant === 'calm'

  const refreshColors = () => {
    const light = window.matchMedia('(prefers-color-scheme: light)').matches
    ballMat.color = new Color(token('--pink', '#ff5d8f'))
    coreMat.color = new Color(token('--cyan', '#3dd6f5'))
    ffMat.color = new Color(token('--gold', '#ffcf5c'))
    linkMat.color = new Color(token('--cyan', '#3dd6f5'))
    // En claro el blending aditivo se pierde: se usa normal y se atenúa
    const blending = light ? NormalBlending : AdditiveBlending
    ffMat.blending = blending
    linkMat.blending = blending
    ffMat.needsUpdate = linkMat.needsUpdate = true
    const k = calm ? 0.55 : 1
    ballMat.opacity = (light ? 0.3 : 0.38) * k
    coreMat.opacity = (light ? 0.4 : 0.55) * k
    ffMat.opacity = (light ? 0.55 : 0.9) * k
    linkMat.opacity = (light ? 0.22 : 0.16) * k
  }
  refreshColors()

  const resize = () => {
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    renderer.setSize(w, h, false)
    camera.aspect = w / Math.max(h, 1)
    // En pantallas angostas la bola se aleja para no tapar el texto
    camera.position.z = w < 768 ? 12 : 9
    camera.updateProjectionMatrix()
    // La bola cuelga arriba a la derecha, asomando sobre la pantalla del juego del hero
    ballGroup.position.x = w >= 900 ? 4.4 : 3.2
    ballGroup.position.y = w >= 900 ? 2.6 : 5.6
  }
  resize()
  window.addEventListener('resize', resize)

  const basePositions = positions.slice()
  let raf = 0
  let start = performance.now()

  const frame = (now) => {
    const t = (now - start) / 1000
    const speed = calm ? 0.45 : 1
    const px = input.px()
    const py = input.py()
    const scroll = input.scroll()

    ball.rotation.y = t * 0.18 * speed
    ball.rotation.x = 0.35 + py * 0.25
    core.rotation.y = -t * 0.35 * speed
    core.rotation.z = t * 0.2 * speed
    const breathe = 1 + Math.sin(t * 1.4) * 0.03
    ballGroup.scale.setScalar(breathe)

    // Las luciérnagas titilan subiendo y bajando poco
    const pos = ffGeo.attributes.position.array
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] = basePositions[i * 3 + 1] + Math.sin(t * 0.8 + phases[i]) * 0.12
    }
    ffGeo.attributes.position.needsUpdate = true

    world.rotation.y = t * 0.03 * speed + px * 0.18
    // Parallax: el puntero mueve la cámara y el scroll la hace bajar entre la constelación
    camera.position.x += (px * 0.8 - camera.position.x) * 0.05
    camera.position.y += (-py * 0.5 - scroll * 3 - camera.position.y) * 0.05
    camera.lookAt(0, -scroll * 2.2, 0)

    renderer.render(scene, camera)
  }

  const loop = (now) => {
    frame(now)
    raf = requestAnimationFrame(loop)
  }
  const onVisibility = () => {
    cancelAnimationFrame(raf)
    if (!document.hidden && !reduce) raf = requestAnimationFrame(loop)
  }

  if (reduce) {
    frame(performance.now())
  } else {
    raf = requestAnimationFrame(loop)
    document.addEventListener('visibilitychange', onVisibility)
  }

  return {
    setVariant(v) {
      calm = v === 'calm'
      refreshColors()
      if (reduce) frame(performance.now())
    },
    refreshColors() {
      refreshColors()
      if (reduce) frame(performance.now())
    },
    dispose() {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', onVisibility)
      ;[ballGeo, coreGeo, ffGeo, linkGeo].forEach((g) => g.dispose())
      ;[ballMat, coreMat, ffMat, linkMat].forEach((m) => m.dispose())
      renderer.dispose()
    },
  }
}
