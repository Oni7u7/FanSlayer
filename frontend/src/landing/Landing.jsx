import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ArrowRight, ArrowUpRight, GithubLogo, Minus, Plus, Wallet } from '@phosphor-icons/react'
import { ARTISTS, CONTRACT_ADDRESS, monadTestnet } from '../config'
import { useT } from '../i18n'
import { PrefsControls } from '../ui'
import './landing.css'

const EXPLORER = `${monadTestnet.blockExplorers.default.url}/address/${CONTRACT_ADDRESS}`
const REPO = 'https://github.com/Oni7u7/fanslayer'
// Dirección truncada en medio: se ve el inicio y el final, que es lo que se compara.
const shortAddress = (a) => `${a.slice(0, 6)}...${a.slice(-4)}`

const ITEMS = ['cadena', 'guante', 'lentes', 'sombrero']

const press = { type: 'spring', stiffness: 400, damping: 22 }
const tween = { duration: 0.3, ease: [0.16, 1, 0.3, 1] }

// Entrada del hero: eyebrow -> título -> texto -> botones
const heroList = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } }
const heroItem = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: tween } }

// Revelado al hacer scroll (una vez)
const gridList = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } }
const gridItem = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: tween } }
const inView = { initial: 'hidden', whileInView: 'show', viewport: { once: true, amount: 0.15 } }

function PlayButton({ onPlay, ready, t, compact = false }) {
  return (
    <motion.button
      type="button"
      className="lp-btn lp-btn-primary"
      onClick={onPlay}
      disabled={!ready}
      aria-busy={!ready}
      whileTap={ready ? { scale: 0.97 } : undefined}
      transition={press}
    >
      <Wallet size={18} weight="bold" aria-hidden="true" />
      <span>{!ready ? t.loading : compact ? t.playShort : t.play}</span>
    </motion.button>
  )
}

/** Cursor de terminal: el único elemento con movimiento continuo de la página. */
function Cursor() {
  const reduce = useReducedMotion()
  return (
    <motion.span
      className="lp-cursor"
      aria-hidden="true"
      animate={reduce ? undefined : { opacity: [1, 1, 0, 0] }}
      transition={reduce ? undefined : { duration: 1.1, repeat: Infinity, times: [0, 0.5, 0.5, 1], ease: 'linear' }}
    />
  )
}

function SectionHead({ index, title, sub, id }) {
  return (
    <motion.header className="lp-section-head" variants={gridItem} {...inView}>
      <span className="lp-index" aria-hidden="true">[{index}]</span>
      <h2 id={id} className="lp-h2">{title}</h2>
      {sub && <p className="lp-section-sub">{sub}</p>}
    </motion.header>
  )
}

function ArtistCard({ artist, t }) {
  // Al pasar el puntero, el artista cambia a su frame de ataque (cambio instantáneo)
  const [hot, setHot] = useState(false)
  const frame = hot ? artist.sprites.attack[0] : artist.image
  return (
    <motion.li
      className="lp-artist"
      variants={gridItem}
      onPointerEnter={() => setHot(true)}
      onPointerLeave={() => setHot(false)}
    >
      <div className="lp-artist-img">
        <img src={frame} alt={t.artistAlt(artist.name)} loading="lazy" width="500" height="500" />
      </div>
      <div className="lp-artist-body">
        <h3 className="lp-h3">{artist.name}</h3>
        <dl className="lp-specs">
          <div>
            <dt>{t.price}</dt>
            <dd>0.01 MON</dd>
          </div>
          <div>
            <dt>{t.limit}</dt>
            <dd>{t.perWallet}</dd>
          </div>
        </dl>
      </div>
    </motion.li>
  )
}

function Faq({ items }) {
  const [open, setOpen] = useState(0)
  return (
    <ul className="lp-faq">
      {items.map((item, i) => {
        const isOpen = open === i
        const panelId = `faq-panel-${i}`
        return (
          <li key={item.q} className="lp-faq-item">
            <h3 className="lp-faq-h">
              <button
                type="button"
                className="lp-faq-q"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? -1 : i)}
              >
                <span>{item.q}</span>
                {isOpen ? <Minus size={20} weight="bold" aria-hidden="true" /> : <Plus size={20} weight="bold" aria-hidden="true" />}
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.p
                  id={panelId}
                  className="lp-faq-a"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, transition: { duration: 0.12 } }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                >
                  {item.a}
                </motion.p>
              )}
            </AnimatePresence>
          </li>
        )
      })}
    </ul>
  )
}

