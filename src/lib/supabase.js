// Astrelle Supabase client config + tiny REST/Edge helpers (no SDK — keeps the bundle small).
export const SUPABASE_URL = 'https://wynmqmwvjwdwjwlixwvc.supabase.co'
// Publishable (anon) key — safe to ship. Writes are protected by RLS + edge token auth.
export const SUPABASE_KEY = 'sb_publishable_Ra_BQdcTTY2hlfk8qnO73w_zupAJV2Y'

const headers = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
}

// Public read of the editable site content → { ru, pl, en }
export async function fetchContent() {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/content?select=lang,doc`, { headers })
  if (!r.ok) throw new Error('content fetch failed: ' + r.status)
  const rows = await r.json()
  const out = {}
  for (const row of rows) out[row.lang] = row.doc
  return out
}

// Public read of studio gallery media, ordered.
export async function fetchGallery() {
  const r = await fetch(
    `${SUPABASE_URL}/rest/v1/gallery_media?select=id,kind,url,poster_url,width,height,sort&order=sort.asc,created_at.asc`,
    { headers }
  )
  if (!r.ok) throw new Error('gallery fetch failed: ' + r.status)
  return await r.json()
}

// Public read of editable block images → { band, master, kurs, cowork, ... }
export async function fetchImages() {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/site_settings?id=eq.1&select=images`, { headers })
  if (!r.ok) throw new Error('images fetch failed: ' + r.status)
  const rows = await r.json()
  return rows[0]?.images || {}
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
