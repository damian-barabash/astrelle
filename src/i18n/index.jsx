import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react'
import ru from './ru.js'
import pl from './pl.js'
import en from './en.js'
import { fetchContent, fetchSettings } from '../lib/supabase.js'

// Bundled dictionaries are the FALLBACK: the site renders instantly and still works
// if Supabase is unreachable. On mount we fetch the editable content from the DB and
// merge it on top, so admin edits are the live source of truth.
// The admin's visual editor mounts the same provider with `override` (its draft).
export const BUNDLED = { ru, pl, en }
export const LANGS = [
  { code: 'pl', label: 'PL' },
  { code: 'ru', label: 'RU' },
  { code: 'en', label: 'EN' },
]

const LangCtx = createContext(null)

export function pick(obj, pathStr) {
  return String(pathStr).split('.').reduce((acc, k) => (acc == null ? acc : acc[k]), obj)
}
function isPlainObject(v) {
  return v && typeof v === 'object' && !Array.isArray(v)
}
// deep merge: base (bundled) <- override (db). Arrays from override replace wholesale.
export function deepMerge(base, over) {
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

export const DEFAULT_STUDIO = {
  company: 'Astrelle',
  address: 'ul. Mała 5a, Warszawa',
  email: '',
  phone: '',
  instagram: '',
  maps: 'https://maps.google.com/?q=Ma%C5%82a+5a,+Warszawa',
  hours: '',
}

export function LangProvider({ children, override }) {
  const [lang, setLangState] = useState(() => {
    const saved = typeof localStorage !== 'undefined' && localStorage.getItem('astrelle_lang')
    return saved && BUNDLED[saved] ? saved : detectLang()
  })
  const [dicts, setDicts] = useState(BUNDLED)
  const [settings, setSettings] = useState({ images: {}, layout: {}, shop: {}, studio: {} })

  useEffect(() => {
    if (override) return
    localStorage.setItem('astrelle_lang', lang)
    document.documentElement.lang = lang
  }, [lang, override])

  useEffect(() => {
    if (override) return
    let alive = true
    fetchContent()
      .then((db) => {
        if (!alive) return
        setDicts({ ru: deepMerge(BUNDLED.ru, db.ru), pl: deepMerge(BUNDLED.pl, db.pl), en: deepMerge(BUNDLED.en, db.en) })
      })
      .catch(() => { /* keep bundled fallback — the site stays fully functional */ })
    fetchSettings()
      .then((s) => alive && setSettings({ images: s.images || {}, layout: s.layout || {}, shop: s.shop || {}, studio: s.studio || {} }))
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [override])

  const curLang = override?.lang || lang
  const curDicts = override?.dicts || dicts
  const images = override?.images || settings.images
  const layout = override?.layout || settings.layout
  const studio = useMemo(() => ({ ...DEFAULT_STUDIO, ...(override?.studio || settings.studio || {}) }), [override, settings.studio])
  const shop = override?.shop || settings.shop

  const setLang = useCallback((l) => (override?.setLang ? override.setLang(l) : setLangState(l)), [override])

  const t = useCallback(
    (key) => {
      const v = pick(curDicts[curLang], key)
      if (v == null) return pick(BUNDLED.pl, key) ?? key
      return v
    },
    [curLang, curDicts]
  )
  // block image with fallback to the bundled default
  const img = useCallback((key, fallback) => images?.[key] || fallback, [images])

  const value = useMemo(
    () => ({ lang: curLang, setLang, t, img, images, layout, studio, shop, dicts: curDicts }),
    [curLang, setLang, t, img, images, layout, studio, shop, curDicts]
  )
  return <LangCtx.Provider value={value}>{children}</LangCtx.Provider>
}

export function useT() {
  const ctx = useContext(LangCtx)
  if (!ctx) throw new Error('useT must be used within LangProvider')
  return ctx
}

export function LangSwitch({ className = '' }) {
  const { lang, setLang } = useT()
  return (
    <div className={`lang ${className}`} role="group" aria-label="Language">
      {LANGS.map((l) => (
        <button key={l.code} type="button" className={l.code === lang ? 'is-active' : ''} onClick={() => setLang(l.code)} aria-pressed={l.code === lang}>
          {l.label}
        </button>
      ))}
    </div>
  )
}
