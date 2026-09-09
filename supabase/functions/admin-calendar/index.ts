// Astrelle admin calendar: events (thematic classes + time-slots), bulk/recurring creation,
// day copy, bookings quick actions, CalDAV push in the background.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { CORS, json, rest, restJson, rpc, resolveAdmin, audit, bg, caldav, SUPA, H, SERVICE } from "../_shared/common.ts";

function eventRow(e: any) {
  return {
    type: e.type === "coworking" ? "coworking" : "class",
    title: String(e.title ?? "").slice(0, 200),
    theme: e.theme ? String(e.theme).slice(0, 120) : null,
    icon: String(e.icon ?? "").slice(0, 16),
    color: e.color || null,
    starts_at: e.starts_at,
    ends_at: e.ends_at || null,
    capacity: Math.max(1, parseInt(e.capacity, 10) || 1),
    price: e.price ? String(e.price).slice(0, 60) : null,
    notes: e.notes ? String(e.notes).slice(0, 1000) : null,
    published: e.published !== false,
    is_slot: e.is_slot === true,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    const b = await req.json().catch(() => ({}));
    const admin = await resolveAdmin(String(b.token ?? ""));
    if (!admin) return json({ error: "unauthorized" }, 401);

    // range overview (past included — the CRM/history needs it); default: 60 days back → 1 year ahead
    if (b.action === "overview") {
      const from = b.from || new Date(Date.now() - 60 * 864e5).toISOString();
      const to = b.to || new Date(Date.now() + 366 * 864e5).toISOString();
      const [events, bookings] = await Promise.all([
        restJson(`events?starts_at=gte.${from}&starts_at=lt.${to}&select=*&order=starts_at`),
        restJson(`bookings?select=*&order=created_at.desc`),
      ]);
      return json({ events: events.data || [], bookings: bookings.data || [] });
    }

    if (b.action === "event.save") {
      const e = b.event || {};
      if (!e.starts_at) return json({ error: "no_start" }, 400);
      const row = eventRow(e);
      let id = e.id;
      if (id) await rest(`events?id=eq.${id}`, { method: "PATCH", body: JSON.stringify(row) });
      else { const r = await restJson("events", { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify(row) }); id = r.data?.[0]?.id; }
      bg(Promise.all([audit(admin, "event.save", id, { type: row.type, slot: row.is_slot }), caldav("push", { event_id: id })]));
      return json({ ok: true, id });
    }

    // bulk create (slot batches, recurring series, copied days) — rows are full event objects
    if (b.action === "events.create_many") {
      const rows: any[] = Array.isArray(b.rows) ? b.rows.slice(0, 400) : [];
      const ids: string[] = [];
      for (const e of rows) {
        if (!e.starts_at) continue;
        const r = await restJson("events", { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify(eventRow(e)) });
        const id = r.data?.[0]?.id; if (id) ids.push(id);
      }
      bg(Promise.all([audit(admin, "events.create_many", null, { count: ids.length }), ...ids.map((id) => caldav("push", { event_id: id }))]));
      return json({ ok: true, created: ids.length, ids });
    }

    // legacy name kept for older clients
    if (b.action === "slots.create") {
      const type = b.type === "coworking" ? "coworking" : "class";
      const price = b.price ? String(b.price).slice(0, 60) : null;
      const rows = (Array.isArray(b.slots) ? b.slots : []).map((s: any) => ({ type, title: "", icon: "", starts_at: s.starts_at, ends_at: s.ends_at, capacity: s.capacity, price, is_slot: true }));
      const ids: string[] = [];
      for (const e of rows) {
        if (!e.starts_at) continue;
        const r = await restJson("events", { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify(eventRow(e)) });
        const id = r.data?.[0]?.id; if (id) ids.push(id);
      }
      bg(Promise.all([audit(admin, "slots.create", type, { count: ids.length }), ...ids.map((id) => caldav("push", { event_id: id }))]));
      return json({ ok: true, created: ids.length });
    }

    if (b.action === "event.delete" || b.action === "events.delete_many") {
      const ids: string[] = b.action === "event.delete" ? [String(b.id ?? "")] : (Array.isArray(b.ids) ? b.ids.map(String) : []);
      for (const id of ids) {
        const href = (await restJson(`events?id=eq.${id}&select=caldav_href`)).data?.[0]?.caldav_href;
        await rest(`events?id=eq.${id}`, { method: "DELETE" });
        bg(caldav("remove", { event_id: id, href }));
      }
      bg(audit(admin, "event.delete", ids.join(","), { count: ids.length }));
      return json({ ok: true });
    }

    if (b.action === "event.publish") {
      const id = String(b.id ?? "");
      await rest(`events?id=eq.${id}`, { method: "PATCH", body: JSON.stringify({ published: b.published !== false }) });
      bg(Promise.all([audit(admin, "event.save", id, { published: b.published !== false }), caldav("push", { event_id: id })]));
      return json({ ok: true });
    }

    if (b.action === "booking.status") {
      const id = String(b.id ?? "");
      const ok = ["pending", "confirmed", "declined", "attended", "no_show", "cancelled", "waitlist"];
      const status = ok.includes(b.status) ? b.status : "pending";
      const r = await restJson(`bookings?id=eq.${id}`, { method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify({ status, updated_at: new Date().toISOString() }) });
      const row = r.data?.[0];
      bg(Promise.all([audit(admin, "booking.status", id, { status }), row?.event_id ? caldav("push", { event_id: row.event_id }) : Promise.resolve()]));
      return json({ ok: true });
    }

    if (b.action === "booking.delete") {
      const id = String(b.id ?? "");
      const ev = (await restJson(`bookings?id=eq.${id}&select=event_id`)).data?.[0]?.event_id;
      await rest(`bookings?id=eq.${id}`, { method: "DELETE" });
      bg(Promise.all([audit(admin, "booking.delete", id, null), ev ? caldav("push", { event_id: ev }) : Promise.resolve()]));
      return json({ ok: true });
    }

    if (b.action === "integration.get") {
      const cfg = (await restJson("integrations?id=eq.1&select=apple_id,calendar_name,enabled,last_sync,last_error")).data?.[0] || {};
      const pw = await rpc("get_secret", { p_name: "apple_app_password" });
      return json({ ...cfg, has_password: typeof pw === "string" && pw.length > 0, feed: `${SUPA}/functions/v1/calendar-feed` });
    }
    if (b.action === "integration.save") {
      const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (typeof b.apple_id === "string") patch.apple_id = b.apple_id.trim();
      if (typeof b.calendar_name === "string" && b.calendar_name.trim()) patch.calendar_name = b.calendar_name.trim();
      if (typeof b.enabled === "boolean") patch.enabled = b.enabled;
      await rest("integrations?id=eq.1", { method: "PATCH", body: JSON.stringify(patch) });
      if (typeof b.app_password === "string" && b.app_password.trim()) await rpc("set_secret", { p_name: "apple_app_password", p_value: b.app_password.trim() });
      await audit(admin, "integration.save", null, null);
      return json({ ok: true });
    }
    if (b.action === "caldav.connect") { const r = await fetch(`${SUPA}/functions/v1/caldav-sync`, { method: "POST", headers: H, body: JSON.stringify({ token: SERVICE, action: "connect" }) }); return json(await r.json()); }
    if (b.action === "caldav.sync") { const r = await fetch(`${SUPA}/functions/v1/caldav-sync`, { method: "POST", headers: H, body: JSON.stringify({ token: SERVICE, action: "sync-all" }) }); return json(await r.json()); }

    return json({ error: "bad_action" }, 400);
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
