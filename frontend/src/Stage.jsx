import { useEffect, useRef, useState } from 'react'

const SPAWN_INTERVAL = 2000
const ZOMBIE_SPEED = 1.5
const PLAYER_SPEED = 3
const MAX_HP = 100
const ATTACK_FRAMES = 20
const DAMAGE = 10
const DAMAGE_COOLDOWN = 30
// La lógica corre a 60 pasos por segundo sin importar los Hz del monitor.
const STEP_MS = 1000 / 60

const BG_PATH = '/sprites/bg.jpg'
const ITEMS = [
  { id: 'cadena', name: 'Cadena', image: '/sprites/items/item_cadena.png' },
  { id: 'guante', name: 'Guante', image: '/sprites/items/item_guante.png' },
  { id: 'lentes', name: 'Lentes', image: '/sprites/items/item_lentes.png' },
  { id: 'sombrero', name: 'Sombrero', image: '/sprites/items/item_sombrero.png' },
]
const emptyInventory = () => Object.fromEntries(ITEMS.map((it) => [it.id, 0]))
const HP_SEGMENTS = 10

// Tamaños relativos a la pantalla, para que se vea bien en cualquier ventana.
const sizesFor = (w, h) => {
  const player = Math.round(Math.min(140, Math.max(64, Math.min(w, h) * 0.15)))
  return { player, zombie: Math.round(player * 0.75), attackRange: player * 0.9, hitDist: player * 0.5 }
}

