import React from 'react'
import ReactDOM from 'react-dom/client'
import { PrivyProvider } from '@privy-io/react-auth'
import { MotionConfig } from 'motion/react'
import App from './App'
import { PRIVY_APP_ID, monadTestnet } from './config'
import '@fontsource/press-start-2p/400.css'
import '@fontsource-variable/space-grotesk'
import '@fontsource/vt323/400.css'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <PrivyProvider
      appId={PRIVY_APP_ID}
      config={{
        defaultChain: monadTestnet,
        supportedChains: [monadTestnet],
        appearance: { theme: 'dark' },
      }}
    >
      <MotionConfig reducedMotion="user">
        <App />
      </MotionConfig>
    </PrivyProvider>
  </React.StrictMode>
)
