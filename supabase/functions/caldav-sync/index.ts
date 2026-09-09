import "jsr:@supabase/functions-js/edge-runtime.d.ts";
const SUPA = Deno.env.get("SUPABASE_URL")!;
const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const H = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, "Content-Type": "application/json" };
const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, content-type, apikey", "Access-Control-Allow-Methods": "POST, OPTIONS" };
const json = (b, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...CORS, "Content-Type": "application/json" } });
async function rest(path, init = {}) { return fetch(`${SUPA}/rest/v1/${path}`, { ...init, headers: { ...H, ...(init.headers || {}) } }); }
async function rpc(fn, args) { const r = await fetch(`${SUPA}/rest/v1/rpc/${fn}`, { method: "POST", headers: H, body: JSON.stringify(args) }); return r.ok ? await r.json() : null; }
async function resolveAdmin(token) { const rows = await rpc("admin_by_token", { p_token: token }); return Array.isArray(rows) && rows.length ? rows[0] : null; }
async function getConfig() { const r = await rest("integrations?id=eq.1&select=*"); const rows = await r.json(); const cfg = Array.isArray(rows) ? rows[0] : null; const password = await rpc("get_secret", { p_name: "apple_app_password" }); return { cfg, password: typeof password === "string" ? password : "" }; }
function authHeader(appleId, password) { return "Basic " + btoa(`${appleId}:${password}`); }
// NOTE: iCloud emits <href xmlns="DAV:">...</href> (with attributes) — allow them.
function hrefs(xml) { return [...xml.matchAll(/<[a-z0-9]*:?href[^>]*>([^<]+)<\/[a-z0-9]*:?href>/gi)].map((m) => m[1].trim()); }
async function propfind(url, depth, body, auth) { const r = await fetch(url, { method: "PROPFIND", headers: { Authorization: auth, Depth: depth, "Content-Type": "application/xml; charset=utf-8" }, body, redirect: "follow" }); return { status: r.status, text: await r.text(), url: r.url }; }
function abs(base, href) { if (/^https?:\/\//i.test(href)) return href; const u = new globalThis.URL(base); return `${u.protocol}//${u.host}${href}`; }
function icsDate(d) { return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, ""); }
function esc(s) { return String(s || "").replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n"); }

async function connect() {
  const dbg = {};
  const { cfg, password } = await getConfig();
  if (!cfg?.apple_id) return { ok: false, error: "no_apple_id" };
  if (!password) return { ok: false, error: "no_password" };
  const auth = authHeader(cfg.apple_id, password);
  const name = cfg.calendar_name || "Astrelle";
  const p1 = await propfind("https://caldav.icloud.com/", "0", `<d:propfind xmlns:d="DAV:"><d:prop><d:current-user-principal/></d:prop></d:propfind>`, auth);
  dbg.p1 = p1.status;
  if (p1.status === 401) return { ok: false, error: "auth_failed", dbg };
  const principalHref = hrefs(p1.text).find((h) => /principal/i.test(h)) || hrefs(p1.text)[0];
  if (!principalHref) return { ok: false, error: "no_principal", dbg, detail: p1.text.slice(0, 200) };
  const principalUrl = abs(p1.url || "https://caldav.icloud.com/", principalHref);
  dbg.principal = principalUrl;
  const p2 = await propfind(principalUrl, "0", `<d:propfind xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav"><d:prop><c:calendar-home-set/></d:prop></d:propfind>`, auth);
  dbg.p2 = p2.status;
  const homeHref = hrefs(p2.text).find((h) => /calendar/i.test(h)) || hrefs(p2.text).find((h) => h !== principalHref) || hrefs(p2.text)[0];
  if (!homeHref) return { ok: false, error: "no_home", dbg, detail: p2.text.slice(0, 200) };
  const home = abs(principalUrl, homeHref);
  dbg.home = home;
  const p3 = await propfind(home, "1", `<d:propfind xmlns:d="DAV:"><d:prop><d:displayname/><d:resourcetype/></d:prop></d:propfind>`, auth);
  dbg.p3 = p3.status;
  let calUrl = "";
  const blocks = p3.text.split(/<[a-z0-9]*:?response[ >]/i);
  for (const blk of blocks) {
    const dn = blk.match(/<[a-z0-9]*:?displayname[^>]*>([^<]*)<\/[a-z0-9]*:?displayname>/i);
    if (dn && dn[1].trim().toLowerCase() === name.toLowerCase() && /calendar/i.test(blk)) { const h = hrefs(blk)[0]; if (h) calUrl = abs(home, h); }
  }
  dbg.foundExisting = !!calUrl;
  if (!calUrl) {
    const slug = "astrelle-" + Math.random().toString(36).slice(2, 8);
    calUrl = home.replace(/\/?$/, "/") + slug + "/";
    dbg.mkUrl = calUrl;
    const mk = await fetch(calUrl, { method: "MKCALENDAR", headers: { Authorization: auth, "Content-Type": "application/xml; charset=utf-8" }, body: `<?xml version="1.0" encoding="utf-8"?>\n<C:mkcalendar xmlns:D="DAV:" xmlns:C="urn:ietf:params:xml:ns:caldav"><D:set><D:prop><D:displayname>${name}</D:displayname><C:supported-calendar-component-set><C:comp name="VEVENT"/></C:supported-calendar-component-set></D:prop></D:set></C:mkcalendar>` });
    dbg.mkStatus = mk.status;
    if (mk.status >= 400) return { ok: false, error: "mkcalendar_failed", dbg, detail: (await mk.text()).slice(0, 300) };
  }
  await rest("integrations?id=eq.1", { method: "PATCH", body: JSON.stringify({ caldav_home: home, caldav_calendar: calUrl, enabled: true, last_error: null, updated_at: new Date().toISOString() }) });
  return { ok: true, calendar: calUrl, dbg };
}

function buildICS(ev, bookings) {
  const uid = ev.caldav_uid || `${ev.id}@astrelle.pl`;
  const start = new Date(ev.starts_at);
  const end = ev.ends_at ? new Date(ev.ends_at) : new Date(start.getTime() + 2 * 3600 * 1000);
  const conf = bookings.filter((b) => b.status === "confirmed");
  const seats = conf.reduce((s, b) => s + (b.people || 1), 0);
  const lines = bookings.map((b) => `${b.status === "confirmed" ? "✓" : b.status === "declined" ? "✕" : "…"} ${b.name} (${b.people}) ${b.contact}`);
  const kind = ev.type === "coworking" ? "Coworking" : "Master-class";
  const desc = [`${kind}${ev.theme ? " · " + ev.theme : ""}`, ev.price ? `Price: ${ev.price}` : "", `Seats: ${seats}/${ev.capacity}`, ev.notes || "", "", ...lines].filter(Boolean).join("\n");
  return { uid, ics: ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Astrelle//Booking//EN", "CALSCALE:GREGORIAN", "BEGIN:VEVENT", `UID:${uid}`, `DTSTAMP:${icsDate(new Date())}`, `DTSTART:${icsDate(start)}`, `DTEND:${icsDate(end)}`, `SUMMARY:${esc((ev.icon ? ev.icon + " " : "") + (ev.title || kind))}`, "LOCATION:Mała 5a, studio AINO, Warszawa", `DESCRIPTION:${esc(desc)}`, "END:VEVENT", "END:VCALENDAR"].join("\r\n") };
}
async function pushEvent(eventId) {
  const { cfg, password } = await getConfig();
  if (!cfg?.enabled || !cfg.caldav_calendar || !cfg.apple_id || !password) return { ok: false, error: "not_connected" };
  const auth = authHeader(cfg.apple_id, password);
  const ev = (await (await rest(`events?id=eq.${eventId}&select=*`)).json())[0];
  if (!ev) return { ok: false, error: "no_event" };
  const bookings = await (await rest(`bookings?event_id=eq.${eventId}&select=name,contact,people,status`)).json();
  const { uid, ics } = buildICS(ev, Array.isArray(bookings) ? bookings : []);
  const href = ev.caldav_href || cfg.caldav_calendar.replace(/\/?$/, "/") + uid + ".ics";
  const put = await fetch(href, { method: "PUT", headers: { Authorization: auth, "Content-Type": "text/calendar; charset=utf-8" }, body: ics });
  if (put.status >= 400) { await rest("integrations?id=eq.1", { method: "PATCH", body: JSON.stringify({ last_error: "push " + put.status, updated_at: new Date().toISOString() }) }); return { ok: false, error: "put_failed", status: put.status }; }
  await rest(`events?id=eq.${eventId}`, { method: "PATCH", body: JSON.stringify({ caldav_uid: uid, caldav_href: href }) });
  await rest("integrations?id=eq.1", { method: "PATCH", body: JSON.stringify({ last_sync: new Date().toISOString(), last_error: null }) });
  return { ok: true };
}
async function removeEvent(eventId, href) {
  const { cfg, password } = await getConfig();
  if (!cfg?.enabled || !cfg.apple_id || !password) return { ok: false, error: "not_connected" };
  const auth = authHeader(cfg.apple_id, password);
  let h = href;
  if (!h) { h = (await (await rest(`events?id=eq.${eventId}&select=caldav_href`)).json())[0]?.caldav_href; }
  if (!h) return { ok: true };
  await fetch(h, { method: "DELETE", headers: { Authorization: auth } }).catch(() => {});
  return { ok: true };
}
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    const b = await req.json().catch(() => ({}));
    const internal = b.token === SERVICE;
    const admin = internal ? { display_name: "system" } : await resolveAdmin(String(b.token ?? ""));
    if (!admin) return json({ error: "unauthorized" }, 401);
    if (b.action === "connect") return json(await connect());
    if (b.action === "push") return json(await pushEvent(String(b.event_id)));
    if (b.action === "remove") return json(await removeEvent(String(b.event_id), b.href));
    if (b.action === "sync-all") { const evs = await (await rest(`events?published=eq.true&starts_at=gte.${new Date().toISOString()}&select=id`)).json(); let n = 0; for (const e of Array.isArray(evs) ? evs : []) { const r = await pushEvent(e.id); if (r.ok) n++; } return json({ ok: true, synced: n }); }
    return json({ error: "bad_action" }, 400);
  } catch (e) { return json({ error: String(e) }, 500); }
});
