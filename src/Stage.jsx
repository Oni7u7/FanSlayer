/*import { useEffect, useRef, useState } from 'react'

const CANVAS_W = 800
const CANVAS_H = 500
const PLAYER_SIZE = 80
const ZOMBIE_SIZE = 60
const SPAWN_INTERVAL = 2000
const ZOMBIE_SPEED = 1.5

const SPRITES = {
  idle: ['/sprites/badbany/img1.jpeg', '/sprites/badbany/img4.png'],
  walk: ['/sprites/badbany/img2.png', '/sprites/badbany/img3.png', '/sprites/badbany/img5.png'],
  attack: ['/sprites/badbany/img6.png', '/sprites/badbany/img7.png'],
}

export default function Stage({ onBack }) {
  const canvasRef = useRef(null)
  const gameRef = useRef({
    player: { x: CANVAS_W / 2, y: CANVAS_H / 2, facing: 1 },
    zombies: [],
    keys: {},
    kills: 0,
    score: 0,
    drops: [],
    state: 'idle',
    frame: 0,
    attackTimer: 0,
    lastSpawn: 0,
    images: {},
    loaded: false,
  })
  const [kills, setKills] = useState(0)
  const [score, setScore] = useState(0)
  const [drops, setDrops] = useState([])

  useEffect(() => {
    const game = gameRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    // Load all sprites
    let loadCount = 0
    const allPaths = [...SPRITES.idle, ...SPRITES.walk, ...SPRITES.attack]
    allPaths.forEach((path) => {
      const img = new Image()
      img.onload = () => {
        loadCount++
        if (loadCount === allPaths.length) game.loaded = true
      }
      img.src = path
      game.images[path] = img
    })

    // Input
    const onKeyDown = (e) => {
      game.keys[e.key] = true
      if (e.key === ' ' || e.key === 'Space') {
        e.preventDefault()
        game.state = 'attack'
        game.attackTimer = 20
        game.frame = 0
      }
    }
    const onKeyUp = (e) => { game.keys[e.key] = false }
    const onClick = () => {
      game.state = 'attack'
      game.attackTimer = 20
      game.frame = 0
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    canvas.addEventListener('click', onClick)

    let animId
    let tick = 0

    const loop = () => {
      animId = requestAnimationFrame(loop)
      if (!game.loaded) return
      tick++
      const p = game.player
      let moving = false

      // Movement
      const speed = 3
      if (game.keys['ArrowLeft'] || game.keys['a']) { p.x -= speed; p.facing = -1; moving = true }
      if (game.keys['ArrowRight'] || game.keys['d']) { p.x += speed; p.facing = 1; moving = true }
      if (game.keys['ArrowUp'] || game.keys['w']) { p.y -= speed; moving = true }
      if (game.keys['ArrowDown'] || game.keys['s']) { p.y += speed; moving = true }

      // Clamp
      p.x = Math.max(PLAYER_SIZE / 2, Math.min(CANVAS_W - PLAYER_SIZE / 2, p.x))
      p.y = Math.max(PLAYER_SIZE / 2, Math.min(CANVAS_H - PLAYER_SIZE / 2, p.y))
            // State
            if (game.attackTimer > 0) {
                game.attackTimer--
                game.state = 'attack'
              } else if (moving) {
                game.state = 'walk'
              } else {
                game.state = 'idle'
              }
        
              // Animate frame
              if (tick % 10 === 0) {
                const frames = SPRITES[game.state]
                game.frame = (game.frame + 1) % frames.length
              }
                    // Spawn zombies
      const now = Date.now()
      if (now - game.lastSpawn > SPAWN_INTERVAL) {
        game.lastSpawn = now
        const side = Math.random() > 0.5 ? 0 : CANVAS_W
        game.zombies.push({
          x: side,
          y: Math.random() * (CANVAS_H - 60) + 30,
          hp: 1,
        })
      }

      // Move zombies toward player
      game.zombies.forEach((z) => {
        const dx = p.x - z.x
        const dy = p.y - z.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist > 5) {
          z.x += (dx / dist) * ZOMBIE_SPEED
          z.y += (dy / dist) * ZOMBIE_SPEED
        }
      })

      // Attack hit detection
      if (game.state === 'attack' && game.attackTimer === 18) {
        const attackRange = 70
        game.zombies = game.zombies.filter((z) => {
          const dx = p.x + p.facing * 30 - z.x
          const dy = p.y - z.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < attackRange) {
            game.kills++
            game.score += 100
            setKills(game.kills)
            setScore(game.score)

            // Random drop
            if (Math.random() < 0.3) {
              const dropNames = ['🎸 Guitarra', '🎤 Micro', '🎵 Disco', '👟 Sneaker', '🕶️ Shades']
              const drop = dropNames[Math.floor(Math.random() * dropNames.length)]
              game.drops.push(drop)
              setDrops([...game.drops])
            }
            return false
        }
        return true
      })
    }

    // DRAW
    ctx.fillStyle = '#1a0a2e'
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)

    // Stage floor
    ctx.fillStyle = '#2a1a3e'
    ctx.fillRect(0, CANVAS_H * 0.7, CANVAS_W, CANVAS_H * 0.3)

    // Stage lights
    for (let i = 0; i < 5; i++) {
        const lx = 80 + i * 170
        ctx.fillStyle = `hsla(${(tick + i * 60) % 360}, 80%, 60%, 0.3)`
        ctx.beginPath()
        ctx.arc(lx, 20, 15, 0, Math.PI * 2)
        ctx.fill()
      }

      // Draw zombies
      game.zombies.forEach((z) => {
        ctx.fillStyle = '#4a5'
        ctx.font = `${ZOMBIE_SIZE}px serif`
        ctx.textAlign = 'center'
        ctx.fillText('🧟', z.x, z.y + ZOMBIE_SIZE / 3)
      })
            // Draw player
            const spritePaths = SPRITES[game.state]
            const spritePath = spritePaths[game.frame % spritePaths.length]
            const img = game.images[spritePath]
            if (img) {
              ctx.save()
              ctx.translate(p.x, p.y)
              ctx.scale(p.facing, 1)
              ctx.drawImage(img, -PLAYER_SIZE / 2, -PLAYER_SIZE / 2, PLAYER_SIZE, PLAYER_SIZE)
              ctx.restore()
            }
      
            // HUD
            ctx.fillStyle = '#fff'
            ctx.font = '16px Courier New'
            ctx.textAlign = 'left'
            ctx.fillText(`⚔️ Kills: ${game.kills}`, 10, 25)
            ctx.fillText(`🏆 Score: ${game.score}`, 10, 45)
          }
      
          loop()
      
          return () => {
            cancelAnimationFrame(animId)
            window.removeEventListener('keydown', onKeyDown)
            window.removeEventListener('keyup', onKeyUp)
            canvas.removeEventListener('click', onClick)
          }
        }, [])
        return (
            <div className="screen stage">
              <canvas
                ref={canvasRef}
                width={CANVAS_W}
                height={CANVAS_H}
                style={{ border: '2px solid #333', borderRadius: '8px', cursor: 'crosshair' }}
              />
              <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
                <span>⚔️ Kills: {kills}</span>
                <span>🏆 Score: {score}</span>
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
*/
//GOD
import { useEffect, useRef, useState } from 'react'

