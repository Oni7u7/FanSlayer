import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { createWalletClient, custom } from 'viem'
import Stage from './Stage'
import Landing from './landing/Landing'
import AmbientBackground from './ambient/AmbientBackground'
import { AppHeader, RosterView, WorkshopView } from './app/Screens'
import { Toast } from './ui'
import { CONTRACT_ADDRESS, FANSLAYER_ABI, monadTestnet } from './config'
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
  const msg = e?.shortMessage || e?.message || 'Error desconocido'
  if (/user rejected|denied/i.test(msg)) return 'Cancelaste la transacción en tu wallet.'
  if (/insufficient funds/i.test(msg)) return 'No tienes MON de testnet suficiente para pagar el mint y el gas.'
  return msg.slice(0, 140)
}

const screenMotion = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
}

function App() {
  const { ready, login, logout, authenticated, user } = usePrivy()
  const { wallets } = useWallets()
  const [screen, setScreen] = useState('menu') // menu | workshop | stage
  const [minting, setMinting] = useState('')
  const [mintPrice, setMintPrice] = useState(null)
  const [priceStatus, setPriceStatus] = useState('idle') // idle | loading | ready | error
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)

  const [owned, setOwned] = useState([])
  const [ownedStatus, setOwnedStatus] = useState('idle') // idle | loading | ready | error
  const [selectedId, setSelectedId] = useState(null)

  const address = user?.wallet?.address

  const showToast = useCallback((t, ms = 6000) => {
    clearTimeout(toastTimer.current)
    setToast({ id: Date.now(), ...t })
    if (t.tone !== 'loading') toastTimer.current = setTimeout(() => setToast(null), ms)
  }, [])

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

  const loadPrice = useCallback(() => {
    let cancelled = false
    setPriceStatus('loading')
    publicClient
      .readContract({ address: CONTRACT_ADDRESS, abi: FANSLAYER_ABI, functionName: 'mintPrice' })
      .then((price) => {
        if (cancelled) return
        setMintPrice(price)
        setPriceStatus('ready')
      })
      .catch(() => { if (!cancelled) setPriceStatus('error') })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (screen !== 'workshop' || priceStatus === 'ready') return
    return loadPrice()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, loadPrice])

  const mintArtist = async (artist) => {
    const wallet =
      wallets.find((w) => address && w.address.toLowerCase() === address.toLowerCase()) ?? wallets[0]
    if (!wallet) return showToast({ tone: 'error', title: 'No hay wallet conectada', detail: 'Cierra sesión y vuelve a entrar.' })
    if (mintPrice === null) return showToast({ tone: 'error', title: 'Aún no se carga el precio' })
    if (owned.some((c) => c.artist?.id === artist.id)) return showToast({ tone: 'info', title: `Ya tienes a ${artist.name}` })

    try {
      setMinting(artist.name)
      showToast({ tone: 'loading', title: 'Cambiando a Monad Testnet' })
      await wallet.switchChain(monadTestnet.id)

      const provider = await wallet.getEthereumProvider()
      const walletClient = createWalletClient({ chain: monadTestnet, transport: custom(provider) })
      const [account] = await walletClient.getAddresses()

      showToast({ tone: 'loading', title: 'Confirma en tu wallet', detail: `Mint de ${artist.name}` })
      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS,
        abi: FANSLAYER_ABI,
        functionName: 'mintArtist',
        args: [artist.name],
        value: mintPrice,
        account,
      })

      showToast({ tone: 'loading', title: 'Esperando confirmación', detail: `TX ${hash.slice(0, 10)}…` })
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      if (receipt.status !== 'success') throw new Error('La transacción fue revertida')

      // Recargar desde la cadena y equipar el personaje recién comprado.
      const list = await refreshOwned()
      const fresh = list.filter((c) => c.artist?.id === artist.id).at(-1)
      if (fresh) selectCharacter(fresh.tokenId)

      showToast({ tone: 'success', title: `${artist.name} es tuyo y ya está equipado`, detail: `TX ${hash.slice(0, 10)}…` }, 8000)
    } catch (e) {
      showToast({ tone: 'error', title: 'No se pudo mintear', detail: shortError(e) }, 9000)
    } finally {
      setMinting('')
    }
  }

  const inGame = authenticated && screen === 'stage' && selected
  const variant = !ready || !authenticated ? 'full' : 'calm'

  let content
  if (!ready || !authenticated) {
    // La landing se muestra de inmediato; el botón de jugar espera a que Privy esté listo.
    content = <Landing onPlay={login} ready={ready} />
  } else if (inGame) {
    content = <Stage key={selected.tokenId} character={selected} onBack={() => setScreen('menu')} />
  } else {
    content = (
      <div className="app-shell">
        <a className="skip-link" href="#app-main">Saltar al contenido</a>
        <AppHeader screen={screen} onNavigate={setScreen} address={address} onLogout={logout} />
        <main id="app-main" className="app-main">
          <AnimatePresence mode="wait">
            {screen === 'workshop' ? (
              <motion.div key="workshop" {...screenMotion}>
                <WorkshopView
                  owned={owned}
                  ownedStatus={ownedStatus}
                  mintPrice={mintPrice}
                  priceStatus={priceStatus}
                  onRetryPrice={loadPrice}
                  minting={minting}
                  onMint={mintArtist}
                />
              </motion.div>
            ) : (
              <motion.div key="menu" {...screenMotion}>
                <RosterView
                  groups={groups}
                  status={ownedStatus}
                  selected={selected}
                  onSelect={selectCharacter}
                  onRetry={refreshOwned}
                  onPlay={() => setScreen('stage')}
                  onShop={() => setScreen('workshop')}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
        <Toast toast={toast} onClose={() => setToast(null)} />
      </div>
    )
  }

  return (
    <>
      {/* El juego tiene su propio escenario; el fondo 3D se apaga para no gastar GPU */}
      {!inGame && <AmbientBackground variant={variant} />}
      {content}
    </>
  )
}

export default App
