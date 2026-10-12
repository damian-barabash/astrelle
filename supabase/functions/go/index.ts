// Public: records a click on a link that leads to the partner studio. No personal
// data — the offer, where the link stood, and the one-off code written into the address.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { CORS, json, restJson } from "../_shared/common.ts";

const BOT = /bot|crawl|spider|slurp|preview|headless|lighthouse|pingdom|monitor/i;
const clean = (v: unknown, n: number) => String(v ?? "").replace(/[\u0000-\u001f]/g, "").trim().slice(0, n);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    const b = await req.json().catch(() => ({}));
    const ref = clean(b.ref, 12).toUpperCase();
    const offer = clean(b.offer, 60);
    if (!/^[A-Z0-9]{4,12}$/.test(ref) || !/^[\w:-]{2,60}$/.test(offer)) return json({ error: "bad_request" }, 400);
    // crawlers follow links too — they are not visitors
    if (BOT.test(req.headers.get("user-agent") || "")) return json({ ok: true, skipped: true });
    const row = {
      ref, offer,
      place: clean(b.place, 60) || null,
      page: clean(b.page, 120) || null,
      lang: ["ru", "pl", "en"].includes(b.lang) ? b.lang : null,
      device: ["mobile", "tablet", "desktop"].includes(b.device) ? b.device : null,
      sid: clean(b.sid, 64) || null,
      dest: clean(b.dest, 400) || null,
    };
    const r = await restJson("partner_clicks", { method: "POST", headers: { Prefer: "resolution=ignore-duplicates" }, body: JSON.stringify(row) });
    if (!r.ok) return json({ error: "insert_failed" }, 500);
    return json({ ok: true });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
