import { motion, useReducedMotion, useScroll, useSpring } from 'motion/react'
import { ArrowDown, GithubLogo, Skull, Storefront, UsersThree, Wallet } from '@phosphor-icons/react'
import { ARTISTS, CONTRACT_ADDRESS, monadTestnet } from '../config'
import { Address, Button } from '../ui'
import SpriteLoop from './SpriteLoop'
import useSmoothScroll from './useSmoothScroll'
import './landing.css'

const EXPLORER = `${monadTestnet.blockExplorers.default.url}/address/${CONTRACT_ADDRESS}`
const REPO = 'https://github.com/Oni7u7/fanslayer'
const ease = [0.16, 1, 0.3, 1]

const heroParent = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }
const heroChild = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.3, ease } } }
const listParent = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } }
const listChild = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.3, ease } } }
const reveal = { initial: 'hidden', whileInView: 'show', viewport: { once: true, margin: '-60px' } }

const STEPS = [
  { icon: Storefront, verb: 'Compra', text: 'Un artista por 0.01 MON.' },
  { icon: UsersThree, verb: 'Elige', text: 'Tu colección vive en la cadena.' },
  { icon: Skull, verb: 'Defiende', text: 'Aguanta las oleadas de zombis.' },
]

function PlayButton({ onPlay, ready, size = 'md' }) {
  return (
    <Button size={size} onClick={onPlay} loading={!ready} icon={<Wallet size={18} weight="bold" />}>
      {ready ? 'Jugar ahora' : 'Cargando'}
    </Button>
  )
}

export default function Landing({ onPlay, ready }) {
  useSmoothScroll()
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 26 })
  const hero = ARTISTS[0]

  return (
    <div className="lp">
      <a className="skip-link" href="#contenido">Saltar al contenido</a>
      <motion.div className="scroll-progress" style={{ scaleX: progress }} aria-hidden="true" />

      <header className="nav">
        <a href="#top" className="logo" aria-label="FanSlayer, inicio">FAN<span>SLAYER</span></a>
        <PlayButton onPlay={onPlay} ready={ready} size="sm" />
      </header>

      <main id="contenido">
        <section id="top" className="hero">
          <motion.div className="hero-copy" variants={heroParent} initial="hidden" animate="show">
            <motion.p className="t-eyebrow" variants={heroChild}>Juego web · Monad Testnet</motion.p>
            <motion.h1 className="t-display hero-title" variants={heroChild}>
              Defiende el <span className="hl">escenario</span>
            </motion.h1>

            <motion.div className="hero-char" variants={heroChild} aria-hidden="true">
              <motion.div
                className="hero-char-sprite"
                animate={reduce ? undefined : { y: [0, -8, 0] }}
                transition={{ duration: 1.6, ease: 'easeInOut', repeat: Infinity, repeatType: 'loop' }}
              >
                <SpriteLoop frames={hero.sprites.idle.concat(hero.sprites.walk)} alt="" interval={260} />
              </motion.div>
              <span className="hero-platform" />
            </motion.div>

            <motion.p className="t-lead hero-sub" variants={heroChild}>
              Compra a tu artista como NFT y aguanta oleadas de zombis.
            </motion.p>
            <motion.div className="hero-ctas" variants={heroChild}>
              <PlayButton onPlay={onPlay} ready={ready} />
              <Button variant="secondary" href="#juego" icon={<ArrowDown size={18} weight="bold" />}>
                Cómo se juega
              </Button>
            </motion.div>
            <motion.p className={`press-start${reduce ? '' : ' is-blinking'}`} variants={heroChild} aria-hidden="true">
              PRESS START
            </motion.p>
          </motion.div>
        </section>

        <section id="juego" className="section" aria-labelledby="juego-title">
          <h2 id="juego-title" className="t-title section-title">Cómo se juega</h2>
          <motion.ol className="steps" variants={listParent} {...reveal}>
            {STEPS.map((s, i) => {
              const Icon = s.icon
              return (
                <motion.li key={s.verb} className="step" variants={listChild}>
                  <span className="step-num" aria-hidden="true">{i + 1}</span>
                  <Icon size={28} weight="bold" aria-hidden="true" className="step-icon" />
                  <h3 className="step-verb">{s.verb}</h3>
                  <p className="t-body">{s.text}</p>
                </motion.li>
              )
            })}
          </motion.ol>
        </section>

        <section id="artistas" className="section" aria-labelledby="artistas-title">
          <h2 id="artistas-title" className="t-title section-title">Artistas</h2>
          <motion.ul className="artists" variants={listParent} {...reveal}>
            {ARTISTS.map((artist) => (
              <motion.li
                key={artist.id}
                className="artist"
                variants={listChild}
                whileHover={reduce ? undefined : { y: -4 }}
                transition={{ type: 'spring', stiffness: 400, damping: 24 }}
              >
                <SpriteLoop
                  frames={[...artist.sprites.walk, ...artist.sprites.attack]}
                  alt={`${artist.name} en pixel art`}
                  className="artist-sprite"
                />
                <div className="artist-info">
                  <h3 className="artist-name">{artist.name}</h3>
                  <p className="price t-mono">0.01 MON <span className="price-net">testnet</span></p>
                  <p className="t-body">Uno por wallet</p>
                </div>
              </motion.li>
            ))}
          </motion.ul>
        </section>

        <section className="section final" aria-labelledby="final-title">
          <h2 id="final-title" className="t-title">¿Listo para salir al escenario?</h2>
          <PlayButton onPlay={onPlay} ready={ready} />
        </section>
      </main>

      <footer className="footer">
        <p className="t-body">
          MON de prueba, sin valor real. Contrato{' '}
          <a className="text-link" href={EXPLORER} target="_blank" rel="noreferrer">
            <Address value={CONTRACT_ADDRESS} />
          </a>
        </p>
        <a className="text-link" href={REPO} target="_blank" rel="noreferrer">
          <GithubLogo size={18} weight="bold" aria-hidden="true" /> Código
        </a>
      </footer>
    </div>
  )
}
