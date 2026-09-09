// Public lead endpoint: the "not sure what to pick? write to us" form and the shop waiting list.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { CORS, json, rest, restJson, bg, upsertClient, normContact } from "../_shared/common.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    const b = await req.json().catch(() => ({}));
    const kind = b.kind === "shop" ? "shop" : "contact";
    const name = String(b.name ?? "").trim().slice(0, 120);
    const contact = String(b.contact ?? "").trim().slice(0, 160);
    const message = String(b.message ?? "").trim().slice(0, 1000);
    const lang = ["ru", "pl", "en"].includes(b.lang) ? b.lang : null;
    const page = String(b.page ?? "").slice(0, 120);
    if (!contact || normContact(contact).length < 3) return json({ error: "missing_contact" }, 400);
    if (b.consent !== true) return json({ error: "consent_required" }, 400);
    // honeypot: bots fill every field
    if (b.website) return json({ ok: true });

    // the shop list is one row per person — don't pile up duplicates
    if (kind === "shop") {
      const dup = await restJson(`leads?kind=eq.shop&contact=ilike.${encodeURIComponent(contact)}&select=id`);
      if (dup.ok && Array.isArray(dup.data) && dup.data.length) return json({ ok: true, dup: true });
    }
    const client_id = await upsertClient({ name, contact, source: kind === "shop" ? "shop" : "lead", lang: lang || undefined });
    const ins = await restJson("leads", {
      method: "POST", headers: { Prefer: "return=representation" },
      body: JSON.stringify({ kind, name, contact, message, client_id, lang, page, status: "new" }),
    });
    if (!ins.ok) return json({ error: "insert_failed", detail: ins.data }, 500);
    bg(rest("audit_log", { method: "POST", body: JSON.stringify({ action: "lead.create", target: kind, detail: { name, contact } }) }).catch(() => {}));
    return json({ ok: true, id: ins.data?.[0]?.id });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