export default function Stage({ character, onBack }) {
  const sprites = character.artist.sprites
  const canvasRef = useRef(null)
  const gameRef = useRef(null)
  const [kills, setKills] = useState(0)
  const [score, setScore] = useState(0)
  const [inventory, setInventory] = useState(emptyInventory)
  const [lastDrop, setLastDrop] = useState(null) // { id, n } para animar el slot
  const [hp, setHp] = useState(MAX_HP)
  const [hitFx, setHitFx] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const game = {
      w: 0,
      h: 0,
      size: sizesFor(800, 600),
      player: { x: 0, y: 0, facing: 1, hp: MAX_HP },
      zombies: [],
      keys: {},
      kills: 0,
      score: 0,
      inventory: emptyInventory(),
      dropCount: 0,
      state: 'idle',
      frame: 0,
      attackTimer: 0,
      dmgCooldown: 0,
      lastSpawn: 0,
      images: {},
      loaded: false,
      gameOver: false,
    }
    gameRef.current = game

    // Canvas del tamaño de la ventana, nítido en pantallas de alta densidad.
    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      const first = game.w === 0
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.imageSmoothingEnabled = false
      game.w = w
      game.h = h
      game.size = sizesFor(w, h)
      const p = game.player
      if (first) {
        p.x = w / 2
        p.y = h / 2
      }
      const half = game.size.player / 2
      p.x = Math.max(half, Math.min(w - half, p.x))
      p.y = Math.max(half, Math.min(h - half, p.y))
    }
    resize()
    window.addEventListener('resize', resize)

    // Cargar sprites. Si alguno falla, el juego arranca igual y avisa.
    const allPaths = [...sprites.idle, ...sprites.walk, ...sprites.attack, BG_PATH]
    let pending = allPaths.length
    const settle = () => { if (--pending === 0) game.loaded = true }
    allPaths.forEach((path) => {
      const img = new Image()
      img.onload = settle
      img.onerror = () => {
        delete game.images[path]
        setLoadError(`No se pudo cargar ${path}`)
        settle()
      }
      img.src = path
      game.images[path] = img
    })

    const startAttack = () => {
      if (game.gameOver) return
      game.state = 'attack'
      game.attackTimer = ATTACK_FRAMES
      game.frame = 0
    }
    const onKeyDown = (e) => {
      game.keys[e.key.toLowerCase()] = true
      if (e.key === ' ') {
        e.preventDefault()
        startAttack()
      }
      if (e.key.startsWith('Arrow')) e.preventDefault()
    }
    const onKeyUp = (e) => { game.keys[e.key.toLowerCase()] = false }
    const onBlur = () => { game.keys = {} }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', onBlur)
    canvas.addEventListener('pointerdown', startAttack)

    let tick = 0

    const update = (now) => {
      tick++
      const { w, h, size } = game
      const p = game.player
      const k = game.keys
      let moving = false

      if (k['arrowleft'] || k['a']) { p.x -= PLAYER_SPEED; p.facing = -1; moving = true }
      if (k['arrowright'] || k['d']) { p.x += PLAYER_SPEED; p.facing = 1; moving = true }
      if (k['arrowup'] || k['w']) { p.y -= PLAYER_SPEED; moving = true }
      if (k['arrowdown'] || k['s']) { p.y += PLAYER_SPEED; moving = true }

      const half = size.player / 2
      p.x = Math.max(half, Math.min(w - half, p.x))
      p.y = Math.max(half, Math.min(h - half, p.y))

      if (game.attackTimer > 0) {
        game.attackTimer--
        game.state = 'attack'
      } else {
        game.state = moving ? 'walk' : 'idle'
      }

      // Animar solo al caminar o atacar
      if (game.state === 'idle') {
        game.frame = 0
      } else if (tick % 10 === 0) {
        game.frame = (game.frame + 1) % sprites[game.state].length
      }

      // Spawn de zombis por los costados
      if (now - game.lastSpawn > SPAWN_INTERVAL) {
        game.lastSpawn = now
        game.zombies.push({
          x: Math.random() > 0.5 ? 0 : w,
          y: Math.random() * (h - size.zombie) + size.zombie / 2,
        })
      }

      // Mover zombis hacia el jugador
      game.zombies.forEach((z) => {
        const dx = p.x - z.x
        const dy = p.y - z.y
        const dist = Math.hypot(dx, dy)
        if (dist > 5) {
          z.x += (dx / dist) * ZOMBIE_SPEED
          z.y += (dy / dist) * ZOMBIE_SPEED
        }
      })

      // Daño al jugador: como máximo un golpe por cooldown
      if (game.dmgCooldown > 0) {
        game.dmgCooldown--
      } else if (game.zombies.some((z) => Math.hypot(p.x - z.x, p.y - z.y) < size.hitDist)) {
        p.hp = Math.max(0, p.hp - DAMAGE)
        game.dmgCooldown = DAMAGE_COOLDOWN
        setHp(p.hp)
        setHitFx((n) => n + 1)
        if (p.hp === 0) {
          game.gameOver = true
          setGameOver(true)
        }
      }

      // Golpe del jugador
      if (game.state === 'attack' && game.attackTimer === ATTACK_FRAMES - 2) {
        const before = game.zombies.length
        const reach = size.player * 0.4
        game.zombies = game.zombies.filter((z) => {
          const hit = Math.hypot(p.x + p.facing * reach - z.x, p.y - z.y) < size.attackRange
          if (hit && Math.random() < 0.3) {
            const item = ITEMS[Math.floor(Math.random() * ITEMS.length)]
            game.inventory[item.id]++
            game.dropCount++
            setLastDrop({ id: item.id, n: game.dropCount })
          }
          return !hit
        })
        const killed = before - game.zombies.length
        if (killed > 0) {
          game.kills += killed
          game.score += killed * 100
          setKills(game.kills)
          setScore(game.score)
          setInventory({ ...game.inventory })
        }
      }
    }

    const drawCover = (img) => {
      const { w, h } = game
      const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight)
      const dw = img.naturalWidth * scale
      const dh = img.naturalHeight * scale
      ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh)
    }

    const draw = () => {
      const { w, h, size } = game
      const p = game.player

      const bgImg = game.images[BG_PATH]
      if (bgImg?.naturalWidth) {
        drawCover(bgImg)
      } else {
        ctx.fillStyle = '#1a0533'
        ctx.fillRect(0, 0, w, h)
      }

      ctx.font = `${size.zombie}px serif`
      ctx.textAlign = 'center'
      game.zombies.forEach((z) => ctx.fillText('🧟', z.x, z.y + size.zombie / 3))

      // Jugador, respetando la proporción de cada sprite
      const frames = sprites[game.state]
      const img = game.images[frames[game.frame % frames.length]]
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.scale(p.facing, 1)
      if (img?.naturalWidth) {
        const ph = size.player
        const pw = ph * (img.naturalWidth / img.naturalHeight)
        ctx.drawImage(img, -pw / 2, -ph / 2, pw, ph)
      } else {
        ctx.fillStyle = '#ff4444'
        ctx.fillRect(-size.player / 4, -size.player / 2, size.player / 2, size.player)
      }
      ctx.restore()

      // Flash de daño
      if (game.dmgCooldown > DAMAGE_COOLDOWN - 5) {
        ctx.fillStyle = 'rgba(255, 0, 0, 0.2)'
        ctx.fillRect(0, 0, w, h)
      }
    }

    let animId
    let last = null
    let acc = 0
    const loop = (ts) => {
      animId = requestAnimationFrame(loop)
      if (!game.loaded) return
      if (last === null) last = ts
      // Tope de 250 ms para no "saltar" tras cambiar de pestaña
      acc += Math.min(ts - last, 250)
      last = ts
      while (acc >= STEP_MS && !game.gameOver) {
        update(ts)
        acc -= STEP_MS
      }
      if (game.gameOver) acc = 0
      draw()
    }
    animId = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', onBlur)
      canvas.removeEventListener('pointerdown', startAttack)
    }
  }, [sprites])

  const restart = () => {
    const game = gameRef.current
    game.player = { x: game.w / 2, y: game.h / 2, facing: 1, hp: MAX_HP }
    game.zombies = []
    game.kills = 0
    game.score = 0
    game.inventory = emptyInventory()
    game.dropCount = 0
    game.state = 'idle'
    game.frame = 0
    game.attackTimer = 0
    game.dmgCooldown = 0
    game.gameOver = false
    setKills(0)
    setScore(0)
    setInventory(emptyInventory())
    setLastDrop(null)
    setHp(MAX_HP)
    setGameOver(false)
  }

  const hpRatio = hp / MAX_HP
  const filledSegments = Math.ceil(hpRatio * HP_SEGMENTS)
  const hpTone = hpRatio > 0.5 ? 'ok' : hpRatio > 0.25 ? 'mid' : 'low'

  return (
    <div className="stage">
      <canvas ref={canvasRef} aria-label={`Escenario: juegas con ${character.name}`} />

      <div className="hud">
        {/* Retrato, nombre y vida */}
        <div key={hitFx} className={`px-panel hud-player${hitFx ? ' is-hit' : ''}`}>
          <div className="hud-portrait">
            <img src={character.artist.image} alt="" />
          </div>
          <div className="hud-player-info">
            <p className="hud-name">
              {character.name} <span className="hud-token">#{character.tokenId}</span>
            </p>
            <div
              className={`hud-hp hp-${hpTone}`}
              role="meter"
              aria-label="Vida"
              aria-valuemin={0}
              aria-valuemax={MAX_HP}
              aria-valuenow={hp}
            >
              <span className="hud-heart" aria-hidden="true" />
              <div className="hud-hp-bar">
                {Array.from({ length: HP_SEGMENTS }, (_, i) => (
                  <span key={i} className={i < filledSegments ? 'on' : ''} />
                ))}
              </div>
              <span className="hud-hp-num">{hp}</span>
            </div>
          </div>
        </div>

        {/* Kills y score */}
        <div className="px-panel hud-stats">
          <div className="hud-stat">
            <span className="hud-stat-label">KILLS</span>
            <span key={kills} className="hud-stat-value pop">{kills}</span>
          </div>
          <div className="hud-stat">
            <span className="hud-stat-label">SCORE</span>
            <span key={score} className="hud-stat-value gold pop">{String(score).padStart(5, '0')}</span>
          </div>
        </div>
      </div>

      {/* Inventario de drops */}
      <div className="px-panel hud-inventory" aria-label="Drops">
        {ITEMS.map((it) => {
          const count = inventory[it.id]
          const fresh = lastDrop?.id === it.id
          return (
            <div
              key={fresh ? `${it.id}-${lastDrop.n}` : it.id}
              className={`hud-slot${count ? '' : ' empty'}${fresh ? ' fresh' : ''}`}
              title={`${it.name}: ${count}`}
            >
              <img src={it.image} alt={it.name} />
              {count > 0 && <span className="hud-slot-count">{count}</span>}
            </div>
          )
        })}
      </div>

      {loadError && <p className="stage-warning">⚠️ {loadError}</p>}

      {gameOver && (
        <div className="stage-overlay">
          <div className="px-panel game-over">
            <h2>GAME OVER</h2>
            <p>KILLS {kills} · SCORE {score}</p>
            <button className="px-button" onClick={restart}>Reiniciar</button>
            <button className="px-button secondary" onClick={onBack}>Volver al menú</button>
          </div>
        </div>
      )}

      <div className="stage-hud">
        <button className="px-button small" onClick={onBack}>← Menú</button>
        <span className="stage-help">WASD/Flechas mover · Click/Space atacar</span>
      </div>
    </div>
  )
}
