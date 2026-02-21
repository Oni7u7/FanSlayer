import React from 'react'
import ReactDOM from 'react-dom/client'
import { PrivyProvider } from '@privy-io/react-auth'
import App from './App'
import './index.css'

const monadTestnet = {
  id: 10143,
  name: 'Monad Testnet',
  network: 'monad-testnet',
  nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
  rpcUrls: { default: { http: ['https://testnet-rpc.monad.xyz'] } },
  blockExplorers: { default: { name: 'Explorer', url: 'https://testnet.monadexplorer.com' } },
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <PrivyProvider
      appId="cmlwjx1ux00ze0dl1o94dxnn8"
      config={{
        defaultChain: monadTestnet,
        supportedChains: [monadTestnet],
        appearance: { theme: 'dark' },
      }}
    >
      <App />
      </PrivyProvider>
  </React.StrictMode>
)