// Astrelle admin auth: custom username/password login (bcrypt in DB) + token sessions.
// Public function (verify_jwt=false): it implements its own auth via the admins table.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const H = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, "Content-Type": "application/json" };
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type, apikey",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...CORS, "Content-Type": "application/json" } });

async function rpc(fn: string, args: Record<string, unknown>) {
  const r = await fetch(`${URL}/rest/v1/rpc/${fn}`, { method: "POST", headers: H, body: JSON.stringify(args) });
  return await r.json();
}
async function resolve(token: string) {
  if (!token) return null;
  const rows = await rpc("admin_by_token", { p_token: token });
  return Array.isArray(rows) && rows.length ? rows[0] : null;
}
async function audit(admin: any, action: string, target: string | null = null, detail: unknown = null) {
  try {
    await fetch(`${URL}/rest/v1/audit_log`, {
      method: "POST", headers: H,
      body: JSON.stringify({ admin_id: admin?.admin_id ?? null, admin_name: admin?.display_name ?? null, action, target, detail }),
    });
  } catch (_) { /* logging must never break auth */ }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action;
    if (action === "login") {
      const token = (crypto.randomUUID() + crypto.randomUUID()).replaceAll("-", "");
      const rows = await rpc("admin_login", {
        p_username: String(body.username ?? ""), p_password: String(body.password ?? ""), p_token: token,
      });
      if (!Array.isArray(rows) || rows.length === 0) return json({ error: "invalid_credentials" }, 401);
      const admin = rows[0];
      await audit(admin, "login");
      return json({ token, admin });
    }
    if (action === "me") {
      const admin = await resolve(String(body.token ?? ""));
      if (!admin) return json({ error: "unauthorized" }, 401);
      return json({ admin });
    }
    if (action === "password") {
      const admin = await resolve(String(body.token ?? ""));
      if (!admin) return json({ error: "unauthorized" }, 401);
      const next = String(body.new_password ?? "");
      if (next.length < 8) return json({ error: "too_short" }, 400);
      const ok = await rpc("admin_set_password", { p_admin_id: admin.admin_id, p_old: String(body.old_password ?? ""), p_new: next });
      if (ok !== true) return json({ error: "wrong_password" }, 400);
      await audit(admin, "password.change");
      return json({ ok: true });
    }
    if (action === "logout") {
      const token = String(body.token ?? "");
      if (token) await fetch(`${URL}/rest/v1/admin_sessions?token=eq.${encodeURIComponent(token)}`, { method: "DELETE", headers: H });
      return json({ ok: true });
    }
    return json({ error: "bad_action" }, 400);
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
