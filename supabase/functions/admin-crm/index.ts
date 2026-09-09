// Astrelle admin CRM: clients, booking pipeline, leads (contact / shop / gift), notes, tags, CSV export.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { CORS, json, rest, restJson, resolveAdmin, audit, bg, caldav, upsertClient, isEmail, normContact } from "../_shared/common.ts";

const BOOKING_STATUS = ["pending", "confirmed", "declined", "attended", "no_show", "cancelled", "waitlist"];
const LEAD_STATUS = ["new", "replied", "closed"];
const csvCell = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    const b = await req.json().catch(() => ({}));
    const admin = await resolveAdmin(String(b.token ?? ""));
    if (!admin) return json({ error: "unauthorized" }, 401);

    // Everything the CRM tab needs in one round-trip.
    if (b.action === "overview") {
      const [clients, bookings, leads] = await Promise.all([
        restJson("clients?select=*&order=last_seen.desc&limit=2000"),
        restJson("bookings?select=*,event:events(id,type,title,theme,icon,starts_at,ends_at,price,capacity,is_slot)&order=created_at.desc&limit=2000"),
        restJson("leads?select=*&order=created_at.desc&limit=1000"),
      ]);
      return json({ clients: clients.data || [], bookings: bookings.data || [], leads: leads.data || [] });
    }

    if (b.action === "client.update") {
      const id = String(b.id ?? "");
      const patch: Record<string, unknown> = {};
      if (typeof b.name === "string") patch.name = b.name.trim().slice(0, 120);
      if (typeof b.notes === "string") patch.notes = b.notes.slice(0, 4000);
      if (Array.isArray(b.tags)) patch.tags = b.tags.map((t: unknown) => String(t).trim().slice(0, 30)).filter(Boolean).slice(0, 20);
      if (typeof b.email === "string") patch.email = b.email.trim().toLowerCase().slice(0, 160) || null;
      if (typeof b.phone === "string") patch.phone = b.phone.replace(/[^0-9+ ]/g, "").slice(0, 40) || null;
      if (!id || !Object.keys(patch).length) return json({ error: "nothing_to_update" }, 400);
      const r = await restJson(`clients?id=eq.${id}`, { method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify(patch) });
      if (!r.ok) return json({ error: "update_failed", detail: r.data }, 500);
      bg(audit(admin, "client.update", id, Object.keys(patch)));
      return json({ ok: true, client: r.data?.[0] });
    }

    // manual client (walk-in, phone call)
    if (b.action === "client.create") {
      const contact = String(b.contact ?? "").trim();
      if (normContact(contact).length < 3) return json({ error: "bad_contact" }, 400);
      const id = await upsertClient({ name: String(b.name ?? ""), contact, source: "manual" });
      bg(audit(admin, "client.create", id, null));
      return json({ ok: true, id });
    }

    if (b.action === "client.delete") {
      const id = String(b.id ?? "");
      await rest(`clients?id=eq.${id}`, { method: "DELETE" });
      bg(audit(admin, "client.delete", id, null));
      return json({ ok: true });
    }

    if (b.action === "booking.status") {
      const id = String(b.id ?? "");
      const status = BOOKING_STATUS.includes(b.status) ? b.status : "pending";
      const r = await restJson(`bookings?id=eq.${id}`, { method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify({ status, updated_at: new Date().toISOString() }) });
      const row = r.data?.[0];
      bg(Promise.all([audit(admin, "booking.status", id, { status }), row?.event_id ? caldav("push", { event_id: row.event_id }) : Promise.resolve()]));
      return json({ ok: true });
    }

    if (b.action === "booking.note") {
      const id = String(b.id ?? "");
      await rest(`bookings?id=eq.${id}`, { method: "PATCH", body: JSON.stringify({ admin_note: String(b.note ?? "").slice(0, 2000), updated_at: new Date().toISOString() }) });
      return json({ ok: true });
    }

    if (b.action === "booking.delete") {
      const id = String(b.id ?? "");
      const ev = (await restJson(`bookings?id=eq.${id}&select=event_id`)).data?.[0]?.event_id;
      await rest(`bookings?id=eq.${id}`, { method: "DELETE" });
      bg(Promise.all([audit(admin, "booking.delete", id, null), ev ? caldav("push", { event_id: ev }) : Promise.resolve()]));
      return json({ ok: true });
    }

    // admin adds a booking by hand (phone / Instagram / walk-in) — confirmed right away
    if (b.action === "booking.create") {
      const event_id = String(b.event_id ?? "");
      const name = String(b.name ?? "").trim().slice(0, 120);
      const contact = String(b.contact ?? "").trim().slice(0, 160);
      const people = Math.min(20, Math.max(1, parseInt(b.people, 10) || 1));
      if (!event_id || !name) return json({ error: "missing_fields" }, 400);
      const client_id = contact ? await upsertClient({ name, contact, source: "manual" }) : null;
      const status = BOOKING_STATUS.includes(b.status) ? b.status : "confirmed";
      const r = await restJson("bookings", {
        method: "POST", headers: { Prefer: "return=representation" },
        body: JSON.stringify({ event_id, name, contact: contact || "—", people, comment: String(b.comment ?? "").slice(0, 600), status, client_id, admin_note: String(b.note ?? "").slice(0, 2000) || null }),
      });
      if (!r.ok) return json({ error: "insert_failed", detail: r.data }, 500);
      bg(Promise.all([audit(admin, "booking.create", event_id, { name, people, manual: true }), caldav("push", { event_id })]));
      return json({ ok: true, booking: r.data?.[0] });
    }

    if (b.action === "lead.update") {
      const id = String(b.id ?? "");
      const patch: Record<string, unknown> = {};
      if (LEAD_STATUS.includes(b.status)) patch.status = b.status;
      if (typeof b.note === "string") patch.admin_note = b.note.slice(0, 2000);
      if (!id || !Object.keys(patch).length) return json({ error: "nothing_to_update" }, 400);
      await rest(`leads?id=eq.${id}`, { method: "PATCH", body: JSON.stringify(patch) });
      bg(audit(admin, "lead.update", id, patch));
      return json({ ok: true });
    }

    if (b.action === "lead.delete") {
      const id = String(b.id ?? "");
      await rest(`leads?id=eq.${id}`, { method: "DELETE" });
      bg(audit(admin, "lead.delete", id, null));
      return json({ ok: true });
    }

    // CSV export (clients | bookings | leads) — the UI turns it into a download
    if (b.action === "export") {
      const what = ["clients", "bookings", "leads"].includes(b.what) ? b.what : "clients";
      let rows: any[] = [];
      let head: string[] = [];
      if (what === "clients") {
        rows = (await restJson("clients?select=*&order=created_at")).data || [];
        head = ["name", "contact", "email", "phone", "tags", "source", "lang", "notes", "created_at", "last_seen"];
      } else if (what === "bookings") {
        rows = ((await restJson("bookings?select=*,event:events(title,type,starts_at,price)&order=created_at")).data || []).map((r: any) => ({
          ...r, event_title: r.event?.title || r.event?.type, event_starts: r.event?.starts_at, event_price: r.event?.price,
        }));
        head = ["name", "contact", "people", "status", "event_title", "event_starts", "event_price", "comment", "admin_note", "created_at"];
      } else {
        rows = (await restJson("leads?select=*&order=created_at")).data || [];
        head = ["kind", "name", "contact", "message", "status", "admin_note", "lang", "created_at"];
      }
      const csv = [head.join(";"), ...rows.map((r) => head.map((k) => csvCell(Array.isArray(r[k]) ? r[k].join(", ") : r[k])).join(";"))].join("\r\n");
      bg(audit(admin, "crm.export", what, { rows: rows.length }));
      return json({ ok: true, csv: "﻿" + csv, filename: `astrelle-${what}-${new Date().toISOString().slice(0, 10)}.csv` });
    }

    return json({ error: "bad_action" }, 400);
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
