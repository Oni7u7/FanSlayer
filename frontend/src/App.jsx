import { useCallback, useEffect, useMemo, useState } from 'react'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { createWalletClient, custom, formatEther } from 'viem'
import Stage from './Stage'
import { ARTISTS, CONTRACT_ADDRESS, FANSLAYER_ABI, monadTestnet } from './config'
import { fetchOwnedCharacters, publicClient } from './nfts'
import './App.css'

const selectedKey = (address) => `fanslayer:selected:${address.toLowerCase()}`

function loadSelected(address) {
  try {
    const v = localStorage.getItem(selectedKey(address))
    return v === null ? null : Number(v)
  } catch {
    return null
  }
}

function saveSelected(address, tokenId) {
  try {
    localStorage.setItem(selectedKey(address), String(tokenId))
  } catch {
    // Sin almacenamiento (modo privado): la selección solo dura esta sesión.
  }
}

function shortError(e) {
  return (e?.shortMessage || e?.message || 'Error desconocido').slice(0, 120)
}

function App() {
  const { ready, login, logout, authenticated, user } = usePrivy()
  const { wallets } = useWallets()
  const [screen, setScreen] = useState('menu')
  const [minting, setMinting] = useState('')
  const [message, setMessage] = useState('')
  const [mintPrice, setMintPrice] = useState(null)

  const [owned, setOwned] = useState([])
  const [ownedStatus, setOwnedStatus] = useState('idle') // idle | loading | ready | error
  const [selectedId, setSelectedId] = useState(null)

  const address = user?.wallet?.address

  // Los personajes viven on-chain: se vuelven a leer cada vez que inicias sesión.
  const refreshOwned = useCallback(async () => {
    if (!address) return []
    setOwnedStatus('loading')
    try {
      const list = await fetchOwnedCharacters(address)
      setOwned(list)
      setOwnedStatus('ready')
      return list
    } catch (e) {
      console.error(e)
      setOwnedStatus('error')
      return []
    }
  }, [address])

  useEffect(() => {
    if (!authenticated || !address) {
      setOwned([])
      setOwnedStatus('idle')
      setSelectedId(null)
      return
    }
    setSelectedId(loadSelected(address))
    refreshOwned()
  }, [authenticated, address, refreshOwned])

  const playable = useMemo(() => owned.filter((c) => c.artist), [owned])

  // El seleccionado debe seguir siendo tuyo; si no, se usa el primero jugable.
  const selected = useMemo(
    () => playable.find((c) => c.tokenId === selectedId) ?? playable[0] ?? null,
    [playable, selectedId]
  )

  // Una tarjeta por artista: los NFTs repetidos se agrupan con un contador.
  const groups = useMemo(() => {
    const map = new Map()
    for (const c of owned) {
      const key = c.artist ? c.artist.id : `name:${c.name}`
      if (!map.has(key)) map.set(key, { key, name: c.name, artist: c.artist, tokens: [] })
      map.get(key).tokens.push(c)
    }
    return [...map.values()]
  }, [owned])

  const selectCharacter = (tokenId) => {
    setSelectedId(tokenId)
    if (address) saveSelected(address, tokenId)
  }

  useEffect(() => {
    if (screen !== 'workshop') return
    let cancelled = false
    publicClient
      .readContract({ address: CONTRACT_ADDRESS, abi: FANSLAYER_ABI, functionName: 'mintPrice' })
      .then((price) => { if (!cancelled) setMintPrice(price) })
      .catch((e) => { if (!cancelled) setMessage(`❌ No se pudo leer el precio: ${shortError(e)}`) })
    return () => { cancelled = true }
  }, [screen])

  const mintArtist = async (artist) => {
    const wallet =
      wallets.find((w) => address && w.address.toLowerCase() === address.toLowerCase()) ?? wallets[0]
    if (!wallet) return setMessage('❌ No hay wallet conectada')
    if (mintPrice === null) return setMessage('❌ Aún no se carga el precio')
    if (owned.some((c) => c.artist?.id === artist.id)) return setMessage(`Ya tienes a ${artist.name}`)

    try {
      setMinting(artist.name)
      setMessage('Cambiando a Monad Testnet...')
      await wallet.switchChain(monadTestnet.id)

      const provider = await wallet.getEthereumProvider()
      const walletClient = createWalletClient({ chain: monadTestnet, transport: custom(provider) })
      const [account] = await walletClient.getAddresses()

      setMessage('Confirma la transacción en tu wallet...')
      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS,
        abi: FANSLAYER_ABI,
        functionName: 'mintArtist',
        args: [artist.name],
        value: mintPrice,
        account,
      })

      setMessage(`Esperando confirmación... TX: ${hash.slice(0, 10)}...`)
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      if (receipt.status !== 'success') throw new Error('La transacción fue revertida')

      // Recargar desde la cadena y equipar el personaje recién comprado.
      const list = await refreshOwned()
      const fresh = list.filter((c) => c.artist?.id === artist.id).at(-1)
      if (fresh) selectCharacter(fresh.tokenId)

      setMessage(`✅ ${artist.name} es tuyo y ya está equipado. TX: ${hash.slice(0, 10)}...`)
    } catch (e) {
      setMessage(`❌ Error: ${shortError(e)}`)
    } finally {
      setMinting('')
    }
  }

  if (!ready) {
    return <div className="screen"><p>Cargando...</p></div>
  }

  if (!authenticated) {
    return (
      <div className="screen">
        <h1>⚔️ FanSlayer</h1>
        <p>Tu merch digital con valor real</p>
        <button onClick={login}>Connect Wallet</button>
      </div>
    )
  }

  if (screen === 'stage' && selected) {
    return <Stage key={selected.tokenId} character={selected} onBack={() => setScreen('menu')} />
  }

  if (screen === 'workshop') {
    const priceLabel = mintPrice === null ? '...' : formatEther(mintPrice)
    return (
      <div className="screen">
        <h2>🛠️ Workshop</h2>
        <div className="card-grid">
          {ARTISTS.map((artist) => {
            const count = owned.filter((c) => c.artist?.id === artist.id).length
            return (
              <div key={artist.id} className="card">
                <img src={artist.image} alt={artist.name} />
                <h3>{artist.name}</h3>
                <p className="muted">{priceLabel} MON</p>
                {count > 0 ? (
                  <p className="badge owned">✅ Ya lo tienes</p>
                ) : (
                  <button
                    onClick={() => mintArtist(artist)}
                    disabled={!!minting || mintPrice === null || ownedStatus !== 'ready'}
                  >
                    {minting === artist.name ? 'Minteando...' : 'Comprar'}
                  </button>
                )}
              </div>
            )
          })}
        </div>
        {ownedStatus === 'loading' && <p className="muted">Revisando qué artistas ya tienes...</p>}
        {ownedStatus === 'ready' && ARTISTS.every((a) => owned.some((c) => c.artist?.id === a.id)) && (
          <p className="muted">Ya tienes todos los artistas disponibles.</p>
        )}
        {message && <p>{message}</p>}
        <button onClick={() => { setMessage(''); setScreen('menu') }}>← Volver</button>
      </div>
    )
  }

  return (
    <div className="screen">
      <h1>⚔️ FanSlayer</h1>
      {address && <p className="muted">Wallet: {address.slice(0, 6)}...{address.slice(-4)}</p>}

      <section className="roster">
        <h2>Tus personajes</h2>
        {ownedStatus === 'loading' && <p className="muted">Leyendo tus NFTs en Monad...</p>}
        {ownedStatus === 'error' && (
          <p>
            ❌ No se pudieron leer tus personajes.{' '}
            <button className="link" onClick={refreshOwned}>Reintentar</button>
          </p>
        )}
        {ownedStatus === 'ready' && owned.length === 0 && (
          <p className="muted">Aún no tienes personajes. Compra uno en el Workshop para jugar.</p>
        )}
        {groups.length > 0 && (
          <div className="card-grid">
            {groups.map((g) => {
              const isSelected = !!g.artist && g.tokens.some((c) => c.tokenId === selected?.tokenId)
              const ids = g.tokens.map((c) => `#${c.tokenId}`).join(', ')
              return (
                <button
                  key={g.key}
                  className={`card card-select${isSelected ? ' is-selected' : ''}`}
                  onClick={() => selectCharacter(g.tokens[0].tokenId)}
                  disabled={!g.artist}
                  aria-pressed={isSelected}
                  title={g.artist ? `Jugar con ${g.name} (NFTs ${ids})` : 'Este NFT no tiene sprites en el juego'}
                >
                  {g.artist ? <img src={g.artist.image} alt="" /> : <div className="card-placeholder">?</div>}
                  <h3>{g.name || 'Sin nombre'}</h3>
                  {g.tokens.length > 1 && <p className="badge">×{g.tokens.length}</p>}
                  <p className="muted">{g.artist ? (g.tokens.length > 1 ? `${g.tokens.length} NFTs` : ids) : 'no jugable'}</p>
                </button>
              )
            })}
          </div>
        )}
      </section>

      <div className="actions">
        <button onClick={() => setScreen('stage')} disabled={!selected}>
          🎮 {selected ? `Jugar con ${selected.name}` : 'Enter Stage'}
        </button>
        <button onClick={() => setScreen('workshop')}>🛠️ Workshop</button>
        <button onClick={logout}>Disconnect</button>
      </div>
    </div>
  )
}

export default App
