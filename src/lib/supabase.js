// Astrelle Supabase config + tiny REST/Edge helpers (no SDK — keeps the bundle small).
export const SUPABASE_URL = 'https://wynmqmwvjwdwjwlixwvc.supabase.co'
// Publishable (anon) key — safe to ship. Writes are protected by RLS + edge token auth.
export const SUPABASE_KEY = 'sb_publishable_Ra_BQdcTTY2hlfk8qnO73w_zupAJV2Y'

const headers = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
}

async function get(path) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { headers })
  if (!r.ok) throw new Error(`${path.split('?')[0]} fetch failed: ${r.status}`)
  return r.json()
}

// Editable site copy → { ru, pl, en }
export async function fetchContent() {
  const rows = await get('content?select=lang,doc')
  const out = {}
  for (const row of rows) out[row.lang] = row.doc
  return out
}

// Studio gallery media, ordered.
export function fetchGallery() {
  return get('gallery_media?select=id,kind,url,poster_url,width,height,sort&order=sort.asc,created_at.asc')
}

// Public site settings: block images, section layout, shop status, studio info.
export async function fetchSettings() {
  const rows = await get('site_settings?id=eq.1&select=images,layout,shop,studio')
  return rows[0] || {}
}

// Published events in a range (+ confirmed seats) — the public calendar.
export async function listEvents(fromISO, toISO) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/list_events`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ p_from: fromISO, p_to: toISO }),
  })
  if (!r.ok) throw new Error('events fetch failed: ' + r.status)
  const rows = await r.json()
  return Array.isArray(rows) ? rows : []
}

// Call an Edge Function. Returns { ok, status, data }.
export async function callFn(name, body) {
  try {
    const r = await fetch(`${SUPABASE_URL}/functions/v1/${name}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body || {}),
    })
    const data = await r.json().catch(() => ({}))
    return { ok: r.ok, status: r.status, data }
  } catch (e) {
    return { ok: false, status: 0, data: { error: String(e) } }
  }
}
