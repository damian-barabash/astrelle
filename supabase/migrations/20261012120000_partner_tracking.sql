-- ASTRELLE 2026-10-12: the site became a guide to the partner studio (Wizards of Art).
-- Bookings and sales happen on their site, so we record what we can see ourselves —
-- every click on a link to the studio — and the sales that are reported back
-- (by hand, or by the studio's webhook).

-- public part: promo code, UTM source, per-offer price / link overrides
alter table public.site_settings add column if not exists partner jsonb not null default '{}'::jsonb;

-- one row per click on a link that leads to the studio
create table if not exists public.partner_clicks (
  id uuid primary key default gen_random_uuid(),
  ref text not null unique,          -- the one-off code written into the destination address
  offer text not null,               -- offer / voucher / product id, or 'schedule', 'shop', 'phone'…
  place text,                        -- where on our site the link stood
  page text,
  lang text,
  device text,
  sid text,                          -- anonymous visit id, only if statistics were allowed
  dest text,
  created_at timestamptz not null default now()
);
alter table public.partner_clicks enable row level security; -- no policies: service role only
create index if not exists partner_clicks_created_idx on public.partner_clicks(created_at desc);
create index if not exists partner_clicks_offer_idx on public.partner_clicks(offer);

-- sales at the studio that came from us
create table if not exists public.partner_sales (
  id uuid primary key default gen_random_uuid(),
  sold_at date not null default current_date,
  offer text,                        -- our offer id, when known
  title text,                        -- what was bought, as reported
  amount numeric(10,2) not null default 0,
  commission numeric(10,2),          -- our share; null = count it from the default percent
  click_ref text,                    -- the click it is matched to, if any
  customer text,
  note text,
  source text not null default 'manual' check (source in ('manual','webhook','import')),
  status text not null default 'confirmed' check (status in ('new','confirmed','rejected')),
  external_id text unique,           -- the studio's order / booking number (stops duplicates)
  raw jsonb,                         -- the webhook body, kept for checking
  created_at timestamptz not null default now()
);
alter table public.partner_sales enable row level security;
create index if not exists partner_sales_sold_idx on public.partner_sales(sold_at desc);

-- private part: the webhook key and our commission
create table if not exists public.partner_private (
  id integer primary key default 1 check (id = 1),
  hook_key text not null default replace(gen_random_uuid()::text, '-', ''),
  commission_pct numeric(5,2) not null default 0,
  updated_at timestamptz not null default now()
);
alter table public.partner_private enable row level security;
insert into public.partner_private (id) values (1) on conflict (id) do nothing;

-- everything the "Partner" tab shows for a period
create or replace function public.partner_summary(p_days integer)
returns jsonb language sql stable security definer set search_path to 'public' as $$
  with win as (select (now() - make_interval(days => greatest(1, p_days))) as since),
  c as (select pc.* from public.partner_clicks pc, win where pc.created_at >= win.since),
  s as (select ps.* from public.partner_sales ps, win where ps.sold_at >= win.since::date and ps.status <> 'rejected'),
  pct as (select commission_pct from public.partner_private where id = 1)
  select jsonb_build_object(
    'clicks', (select count(*) from c),
    'calls', (select count(*) from c where offer = 'phone'),
    'sales', (select count(*) from s where status = 'confirmed'),
    'pending', (select count(*) from s where status = 'new'),
    'revenue', coalesce((select sum(amount) from s where status = 'confirmed'), 0),
    'commission', coalesce((select sum(coalesce(commission, round(amount * (select commission_pct from pct) / 100, 2))) from s where status = 'confirmed'), 0),
    'commission_pct', (select commission_pct from pct),
    'by_offer', (select coalesce(jsonb_agg(jsonb_build_object('k', k, 'clicks', clicks, 'sales', sales, 'revenue', revenue) order by clicks desc, sales desc), '[]'::jsonb)
                 from (select coalesce(a.offer, b.offer) k, coalesce(a.n, 0) clicks, coalesce(b.n, 0) sales, coalesce(b.sum, 0) revenue
                       from (select offer, count(*) n from c group by 1) a
                       full join (select offer, count(*) n, sum(amount) sum from s where status = 'confirmed' and offer is not null group by 1) b on a.offer = b.offer) q),
    'by_place', (select coalesce(jsonb_agg(jsonb_build_object('k', coalesce(place, '—'), 'n', n) order by n desc), '[]'::jsonb)
                 from (select place, count(*) n from c group by 1 order by n desc limit 12) q),
    'by_lang', (select coalesce(jsonb_agg(jsonb_build_object('k', coalesce(nullif(lang, ''), '—'), 'n', n) order by n desc), '[]'::jsonb)
                from (select lang, count(*) n from c group by 1) q),
    'by_device', (select coalesce(jsonb_agg(jsonb_build_object('k', coalesce(nullif(device, ''), '—'), 'n', n) order by n desc), '[]'::jsonb)
                  from (select device, count(*) n from c group by 1) q),
    'daily', (select coalesce(jsonb_agg(jsonb_build_object('d', d, 'clicks', n) order by d), '[]'::jsonb)
              from (select to_char(date_trunc('day', created_at), 'YYYY-MM-DD') d, count(*) n from c group by 1) q)
  );
$$;
revoke all on function public.partner_summary(integer) from public, anon, authenticated;

-- the funnel no longer ends in a booking request: it ends in a click to the studio
-- and, when reported back, in a sale
create or replace function public.funnel_summary(p_days integer)
returns jsonb language sql stable security definer set search_path to 'public' as $$
  select jsonb_build_object(
    'visits', (select count(*) from public.analytics_sessions where first_seen > now() - make_interval(days => p_days)),
    'offer_views', (select count(distinct sid) from public.analytics_pageviews
                    where (path like '/warsztaty%' or path like '/voucher%' or path like '/sklep%') and ts > now() - make_interval(days => p_days)),
    'clicks', (select count(*) from public.partner_clicks where created_at > now() - make_interval(days => p_days)),
    'click_visits', (select count(distinct sid) from public.partner_clicks where coalesce(sid, '') <> '' and created_at > now() - make_interval(days => p_days)),
    'sales', (select count(*) from public.partner_sales where status = 'confirmed' and sold_at > (now() - make_interval(days => p_days))::date),
    'revenue', coalesce((select sum(amount) from public.partner_sales where status = 'confirmed' and sold_at > (now() - make_interval(days => p_days))::date), 0),
    'leads', (select count(*) from public.leads where created_at > now() - make_interval(days => p_days)),
    'clients', (select count(*) from public.clients)
  );
$$;
revoke all on function public.funnel_summary(integer) from public, anon, authenticated;
