import { CheckCircle, GameController, Play, ShoppingBag, SignOut, Storefront } from '@phosphor-icons/react'
import { formatEther } from 'viem'
import { ARTISTS } from '../config'
import { useT } from '../i18n'
import { Address, Button, EmptyState, ErrorState, IconButton, PrefsControls, Skeleton } from '../ui'

export function AppHeader({ screen, onNavigate, address, onLogout }) {
  const t = useT().app
  const tabs = [
    { id: 'menu', label: t.tabRoster },
    { id: 'workshop', label: t.tabShop },
  ]
  return (
    <header className="app-header">
      <div className="app-wrap app-header-row">
        <span className="app-logo">
          <span className="app-logo-mark" aria-hidden="true" />
          <span className="app-logo-text">FANSLAYER</span>
        </span>
        <nav className="tabs" aria-label={t.sections}>
          {tabs.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              className="tab"
              aria-current={screen === id ? 'page' : undefined}
              onClick={() => onNavigate(id)}
            >
              {label}
            </button>
          ))}
        </nav>
        <div className="app-header-end">
          <span className="wallet">
            <span className="sr-only">{t.walletConnected}</span>
            <Address value={address} />
          </span>
          <PrefsControls />
          <IconButton label={t.logout} onClick={onLogout}>
            <SignOut size={20} weight="bold" aria-hidden="true" />
          </IconButton>
        </div>
      </div>
    </header>
  )
}

function Portrait({ artist, size = 'md' }) {
  return (
    <span className={`portrait portrait-${size}`}>
      {artist ? <img src={artist.image} alt="" /> : <span className="portrait-unknown" aria-hidden="true">?</span>}
    </span>
  )
}

export function RosterView({ groups, status, selected, onSelect, onRetry, onPlay, onShop }) {
  const t = useT().app
  const loading = status === 'loading' || status === 'idle'

  return (
    <section className="view" aria-labelledby="roster-title">
      <header className="view-head">
        <h1 id="roster-title" className="t-title">{t.rosterTitle}</h1>
        <p className="t-body">{t.rosterSub}</p>
      </header>

      {loading && groups.length === 0 && (
        <ul className="roster-grid" aria-busy="true" aria-label={t.loadingRoster}>
          {[0, 1, 2].map((i) => (
            <li key={i} className="char-card is-skeleton">
              <Skeleton className="sk-portrait" />
              <Skeleton className="sk-line" />
              <Skeleton className="sk-line short" />
            </li>
          ))}
        </ul>
      )}

      {status === 'error' && (
        <ErrorState title={t.rosterErrorTitle} onRetry={onRetry}>
          {t.rosterErrorText}
        </ErrorState>
      )}

      {status === 'ready' && groups.length === 0 && (
        <EmptyState
          icon={<ShoppingBag size={24} weight="bold" />}
          title={t.emptyTitle}
          action={
            <Button icon={<Storefront size={18} weight="bold" />} onClick={onShop}>
              {t.goShop}
            </Button>
          }
        >
          {t.emptyText}
        </EmptyState>
      )}

      {groups.length > 0 && (
        <ul className="roster-grid">
          {groups.map((g) => {
            const isSelected = !!g.artist && g.tokens.some((c) => c.tokenId === selected?.tokenId)
            const ids = g.tokens.map((c) => `#${c.tokenId}`).join(', ')
            return (
              <li key={g.key}>
                <button
                  type="button"
                  className="char-card"
                  onClick={() => onSelect(g.tokens[0].tokenId)}
                  disabled={!g.artist}
                  aria-pressed={isSelected}
                  title={g.artist ? t.playWith(g.name, ids) : t.noSprites}
                >
                  <Portrait artist={g.artist} />
                  <span className="char-name">{g.name || t.unnamed}</span>
                  <span className="char-meta t-mono">
                    {g.artist ? (g.tokens.length > 1 ? t.nfts(g.tokens.length) : ids) : t.notPlayable}
                  </span>
                  {isSelected && (
                    <span className="char-badge">
                      <CheckCircle size={16} weight="fill" aria-hidden="true" /> {t.equipped}
                    </span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      )}

      <div className="play-bar">
        <div className="app-wrap play-bar-row">
          <div className="play-bar-info">
            {selected ? (
              <>
                <Portrait artist={selected.artist} size="sm" />
                <div>
                  <p className="t-label">{t.goingWith}</p>
                  <p className="play-bar-name">
                    {selected.name} <span className="t-mono">#{selected.tokenId}</span>
                  </p>
                </div>
              </>
            ) : (
              <p className="t-body">{loading ? t.loadingRoster : t.pickOrBuy}</p>
            )}
          </div>
          <Button icon={<Play size={18} weight="fill" />} onClick={onPlay} disabled={!selected}>
            {t.play}
          </Button>
        </div>
      </div>
    </section>
  )
}

export function WorkshopView({ owned, ownedStatus, mintPrice, priceStatus, onRetryPrice, minting, onMint }) {
  const t = useT().app
  const priceLabel = mintPrice === null ? null : formatEther(mintPrice)
  const allOwned = ownedStatus === 'ready' && ARTISTS.every((a) => owned.some((c) => c.artist?.id === a.id))

  return (
    <section className="view" aria-labelledby="shop-title">
      <header className="view-head">
        <h1 id="shop-title" className="t-title">{t.shopTitle}</h1>
        <p className="t-body">{t.shopSub}</p>
      </header>

      {priceStatus === 'error' && (
        <ErrorState title={t.priceErrorTitle} onRetry={onRetryPrice}>
          {t.priceErrorText}
        </ErrorState>
      )}

      <ul className="shop-list">
        {ARTISTS.map((artist) => {
          const count = owned.filter((c) => c.artist?.id === artist.id).length
          const checking = ownedStatus !== 'ready'
          return (
            <li key={artist.id} className="shop-item">
              <Portrait artist={artist} />
              <div className="shop-info">
                <h2 className="shop-name">{artist.name}</h2>
                <p className="shop-price t-mono">
                  {priceStatus === 'ready' ? (
                    <>
                      {priceLabel} MON <span className="shop-net">testnet</span>
                    </>
                  ) : priceStatus === 'error' ? (
                    <span className="t-body">{t.priceUnavailable}</span>
                  ) : (
                    <Skeleton className="sk-price" />
                  )}
                </p>
              </div>
              <div className="shop-action">
                {count > 0 ? (
                  <p className="owned-note">
                    <CheckCircle size={18} weight="fill" aria-hidden="true" /> {t.inCollection}
                  </p>
                ) : (
                  <Button
                    onClick={() => onMint(artist)}
                    loading={minting === artist.name}
                    disabled={(!!minting && minting !== artist.name) || priceStatus !== 'ready' || checking}
                    icon={<GameController size={18} weight="bold" />}
                  >
                    {minting === artist.name ? t.minting : checking ? t.checking : t.buy}
                  </Button>
                )}
              </div>
            </li>
          )
        })}
      </ul>

      {allOwned && <p className="t-body center-note">{t.allOwned}</p>}
    </section>
  )
}
