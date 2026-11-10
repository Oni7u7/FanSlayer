import { useEffect, useRef, useState } from 'react'

const SPAWN_INTERVAL = 2000
const PLAYER_SPEED = 3
const MAX_HP = 100
const ATTACK_FRAMES = 20
const DAMAGE_COOLDOWN = 30
// Combo: cada kill dentro de esta ventana suma; recibir daño lo rompe.
const COMBO_WINDOW = 120 // pasos (~2 s)
const comboMultiplier = (combo) => Math.min(5, 1 + Math.floor(combo / 5))

// Tipos de zombi. El "bruto" aparece de vez en cuando y aguanta varios golpes.
const ZOMBIE_TYPES = {
  normal: { hp: 1, speed: 1.5, scale: 1, damage: 10, points: 100, dropChance: 0.3 },
  brute: { hp: 4, speed: 1, scale: 1.5, damage: 20, points: 400, dropChance: 0.75 },
}
// Probabilidad de bruto: empieza en 12% y sube con las kills hasta 30%.
const bruteChance = (kills) => Math.min(0.3, 0.12 + kills * 0.004)
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
  const [combo, setCombo] = useState(0)
  const [bestCombo, setBestCombo] = useState(0)
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
      combo: 0,
      comboTimer: 0,
      bestCombo: 0,
      lastSpawn: 0,
      images: {},
      loaded: false,
      gameOver: false,
    }
    gameRef.current = game
    // Solo en desarrollo: inspeccionar el estado desde la consola.
    if (import.meta.env.DEV) window.__fanslayerGame = game

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
        const type = Math.random() < bruteChance(game.kills) ? 'brute' : 'normal'
        const t = ZOMBIE_TYPES[type]
        const zsize = size.zombie * t.scale
        game.zombies.push({
          type,
          hp: t.hp,
          maxHp: t.hp,
          flash: 0,
          x: Math.random() > 0.5 ? 0 : w,
          y: Math.random() * (h - zsize) + zsize / 2,
        })
      }

      // Mover zombis hacia el jugador
      game.zombies.forEach((z) => {
        if (z.flash > 0) z.flash--
        const dx = p.x - z.x
        const dy = p.y - z.y
        const dist = Math.hypot(dx, dy)
        if (dist > 5) {
          const speed = ZOMBIE_TYPES[z.type].speed
          z.x += (dx / dist) * speed
          z.y += (dy / dist) * speed
        }
      })

      // Combo: se pierde si pasa la ventana sin kills
      if (game.combo > 0 && --game.comboTimer <= 0) {
        game.combo = 0
        setCombo(0)
      }

      // Daño al jugador: como máximo un golpe por cooldown; el bruto pega más fuerte
      if (game.dmgCooldown > 0) {
        game.dmgCooldown--
      } else {
        const touching = game.zombies.filter(
          (z) => Math.hypot(p.x - z.x, p.y - z.y) < size.hitDist * ZOMBIE_TYPES[z.type].scale
        )
        if (touching.length > 0) {
          const damage = Math.max(...touching.map((z) => ZOMBIE_TYPES[z.type].damage))
          p.hp = Math.max(0, p.hp - damage)
          game.dmgCooldown = DAMAGE_COOLDOWN
          setHp(p.hp)
          setHitFx((n) => n + 1)
          if (game.combo > 0) {
            game.combo = 0
            setCombo(0)
          }
          if (p.hp === 0) {
            game.gameOver = true
            setGameOver(true)
          }
        }
      }

      // Golpe del jugador
      if (game.state === 'attack' && game.attackTimer === ATTACK_FRAMES - 2) {
        const reach = size.player * 0.4
        const killed = []
        game.zombies = game.zombies.filter((z) => {
          const t = ZOMBIE_TYPES[z.type]
          const range = size.attackRange + (size.zombie * (t.scale - 1)) / 2
          if (Math.hypot(p.x + p.facing * reach - z.x, p.y - z.y) >= range) return true
          z.hp--
          if (z.hp > 0) {
            // Sobrevive: parpadea y retrocede
            z.flash = 10
            const dx = z.x - p.x
            const dy = z.y - p.y
            const d = Math.hypot(dx, dy) || 1
            z.x += (dx / d) * size.player * 0.5
            z.y += (dy / d) * size.player * 0.5
            return true
          }
          killed.push(z)
          return false
        })

        if (killed.length > 0) {
          for (const z of killed) {
            const t = ZOMBIE_TYPES[z.type]
            game.combo++
            game.score += t.points * comboMultiplier(game.combo)
            if (Math.random() < t.dropChance) {
              const item = ITEMS[Math.floor(Math.random() * ITEMS.length)]
              game.inventory[item.id]++
              game.dropCount++
              setLastDrop({ id: item.id, n: game.dropCount })
            }
          }
          game.kills += killed.length
          game.comboTimer = COMBO_WINDOW
          if (game.combo > game.bestCombo) {
            game.bestCombo = game.combo
            setBestCombo(game.bestCombo)
          }
          setCombo(game.combo)
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

      // Zombis. fillStyle opaco: si queda el del destello de daño (alpha 0.2),
      // los emojis se dibujan semitransparentes.
      ctx.textAlign = 'center'
      game.zombies.forEach((z) => {
        const t = ZOMBIE_TYPES[z.type]
        const zs = size.zombie * t.scale

        // Sombra en el piso
        ctx.fillStyle = z.type === 'brute' ? 'rgba(120, 0, 0, 0.45)' : 'rgba(0, 0, 0, 0.35)'
        ctx.beginPath()
        ctx.ellipse(z.x, z.y + zs * 0.42, zs * 0.38, zs * 0.12, 0, 0, Math.PI * 2)
        ctx.fill()

        ctx.save()
        // Parpadeo al recibir un golpe sin morir
        if (z.flash > 0 && z.flash % 4 < 2) ctx.globalAlpha = 0.35
        ctx.fillStyle = '#000'
        ctx.font = `${zs}px serif`
        ctx.fillText('🧟', z.x, z.y + zs / 3)
        ctx.restore()

        // Barra de vida del bruto, en bloques
        if (z.type === 'brute') {
          const pip = Math.max(6, zs * 0.1)
          const gap = 2
          const total = z.maxHp * pip + (z.maxHp - 1) * gap
          const bx = z.x - total / 2
          const by = z.y - zs * 0.62
          ctx.fillStyle = '#000'
          ctx.fillRect(bx - 2, by - 2, total + 4, pip * 0.8 + 4)
          for (let i = 0; i < z.maxHp; i++) {
            ctx.fillStyle = i < z.hp ? '#ff3b3b' : '#3a2a2a'
            ctx.fillRect(bx + i * (pip + gap), by, pip, pip * 0.8)
          }
        }
      })

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

      // Flash de daño (aislado con save/restore para no contaminar el siguiente frame)
      if (game.dmgCooldown > DAMAGE_COOLDOWN - 5) {
        ctx.save()
        ctx.fillStyle = 'rgba(255, 0, 0, 0.2)'
        ctx.fillRect(0, 0, w, h)
        ctx.restore()
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
    game.combo = 0
    game.comboTimer = 0
    game.bestCombo = 0
    game.gameOver = false
    setKills(0)
    setScore(0)
    setInventory(emptyInventory())
    setLastDrop(null)
    setHp(MAX_HP)
    setCombo(0)
    setBestCombo(0)
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

      {/* Combo */}
      {combo >= 2 && (
        <div className="hud-combo" aria-live="polite">
          <div key={combo} className="hud-combo-inner pop">
            <span className="hud-combo-count">{combo}</span>
            <span className="hud-combo-label">COMBO</span>
            {comboMultiplier(combo) > 1 && (
              <span className="hud-combo-mult">x{comboMultiplier(combo)}</span>
            )}
          </div>
          <div className="hud-combo-timer">
            <span key={combo} style={{ animationDuration: `${(COMBO_WINDOW * STEP_MS) / 1000}s` }} />
          </div>
        </div>
      )}

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
            <p>MEJOR COMBO {bestCombo}</p>
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
