// Anonymous, cookieless traffic tracker. Runs on the public site only and ONLY after
// the visitor allowed statistics in the consent dialog.
import { SUPABASE_URL, SUPABASE_KEY, callFn } from './supabase.js'
import { getConsent, onConsent } from './consent.js'

let started = false
let stop = null

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
function base() {
  return {
    sid: sid(),
    path: location.pathname || '/',
    referrer: document.referrer || '',
    device: device(),
    lang: localStorage.getItem('astrelle_lang') || '',
  }
}

// SPA route change → count a pageview for the new path
export function trackPageview() {
  if (!started) return
  callFn('analytics-track', { ...base(), type: 'pageview' })
}

function start() {
  if (started || typeof window === 'undefined') return
  started = true
  callFn('analytics-track', { ...base(), type: 'pageview' })
  const hb = setInterval(() => callFn('analytics-track', { ...base(), type: 'heartbeat' }), 15000)
  const beacon = () => {
    try {
      navigator.sendBeacon(
        `${SUPABASE_URL}/functions/v1/analytics-track`,
        new Blob([JSON.stringify({ ...base(), type: 'heartbeat', apikey: SUPABASE_KEY })], { type: 'application/json' })
      )
    } catch { /* ignore */ }
  }
  window.addEventListener('pagehide', beacon)
  stop = () => {
    clearInterval(hb)
    window.removeEventListener('pagehide', beacon)
    started = false
  }
}

// Called once from App: starts now if consent exists, otherwise waits for it.
export function initAnalytics() {
  if (typeof window === 'undefined') return () => {}
  if (getConsent()?.analytics) start()
  const off = onConsent((c) => {
    if (c?.analytics) start()
    else if (stop) stop()
  })
  return () => {
    off()
    if (stop) stop()
  }
}
