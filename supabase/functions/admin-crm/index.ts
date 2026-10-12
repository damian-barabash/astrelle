// Astrelle admin CRM: clients and the messages sent through the contact form — notes, tags, CSV export.
// (Bookings are not taken on the site any more: they belong to the partner studio.)
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { CORS, json, rest, restJson, resolveAdmin, audit, bg, upsertClient, normContact } from "../_shared/common.ts";

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
      const [clients, leads] = await Promise.all([
        restJson("clients?select=*&order=last_seen.desc&limit=2000"),
        restJson("leads?select=*&order=created_at.desc&limit=1000"),
      ]);
      // `bookings` stays in the answer (always empty) for panels opened before the 2026-10 update
      return json({ clients: clients.data || [], bookings: [], leads: leads.data || [] });
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

    // CSV export (clients | leads) — the UI turns it into a download
    if (b.action === "export") {
      const what = b.what === "leads" ? "leads" : "clients";
      let rows: any[] = [];
      let head: string[] = [];
      if (what === "clients") {
        rows = (await restJson("clients?select=*&order=created_at")).data || [];
        head = ["name", "contact", "email", "phone", "tags", "source", "lang", "notes", "created_at", "last_seen"];
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
