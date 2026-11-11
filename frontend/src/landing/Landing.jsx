import { ArrowRight, ArrowUpRight, GithubLogo, Wallet } from '@phosphor-icons/react'
import { ARTISTS, CONTRACT_ADDRESS, monadTestnet } from '../config'
import { useT } from '../i18n'
import { PrefsControls } from '../ui'
import './landing.css'

const EXPLORER = `${monadTestnet.blockExplorers.default.url}/address/${CONTRACT_ADDRESS}`
const REPO = 'https://github.com/Oni7u7/fanslayer'
// Dirección truncada en medio: se ve el inicio y el final, que es lo que se compara.
const shortAddress = (a) => `${a.slice(0, 6)}...${a.slice(-4)}`

function PlayButton({ onPlay, ready, t, compact = false }) {
  return (
    <button type="button" className="lp-btn lp-btn-primary" onClick={onPlay} disabled={!ready} aria-busy={!ready}>
      <Wallet size={18} weight="bold" aria-hidden="true" />
      <span>{!ready ? t.loading : compact ? t.playShort : t.play}</span>
    </button>
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
            FANSLAYER
          </a>
          <nav className="lp-nav" aria-label={t.navHow}>
            <a href="#como-funciona">{t.navHow}</a>
            <a href="#artistas">{t.navArtists}</a>
          </nav>
          <PrefsControls />
          <div className="lp-header-cta">
            <PlayButton onPlay={onPlay} ready={ready} t={t} compact />
          </div>
        </div>
      </header>

      <main id="contenido">
        <section className="lp-wrap lp-hero" aria-labelledby="hero-title">
          <div className="lp-hero-copy">
            <p className="lp-eyebrow">{t.eyebrow}</p>
            <h1 id="hero-title" className="lp-title">{t.title}</h1>
            <p className="lp-lead">{t.sub}</p>
            <div className="lp-ctas">
              <PlayButton onPlay={onPlay} ready={ready} t={t} />
              <a className="lp-btn lp-btn-ghost" href="#como-funciona">
                <span>{t.navHow}</span>
                <ArrowRight size={18} weight="bold" aria-hidden="true" />
              </a>
            </div>
          </div>

          <figure className="lp-shot">
            <div className="lp-shot-frame">
              <img src="/landing/gameplay.jpg" width="800" height="600" alt={t.shotAlt} fetchPriority="high" />
            </div>
            <figcaption className="lp-mono lp-caption">{t.shotCaption}</figcaption>
          </figure>
        </section>

        <section id="como-funciona" className="lp-wrap lp-section" aria-labelledby="how-title">
          <h2 id="how-title" className="lp-h2">{t.howTitle}</h2>
          <ol className="lp-steps">
            {t.steps.map((s, i) => (
              <li key={s.verb} className="lp-step">
                <span className="lp-mono lp-step-index" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="lp-h3">{s.verb}</h3>
                <p>{s.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="artistas" className="lp-wrap lp-section" aria-labelledby="artists-title">
          <h2 id="artists-title" className="lp-h2">{t.artistsTitle}</h2>
          <ul className="lp-artists">
            {ARTISTS.map((artist) => (
              <li key={artist.id} className="lp-artist">
                <div className="lp-artist-img">
                  <img src={artist.image} alt={t.artistAlt(artist.name)} loading="lazy" width="500" height="500" />
                </div>
                <div className="lp-artist-body">
                  <h3 className="lp-h3">{artist.name}</h3>
                  <dl className="lp-specs">
                    <div>
                      <dt className="lp-mono">{t.price}</dt>
                      <dd className="lp-mono">0.01 MON</dd>
                    </div>
                    <div>
                      <dt className="lp-mono">{t.limit}</dt>
                      <dd className="lp-mono">{t.perWallet}</dd>
                    </div>
                  </dl>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="lp-footer">
        <div className="lp-wrap lp-footer-row">
          <p>{t.disclaimer}</p>
          <p>
            {t.contract}{' '}
            <a className="lp-link lp-mono" href={EXPLORER} target="_blank" rel="noreferrer">
              {shortAddress(CONTRACT_ADDRESS)}
              <ArrowUpRight size={14} weight="bold" aria-hidden="true" />
              <span className="lp-sr">{t.newTab}</span>
            </a>
          </p>
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
