import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import ru from './ru.js'
import pl from './pl.js'
import en from './en.js'
import { fetchContent, fetchImages } from '../lib/supabase.js'

// Bundled dictionaries are the FALLBACK: the site renders instantly and still works
// if Supabase is unreachable. On mount we fetch the editable content from the DB and
// merge it on top, so admin edits become the live source of truth.
const BUNDLED = { ru, pl, en }
export const LANGS = [
  { code: 'ru', label: 'RU' },
  { code: 'pl', label: 'PL' },
  { code: 'en', label: 'EN' },
]

const LangCtx = createContext(null)

function pick(obj, pathStr) {
  return pathStr.split('.').reduce((acc, k) => (acc == null ? acc : acc[k]), obj)
}

function isPlainObject(v) {
  return v && typeof v === 'object' && !Array.isArray(v)
}
// deep merge: base (bundled) <- override (db). Arrays from override replace wholesale.
function deepMerge(base, over) {
  if (!isPlainObject(base) || !isPlainObject(over)) return over === undefined ? base : over
  const out = { ...base }
  for (const k of Object.keys(over)) {
    out[k] = isPlainObject(base[k]) && isPlainObject(over[k]) ? deepMerge(base[k], over[k]) : over[k]
  }
  return out
}

function detectLang() {
  try {
    const nav = navigator.language || (navigator.languages && navigator.languages[0]) || 'pl'
    const base = nav.toLowerCase().split('-')[0]
    return BUNDLED[base] ? base : 'pl'
  } catch {
    return 'pl'
  }
}

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => {
    const saved = typeof localStorage !== 'undefined' && localStorage.getItem('astrelle_lang')
    return saved && BUNDLED[saved] ? saved : detectLang()
  })
  // live dictionaries — start with bundled, get replaced by DB content once loaded
  const [dicts, setDicts] = useState(BUNDLED)
  // editable block images (key -> url); empty until loaded, then overrides defaults
  const [images, setImages] = useState({})

  useEffect(() => {
    localStorage.setItem('astrelle_lang', lang)
    document.documentElement.lang = lang
  }, [lang])

  useEffect(() => {
    let alive = true
    fetchContent()
      .then((db) => {
        if (!alive) return
        setDicts({
          ru: deepMerge(BUNDLED.ru, db.ru),
          pl: deepMerge(BUNDLED.pl, db.pl),
          en: deepMerge(BUNDLED.en, db.en),
        })
      })
      .catch(() => {
        /* keep bundled fallback — the site stays fully functional */
      })
    fetchImages()
      .then((im) => alive && setImages(im || {}))
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])

  // block image with fallback to the bundled default
  const img = useCallback((key, fallback) => images[key] || fallback, [images])

  const t = useCallback(
    (key) => {
      const v = pick(dicts[lang], key)
      if (v == null) return pick(dicts.ru, key) ?? key
      return v
    },
    [lang, dicts]
  )

  return <LangCtx.Provider value={{ lang, setLang, t, img }}>{children}</LangCtx.Provider>
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
