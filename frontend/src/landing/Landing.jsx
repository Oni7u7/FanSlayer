import { useEffect, useRef } from 'react'
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react'
import { ArrowRight, ArrowSquareOut, GithubLogo, Lightning, Skull, Sparkle, Wallet } from '@phosphor-icons/react'
import { ARTISTS, CONTRACT_ADDRESS, monadTestnet } from '../config'
import { Address, Button } from '../ui'
import SpriteLoop from './SpriteLoop'
import useSmoothScroll from './useSmoothScroll'
import './landing.css'

const ITEMS = [
  { id: 'cadena', name: 'Cadena' },
  { id: 'guante', name: 'Guante' },
  { id: 'lentes', name: 'Lentes' },
  { id: 'sombrero', name: 'Sombrero' },
]
const EXPLORER = `${monadTestnet.blockExplorers.default.url}/address/${CONTRACT_ADDRESS}`
const REPO = 'https://github.com/Oni7u7/fanslayer'
const TICKER = ['Combos hasta x5', 'Zombis brutos', 'Drops de merch', 'NFTs en Monad Testnet', 'Un artista por wallet']

const ease = [0.16, 1, 0.3, 1]
const heroParent = { hidden: {}, show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } } }
const heroChild = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease } } }
const inView = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-80px' } }

function PlayButton({ onPlay, ready, size = 'md' }) {
  return (
    <Button size={size} onClick={onPlay} loading={!ready} icon={<Wallet size={18} weight="bold" />}>
      {ready ? 'Jugar ahora' : 'Cargando'}
    </Button>
  )
}

/** Pantalla del juego flotando: inclinación 3D con el puntero y deriva continua sutil. */
function HeroScreen({ heroProgress }) {
  const reduce = useReducedMotion()
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-9, 9]), { stiffness: 120, damping: 18 })
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [7, -7]), { stiffness: 120, damping: 18 })
  const y = useTransform(heroProgress, [0, 1], [0, reduce ? 0 : -80])
  const scale = useTransform(heroProgress, [0, 1], [1, reduce ? 1 : 0.92])

  const onMove = (e) => {
    if (reduce) return
    const r = e.currentTarget.getBoundingClientRect()
    mx.set((e.clientX - r.left) / r.width - 0.5)
    my.set((e.clientY - r.top) / r.height - 0.5)
  }
  const onLeave = () => {
    mx.set(0)
    my.set(0)
  }

  return (
    <motion.div className="hero-screen-wrap" style={{ y, scale }} onPointerMove={onMove} onPointerLeave={onLeave}>
      <motion.figure
        className="hero-screen"
        style={{ rotateX, rotateY }}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease, delay: 0.25 }}
      >
        <motion.div
          className="hero-screen-float"
          animate={reduce ? undefined : { y: [0, -10, 0] }}
          transition={{ duration: 6, ease: 'easeInOut', repeat: Infinity }}
        >
          <img
            src="/landing/gameplay.jpg"
            width="800"
            height="600"
            alt="Partida de FanSlayer: Bad Bany en el escenario del bosque rodeado de zombis, con vida, kills, score e inventario."
            fetchPriority="high"
          />
          <span className="hero-screen-glare" aria-hidden="true" />
        </motion.div>
      </motion.figure>
      <span className="hero-screen-shadow" aria-hidden="true" />
    </motion.div>
  )
}

function MechanicCards() {
  return (
    <>
      <article className="mech mech-combo">
        <div className="mech-visual combo-visual" aria-hidden="true">
          <span className="combo-num">12</span>
          <span className="combo-label">COMBO</span>
          <span className="combo-mult">x3</span>
        </div>
        <h3 className="t-title">Combos que multiplican</h3>
        <p className="t-body">Encadena kills en menos de dos segundos y tu puntaje sube hasta x5. Un golpe y se rompe.</p>
      </article>

      <article className="mech mech-brute">
        <div className="mech-visual brute-crop" role="img" aria-label="Un zombi bruto con su barra de vida" />
        <h3 className="t-title">Zombis brutos</h3>
        <p className="t-body">Más grandes, aguantan cuatro golpes y pegan el doble. Cada uno vale 400 puntos.</p>
      </article>

      <article className="mech mech-drops">
        <div className="mech-visual slots">
          {ITEMS.map((it) => (
            <span key={it.id} className="slot" title={it.name}>
              <img src={`/sprites/items/item_${it.id}.png`} alt={it.name} loading="lazy" />
            </span>
          ))}
        </div>
        <h3 className="t-title">Drops de merch</h3>
        <p className="t-body">Cadena, guante, lentes y sombrero caen de los zombis. Los brutos sueltan más.</p>
      </article>

      <article className="mech mech-chain">
        <div className="mech-visual chain-visual" aria-hidden="true">
          <Sparkle size={40} weight="fill" />
        </div>
        <h3 className="t-title">Tu personaje vive en la cadena</h3>
        <p className="t-body">Los artistas son NFTs en Monad Testnet. Cambias de navegador y tu colección sigue ahí.</p>
        <a className="text-link" href={EXPLORER} target="_blank" rel="noreferrer">
          Ver contrato <Address value={CONTRACT_ADDRESS} />
          <ArrowSquareOut size={16} weight="bold" aria-hidden="true" />
        </a>
      </article>
    </>
  )
}

