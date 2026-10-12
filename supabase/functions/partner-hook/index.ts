// Webhook for the partner studio: "an order / booking was paid". The studio's site
// (Wix Automations → "Send HTTP request") posts here with the secret key in the
// address: …/partner-hook?key=<key>. Any JSON body is accepted — we look for an
// amount, an order number, a title, a customer and our promo / reference code inside
// it, and keep the whole body so the row can be checked by eye in the admin.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { CORS, json, rest, restJson } from "../_shared/common.ts";

type Hit = { path: string; key: string; value: unknown };
function walk(v: unknown, path: string, out: Hit[], depth = 0) {
  if (depth > 8 || v == null) return;
  if (Array.isArray(v)) return v.slice(0, 30).forEach((x, i) => walk(x, `${path}.${i}`, out, depth + 1));
  if (typeof v === "object") {
    for (const [k, x] of Object.entries(v as Record<string, unknown>)) {
      if (x != null && typeof x === "object") walk(x, `${path}.${k}`, out, depth + 1);
      else out.push({ path: `${path}.${k}`, key: k, value: x });
    }
  }
}
const num = (v: unknown) => {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? "").replace(/\s/g, "").replace(",", ".").replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : null;
};
// first leaf whose path matches one of the patterns, in the order of the patterns
function find(hits: Hit[], patterns: RegExp[], ok: (v: unknown) => boolean = (v) => v !== "" && v != null) {
  for (const re of patterns) {
    const h = hits.find((x) => re.test(x.path) && ok(x.value));
    if (h) return h.value;
  }
  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    const url = new URL(req.url);
    const key = url.searchParams.get("key") || req.headers.get("x-astrelle-key") || "";
    const priv = (await restJson("partner_private?id=eq.1&select=hook_key")).data?.[0];
    if (!priv || !key || key !== priv.hook_key) return json({ error: "unauthorized" }, 401);
    if (req.method !== "POST") return json({ ok: true, ready: true });

    const text = await req.text();
    let body: unknown = null;
    try { body = JSON.parse(text); } catch { body = { text: text.slice(0, 4000) }; }
    const hits: Hit[] = [];
    walk(body, "", hits);

    const amount = num(find(hits, [/pricesummary\.total\.amount$/i, /\.total(\.amount|price|amount)?$/i, /(^|\.)(amount|totalprice|price|paid)[^.]*$/i], (v) => num(v) !== null && num(v)! > 0)) ?? 0;
    const external = find(hits, [/(order|booking)(\.|_)?(number|id)$/i, /\.number$/i, /\.id$/i]);
    const title = find(hits, [/(service|product|item|plan)[^.]*\.?(name|title)$/i, /lineitems\.0\..*name/i, /\.(title|name)$/i], (v) => typeof v === "string" && v.length > 1);
    const customer = find(hits, [/email$/i, /(contact|buyer|customer)[^.]*\.?(name|phone)$/i, /phone$/i], (v) => typeof v === "string" && v.length > 2);
    const flat = JSON.stringify(body).toUpperCase();

    // is our promo code in the body? is one of our click codes?
    const settings = (await restJson("site_settings?id=eq.1&select=partner")).data?.[0]?.partner || {};
    const promo = String(settings.promo_code || "").trim().toUpperCase();
    const hasPromo = !!promo && flat.includes(promo);
    let click_ref: string | null = null;
    let offer: string | null = null;
    const m = flat.match(/UTM_CONTENT[^A-Z0-9]{1,6}([A-Z0-9]{6})\b/) || flat.match(/\bREF[^A-Z0-9]{1,6}([A-Z0-9]{6})\b/);
    if (m) {
      const c = (await restJson(`partner_clicks?ref=eq.${m[1]}&select=ref,offer`)).data?.[0];
      if (c) { click_ref = c.ref; offer = c.offer; }
    }

    const row = {
      title: title ? String(title).slice(0, 200) : null,
      amount, offer, click_ref,
      customer: customer ? String(customer).slice(0, 160) : null,
      note: hasPromo ? `с кодом ${promo}` : click_ref ? "в заказе есть код перехода" : "без кода Astrelle — проверить",
      source: "webhook",
      // a sale carrying our code is ours; anything else waits for a look
      status: hasPromo || click_ref ? "confirmed" : "new",
      external_id: external ? String(external).slice(0, 120) : null,
      raw: body,
    };
    const r = await restJson("partner_sales", { method: "POST", headers: { Prefer: "resolution=ignore-duplicates,return=representation" }, body: JSON.stringify(row) });
    if (!r.ok) return json({ error: "insert_failed", detail: r.data }, 500);
    await rest("audit_log", { method: "POST", body: JSON.stringify({ action: "sale.webhook", target: row.external_id, detail: { amount, status: row.status } }) }).catch(() => {});
    return json({ ok: true, status: row.status });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
