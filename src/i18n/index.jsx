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
// The copy was rewritten when Astrelle moved to the partner studio (2026-10). Docs saved
// before that carry the old site's texts under the same keys, so only docs stamped with
// the current revision are merged; the editor stamps a doc when it publishes.
export const DOC_REV = 2
export const liveDoc = (lang, doc) => (doc && doc.__v === DOC_REV ? deepMerge(BUNDLED[lang], doc) : BUNDLED[lang])
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

// Astrelle's own contact details (footer, documents). The address is the partner
// studio where the classes take place.
export const DEFAULT_STUDIO = {
  company: 'Astrelle',
  address: 'pracownia Wizards of Art, ul. Żurawia 32/34 lok. 26, Warszawa',
  email: '',
  phone: '',
  instagram: '',
}
// What the admin can change about the links to the partner studio.
export const DEFAULT_PARTNER = { promo_code: '', utm_source: 'astrelle', offers: {} }

export function LangProvider({ children, override }) {
  const [lang, setLangState] = useState(() => {
    const saved = typeof localStorage !== 'undefined' && localStorage.getItem('astrelle_lang')
    return saved && BUNDLED[saved] ? saved : detectLang()
  })
  const [dicts, setDicts] = useState(BUNDLED)
  const [settings, setSettings] = useState({ images: {}, layout: {}, studio: {}, partner: {} })

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
        setDicts({ ru: liveDoc('ru', db.ru), pl: liveDoc('pl', db.pl), en: liveDoc('en', db.en) })
      })
      .catch(() => { /* keep bundled fallback — the site stays fully functional */ })
    fetchSettings()
      .then((s) => alive && setSettings({ images: s.images || {}, layout: s.layout || {}, studio: s.studio || {}, partner: s.partner || {} }))
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [override])

  const curLang = override?.lang || lang
  const curDicts = override?.dicts || dicts
  const images = override?.images || settings.images
  const layout = override?.layout || settings.layout
  // empty fields in the saved settings fall back to the defaults
  const studio = useMemo(() => {
    const out = { ...DEFAULT_STUDIO }
    for (const [k, v] of Object.entries(override?.studio || settings.studio || {})) if (v) out[k] = v
    return out
  }, [override, settings.studio])
  const partner = useMemo(() => ({ ...DEFAULT_PARTNER, ...(override?.partner || settings.partner || {}) }), [override, settings.partner])

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
    () => ({ lang: curLang, setLang, t, img, images, layout, studio, partner, dicts: curDicts }),
    [curLang, setLang, t, img, images, layout, studio, partner, curDicts]
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
