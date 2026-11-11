import React from 'react'
import ReactDOM from 'react-dom/client'
import Root from './Root'
import { PrefsProvider } from './prefs'
import '@fontsource/press-start-2p/400.css' // solo el HUD del juego
import '@fontsource-variable/space-grotesk'
import '@fontsource-variable/jetbrains-mono'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <PrefsProvider>
      <Root />
    </PrefsProvider>
  </React.StrictMode>
)
