import { useEffect, useState } from 'react'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { createPublicClient, createWalletClient, custom, formatEther, http } from 'viem'
import Stage from './Stage'
import { CONTRACT_ADDRESS, FANSLAYER_ABI, monadTestnet } from './config'
import './App.css'

const ARTISTS = [
  { name: 'Bad Bany', image: '/sprites/badbany/img1.jpeg' },
  { name: 'Michel Jackson', image: '/sprites/michaeljackson/img1.jpeg' },
]

const publicClient = createPublicClient({ chain: monadTestnet, transport: http() })

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
    const wallet = wallets[0]
    if (!wallet) return setMessage('❌ No hay wallet conectada')
    if (mintPrice === null) return setMessage('❌ Aún no se carga el precio')

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

      setMessage(`✅ ${artist.name} minteado! TX: ${hash.slice(0, 10)}...`)
    } catch (e) {
      setMessage(`❌ Error: ${shortError(e)}`)
    } finally {
      setMinting('')
    }
  }

  if (!ready) {
    return <div className="screen menu"><p>Cargando...</p></div>
  }

  if (!authenticated) {
    return (
      <div className="screen menu">
        <h1>⚔️ FanSlayer</h1>
        <p>Tu merch digital con valor real</p>
        <button onClick={login}>Connect Wallet</button>
      </div>
    )
  }

  if (screen === 'stage') {
    return <Stage onBack={() => setScreen('menu')} />
  }

  if (screen === 'workshop') {
    const priceLabel = mintPrice === null ? '...' : formatEther(mintPrice)
    return (
      <div className="screen workshop">
        <h2>🛠️ Workshop</h2>
        <div className="artist-grid">
          {ARTISTS.map((artist) => (
            <div key={artist.name} className="artist-card">
              <img src={artist.image} alt={artist.name} />
              <h3>{artist.name}</h3>
              <p className="artist-price">{priceLabel} MON</p>
              <button onClick={() => mintArtist(artist)} disabled={!!minting || mintPrice === null}>
                {minting === artist.name ? 'Minteando...' : 'Comprar'}
              </button>
            </div>
          ))}
        </div>
        {message && <p>{message}</p>}
        <button onClick={() => { setMessage(''); setScreen('menu') }}>← Volver</button>
      </div>
    )
  }

  const address = user?.wallet?.address
  return (
    <div className="screen menu">
      <h1>⚔️ FanSlayer</h1>
      {address && <p>Wallet: {address.slice(0, 6)}...{address.slice(-4)}</p>}
      <button onClick={() => setScreen('stage')}>🎮 Enter Stage</button>
      <button onClick={() => setScreen('workshop')}>🛠️ Workshop</button>
      <button onClick={logout}>Disconnect</button>
    </div>
  )
}

export default App
