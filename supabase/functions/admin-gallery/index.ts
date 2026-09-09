// Astrelle studio gallery management. Token-authenticated (admin session token in body).
// Uses signed upload URLs so large videos upload directly to Storage (not through the fn).
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const BUCKET = "studio-media";
const H = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, "Content-Type": "application/json" };
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type, apikey",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...CORS, "Content-Type": "application/json" } });

async function resolve(token: string) {
  if (!token) return null;
  const r = await fetch(`${URL}/rest/v1/rpc/admin_by_token`, { method: "POST", headers: H, body: JSON.stringify({ p_token: token }) });
  const rows = await r.json();
  return Array.isArray(rows) && rows.length ? rows[0] : null;
}
async function audit(a: any, action: string, target: string | null, detail: unknown) {
  try {
    await fetch(`${URL}/rest/v1/audit_log`, { method: "POST", headers: H, body: JSON.stringify({ admin_id: a?.admin_id ?? null, admin_name: a?.display_name ?? null, action, target, detail }) });
  } catch (_) { /* */ }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    const body = await req.json().catch(() => ({}));
    const admin = await resolve(String(body.token ?? ""));
    if (!admin) return json({ error: "unauthorized" }, 401);

    if (body.action === "sign") {
      const ext = String(body.ext ?? "bin").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 5) || "bin";
      const path = `${crypto.randomUUID()}.${ext}`;
      const r = await fetch(`${URL}/storage/v1/object/upload/sign/${BUCKET}/${path}`, { method: "POST", headers: H, body: "{}" });
      if (!r.ok) return json({ error: "sign_failed", detail: await r.text() }, 500);
      const d = await r.json(); // { url: "/object/upload/sign/...&token=..." }
      return json({
        path,
        uploadUrl: `${URL}/storage/v1${d.url}`,
        publicUrl: `${URL}/storage/v1/object/public/${BUCKET}/${path}`,
      });
    }

    if (body.action === "add") {
      const kind = body.kind === "video" ? "video" : "image";
      if (!body.url) return json({ error: "no_url" }, 400);
      const r = await fetch(`${URL}/rest/v1/gallery_media`, {
        method: "POST", headers: { ...H, Prefer: "return=representation" },
        body: JSON.stringify({ kind, url: body.url, poster_url: body.poster_url ?? null, width: body.width ?? null, height: body.height ?? null, sort: body.sort ?? 0 }),
      });
      if (!r.ok) return json({ error: "add_failed", detail: await r.text() }, 500);
      await audit(admin, "gallery.add", kind, null);
      return json({ ok: true, row: (await r.json())[0] });
    }

    if (body.action === "delete") {
      const id = String(body.id ?? "");
      if (!id) return json({ error: "no_id" }, 400);
      const g = await fetch(`${URL}/rest/v1/gallery_media?id=eq.${id}&select=url`, { headers: H });
      const rows = await g.json();
      if (Array.isArray(rows) && rows[0]?.url) {
        const marker = `/object/public/${BUCKET}/`;
        const i = rows[0].url.indexOf(marker);
        if (i >= 0) {
          const path = rows[0].url.slice(i + marker.length);
          await fetch(`${URL}/storage/v1/object/${BUCKET}/${path}`, { method: "DELETE", headers: H }).catch(() => {});
        }
      }
      await fetch(`${URL}/rest/v1/gallery_media?id=eq.${id}`, { method: "DELETE", headers: H });
      await audit(admin, "gallery.delete", id, null);
      return json({ ok: true });
    }

    if (body.action === "reorder") {
      const ids: string[] = Array.isArray(body.ids) ? body.ids : [];
      for (let i = 0; i < ids.length; i++) {
        await fetch(`${URL}/rest/v1/gallery_media?id=eq.${ids[i]}`, { method: "PATCH", headers: H, body: JSON.stringify({ sort: i }) });
      }
      await audit(admin, "gallery.reorder", null, { count: ids.length });
      return json({ ok: true });
    }

    return json({ error: "bad_action" }, 400);
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
