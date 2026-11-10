import { motion } from 'motion/react'
import { CheckCircle, GameController, Play, ShoppingBag, SignOut, Storefront, UsersThree } from '@phosphor-icons/react'
import { formatEther } from 'viem'
import { ARTISTS } from '../config'
import { Address, Button, EmptyState, ErrorState, IconButton, Skeleton } from '../ui'

const list = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } }
const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 280, damping: 26 } },
}

const TABS = [
  { id: 'menu', label: 'Personajes', icon: UsersThree },
  { id: 'workshop', label: 'Workshop', icon: Storefront },
]

export function AppHeader({ screen, onNavigate, address, onLogout }) {
  return (
    <header className="app-header">
      <span className="logo">FAN<span>SLAYER</span></span>
      <nav className="tabs" aria-label="Secciones">
        {TABS.map((tab) => {
          const { id, label } = tab
          const Icon = tab.icon
          const active = screen === id
          return (
            <button
              key={id}
              type="button"
              className={`tab${active ? ' is-active' : ''}`}
              aria-current={active ? 'page' : undefined}
              onClick={() => onNavigate(id)}
            >
              {active && (
                <motion.span
                  layoutId="tab-indicator"
                  className="tab-indicator"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <Icon size={18} weight="bold" aria-hidden="true" />
              <span className="tab-label">{label}</span>
            </button>
          )
        })}
      </nav>
      <div className="wallet">
        <span className="wallet-chip">
          <span className="wallet-dot" aria-hidden="true" />
          <span className="sr-only">Wallet conectada:</span>
          <Address value={address} />
        </span>
        <IconButton label="Cerrar sesión" onClick={onLogout}>
          <SignOut size={20} weight="bold" />
        </IconButton>
      </div>
    </header>
  )
}

function Portrait({ artist }) {
  return (
    <span className="portrait">
      <span className="portrait-light" aria-hidden="true" />
      {artist ? <img src={artist.image} alt="" /> : <span className="portrait-unknown" aria-hidden="true">?</span>}
    </span>
  )
}

export function RosterView({ groups, status, selected, onSelect, onRetry, onPlay, onShop }) {
  const loading = status === 'loading' || status === 'idle'

  return (
    <section className="view" aria-labelledby="roster-title">
      <div className="view-head">
        <div>
          <h1 id="roster-title" className="t-title">Tus personajes</h1>
          <p className="t-body">Se leen de la cadena cada vez que entras. Elige con quién sales al escenario.</p>
        </div>
      </div>

      {loading && groups.length === 0 && (
        <div className="roster-grid" aria-busy="true" aria-label="Cargando tus personajes">
          {[0, 1, 2].map((i) => (
            <div key={i} className="char-card is-skeleton">
              <Skeleton className="sk-portrait" />
              <Skeleton className="sk-line" />
              <Skeleton className="sk-line short" />
            </div>
          ))}
        </div>
      )}

      {status === 'error' && (
        <ErrorState title="No pudimos leer tus NFTs" onRetry={onRetry}>
          El RPC de Monad Testnet no respondió. Revisa tu conexión y vuelve a intentar.
        </ErrorState>
      )}

      {status === 'ready' && groups.length === 0 && (
        <EmptyState
          icon={<ShoppingBag size={28} weight="bold" />}
          title="Aún no tienes personajes"
          action={
            <Button icon={<Storefront size={18} weight="bold" />} onClick={onShop}>
              Ir al Workshop
            </Button>
          }
        >
          Compra un artista en el Workshop por 0.01 MON de testnet y aparecerá aquí.
        </EmptyState>
      )}

      {groups.length > 0 && (
        <motion.ul className="roster-grid" variants={list} initial="hidden" animate="show">
          {groups.map((g) => {
            const isSelected = !!g.artist && g.tokens.some((c) => c.tokenId === selected?.tokenId)
            const ids = g.tokens.map((c) => `#${c.tokenId}`).join(', ')
            return (
              <motion.li key={g.key} variants={item}>
                <motion.button
                  type="button"
                  className={`char-card${isSelected ? ' is-selected' : ''}`}
                  onClick={() => onSelect(g.tokens[0].tokenId)}
                  disabled={!g.artist}
                  aria-pressed={isSelected}
                  title={g.artist ? `Jugar con ${g.name} (NFTs ${ids})` : 'Este NFT no tiene sprites en el juego'}
                  whileHover={g.artist ? { y: -4 } : undefined}
                  whileTap={g.artist ? { scale: 0.98 } : undefined}
                  transition={{ type: 'spring', stiffness: 400, damping: 24 }}
                >
                  {isSelected && (
                    <motion.span
                      layoutId="char-selected"
                      className="char-selected-ring"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <Portrait artist={g.artist} />
                  <span className="char-name">{g.name || 'Sin nombre'}</span>
                  <span className="char-meta">
                    {g.artist ? (
                      <>
                        {g.tokens.length > 1 && <span className="count">×{g.tokens.length}</span>}
                        <span className="t-mono">{g.tokens.length > 1 ? `${g.tokens.length} NFTs` : ids}</span>
                      </>
                    ) : (
                      'no jugable'
                    )}
                  </span>
                  {isSelected && (
                    <span className="char-badge">
                      <CheckCircle size={14} weight="fill" aria-hidden="true" /> Equipado
                    </span>
                  )}
                </motion.button>
              </motion.li>
            )
          })}
        </motion.ul>
      )}

      <div className="play-bar">
        <div className="play-bar-info">
          {selected ? (
            <>
              <Portrait artist={selected.artist} />
              <div>
                <p className="t-label">Sales al escenario con</p>
                <p className="play-bar-name">
                  {selected.name} <span className="t-mono">#{selected.tokenId}</span>
                </p>
              </div>
            </>
          ) : (
            <p className="t-body">{loading ? 'Cargando tus personajes…' : 'Elige o compra un personaje.'}</p>
          )}
        </div>
        <Button icon={<Play size={18} weight="fill" />} onClick={onPlay} disabled={!selected}>
          Jugar
        </Button>
      </div>
    </section>
  )
}

export function WorkshopView({ owned, ownedStatus, mintPrice, priceStatus, onRetryPrice, minting, onMint }) {
  const priceLabel = mintPrice === null ? null : formatEther(mintPrice)
  const allOwned = ownedStatus === 'ready' && ARTISTS.every((a) => owned.some((c) => c.artist?.id === a.id))

  return (
    <section className="view" aria-labelledby="shop-title">
      <div className="view-head">
        <div>
          <h1 id="shop-title" className="t-title">Workshop</h1>
          <p className="t-body">Cada wallet puede tener un NFT de cada artista. Se paga con MON de Monad Testnet.</p>
        </div>
      </div>

      {priceStatus === 'error' && (
        <ErrorState title="No pudimos leer el precio" onRetry={onRetryPrice}>
          El contrato no respondió. Sin precio no se puede mintear; reintenta en unos segundos.
        </ErrorState>
      )}

      <motion.ul className="shop-grid" variants={list} initial="hidden" animate="show">
        {ARTISTS.map((artist) => {
          const count = owned.filter((c) => c.artist?.id === artist.id).length
          const checking = ownedStatus !== 'ready'
          return (
            <motion.li key={artist.id} variants={item} className={`shop-card${count ? ' is-owned' : ''}`}>
              <div className="shop-stage">
                <span className="portrait-light" aria-hidden="true" />
                <img src={artist.image} alt={`${artist.name} en pixel art`} />
              </div>
              <div className="shop-info">
                <h2 className="shop-name">{artist.name}</h2>
                <p className="shop-price">
                  {priceStatus === 'ready' ? (
                    <>
                      <span className="t-mono">{priceLabel}</span> MON <span className="tag">testnet</span>
                    </>
                  ) : priceStatus === 'error' ? (
                    <span className="t-body">Precio no disponible</span>
                  ) : (
                    <Skeleton className="sk-price" />
                  )}
                </p>
                {count > 0 ? (
                  <p className="owned-note">
                    <CheckCircle size={18} weight="fill" aria-hidden="true" /> En tu colección
                  </p>
                ) : (
                  <Button
                    onClick={() => onMint(artist)}
                    loading={minting === artist.name}
                    disabled={(!!minting && minting !== artist.name) || priceStatus !== 'ready' || checking}
                    icon={<GameController size={18} weight="bold" />}
                  >
                    {minting === artist.name ? 'Minteando' : checking ? 'Revisando' : 'Comprar'}
                  </Button>
                )}
              </div>
            </motion.li>
          )
        })}
      </motion.ul>

      {allOwned && <p className="t-body center-note">Ya tienes todos los artistas disponibles.</p>}
    </section>
  )
}
