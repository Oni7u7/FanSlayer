import React from 'react'
import ReactDOM from 'react-dom/client'
import Root from './Root'
import { PrefsProvider } from './prefs'
import '@fontsource/press-start-2p/400.css'
import '@fontsource-variable/space-grotesk'
import '@fontsource/vt323/400.css'
import '@fontsource/chakra-petch/600.css'
import '@fontsource/chakra-petch/700.css'
import '@fontsource-variable/jetbrains-mono'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <PrefsProvider>
      <Root />
    </PrefsProvider>
  </React.StrictMode>
)
