import { ArrowRight, ArrowSquareOut, GithubLogo, Wallet } from '@phosphor-icons/react'
import { ARTISTS, CONTRACT_ADDRESS, monadTestnet } from '../config'
import SpriteLoop from './SpriteLoop'
import { useReveal } from './useReveal'
import './landing.css'

const ITEMS = [
  { id: 'cadena', name: 'Cadena' },
  { id: 'guante', name: 'Guante' },
  { id: 'lentes', name: 'Lentes' },
  { id: 'sombrero', name: 'Sombrero' },
]

const EXPLORER = `${monadTestnet.blockExplorers.default.url}/address/${CONTRACT_ADDRESS}`
const REPO = 'https://github.com/Oni7u7/fanslayer'
const short = (addr) => `${addr.slice(0, 6)}...${addr.slice(-4)}`

function Reveal({ as = 'div', className = '', delay = 0, children, ...rest }) {
  const Tag = as
  const [ref, visible] = useReveal()
  return (
    <Tag
      ref={ref}
      className={`reveal${visible ? ' is-visible' : ''} ${className}`}
      style={{ '--reveal-delay': `${delay}ms` }}
      {...rest}
    >
      {children}
    </Tag>
  )
}

function PlayButton({ onPlay, ready, className = '' }) {
  return (
    <button className={`lp-btn lp-btn-primary ${className}`} onClick={onPlay} disabled={!ready}>
      <Wallet size={18} weight="bold" aria-hidden="true" />
      {ready ? 'Jugar ahora' : 'Cargando...'}
    </button>
  )
}

