/**
 * Vista previa SOLO de desarrollo (npm run dev → /dev-preview.html).
 * No entra al build: Vite solo construye index.html.
 * Muestra el menú y el Workshop con datos simulados para revisar cada estado sin iniciar sesión.
 *   ?view=menu|workshop|stage  &state=loading|empty|error|ready  &toast=success|error|loading|info
 * El tema y el idioma salen de las preferencias guardadas (botones del header).
 */
import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import '@fontsource/press-start-2p/400.css'
import '@fontsource-variable/space-grotesk'
import '@fontsource/chakra-petch/600.css'
import '@fontsource/chakra-petch/700.css'
import '@fontsource-variable/jetbrains-mono'
import '../index.css'
import '../App.css'
import { PrefsProvider } from '../prefs'
import { AppHeader, RosterView, WorkshopView } from '../app/Screens'
import { Toast } from '../ui'
import Stage from '../Stage'
import { ARTISTS } from '../config'

const q = new URLSearchParams(location.search)
const state = q.get('state') ?? 'ready'
const MOCK_ADDRESS = '0x0000000000000000000000000000000000000001' // dirección de ejemplo, no real

const mockOwned = [
  { tokenId: 0, name: 'Bad Bany', artist: ARTISTS[0] },
  { tokenId: 3, name: 'Bad Bany', artist: ARTISTS[0] },
  { tokenId: 4, name: 'Michel Jackson', artist: ARTISTS[1] },
  { tokenId: 7, name: 'Kendrick', artist: null },
]

// eslint-disable-next-line react-refresh/only-export-components -- página de vista previa, no necesita fast refresh
function Preview() {
  const [view, setView] = useState(q.get('view') ?? 'menu')
  const owned = state === 'ready' ? mockOwned : []
  const groups = [...new Map(owned.map((c) => [c.artist?.id ?? c.name, c])).keys()].map((k) => {
    const tokens = owned.filter((c) => (c.artist?.id ?? c.name) === k)
    return { key: k, name: tokens[0].name, artist: tokens[0].artist, tokens }
  })
  const [selected, setSelected] = useState(state === 'ready' ? mockOwned[2] : null)
  const toastTone = q.get('toast')
  const toast = toastTone ? { id: 1, tone: toastTone, title: 'Michel Jackson', detail: 'Ejemplo de vista previa / preview sample' } : null
  const ownedStatus = state === 'ready' || state === 'empty' ? 'ready' : state
  if (view === 'stage') return <Stage character={mockOwned[2]} onBack={() => setView('menu')} />

  return (
    <div className="app-shell">
      <AppHeader screen={view} onNavigate={setView} address={MOCK_ADDRESS} onLogout={() => {}} />
      <main className="app-main">
        <div className="app-wrap">
          {view === 'workshop' ? (
            <WorkshopView owned={owned.slice(2, 3)} ownedStatus={ownedStatus} mintPrice={10000000000000000n} priceStatus={state === 'error' ? 'error' : state === 'loading' ? 'loading' : 'ready'} onRetryPrice={() => {}} minting="" onMint={() => {}} />
          ) : (
            <RosterView groups={groups} status={ownedStatus} selected={selected} onSelect={(id) => setSelected(owned.find((c) => c.tokenId === id))} onRetry={() => {}} onPlay={() => {}} onShop={() => setView('workshop')} />
          )}
        </div>
      </main>
      <Toast toast={toast} onClose={() => {}} />
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <PrefsProvider><Preview /></PrefsProvider>
)
