// Public booking endpoint — creates a 'pending' request (the admin confirms it),
// links the person to a CRM client row and nudges the iCloud calendar.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { CORS, json, rest, restJson, caldav, bg, upsertClient } from "../_shared/common.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    const b = await req.json().catch(() => ({}));
    const event_id = String(b.event_id ?? "");
    const name = String(b.name ?? "").trim().slice(0, 120);
    const contact = String(b.contact ?? "").trim().slice(0, 160);
    const lang = ["ru", "pl", "en"].includes(b.lang) ? b.lang : null;
    let people = parseInt(b.people, 10);
    if (!Number.isFinite(people) || people < 1) people = 1;
    if (people > 20) people = 20;
    const comment = String(b.comment ?? "").trim().slice(0, 600);
    if (!event_id || !name || !contact) return json({ error: "missing_fields" }, 400);
    if (b.consent !== true) return json({ error: "consent_required" }, 400);

    const evr = await restJson(`events?id=eq.${event_id}&select=id,published,archived,starts_at,capacity`);
    const ev = Array.isArray(evr.data) ? evr.data[0] : null;
    if (!ev || !ev.published || ev.archived) return json({ error: "event_unavailable" }, 400);
    if (new Date(ev.starts_at).getTime() < Date.now()) return json({ error: "event_past" }, 400);

    // seats left (confirmed only — pending requests do not block others)
    const bk = await restJson(`bookings?event_id=eq.${event_id}&status=eq.confirmed&select=people`);
    const taken = (Array.isArray(bk.data) ? bk.data : []).reduce((s: number, x: any) => s + (x.people || 1), 0);
    const full = taken + people > ev.capacity;
    // no seats → the visitor may join the waiting list instead of being turned away
    if (full && b.waitlist !== true) return json({ error: "no_seats", left: Math.max(0, ev.capacity - taken) }, 409);
    const status = full ? "waitlist" : "pending";

    const client_id = await upsertClient({ name, contact, source: "booking", lang: lang || undefined });
    const ins = await restJson("bookings", {
      method: "POST", headers: { Prefer: "return=representation" },
      body: JSON.stringify({ event_id, name, contact, people, comment, status, client_id, lang }),
    });
    if (!ins.ok) return json({ error: "insert_failed", detail: ins.data }, 500);
    const id = ins.data?.[0]?.id;
    bg(Promise.all([
      rest("audit_log", { method: "POST", body: JSON.stringify({ action: "booking.create", target: event_id, detail: { name, people, status } }) }).catch(() => {}),
      caldav("push", { event_id }),
    ]));
    return json({ ok: true, id });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
