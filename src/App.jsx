/*import { useState } from 'react'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { createWalletClient, custom, parseEther } from 'viem'
import Stage from './Stage'
import './App.css'

const monadTestnet = {
  id: 10143,
  name: 'Monad Testnet',
  rpcUrls: { default: { http: ['https://testnet-rpc.monad.xyz'] } },
  nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
}

const CONTRACT = '0x4a8EEB3b29527e88D6CDBd93fE39F9DB3aa7064a'
const ABI = [
  {
    name: 'mintArtist',
    type: 'function',
    stateMutability: 'payable',
    inputs: [{ name: '_name', type: 'string' }],
    outputs: [],
  },
]

function App() {
  const { login, logout, authenticated, user } = usePrivy()
  const { wallets } = useWallets()
  const [screen, setScreen] = useState('menu')
  const [minting, setMinting] = useState(false)
  const [artistInput, setArtistInput] = useState('')
  const [message, setMessage] = useState('')

  const mintArtist = async () => {
    if (!artistInput) return setMessage('Escribe un nombre de artista')
    try {
      setMinting(true)
      setMessage('Minteando...')
      const wallet = wallets[0]
      const provider = await wallet.getEthereumProvider()
      const walletClient = createWalletClient({
        chain: monadTestnet,
        transport: custom(provider),
      })
      const [address] = await walletClient.getAddresses()
      const hash = await walletClient.writeContract({
        address: CONTRACT,
        abi: ABI,
        functionName: 'mintArtist',
        args: [artistInput],
        value: parseEther('0.01'),
        account: address,
      })
      setMessage(`✅ Minteado! TX: ${hash.slice(0, 10)}...`)
      setArtistInput('')
    } catch (e) {
      setMessage(`❌ Error: ${e.message?.slice(0, 80)}`)
    } finally {
      setMinting(false)
    }
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
    return (
      <div className="screen workshop">
        <h2>🛠️ Workshop</h2>
        <input
          placeholder="Nombre del artista"
          value={artistInput}
          onChange={(e) => setArtistInput(e.target.value)}
        />
        <button onClick={mintArtist} disabled={minting}>
          {minting ? 'Minteando...' : 'Comprar Artista (0.01 MON)'}
          </button>
        {message && <p>{message}</p>}
        <button onClick={() => setScreen('menu')}>← Volver</button>
      </div>
    )
  }

  return (
    <div className="screen menu">
      <h1>⚔️ FanSlayer</h1>
      <p>Wallet: {user?.wallet?.address?.slice(0, 6)}...{user?.wallet?.address?.slice(-4)}</p>
      <button onClick={() => setScreen('stage')}>🎮 Enter Stage</button>
      <button onClick={() => setScreen('workshop')}>🛠️ Workshop</button>
      <button onClick={logout}>Disconnect</button>
    </div>
      )
    }
    
    export default App
*/

import { useState } from 'react'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { createWalletClient, custom, parseEther } from 'viem'
import Stage from './Stage'
import './App.css'

const monadTestnet = {
  id: 10143,
  name: 'Monad Testnet',
  rpcUrls: { default: { http: ['https://testnet-rpc.monad.xyz'] } },
  nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
}

const CONTRACT = '0x4a8EEB3b29527e88D6CDBd93fE39F9DB3aa7064a'
const ABI = [
  {
    name: 'mintArtist',
    type: 'function',
    stateMutability: 'payable',
    inputs: [{ name: '_name', type: 'string' }],
    outputs: [],
  },
]

const ARTISTS = [
  { name: 'Bad Bany', image: '/sprites/badbany/img1.jpeg', price: '0.01' },
  { name: 'Michel Jackson', image: '/sprites/michaeljackson/img1.jpeg', price: '0.01' },
]

function App() {
  const { login, logout, authenticated, user } = usePrivy()
  const { wallets } = useWallets()
  const [screen, setScreen] = useState('menu')
  const [minting, setMinting] = useState('')
  const [message, setMessage] = useState('')

  const mintArtist = async (artist) => {
    try {
      setMinting(artist.name)
      setMessage('Minteando...')
      const wallet = wallets[0]
      const provider = await wallet.getEthereumProvider()
      const walletClient = createWalletClient({
        chain: monadTestnet,
        transport: custom(provider),
      })
      const [address] = await walletClient.getAddresses()
      const hash = await walletClient.writeContract({
        address: CONTRACT,
        abi: ABI,
        functionName: 'mintArtist',
        args: [artist.name],
        value: parseEther(artist.price),
        account: address,
      })
      setMessage(`✅ ${artist.name} minteado! TX: ${hash.slice(0, 10)}...`)
    } catch (e) {
      setMessage(`❌ Error: ${e.message?.slice(0, 80)}`)
    } finally {
      setMinting('')
    }
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
    return (
      <div className="screen workshop">
        <h2>🛠️ Workshop</h2>
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {ARTISTS.map((artist) => (
            <div key={artist.name} style={{
              background: '#1a1a1a',
              border: '1px solid #333',
              borderRadius: '8px',
              padding: '16px',
              textAlign: 'center',
              width: '180px',
            }}>
              <img
                              src={artist.image}
                              alt={artist.name}
                              style={{ width: '120px', height: '120px', objectFit: 'contain', imageRendering: 'pixelated' }}
                            />
                            <h3 style={{ margin: '8px 0 4px' }}>{artist.name}</h3>
                            <p style={{ fontSize: '14px', color: '#aaa' }}>{artist.price} MON</p>
                            <button
                              onClick={() => mintArtist(artist)}
                              disabled={!!minting}
                              style={{ width: '100%', marginTop: '8px' }}
                            >
                              {minting === artist.name ? 'Minteando...' : 'Comprar'}
                            </button>
                          </div>
                        ))}
                                </div>
        {message && <p style={{ marginTop: '12px' }}>{message}</p>}
        <button onClick={() => setScreen('menu')} style={{ marginTop: '16px' }}>← Volver</button>
      </div>
    )
  }

  return (
    <div className="screen menu">
      <h1>⚔️ FanSlayer</h1>
      <p>Wallet: {user?.wallet?.address?.slice(0, 6)}...{user?.wallet?.address?.slice(-4)}</p>
      <button onClick={() => setScreen('stage')}>🎮 Enter Stage</button>
      <button onClick={() => setScreen('workshop')}>🛠️ Workshop</button>
      <button onClick={logout}>Disconnect</button>
    </div>
      )
    }
    
    export default App
