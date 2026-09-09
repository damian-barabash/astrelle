// Astrelle admin content: site copy (jsonb per language), block images, site settings
// (section layout, event templates, shop status, studio info, message templates).
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { CORS, json, rest, restJson, resolveAdmin, audit, bg } from "../_shared/common.ts";

const SETTING_KEYS = ["layout", "templates", "shop", "studio", "messages"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    const body = await req.json().catch(() => ({}));
    const admin = await resolveAdmin(String(body.token ?? ""));
    if (!admin) return json({ error: "unauthorized" }, 401);

    if (body.action === "save") {
      const lang = String(body.lang ?? "");
      if (!["ru", "pl", "en"].includes(lang)) return json({ error: "bad_lang" }, 400);
      const doc = body.doc;
      if (doc === null || typeof doc !== "object" || Array.isArray(doc)) return json({ error: "bad_doc" }, 400);
      const r = await restJson(`content?lang=eq.${lang}`, {
        method: "PATCH", headers: { Prefer: "return=representation" },
        body: JSON.stringify({ doc, updated_at: new Date().toISOString(), updated_by: admin.display_name }),
      });
      if (!r.ok) return json({ error: "save_failed", detail: r.data }, 500);
      bg(audit(admin, "content.update", lang, null));
      return json({ ok: true, updated: Array.isArray(r.data) ? r.data.length : 0 });
    }

    // all three languages at once (the visual editor saves what changed)
    if (body.action === "save_all") {
      const docs = body.docs || {};
      let n = 0;
      for (const lang of ["ru", "pl", "en"]) {
        const doc = docs[lang];
        if (!doc || typeof doc !== "object" || Array.isArray(doc)) continue;
        const r = await rest(`content?lang=eq.${lang}`, { method: "PATCH", body: JSON.stringify({ doc, updated_at: new Date().toISOString(), updated_by: admin.display_name }) });
        if (r.ok) n++;
      }
      bg(audit(admin, "content.update", Object.keys(docs).join(","), null));
      return json({ ok: true, updated: n });
    }

    if (body.action === "images.set") {
      const key = String(body.key ?? "").slice(0, 40);
      const url = body.url == null ? null : String(body.url).slice(0, 600);
      if (!key) return json({ error: "no_key" }, 400);
      const cur = (await restJson("site_settings?id=eq.1&select=images")).data?.[0]?.images || {};
      if (url) cur[key] = url; else delete cur[key];
      const r = await rest("site_settings?id=eq.1", { method: "PATCH", body: JSON.stringify({ images: cur, updated_at: new Date().toISOString() }) });
      if (!r.ok) return json({ error: "save_failed" }, 500);
      bg(audit(admin, "images.set", key, null));
      return json({ ok: true });
    }

    if (body.action === "settings.get") {
      const row = (await restJson(`site_settings?id=eq.1&select=${SETTING_KEYS.join(",")},images`)).data?.[0] || {};
      return json({ ok: true, settings: row });
    }

    if (body.action === "settings.set") {
      const key = String(body.key ?? "");
      if (!SETTING_KEYS.includes(key)) return json({ error: "bad_key" }, 400);
      const value = body.value;
      if (value === undefined) return json({ error: "no_value" }, 400);
      const r = await rest("site_settings?id=eq.1", { method: "PATCH", body: JSON.stringify({ [key]: value, updated_at: new Date().toISOString() }) });
      if (!r.ok) return json({ error: "save_failed" }, 500);
      bg(audit(admin, "settings.set", key, null));
      return json({ ok: true });
    }

    return json({ error: "bad_action" }, 400);
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
