/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

/*
 * Preferencias del usuario: tema (claro/oscuro) e idioma (es/en).
 * El script inline de index.html ya puso data-theme y lang en <html> antes de pintar
 * (sin parpadeo); aquí se leen de ahí, se mantienen sincronizados y se guardan.
 */
const THEME_KEY = 'fanslayer:theme'
const LANG_KEY = 'fanslayer:lang'

const PrefsContext = createContext(null)

function initialTheme() {
  const t = document.documentElement.dataset.theme
  return t === 'dark' || t === 'light' ? t : 'dark'
}

function initialLang() {
  return document.documentElement.lang === 'en' ? 'en' : 'es'
}

function save(key, value) {
  try {
    localStorage.setItem(key, value)
  } catch {
    // Sin almacenamiento (modo privado): la preferencia dura solo esta visita.
  }
}

export function PrefsProvider({ children }) {
  const [theme, setTheme] = useState(initialTheme)
  const [lang, setLang] = useState(initialLang)

  useEffect(() => {
    const root = document.documentElement
    root.dataset.theme = theme
    root.style.colorScheme = theme
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#09090b' : '#f3f3f0')
  }, [theme])

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const toggleTheme = useCallback(() => {
    setTheme((t) => {
      const next = t === 'dark' ? 'light' : 'dark'
      save(THEME_KEY, next)
      return next
    })
  }, [])

  const changeLang = useCallback((next) => {
    setLang(next)
    save(LANG_KEY, next)
  }, [])

  const value = useMemo(() => ({ theme, toggleTheme, lang, setLang: changeLang }), [theme, toggleTheme, lang, changeLang])
  return <PrefsContext.Provider value={value}>{children}</PrefsContext.Provider>
}

export function usePrefs() {
  const ctx = useContext(PrefsContext)
  if (!ctx) throw new Error('usePrefs debe usarse dentro de <PrefsProvider>')
  return ctx
}
