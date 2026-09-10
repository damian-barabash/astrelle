-- avg_time was skewed by returning visitors (persistent sid → last_seen - first_seen spans days).
-- Cap a session at 30 minutes when averaging.
create or replace function public.analytics_summary(p_days integer)
returns jsonb language sql stable security definer set search_path to 'public' as $$
  with win as (select (now() - make_interval(days => greatest(1, p_days))) as since),
  s as (select * from public.analytics_sessions, win where last_seen >= win.since),
  pv as (select * from public.analytics_pageviews, win where ts >= win.since)
  select jsonb_build_object(
    'visits', (select count(*) from s),
    'pageviews', (select count(*) from pv),
    'avg_time', coalesce((select round(avg(least(extract(epoch from (last_seen - first_seen)), 1800)))::int from s where pageviews > 1), 0),
    'bounce', coalesce((select round(100.0 * count(*) filter (where pageviews <= 1) / nullif(count(*),0))::int from s), 0),
    'daily', (select coalesce(jsonb_agg(jsonb_build_object('d', d, 'visits', v, 'views', w) order by d), '[]'::jsonb)
              from (select to_char(date_trunc('day', ts), 'YYYY-MM-DD') d, count(distinct sid) v, count(*) w from pv group by 1) q),
    'top_pages', (select coalesce(jsonb_agg(jsonb_build_object('k', path, 'n', n) order by n desc), '[]'::jsonb)
                  from (select path, count(*) n from pv group by 1 order by n desc limit 8) q),
    'referrers', (select coalesce(jsonb_agg(jsonb_build_object('k', coalesce(referrer,'прямой'), 'n', n) order by n desc), '[]'::jsonb)
                  from (select referrer, count(*) n from s group by 1 order by n desc limit 8) q),
    'devices', (select coalesce(jsonb_agg(jsonb_build_object('k', coalesce(device,'—'), 'n', n) order by n desc), '[]'::jsonb)
                from (select device, count(*) n from s group by 1 order by n desc) q),
    'langs', (select coalesce(jsonb_agg(jsonb_build_object('k', coalesce(lang,'—'), 'n', n) order by n desc), '[]'::jsonb)
              from (select lang, count(*) n from s group by 1 order by n desc) q)
  );
$$;
