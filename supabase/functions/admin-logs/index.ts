// Astrelle admin logs: returns the audit_log (admin actions, bookings, edits). Token-auth.
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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    const b = await req.json().catch(() => ({}));
    const ar = await fetch(`${URL}/rest/v1/rpc/admin_by_token`, { method: "POST", headers: H, body: JSON.stringify({ p_token: String(b.token ?? "") }) });
    const admin = (await ar.json())?.[0];
    if (!admin) return json({ error: "unauthorized" }, 401);

    const limit = Math.min(500, Math.max(1, parseInt(b.limit, 10) || 200));
    let q = `audit_log?select=id,ts,admin_name,action,target,detail&order=ts.desc&limit=${limit}`;
    if (b.action && typeof b.action === "string" && b.action !== "all") q += `&action=eq.${encodeURIComponent(b.action)}`;
    const r = await fetch(`${URL}/rest/v1/${q}`, { headers: H });
    const rows = await r.json();
    return json({ rows });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
