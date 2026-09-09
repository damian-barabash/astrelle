// Public read-only iCal feed of Astrelle events (subscribe in Apple/Google Calendar).
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
const SUPA = Deno.env.get("SUPABASE_URL")!;
const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const H = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` };
function dt(d: Date) { return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, ""); }
function esc(s: string) { return String(s || "").replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n"); }

Deno.serve(async () => {
  try {
    const all = await (await fetch(`${SUPA}/rest/v1/events?published=eq.true&select=*&order=starts_at`, { headers: H })).json();
    const now = Date.now();
    // hide events that already ended (past auto-removed from the subscribed calendar)
    const events = (Array.isArray(all) ? all : []).filter((ev) => {
      const end = ev.ends_at ? new Date(ev.ends_at).getTime() : new Date(ev.starts_at).getTime() + 2 * 3600 * 1000;
      return end > now;
    });
    const bookings = await (await fetch(`${SUPA}/rest/v1/bookings?select=event_id,name,contact,people,status`, { headers: H })).json();
    const byEv: Record<string, any[]> = {};
    for (const b of Array.isArray(bookings) ? bookings : []) (byEv[b.event_id] = byEv[b.event_id] || []).push(b);
    const L = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Astrelle//Feed//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
      "X-WR-CALNAME:Astrelle", "NAME:Astrelle", "X-WR-TIMEZONE:Europe/Warsaw", "X-APPLE-CALENDAR-COLOR:#84A867", "REFRESH-INTERVAL;VALUE=DURATION:PT15M", "X-PUBLISHED-TTL:PT15M",
    ];
    for (const ev of events) {
      const start = new Date(ev.starts_at);
      const end = ev.ends_at ? new Date(ev.ends_at) : new Date(start.getTime() + 2 * 3600 * 1000);
      const bks = byEv[ev.id] || [];
      const seats = bks.filter((b) => b.status === "confirmed").reduce((s, b) => s + (b.people || 1), 0);
      const kind = ev.type === "coworking" ? "Coworking" : "Master-class";
      const lines = bks.map((b) => `${b.status === "confirmed" ? "✓" : b.status === "declined" ? "✕" : "…"} ${b.name} (${b.people}) ${b.contact}`);
      const desc = [`${kind}${ev.theme ? " · " + ev.theme : ""}`, ev.price ? `Цена: ${ev.price}` : "", `Мест: ${seats}/${ev.capacity}`, ev.notes || "", "", ...lines].filter(Boolean).join("\n");
      L.push("BEGIN:VEVENT", `UID:${ev.id}@astrelle.pl`, `DTSTAMP:${dt(new Date(ev.created_at || Date.now()))}`, `DTSTART:${dt(start)}`, `DTEND:${dt(end)}`,
        `SUMMARY:${esc((ev.icon ? ev.icon + " " : "") + (ev.title || kind))}`, "LOCATION:Mała 5a, studio AINO, Warszawa", `DESCRIPTION:${esc(desc)}`, "END:VEVENT");
    }
    L.push("END:VCALENDAR");
    return new Response(L.join("\r\n"), { headers: { "Content-Type": "text/calendar; charset=utf-8", "Cache-Control": "no-cache, max-age=0", "Access-Control-Allow-Origin": "*", "Content-Disposition": "inline; filename=astrelle.ics" } });
  } catch (e) {
    return new Response("error: " + String(e), { status: 500 });
  }
});
