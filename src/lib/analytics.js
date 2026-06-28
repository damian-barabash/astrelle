// Anonymous, cookieless traffic tracker. Runs on the public site only.
import { SUPABASE_URL, SUPABASE_KEY, callFn } from './supabase.js'

function sid() {
  let s = localStorage.getItem('astrelle_sid')
  if (!s) {
    s = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36)
    localStorage.setItem('astrelle_sid', s)
  }
  return s
}
function device() {
  const ua = navigator.userAgent || ''
  if (/ipad|tablet/i.test(ua)) return 'tablet'
  if (/mobi|android|iphone|ipod/i.test(ua)) return 'mobile'
  return 'desktop'
}

export function initAnalytics() {
  if (typeof window === 'undefined') return () => {}
  const id = sid()
  const base = () => ({
    sid: id,
    path: location.pathname || '/',
    referrer: document.referrer || '',
    device: device(),
    lang: localStorage.getItem('astrelle_lang') || '',
  })
  callFn('analytics-track', { ...base(), type: 'pageview' })
  const hb = setInterval(() => callFn('analytics-track', { ...base(), type: 'heartbeat' }), 15000)
  const beacon = () => {
    try {
      navigator.sendBeacon(
        `${SUPABASE_URL}/functions/v1/analytics-track`,
        new Blob([JSON.stringify({ ...base(), type: 'heartbeat', apikey: SUPABASE_KEY })], { type: 'application/json' })
      )
    } catch (_) { /* ignore */ }
  }
  window.addEventListener('pagehide', beacon)
  return () => {
    clearInterval(hb)
    window.removeEventListener('pagehide', beacon)
  }
}
