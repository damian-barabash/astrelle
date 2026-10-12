// Outbound links to the partner studio. Every link carries UTM tags (so the studio's
// own statistics show Astrelle as the source) and a short one-off reference code;
// the click itself is logged on our side. No cookies, nothing personal: just which
// link was pressed, where on the site, and the code that went into the address.
import { SUPABASE_URL, SUPABASE_KEY } from './supabase.js'
import { getConsent } from './consent.js'

const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789' // no 0/O, 1/I/L

export function newRef() {
  let s = ''
  const a = new Uint8Array(6)
  try {
    crypto.getRandomValues(a)
  } catch {
    for (let i = 0; i < 6; i++) a[i] = Math.floor(Math.random() * 256)
  }
  for (const b of a) s += ALPHABET[b % ALPHABET.length]
  return s
}

// the destination with our tags on it; non-ASCII paths (żółć…) are encoded by URL()
export function outUrl(url, { offer = '', ref = '', source = 'astrelle' } = {}) {
  try {
    const u = new URL(url)
    u.searchParams.set('utm_source', source || 'astrelle')
    u.searchParams.set('utm_medium', 'referral')
    if (offer) u.searchParams.set('utm_campaign', offer)
    if (ref) u.searchParams.set('utm_content', ref)
    return u.toString()
  } catch {
    return url
  }
}

function device() {
  const ua = navigator.userAgent || ''
  if (/ipad|tablet/i.test(ua)) return 'tablet'
  if (/mobi|android|iphone|ipod/i.test(ua)) return 'mobile'
  return 'desktop'
}

// fire-and-forget: `keepalive` lets the request finish while the new tab opens
export function logClick({ offer, place, ref, dest, lang }) {
  try {
    const consent = getConsent()
    const body = {
      offer,
      place,
      ref,
      dest,
      lang,
      page: location.pathname,
      device: device(),
      // the visit id exists only if the visitor agreed to statistics
      sid: consent?.analytics ? localStorage.getItem('astrelle_sid') || '' : '',
    }
    fetch(`${SUPABASE_URL}/functions/v1/go`, {
      method: 'POST',
      keepalive: true,
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).catch(() => {})
  } catch { /* tracking must never break a link */ }
}