const CANVAS_W = 800
const CANVAS_H = 500
const PLAYER_SIZE = 80
const ZOMBIE_SIZE = 60
const SPAWN_INTERVAL = 2000
const ZOMBIE_SPEED = 1.5
const MAX_HP = 100

const SPRITES = {
  idle: ['/sprites/badbany/img1.jpeg'],
  walk: ['/sprites/badbany/img2.png', '/sprites/badbany/img3.png', '/sprites/badbany/img5.png'],
  attack: ['/sprites/badbany/img6.png', '/sprites/badbany/img7.png'],
}

export default function Stage({ onBack }) {
  const canvasRef = useRef(null)
  const gameRef = useRef({
    player: { x: CANVAS_W / 2, y: CANVAS_H / 2, facing: 1, hp: MAX_HP },
    zombies: [],
    keys: {},
    kills: 0,
    score: 0,
    drops: [],
    state: 'idle',
    frame: 0,
    attackTimer: 0,
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

  useEffect(() => {
    const game = gameRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    const allPaths = [...SPRITES.idle, ...SPRITES.walk, ...SPRITES.attack, '/sprites/bg.jpg']
    let loadCount = 0
    allPaths.forEach((path) => {
      const img = new Image()
      img.onload = () => {
        loadCount++
        if (loadCount === allPaths.length) game.loaded = true
      }
      img.src = path
      game.images[path] = img
    })
    const onKeyDown = (e) => {
      game.keys[e.key] = true
      if (e.key === ' ') {
        e.preventDefault()
        game.state = 'attack'
        game.attackTimer = 20
        game.frame = 0
      }
    }
    const onKeyUp = (e) => { game.keys[e.key] = false }
    const onClick = () => {
      game.state = 'attack'
      game.attackTimer = 20
      game.frame = 0
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    canvas.addEventListener('click', onClick)

    let animId
    let tick = 0
    let dmgCooldown = 0

    const loop = () => {
      animId = requestAnimationFrame(loop)
      if (!game.loaded || game.gameOver) return
      tick++

      const p = game.player
      let moving = false
      const speed = 3

      if (game.keys['ArrowLeft'] || game.keys['a']) { p.x -= speed; p.facing = -1; moving = true }
      if (game.keys['ArrowRight'] || game.keys['d']) { p.x += speed; p.facing = 1; moving = true }
      if (game.keys['ArrowUp'] || game.keys['w']) { p.y -= speed; moving = true }
      if (game.keys['ArrowDown'] || game.keys['s']) { p.y += speed; moving = true }

      p.x = Math.max(PLAYER_SIZE / 2, Math.min(CANVAS_W - PLAYER_SIZE / 2, p.x))
      p.y = Math.max(PLAYER_SIZE / 2, Math.min(CANVAS_H - PLAYER_SIZE / 2, p.y))

      if (game.attackTimer > 0) {
        game.attackTimer--
        game.state = 'attack'
      } else if (moving) {
        game.state = 'walk'
      } else {
        game.state = 'idle'
      }

      // Animate only when walking or attacking
      if (game.state !== 'idle' && tick % 10 === 0) {
        const frames = SPRITES[game.state]
        game.frame = (game.frame + 1) % frames.length
      }
      if (game.state === 'idle') game.frame = 0

      // Spawn zombies
      const now = Date.now()
      if (now - game.lastSpawn > SPAWN_INTERVAL) {
        game.lastSpawn = now
        const side = Math.random() > 0.5 ? 0 : CANVAS_W
        game.zombies.push({
          x: side,
          y: Math.random() * (CANVAS_H - 60) + 30,
          hp: 1,
        })
      }

      // Move zombies
      game.zombies.forEach((z) => {
        const dx = p.x - z.x
        const dy = p.y - z.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist > 5) {
          z.x += (dx / dist) * ZOMBIE_SPEED
          z.y += (dy / dist) * ZOMBIE_SPEED
        }
      })

      // Zombie damage to player
      if (dmgCooldown > 0) dmgCooldown--
      if (dmgCooldown === 0) {
        game.zombies.forEach((z) => {
          const dx = p.x - z.x
          const dy = p.y - z.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 40) {
            p.hp -= 10
            dmgCooldown = 30
            setHp(p.hp)
            if (p.hp <= 0) {
              game.gameOver = true
              setGameOver(true)
            }
          }
        })
      }

      // Attack hit
      if (game.state === 'attack' && game.attackTimer === 18) {
        const attackRange = 70
        game.zombies = game.zombies.filter((z) => {
          const dx = p.x + p.facing * 30 - z.x
          const dy = p.y - z.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < attackRange) {
            game.kills++
            game.score += 100
            setKills(game.kills)
            setScore(game.score)
            if (Math.random() < 0.3) {
              const dropNames = ['🎸 Guitarra', '🎤 Micro', '🎵 Disco', '👟 Sneaker', '🕶️ Shades']
              const drop = dropNames[Math.floor(Math.random() * dropNames.length)]
              game.drops.push(drop)
              setDrops([...game.drops])
            }
            return false
          }
          return true
        })
      }

      const bgImg = game.images['/sprites/bg.jpg']
if (bgImg && bgImg.complete) {
ctx.drawImage(bgImg, 0, 0, CANVAS_W, CANVAS_H)
} else {
ctx.fillStyle = '#1a0533'
ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)
}

      // Zombies
      game.zombies.forEach((z) => {
        ctx.font = `${ZOMBIE_SIZE}px serif`
        ctx.textAlign = 'center'
        ctx.fillText('🧟', z.x, z.y + ZOMBIE_SIZE / 3)
      })

      // Player
      const spritePaths = SPRITES[game.state]
      const spritePath = spritePaths[game.frame % spritePaths.length]
      const img = game.images[spritePath]
      if (img) {
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.scale(p.facing, 1)
        ctx.drawImage(img, -PLAYER_SIZE / 2, -PLAYER_SIZE / 2, PLAYER_SIZE, PLAYER_SIZE)
        ctx.restore()
      }

      // HP Bar
      const barW = 200
      const barH = 16
      const barX = CANVAS_W - barW - 10
      const barY = 10
      ctx.fillStyle = '#333'
      ctx.fillRect(barX, barY, barW, barH)
      const hpRatio = Math.max(0, p.hp / MAX_HP)
      ctx.fillStyle = hpRatio > 0.5 ? '#4f4' : hpRatio > 0.25 ? '#ff4' : '#f44'
      ctx.fillRect(barX, barY, barW * hpRatio, barH)
      ctx.strokeStyle = '#fff'
      ctx.strokeRect(barX, barY, barW, barH)
      ctx.fillStyle = '#fff'
      ctx.font = '12px Courier New'
      ctx.textAlign = 'center'
      ctx.fillText(`❤️ ${p.hp}/${MAX_HP}`, barX + barW / 2, barY + 13)

      // HUD
      ctx.fillStyle = '#fff'
      ctx.font = '16px Courier New'
      ctx.textAlign = 'left'
      ctx.fillText(`⚔️ Kills: ${game.kills}`, 10, 25)
      ctx.fillText(`🏆 Score: ${game.score}`, 10, 45)
            // Damage flash
            if (dmgCooldown > 25) {
              ctx.fillStyle = 'rgba(255, 0, 0, 0.2)'
              ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)
            }
          }
      
          loop()
      
          return () => {
            cancelAnimationFrame(animId)
            window.removeEventListener('keydown', onKeyDown)
            window.removeEventListener('keyup', onKeyUp)
            canvas.removeEventListener('click', onClick)
          }
        }, [])
      
        const restart = () => {
          const game = gameRef.current
          game.player = { x: CANVAS_W / 2, y: CANVAS_H / 2, facing: 1, hp: MAX_HP }
          game.zombies = []
          game.kills = 0
          game.score = 0
          game.drops = []
          game.state = 'idle'
          game.frame = 0
          game.attackTimer = 0
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
              style={{ border: '2px solid #333', borderRadius: '8px', cursor: 'crosshair' }}
            />
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