/** Paneo horizontal guiado por el scroll vertical; en celular o con reduced motion es una lista normal. */
function MechanicsPan() {
  const reduce = useReducedMotion()
  const ref = useRef(null)
  const trackRef = useRef(null)
  const shift = useMotionValue(0)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const x = useTransform([scrollYProgress, shift], ([p, s]) => -p * s)
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24 })

  // Desplazamiento exacto: ancho del carril menos el ancho visible
  useEffect(() => {
    const measure = () => {
      const el = trackRef.current
      if (el) shift.set(Math.max(0, el.scrollWidth - window.innerWidth))
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [shift])

  return (
    <section ref={ref} className={`mech-pan${reduce ? ' is-static' : ''}`} aria-labelledby="mech-title">
      <div className="mech-sticky">
        <div className="mech-head">
          <h2 id="mech-title" className="t-display section-title">Lo que vas a encontrar</h2>
          <div className="mech-progress" aria-hidden="true">
            <motion.span style={{ scaleX: progress }} />
          </div>
        </div>
        <motion.div ref={trackRef} className="mech-track" style={reduce ? undefined : { x }}>
          <MechanicCards />
        </motion.div>
      </div>
    </section>
  )
}

/** Pasos con una línea que se dibuja al ritmo del scroll. */
function Steps() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 75%', 'end 60%'] })
  const line = useSpring(scrollYProgress, { stiffness: 90, damping: 22 })

  const steps = [
    {
      verb: 'Compra',
      icon: <Wallet size={22} weight="bold" />,
      text: 'Mintea a tu artista por 0.01 MON de testnet. Cada wallet puede tener uno de cada artista.',
    },
    {
      verb: 'Elige',
      icon: <Sparkle size={22} weight="bold" />,
      text: 'Al iniciar sesión el juego lee tus NFTs directo de la cadena. Escoge con quién sales al escenario.',
    },
    {
      verb: 'Defiende',
      icon: <Skull size={22} weight="bold" />,
      text: 'Muévete, ataca y encadena combos antes de que los zombis te rodeen.',
      keys: true,
    },
  ]

  return (
    <section id="juego" ref={ref} className="section steps" aria-labelledby="juego-title">
      <motion.h2 id="juego-title" className="t-display section-title" {...inView} transition={{ duration: 0.5, ease }}>
        Tres pasos y estás tocando
      </motion.h2>
      <div className="steps-body">
        <div className="steps-rail" aria-hidden="true">
          <motion.span style={{ scaleY: line }} />
        </div>
        <ol className="steps-list">
          {steps.map((s, i) => (
            <motion.li key={s.verb} {...inView} transition={{ duration: 0.5, ease, delay: i * 0.05 }}>
              <span className="step-dot" aria-hidden="true">{s.icon}</span>
              <div>
                <h3 className="step-verb">{s.verb}</h3>
                <p className="t-lead">{s.text}</p>
                {s.keys && (
                  <p className="keys" aria-label="Controles: W, A, S, D para mover; Espacio para atacar">
                    <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd>
                    <span>mover</span>
                    <kbd className="wide">Espacio</kbd>
                    <span>atacar</span>
                  </p>
                )}
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  )
}

export default function Landing({ onPlay, ready }) {
  useSmoothScroll()
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 26 })

  const heroRef = useRef(null)
  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroCopyY = useTransform(heroProgress, [0, 1], [0, reduce ? 0 : 60])
  const heroCopyOpacity = useTransform(heroProgress, [0, 0.8], [1, reduce ? 1 : 0])

  return (
    <div className="lp">
      <a className="skip-link" href="#contenido">Saltar al contenido</a>
      <motion.div className="scroll-progress" style={{ scaleX: progress }} aria-hidden="true" />

      <header className="nav">
        <a href="#top" className="logo" aria-label="FanSlayer, inicio">
          FAN<span>SLAYER</span>
        </a>
        <nav aria-label="Secciones" className="nav-links">
          <a href="#juego">Cómo se juega</a>
          <a href="#artistas">Artistas</a>
        </nav>
        <PlayButton onPlay={onPlay} ready={ready} size="sm" />
      </header>

      <main id="contenido">
        <section id="top" ref={heroRef} className="hero">
          <motion.div className="hero-copy" style={{ y: heroCopyY, opacity: heroCopyOpacity }}>
            <motion.div variants={heroParent} initial="hidden" animate="show">
              <motion.p className="chip" variants={heroChild}>
                <Lightning size={14} weight="fill" aria-hidden="true" /> Juego web en Monad Testnet
              </motion.p>
              <motion.h1 className="t-display hero-title" variants={heroChild}>
                Defiende el <span className="hl">escenario</span>.
              </motion.h1>
              <motion.p className="t-lead hero-sub" variants={heroChild}>
                Compra a tu artista como NFT y aguanta oleadas de zombis. Tu personaje queda guardado en tu wallet.
              </motion.p>
              <motion.div className="hero-ctas" variants={heroChild}>
                <PlayButton onPlay={onPlay} ready={ready} />
                <Button variant="secondary" href="#artistas" icon={<ArrowRight size={18} weight="bold" />}>
                  Ver artistas
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>

          <HeroScreen heroProgress={heroProgress} />
        </section>

        <div className="ticker" role="note" aria-label={TICKER.join(', ')}>
          <div className={`ticker-track${reduce ? '' : ' is-moving'}`} aria-hidden="true">
            {[0, 1].map((k) => (
              <span key={k} className="ticker-row">
                {TICKER.map((t) => (
                  <span key={t} className="ticker-item">
                    <span className="ticker-dot" />
                    {t}
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>

        <Steps />

        <section id="artistas" className="section artists" aria-labelledby="artistas-title">
          <motion.h2 id="artistas-title" className="t-display section-title" {...inView} transition={{ duration: 0.5, ease }}>
            Elige quién sube al escenario
          </motion.h2>
          <div className="artist-row">
            {ARTISTS.map((artist, i) => (
              <motion.article
                key={artist.id}
                className={`artist artist-${i}`}
                {...inView}
                transition={{ duration: 0.6, ease, delay: i * 0.08 }}
              >
                <motion.div
                  className="artist-stage"
                  whileHover={reduce ? undefined : { y: -6 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                >
                  <span className="spotlight" aria-hidden="true" />
                  <SpriteLoop
                    frames={[...artist.sprites.walk, ...artist.sprites.attack]}
                    alt={`${artist.name} en pixel art`}
                    className="artist-sprite"
                  />
                  <span className="artist-floor" aria-hidden="true" />
                </motion.div>
                <div className="artist-info">
                  <h3 className="t-title">{artist.name}</h3>
                  <p className="artist-price">
                    <span className="t-mono">0.01</span> MON <span className="tag">testnet</span>
                  </p>
                  <p className="t-body">Uno por wallet. Lo eliges en tu menú antes de cada partida.</p>
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        <MechanicsPan />

        <section className="final" aria-labelledby="final-title">
          <motion.div className="final-inner" {...inView} transition={{ duration: 0.6, ease }}>
            <h2 id="final-title" className="t-display">El escenario te espera.</h2>
            <p className="t-lead">Conecta tu wallet, elige artista y aguanta lo más que puedas.</p>
            <PlayButton onPlay={onPlay} ready={ready} />
          </motion.div>
        </section>
      </main>

      <footer className="footer">
        <span className="logo logo-small">FAN<span>SLAYER</span></span>
        <span className="t-body">Hecho para Monad Testnet. Usa MON de prueba, sin valor real.</span>
        <a className="text-link" href={REPO} target="_blank" rel="noreferrer">
          <GithubLogo size={18} weight="bold" aria-hidden="true" /> Código
        </a>
      </footer>
    </div>
  )
}
