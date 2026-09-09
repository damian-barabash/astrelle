// Public, anonymous traffic tracker (no cookies, no PII). Writes only via service role.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const H = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, "Content-Type": "application/json" };
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type, apikey",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    const b = await req.json().catch(() => ({}));
    const sid = String(b.sid ?? "").slice(0, 64);
    if (!sid) return new Response(JSON.stringify({ error: "no_sid" }), { status: 400, headers: { ...CORS, "Content-Type": "application/json" } });
    const isPv = b.type !== "heartbeat";
    await fetch(`${URL}/rest/v1/rpc/analytics_touch`, {
      method: "POST", headers: H,
      body: JSON.stringify({
        p_sid: sid,
        p_path: String(b.path ?? "/").slice(0, 300),
        p_referrer: String(b.referrer ?? "").slice(0, 300),
        p_device: String(b.device ?? "").slice(0, 20),
        p_lang: String(b.lang ?? "").slice(0, 8),
        p_pv: isPv,
      }),
    });
    return new Response(JSON.stringify({ ok: true }), { headers: { ...CORS, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...CORS, "Content-Type": "application/json" } });
  }
});
