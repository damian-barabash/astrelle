// Archives events whose date passed (keeps the rows — the CRM shows booking history)
// and removes their iCloud CalDAV resource. Called hourly by pg_cron (Vault cron_secret).
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { CORS, json, rest, restJson, rpc, caldav, SERVICE } from "../_shared/common.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    const b = await req.json().catch(() => ({}));
    const secret = await rpc("get_secret", { p_name: "cron_secret" });
    if (b.token !== SERVICE && (!secret || b.secret !== secret)) return json({ error: "unauthorized" }, 401);

    const graceMs = 60 * 60 * 1000; // 1h after the event ends
    const now = Date.now();
    const evs = (await restJson("events?archived=eq.false&select=id,caldav_href,starts_at,ends_at,is_slot")).data || [];
    const due = evs.filter((e: any) => {
      const end = e.ends_at ? new Date(e.ends_at).getTime() : new Date(e.starts_at).getTime() + 2 * 3600 * 1000;
      return end < now - graceMs;
    });
    for (const e of due) {
      await caldav("remove", { event_id: e.id, href: e.caldav_href });
      await rest(`events?id=eq.${e.id}`, { method: "PATCH", body: JSON.stringify({ archived: true, caldav_href: null, caldav_uid: null }) });
    }
    // pending requests for archived events did not happen → close them
    await rest("bookings?status=eq.pending&event_id=in.(" + due.map((e: any) => e.id).join(",") + ")", { method: "PATCH", body: JSON.stringify({ status: "cancelled" }) }).catch(() => {});
    return json({ ok: true, archived: due.length });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
