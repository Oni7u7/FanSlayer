import { useEffect, useRef, useState } from 'react'

const CANVAS_W = 800
const CANVAS_H = 500
const PLAYER_SIZE = 80
const ZOMBIE_SIZE = 60
const SPAWN_INTERVAL = 2000
const ZOMBIE_SPEED = 1.5
const PLAYER_SPEED = 3
const MAX_HP = 100
const ATTACK_FRAMES = 20
const ATTACK_RANGE = 70
const DAMAGE = 10
const DAMAGE_COOLDOWN = 30
// La lógica corre a 60 pasos por segundo sin importar los Hz del monitor.
const STEP_MS = 1000 / 60

const BG_PATH = '/sprites/bg.jpg'
const SPRITES = {
  idle: ['/sprites/badbany/img1.jpeg'],
  walk: ['/sprites/badbany/img2.png', '/sprites/badbany/img3.png', '/sprites/badbany/img5.png'],
  attack: ['/sprites/badbany/img6.png', '/sprites/badbany/img7.png'],
}
const DROP_NAMES = ['🎸 Guitarra', '🎤 Micro', '🎵 Disco', '👟 Sneaker', '🕶️ Shades']

const initialPlayer = () => ({ x: CANVAS_W / 2, y: CANVAS_H / 2, facing: 1, hp: MAX_HP })

