import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import ru from './ru.js'
import pl from './pl.js'
import en from './en.js'

const DICTS = { ru, pl, en }
export const LANGS = [
  { code: 'ru', label: 'RU' },
  { code: 'pl', label: 'PL' },
  { code: 'en', label: 'EN' },
]

const LangCtx = createContext(null)

function pick(obj, pathStr) {
  return pathStr.split('.').reduce((acc, k) => (acc == null ? acc : acc[k]), obj)
}

// First visit: match the device language. ru / pl / en are supported as-is;
// anything else (e.g. French) falls back to Polish. The switcher still lets the
// visitor change it, and that choice is remembered.
function detectLang() {
  try {
    const nav = navigator.language || (navigator.languages && navigator.languages[0]) || 'pl'
    const base = nav.toLowerCase().split('-')[0]
    return DICTS[base] ? base : 'pl'
  } catch {
    return 'pl'
  }
}

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => {
    const saved = typeof localStorage !== 'undefined' && localStorage.getItem('astrelle_lang')
    return saved && DICTS[saved] ? saved : detectLang()
  })

  useEffect(() => {
    localStorage.setItem('astrelle_lang', lang)
    document.documentElement.lang = lang
  }, [lang])

  const t = useCallback(
    (key) => {
      const v = pick(DICTS[lang], key)
      if (v == null) return pick(DICTS.ru, key) ?? key
      return v
    },
    [lang]
  )

  return <LangCtx.Provider value={{ lang, setLang, t }}>{children}</LangCtx.Provider>
}

export function useT() {
  const ctx = useContext(LangCtx)
  if (!ctx) throw new Error('useT must be used within LangProvider')
  return ctx
}

export function LangSwitch({ className = '' }) {
  const { lang, setLang } = useT()
  return (
    <div className={`lang-switch ${className}`} role="group" aria-label="Language">
      {LANGS.map((l) => (
        <button
          key={l.code}
          type="button"
          className={l.code === lang ? 'active' : ''}
          onClick={() => setLang(l.code)}
          aria-pressed={l.code === lang}
        >
          {l.label}
        </button>
      ))}
    </div>
  )
}
