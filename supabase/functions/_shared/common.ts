// Shared helpers for Astrelle edge functions: service-role REST, CORS, admin token auth, audit log.
export const SUPA = Deno.env.get("SUPABASE_URL")!;
export const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
export const H: Record<string, string> = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, "Content-Type": "application/json" };
export const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type, apikey",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
export const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...CORS, "Content-Type": "application/json" } });

export const rest = (path: string, init: RequestInit = {}) =>
  fetch(`${SUPA}/rest/v1/${path}`, { ...init, headers: { ...H, ...(init.headers || {}) } });

export async function restJson(path: string, init: RequestInit = {}) {
  const r = await rest(path, init);
  const t = await r.text();
  try { return { ok: r.ok, status: r.status, data: t ? JSON.parse(t) : null }; } catch { return { ok: r.ok, status: r.status, data: t }; }
}

export async function rpc(fn: string, args: Record<string, unknown>) {
  const r = await fetch(`${SUPA}/rest/v1/rpc/${fn}`, { method: "POST", headers: H, body: JSON.stringify(args) });
  return r.ok ? await r.json() : null;
}

export async function resolveAdmin(token: string) {
  if (!token) return null;
  const rows = await rpc("admin_by_token", { p_token: token });
  return Array.isArray(rows) && rows.length ? rows[0] : null;
}

export async function audit(a: any, action: string, target: string | null, detail: unknown) {
  try {
    await rest("audit_log", { method: "POST", body: JSON.stringify({ admin_id: a?.admin_id ?? null, admin_name: a?.display_name ?? null, action, target, detail }) });
  } catch (_) { /* logging must never break the request */ }
}

// run after the response is sent (never make the UI wait on iCloud etc.)
export function bg(p: Promise<unknown>) {
  try { (globalThis as any).EdgeRuntime?.waitUntil ? (globalThis as any).EdgeRuntime.waitUntil(p) : void p; } catch { void p; }
}

export async function caldav(action: string, payload: Record<string, unknown>) {
  try { await fetch(`${SUPA}/functions/v1/caldav-sync`, { method: "POST", headers: H, body: JSON.stringify({ token: SERVICE, action, ...payload }) }); } catch (_) {}
}

// e-mail → lowercase; phone → digits only. Same rule as the SQL norm_contact().
export function normContact(c: string) {
  const s = String(c || "").trim();
  return s.includes("@") ? s.toLowerCase() : s.replace(/[^0-9]/g, "");
}
export const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s || "").trim());

// Find-or-create a CRM client by contact. Returns the client id (or null when the contact is empty).
export async function upsertClient(o: { name?: string; contact: string; source?: string; lang?: string }) {
  const norm = normContact(o.contact);
  if (!norm || norm.length < 3) return null;
  const found = await restJson(`clients?contact_norm=eq.${encodeURIComponent(norm)}&select=id,name`);
  const name = String(o.name || "").trim().slice(0, 120);
  if (found.ok && Array.isArray(found.data) && found.data[0]) {
    const c = found.data[0];
    const patch: Record<string, unknown> = { last_seen: new Date().toISOString() };
    if (name && !c.name) patch.name = name;
    await rest(`clients?id=eq.${c.id}`, { method: "PATCH", body: JSON.stringify(patch) });
    return c.id as string;
  }
  const email = isEmail(o.contact) ? o.contact.trim().toLowerCase() : null;
  const phone = email ? null : norm;
  const r = await restJson("clients", {
    method: "POST", headers: { Prefer: "return=representation" },
    body: JSON.stringify({ name, contact: String(o.contact).trim().slice(0, 160), contact_norm: norm, email, phone, source: o.source || "booking", lang: o.lang || null }),
  });
  if (r.ok && Array.isArray(r.data) && r.data[0]) return r.data[0].id as string;
  // lost a race with a parallel insert → read again
  const again = await restJson(`clients?contact_norm=eq.${encodeURIComponent(norm)}&select=id`);
  return again.ok && Array.isArray(again.data) && again.data[0] ? (again.data[0].id as string) : null;
}
