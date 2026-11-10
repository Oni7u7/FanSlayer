import { PrivyProvider } from '@privy-io/react-auth'
import { MotionConfig } from 'motion/react'
import App from './App'
import { PRIVY_APP_ID, monadTestnet } from './config'
import { usePrefs } from './prefs'

// El diálogo de Privy sigue el tema elegido (claro/oscuro).
export default function Root() {
  const { theme } = usePrefs()
  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
      config={{
        defaultChain: monadTestnet,
        supportedChains: [monadTestnet],
        appearance: { theme },
      }}
    >
      <MotionConfig reducedMotion="user">
        <App />
      </MotionConfig>
    </PrivyProvider>
  )
}