export default function Stage({ onBack }) {
  const canvasRef = useRef(null)
  const gameRef = useRef({
    player: initialPlayer(),
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
  })
  const [kills, setKills] = useState(0)
  const [score, setScore] = useState(0)
  const [drops, setDrops] = useState([])
  const [hp, setHp] = useState(MAX_HP)
  const [gameOver, setGameOver] = useState(false)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    const game = gameRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    // Cargar sprites. Si alguno falla, el juego arranca igual y avisa.
    const allPaths = [...SPRITES.idle, ...SPRITES.walk, ...SPRITES.attack, BG_PATH]
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
    }
    const onKeyUp = (e) => { game.keys[e.key.toLowerCase()] = false }
    const onBlur = () => { game.keys = {} }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', onBlur)
    canvas.addEventListener('click', startAttack)

    let tick = 0

    const update = (now) => {
      tick++
      const p = game.player
      const k = game.keys
      let moving = false

      if (k['arrowleft'] || k['a']) { p.x -= PLAYER_SPEED; p.facing = -1; moving = true }
      if (k['arrowright'] || k['d']) { p.x += PLAYER_SPEED; p.facing = 1; moving = true }
      if (k['arrowup'] || k['w']) { p.y -= PLAYER_SPEED; moving = true }
      if (k['arrowdown'] || k['s']) { p.y += PLAYER_SPEED; moving = true }

      p.x = Math.max(PLAYER_SIZE / 2, Math.min(CANVAS_W - PLAYER_SIZE / 2, p.x))
      p.y = Math.max(PLAYER_SIZE / 2, Math.min(CANVAS_H - PLAYER_SIZE / 2, p.y))

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
        game.frame = (game.frame + 1) % SPRITES[game.state].length
      }

      // Spawn de zombis
      if (now - game.lastSpawn > SPAWN_INTERVAL) {
        game.lastSpawn = now
        game.zombies.push({
          x: Math.random() > 0.5 ? 0 : CANVAS_W,
          y: Math.random() * (CANVAS_H - 60) + 30,
          hp: 1,
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
      } else if (game.zombies.some((z) => Math.hypot(p.x - z.x, p.y - z.y) < 40)) {
        p.hp = Math.max(0, p.hp - DAMAGE)
        game.dmgCooldown = DAMAGE_COOLDOWN
        setHp(p.hp)
        if (p.hp === 0) {
          game.gameOver = true
          setGameOver(true)
        }
      }

      // Golpe del jugador
      if (game.state === 'attack' && game.attackTimer === ATTACK_FRAMES - 2) {
        const before = game.zombies.length
        game.zombies = game.zombies.filter((z) => {
          const hit = Math.hypot(p.x + p.facing * 30 - z.x, p.y - z.y) < ATTACK_RANGE
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

    const draw = () => {
      const p = game.player
      const bgImg = game.images[BG_PATH]
      if (bgImg) {
        ctx.drawImage(bgImg, 0, 0, CANVAS_W, CANVAS_H)
      } else {
        ctx.fillStyle = '#1a0533'
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)
      }

      ctx.font = `${ZOMBIE_SIZE}px serif`
      ctx.textAlign = 'center'
      game.zombies.forEach((z) => ctx.fillText('🧟', z.x, z.y + ZOMBIE_SIZE / 3))

      const frames = SPRITES[game.state]
      const img = game.images[frames[game.frame % frames.length]]
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.scale(p.facing, 1)
      if (img) {
        ctx.drawImage(img, -PLAYER_SIZE / 2, -PLAYER_SIZE / 2, PLAYER_SIZE, PLAYER_SIZE)
      } else {
        ctx.fillStyle = '#ff4444'
        ctx.fillRect(-PLAYER_SIZE / 4, -PLAYER_SIZE / 2, PLAYER_SIZE / 2, PLAYER_SIZE)
      }
      ctx.restore()

      // Barra de HP
      const barW = 200
      const barH = 16
      const barX = CANVAS_W - barW - 10
      const barY = 10
      const hpRatio = p.hp / MAX_HP
      ctx.fillStyle = '#333'
      ctx.fillRect(barX, barY, barW, barH)
      ctx.fillStyle = hpRatio > 0.5 ? '#4f4' : hpRatio > 0.25 ? '#ff4' : '#f44'
      ctx.fillRect(barX, barY, barW * hpRatio, barH)
      ctx.strokeStyle = '#fff'
      ctx.strokeRect(barX, barY, barW, barH)
      ctx.fillStyle = '#fff'
      ctx.font = '12px Courier New'
      ctx.fillText(`❤️ ${p.hp}/${MAX_HP}`, barX + barW / 2, barY + 13)

      // HUD
      ctx.font = '16px Courier New'
      ctx.textAlign = 'left'
      ctx.fillText(`⚔️ Kills: ${game.kills}`, 10, 25)
      ctx.fillText(`🏆 Score: ${game.score}`, 10, 45)

      // Flash de daño
      if (game.dmgCooldown > DAMAGE_COOLDOWN - 5) {
        ctx.fillStyle = 'rgba(255, 0, 0, 0.2)'
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)
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
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', onBlur)
      canvas.removeEventListener('click', startAttack)
    }
  }, [])

  const restart = () => {
    const game = gameRef.current
    game.player = initialPlayer()
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
    setHp(MAX_HP)
    setGameOver(false)
  }

  return (
    <div className="screen stage">
      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        style={{ border: '2px solid #333', borderRadius: '8px', cursor: 'crosshair', maxWidth: '100%' }}
      />
      {loadError && <p style={{ color: '#ff4' }}>⚠️ {loadError}</p>}
      {gameOver && (
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ color: '#f44' }}>💀 GAME OVER</h2>
          <p>Kills: {kills} | Score: {score}</p>
          <button onClick={restart}>🔄 Reiniciar</button>
        </div>
      )}
      <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
        <span>⚔️ Kills: {kills}</span>
        <span>🏆 Score: {score}</span>
        <span>❤️ HP: {hp}/{MAX_HP}</span>
      </div>
      {drops.length > 0 && (
        <div style={{ marginTop: '8px', fontSize: '14px' }}>
          Drops: {drops.slice(-5).join(' | ')}
        </div>
      )}
      <p style={{ fontSize: '12px', color: '#888', marginTop: '8px' }}>
        WASD/Flechas = mover | Click/Space = atacar
      </p>
      <button onClick={onBack}>← Volver al Menú</button>
    </div>
  )
}