export default function Landing({ onPlay, ready }) {
  return (
    <div className="lp">
      <header className="lp-nav">
        <a href="#top" className="lp-logo" aria-label="FanSlayer, inicio">
          FAN<span>SLAYER</span>
        </a>
        <nav aria-label="Secciones">
          <a href="#juego">Cómo se juega</a>
          <a href="#artistas">Artistas</a>
        </nav>
        <PlayButton onPlay={onPlay} ready={ready} className="lp-btn-small" />
      </header>

      <main id="top">
        {/* Hero */}
        <section className="lp-hero">
          <div className="lp-hero-copy">
            <p className="lp-eyebrow lp-enter" style={{ '--enter-delay': '0ms' }}>
              Juego web en Monad Testnet
            </p>
            <h1 className="lp-enter" style={{ '--enter-delay': '80ms' }}>
              Defiende el escenario.
            </h1>
            <p className="lp-hero-sub lp-enter" style={{ '--enter-delay': '160ms' }}>
              Compra a tu artista como NFT y aguanta oleadas de zombis. Tu personaje queda guardado en tu
              wallet.
            </p>
            <div className="lp-hero-ctas lp-enter" style={{ '--enter-delay': '240ms' }}>
              <PlayButton onPlay={onPlay} ready={ready} />
              <a className="lp-btn lp-btn-ghost" href="#artistas">
                Ver artistas
                <ArrowRight size={18} weight="bold" aria-hidden="true" />
              </a>
            </div>
          </div>

          <figure className="lp-hero-shot lp-enter" style={{ '--enter-delay': '200ms' }}>
            <img
              src="/landing/gameplay.jpg"
              width="800"
              height="600"
              alt="Partida de FanSlayer: Bad Bany en el escenario del bosque rodeado de zombis, con el HUD de vida, kills, score e inventario."
              fetchPriority="high"
            />
          </figure>
        </section>

        {/* Cómo se juega */}
        <section id="juego" className="lp-section lp-steps" aria-labelledby="juego-title">
          <Reveal as="h2" id="juego-title" className="lp-h2">
            Tres pasos y estás tocando
          </Reveal>
          <ol className="lp-steps-list">
            <Reveal as="li" delay={0}>
              <span className="lp-step-verb">Compra</span>
              <p>
                Mintea a tu artista por 0.01 MON. Cada wallet puede tener uno de cada artista, así que tu
                personaje es único en tu colección.
              </p>
            </Reveal>
            <Reveal as="li" delay={80}>
              <span className="lp-step-verb">Elige</span>
              <p>
                Inicia sesión y el juego lee tus NFTs directo de la cadena. Escoge con quién sales al escenario.
              </p>
            </Reveal>
            <Reveal as="li" delay={160}>
              <span className="lp-step-verb">Defiende</span>
              <div>
                <p>Muévete, ataca y no dejes que los zombis te rodeen.</p>
                <p className="lp-keys" aria-label="Controles">
                  <kbd>W</kbd>
                  <kbd>A</kbd>
                  <kbd>S</kbd>
                  <kbd>D</kbd>
                  <span>mover</span>
                  <kbd className="wide">Espacio</kbd>
                  <span>atacar</span>
                </p>
              </div>
            </Reveal>
          </ol>
        </section>

        {/* Artistas */}
        <section id="artistas" className="lp-section" aria-labelledby="artistas-title">
          <Reveal as="h2" id="artistas-title" className="lp-h2">
            Elige quién sube al escenario
          </Reveal>
          <div className="lp-artists">
            {ARTISTS.map((artist, i) => (
              <Reveal key={artist.id} as="article" className="lp-artist px-frame" delay={i * 100}>
                <SpriteLoop
                  frames={[...artist.sprites.walk, ...artist.sprites.attack]}
                  alt={`${artist.name} en pixel art`}
                  className="lp-artist-sprite"
                />
                <div className="lp-artist-info">
                  <h3>{artist.name}</h3>
                  <p className="lp-artist-price">0.01 MON</p>
                  <p className="lp-muted">Uno por wallet</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Mecánicas */}
        <section className="lp-section" aria-labelledby="features-title">
          <Reveal as="h2" id="features-title" className="lp-h2">
            Lo que vas a encontrar
          </Reveal>
          <div className="lp-bento">
            <Reveal className="lp-cell lp-cell-combo px-frame">
              <div className="lp-combo-visual" aria-hidden="true">
                <span className="lp-combo-num">12</span>
                <span className="lp-combo-label">COMBO</span>
                <span className="lp-combo-mult">x3</span>
              </div>
              <h3>Combos que multiplican</h3>
              <p>Encadena kills en menos de dos segundos y tu puntaje sube hasta x5. Un golpe y se rompe.</p>
            </Reveal>

            <Reveal className="lp-cell lp-cell-brute px-frame" delay={80}>
              <div className="lp-brute-crop" role="img" aria-label="Un zombi bruto con su barra de vida" />
              <h3>Zombis brutos</h3>
              <p>Más grandes, aguantan cuatro golpes y pegan el doble. Valen 400 puntos.</p>
            </Reveal>

            <Reveal className="lp-cell lp-cell-drops px-frame" delay={80}>
              <div className="lp-slots">
                {ITEMS.map((it) => (
                  <span key={it.id} className="lp-slot" title={it.name}>
                    <img src={`/sprites/items/item_${it.id}.png`} alt={it.name} loading="lazy" />
                  </span>
                ))}
              </div>
              <h3>Drops de merch</h3>
              <p>Cadena, guante, lentes y sombrero. Los brutos sueltan más.</p>
            </Reveal>

            <Reveal className="lp-cell lp-cell-chain px-frame" delay={160}>
              <h3>Tu personaje vive en la cadena</h3>
              <p>
                Los artistas son NFTs en Monad Testnet. Si cierras sesión o cambias de navegador, tu colección
                sigue ahí.
              </p>
              <a className="lp-link" href={EXPLORER} target="_blank" rel="noreferrer">
                Ver contrato {short(CONTRACT_ADDRESS)}
                <ArrowSquareOut size={16} weight="bold" aria-hidden="true" />
              </a>
            </Reveal>
          </div>
        </section>

        {/* Llamado final */}
        <section className="lp-final" aria-labelledby="final-title">
          <Reveal className="lp-final-inner px-frame">
            <h2 id="final-title">El escenario te espera.</h2>
            <p>Conecta tu wallet, elige artista y aguanta lo más que puedas.</p>
            <PlayButton onPlay={onPlay} ready={ready} />
          </Reveal>
        </section>
      </main>

      <footer className="lp-footer">
        <span className="lp-logo lp-logo-small">
          FAN<span>SLAYER</span>
        </span>
        <span className="lp-muted">Hecho para Monad Testnet. Usa MON de prueba, sin valor real.</span>
        <a className="lp-link" href={REPO} target="_blank" rel="noreferrer">
          <GithubLogo size={18} weight="bold" aria-hidden="true" />
          Código
        </a>
      </footer>
    </div>
  )
}
