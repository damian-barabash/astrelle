// Astrelle admin analytics: traffic summary + conversion funnel (admin session token).
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { CORS, json, rpc, resolveAdmin } from "../_shared/common.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    const b = await req.json().catch(() => ({}));
    const admin = await resolveAdmin(String(b.token ?? ""));
    if (!admin) return json({ error: "unauthorized" }, 401);
    const days = Math.min(365, Math.max(1, parseInt(b.days, 10) || 30));
    const [summary, funnel] = await Promise.all([rpc("analytics_summary", { p_days: days }), rpc("funnel_summary", { p_days: days })]);
    return json({ summary, funnel });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