export default function Landing({ onPlay, ready }) {
  const t = useT()

  return (
    <div className="lp">
      <a className="lp-skip" href="#contenido">{t.skip}</a>

      <header className="lp-header">
        <div className="lp-wrap lp-header-row">
          <a href="#contenido" className="lp-logo" aria-label={t.home}>
            <span className="lp-logo-mark" aria-hidden="true" />
            <span className="lp-logo-text">FANSLAYER</span>
          </a>
          <nav className="lp-nav" aria-label={t.navLabel}>
            <a href="#como-funciona">{t.navHow}</a>
            <a href="#juego">{t.navGame}</a>
            <a href="#artistas">{t.navArtists}</a>
            <a href="#preguntas">{t.navFaq}</a>
          </nav>
          <PrefsControls />
          <div className="lp-header-cta">
            <PlayButton onPlay={onPlay} ready={ready} t={t} compact />
          </div>
        </div>
      </header>

      <main id="contenido">
        {/* Hero */}
        <motion.section className="lp-wrap lp-hero" aria-labelledby="hero-title" variants={heroList} initial="hidden" animate="show">
          <motion.p className="lp-eyebrow" variants={heroItem}>{t.eyebrow}</motion.p>
          <motion.h1 id="hero-title" className="lp-title" variants={heroItem}>
            <span className="lp-title-line">{t.titleA}</span>
            <span className="lp-title-line">
              {t.titleB}
              <Cursor />
            </span>
          </motion.h1>
          <div className="lp-hero-grid">
            <div className="lp-hero-copy">
              <motion.p className="lp-lead" variants={heroItem}>{t.sub}</motion.p>
              <motion.div className="lp-ctas" variants={heroItem}>
                <PlayButton onPlay={onPlay} ready={ready} t={t} />
                <motion.a className="lp-btn lp-btn-ghost" href="#como-funciona" whileTap={{ scale: 0.97 }} transition={press}>
                  <span>{t.seeHow}</span>
                  <ArrowRight size={18} weight="bold" aria-hidden="true" />
                </motion.a>
              </motion.div>
            </div>
            <motion.figure className="lp-shot" variants={heroItem}>
              <div className="lp-shot-frame">
                <img src="/landing/gameplay.jpg" width="800" height="600" alt={t.shotAlt} fetchPriority="high" />
              </div>
              <figcaption className="lp-caption">{t.shotCaption}</figcaption>
            </motion.figure>
          </div>
        </motion.section>

        {/* Ficha técnica: datos reales del contrato */}
        <section className="lp-specbar" aria-label={t.specsLabel}>
          <motion.dl className="lp-wrap lp-specbar-row" variants={gridList} {...inView}>
            {t.specs.map((s) => (
              <motion.div key={s.k} className="lp-spec" variants={gridItem}>
                <dt>{s.k}</dt>
                <dd>
                  <span className="lp-spec-v">{s.v}</span>
                  <span className="lp-spec-d">{s.d}</span>
                </dd>
              </motion.div>
            ))}
            <motion.div className="lp-spec" variants={gridItem}>
              <dt>{t.specContract}</dt>
              <dd>
                <a className="lp-spec-v lp-link" href={EXPLORER} target="_blank" rel="noreferrer">
                  {shortAddress(CONTRACT_ADDRESS)}
                  <ArrowUpRight size={14} weight="bold" aria-hidden="true" />
                  <span className="lp-sr">{t.newTab}</span>
                </a>
                <span className="lp-spec-d">{t.specContractNote}</span>
              </dd>
            </motion.div>
          </motion.dl>
        </section>

        {/* Cómo funciona */}
        <section id="como-funciona" className="lp-wrap lp-section" aria-labelledby="how-title">
          <SectionHead index="01" id="how-title" title={t.howTitle} />
          <motion.ol className="lp-steps" variants={gridList} {...inView}>
            {t.steps.map((s, i) => (
              <motion.li key={s.verb} className="lp-step" variants={gridItem}>
                <span className="lp-step-n" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="lp-step-verb">{s.verb}</h3>
                <p>{s.text}</p>
              </motion.li>
            ))}
          </motion.ol>
        </section>

        {/* El juego: mecánicas con números reales */}
        <section id="juego" className="lp-wrap lp-section" aria-labelledby="game-title">
          <SectionHead index="02" id="game-title" title={t.gameTitle} sub={t.gameSub} />
          <motion.ul className="lp-bento" variants={gridList} {...inView}>
            <motion.li className="lp-cell lp-cell-combo" variants={gridItem}>
              <span className="lp-tag">{t.features[0].tag}</span>
              <p className="lp-combo-num" aria-hidden="true">x5</p>
              <h3 className="lp-h3">{t.features[0].title}</h3>
              <p className="lp-cell-text">{t.features[0].text}</p>
            </motion.li>
            <motion.li className="lp-cell lp-cell-brute" variants={gridItem}>
              <span className="lp-tag">{t.features[1].tag}</span>
              <div className="lp-brute-crop" aria-hidden="true" />
              <h3 className="lp-h3">{t.features[1].title}</h3>
              <p className="lp-cell-text">{t.features[1].text}</p>
            </motion.li>
            <motion.li className="lp-cell lp-cell-drops" variants={gridItem}>
              <span className="lp-tag">{t.features[2].tag}</span>
              <div className="lp-slots">
                {ITEMS.map((id) => (
                  <span key={id} className="lp-slot">
                    <img src={`/sprites/items/item_${id}.png`} alt="" loading="lazy" width="128" height="128" />
                  </span>
                ))}
              </div>
              <h3 className="lp-h3">{t.features[2].title}</h3>
              <p className="lp-cell-text">{t.features[2].text}</p>
            </motion.li>
            <motion.li className="lp-cell lp-cell-keys" variants={gridItem}>
              <span className="lp-tag">{t.features[3].tag}</span>
              <p className="lp-keys" aria-hidden="true">
                <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd>
                <span>{t.keysMove}</span>
                <kbd className="wide">{t.keySpace}</kbd>
                <span>{t.keysAttack}</span>
              </p>
              <h3 className="lp-h3">{t.features[3].title}</h3>
              <p className="lp-cell-text">{t.features[3].text}</p>
            </motion.li>
          </motion.ul>
        </section>

        {/* Artistas */}
        <section id="artistas" className="lp-wrap lp-section" aria-labelledby="artists-title">
          <SectionHead index="03" id="artists-title" title={t.artistsTitle} sub={t.artistsSub} />
          <motion.ul className="lp-artists" variants={gridList} {...inView}>
            {ARTISTS.map((artist) => (
              <ArtistCard key={artist.id} artist={artist} t={t} />
            ))}
          </motion.ul>
        </section>

        {/* Bajo el capó: prueba verificable en lugar de testimonios */}
        <section id="bajo-el-capo" className="lp-wrap lp-section" aria-labelledby="chain-title">
          <SectionHead index="04" id="chain-title" title={t.chainTitle} sub={t.chainSub} />
          <motion.ul className="lp-chain" variants={gridList} {...inView}>
            {t.chain.map((c) => (
              <motion.li key={c.k} className="lp-chain-item" variants={gridItem}>
                <span className="lp-chain-k">{c.k}</span>
                <p>{c.text}</p>
              </motion.li>
            ))}
          </motion.ul>
          <p className="lp-chain-links">
            <a className="lp-link" href={EXPLORER} target="_blank" rel="noreferrer">
              {t.contract} {shortAddress(CONTRACT_ADDRESS)}
              <ArrowUpRight size={14} weight="bold" aria-hidden="true" />
              <span className="lp-sr">{t.newTab}</span>
            </a>
            <a className="lp-link" href={REPO} target="_blank" rel="noreferrer">
              <GithubLogo size={16} weight="bold" aria-hidden="true" />
              {t.source}
              <span className="lp-sr">{t.newTab}</span>
            </a>
          </p>
        </section>

        {/* Preguntas */}
        <section id="preguntas" className="lp-wrap lp-section" aria-labelledby="faq-title">
          <SectionHead index="05" id="faq-title" title={t.faqTitle} />
          <Faq items={t.faq} />
        </section>

        {/* Cierre */}
        <section className="lp-final" aria-labelledby="final-title">
          <motion.div className="lp-wrap lp-final-row" variants={gridItem} {...inView}>
            <h2 id="final-title" className="lp-final-title">{t.finalTitle}</h2>
            <div className="lp-final-side">
              <p>{t.finalSub}</p>
              <PlayButton onPlay={onPlay} ready={ready} t={t} />
            </div>
          </motion.div>
        </section>
      </main>

      <footer className="lp-footer">
        <div className="lp-wrap lp-footer-row">
          <span className="lp-logo lp-logo-small">
            <span className="lp-logo-mark" aria-hidden="true" />
            FANSLAYER
          </span>
          <p>{t.disclaimer}</p>
          <a className="lp-link" href={REPO} target="_blank" rel="noreferrer">
            <GithubLogo size={18} weight="bold" aria-hidden="true" />
            {t.source}
            <span className="lp-sr">{t.newTab}</span>
          </a>
        </div>
      </footer>
    </div>
  )
}
