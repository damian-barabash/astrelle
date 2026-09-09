// Cookie / local-storage consent. Only two things exist: essential settings (always)
// and anonymous statistics (opt-in). Stored as { analytics: bool, ts } in localStorage.
const KEY = 'astrelle_consent'
const listeners = new Set()

export function getConsent() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const v = JSON.parse(raw)
    return typeof v?.analytics === 'boolean' ? v : null
  } catch {
    return null
  }
}

export function setConsent(analytics) {
  const v = { analytics: !!analytics, ts: Date.now() }
  try {
    localStorage.setItem(KEY, JSON.stringify(v))
    if (!analytics) localStorage.removeItem('astrelle_sid')
  } catch { /* private mode */ }
  listeners.forEach((fn) => fn(v))
  return v
}

// re-open the consent dialog (footer link "cookie settings")
export function resetConsent() {
  try { localStorage.removeItem(KEY) } catch { /* */ }
  listeners.forEach((fn) => fn(null))
}

export function onConsent(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
