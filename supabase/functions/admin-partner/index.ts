// Astrelle admin · partner studio: clicks on the links that lead to the studio, the
// sales reported back, our commission, the webhook key, CSV export.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { CORS, SUPA, json, rest, restJson, rpc, resolveAdmin, audit, bg } from "../_shared/common.ts";

const csvCell = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
const SALE_STATUS = ["new", "confirmed", "rejected"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    const b = await req.json().catch(() => ({}));
    const admin = await resolveAdmin(String(b.token ?? ""));
    if (!admin) return json({ error: "unauthorized" }, 401);

    if (b.action === "overview") {
      const days = Math.min(365, Math.max(1, parseInt(b.days, 10) || 30));
      const since = new Date(Date.now() - days * 864e5).toISOString();
      const [summary, clicks, sales, priv] = await Promise.all([
        rpc("partner_summary", { p_days: days }),
        restJson(`partner_clicks?select=*&created_at=gte.${since}&order=created_at.desc&limit=600`),
        restJson("partner_sales?select=id,sold_at,offer,title,amount,commission,click_ref,customer,note,source,status,external_id,created_at&order=sold_at.desc,created_at.desc&limit=600"),
        restJson("partner_private?id=eq.1&select=hook_key,commission_pct"),
      ]);
      const p = priv.data?.[0] || {};
      return json({
        ok: true, summary, clicks: clicks.data || [], sales: sales.data || [],
        commission_pct: Number(p.commission_pct || 0),
        hook_url: p.hook_key ? `${SUPA}/functions/v1/partner-hook?key=${p.hook_key}` : "",
      });
    }

    // create or update a sale (reported by the studio, read from their report, or matched to a click)
    if (b.action === "sale.save") {
      const id = b.id ? String(b.id) : "";
      const amount = Math.max(0, Math.round((parseFloat(String(b.amount ?? "0").replace(",", ".")) || 0) * 100) / 100);
      const com = b.commission === "" || b.commission == null ? null : Math.max(0, parseFloat(String(b.commission).replace(",", ".")) || 0);
      const row: Record<string, unknown> = {
        sold_at: /^\d{4}-\d{2}-\d{2}$/.test(String(b.sold_at ?? "")) ? b.sold_at : new Date().toISOString().slice(0, 10),
        offer: String(b.offer ?? "").slice(0, 60) || null,
        title: String(b.title ?? "").slice(0, 200) || null,
        amount, commission: com,
        click_ref: String(b.click_ref ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12) || null,
        customer: String(b.customer ?? "").slice(0, 160) || null,
        note: String(b.note ?? "").slice(0, 1000) || null,
        status: SALE_STATUS.includes(b.status) ? b.status : "confirmed",
      };
      const r = id
        ? await restJson(`partner_sales?id=eq.${id}`, { method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify(row) })
        : await restJson("partner_sales", { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify({ ...row, source: "manual" }) });
      if (!r.ok) return json({ error: "save_failed", detail: r.data }, 500);
      bg(audit(admin, id ? "sale.update" : "sale.create", r.data?.[0]?.id ?? id, { amount, offer: row.offer, status: row.status }));
      return json({ ok: true, sale: r.data?.[0] });
    }

    if (b.action === "sale.delete") {
      const id = String(b.id ?? "");
      await rest(`partner_sales?id=eq.${id}`, { method: "DELETE" });
      bg(audit(admin, "sale.delete", id, null));
      return json({ ok: true });
    }

    // test clicks made by ourselves
    if (b.action === "click.delete") {
      const id = String(b.id ?? "");
      await rest(`partner_clicks?id=eq.${id}`, { method: "DELETE" });
      bg(audit(admin, "click.delete", id, null));
      return json({ ok: true });
    }

    if (b.action === "private.set") {
      const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (b.commission_pct !== undefined) patch.commission_pct = Math.min(100, Math.max(0, parseFloat(String(b.commission_pct).replace(",", ".")) || 0));
      if (b.rotate_key === true) patch.hook_key = crypto.randomUUID().replace(/-/g, "");
      const r = await restJson("partner_private?id=eq.1", { method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify(patch) });
      if (!r.ok) return json({ error: "save_failed" }, 500);
      bg(audit(admin, "partner.settings", null, { commission_pct: patch.commission_pct, rotated: b.rotate_key === true }));
      const p = r.data?.[0] || {};
      return json({ ok: true, commission_pct: Number(p.commission_pct || 0), hook_url: `${SUPA}/functions/v1/partner-hook?key=${p.hook_key}` });
    }

    if (b.action === "export") {
      const what = b.what === "sales" ? "sales" : "clicks";
      const rows = (await restJson(what === "sales" ? "partner_sales?select=*&order=sold_at" : "partner_clicks?select=*&order=created_at")).data || [];
      const head = what === "sales"
        ? ["sold_at", "title", "offer", "amount", "commission", "click_ref", "customer", "status", "source", "external_id", "note"]
        : ["created_at", "ref", "offer", "place", "page", "lang", "device", "dest"];
      const csv = [head.join(";"), ...rows.map((r: any) => head.map((k) => csvCell(r[k])).join(";"))].join("\r\n");
      bg(audit(admin, "partner.export", what, { rows: rows.length }));
      return json({ ok: true, csv: "﻿" + csv, filename: `astrelle-${what}-${new Date().toISOString().slice(0, 10)}.csv` });
    }

    return json({ error: "bad_action" }, 400);
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
