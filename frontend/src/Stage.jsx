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
const DROP_NAMES = ['🎸 Guitarra', '🎤 Micro', '🎵 Disco', '👟 Sneaker', '🕶️ Shades']

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
  const [drops, setDrops] = useState([])
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
      drops: [],
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
            game.drops.push(DROP_NAMES[Math.floor(Math.random() * DROP_NAMES.length)])
          }
          return !hit
        })
        const killed = before - game.zombies.length
        if (killed > 0) {
          game.kills += killed
          game.score += killed * 100
          setKills(game.kills)
          setScore(game.score)
          setDrops([...game.drops])
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

      // Barra de HP
      const barW = Math.min(220, w * 0.4)
      const barH = 16
      const barX = w - barW - 12
      const barY = 12
      const hpRatio = p.hp / MAX_HP
      ctx.fillStyle = '#333'
      ctx.fillRect(barX, barY, barW, barH)
      ctx.fillStyle = hpRatio > 0.5 ? '#4f4' : hpRatio > 0.25 ? '#ff4' : '#f44'
      ctx.fillRect(barX, barY, barW * hpRatio, barH)
      ctx.strokeStyle = '#fff'
      ctx.strokeRect(barX, barY, barW, barH)
      ctx.fillStyle = '#fff'
      ctx.font = '12px Courier New'
      ctx.textAlign = 'center'
      ctx.fillText(`❤️ ${p.hp}/${MAX_HP}`, barX + barW / 2, barY + 13)

      // HUD
      ctx.font = '16px Courier New'
      ctx.textAlign = 'left'
      ctx.fillText(`🎤 ${character.name} #${character.tokenId}`, 12, 24)
      ctx.fillText(`⚔️ Kills: ${game.kills}   🏆 Score: ${game.score}`, 12, 46)

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
  }, [sprites, character.name, character.tokenId])

  const restart = () => {
    const game = gameRef.current
    game.player = { x: game.w / 2, y: game.h / 2, facing: 1, hp: MAX_HP }
    game.zombies = []
    game.kills = 0
    game.score = 0
    game.drops = []
    game.state = 'idle'
    game.frame = 0
    game.attackTimer = 0
    game.dmgCooldown = 0
    game.gameOver = false
    setKills(0)
    setScore(0)
    setDrops([])
    setGameOver(false)
  }

  return (
    <div className="stage">
      <canvas ref={canvasRef} aria-label={`Escenario: juegas con ${character.name}`} />

      {loadError && <p className="stage-warning">⚠️ {loadError}</p>}

      {drops.length > 0 && <div className="stage-drops">Drops: {drops.slice(-5).join(' | ')}</div>}

      {gameOver && (
        <div className="stage-overlay">
          <div>
            <h2 style={{ color: '#f44' }}>💀 GAME OVER</h2>
            <p>Kills: {kills} | Score: {score}</p>
            <button onClick={restart}>🔄 Reiniciar</button>
            <button onClick={onBack}>← Volver al Menú</button>
          </div>
        </div>
      )}

      <div className="stage-hud">
        <button onClick={onBack}>← Menú</button>
        <span className="stage-help">WASD/Flechas = mover | Click/Space = atacar</span>
      </div>
    </div>
  )
}
