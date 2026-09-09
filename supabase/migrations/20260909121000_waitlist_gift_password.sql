-- waiting list bookings, gift-voucher leads, admin password change, studio settings
alter table public.bookings drop constraint if exists bookings_status_check;
alter table public.bookings add constraint bookings_status_check
  check (status in ('pending','confirmed','declined','attended','no_show','cancelled','waitlist'));
alter table public.leads drop constraint if exists leads_kind_check;
alter table public.leads add constraint leads_kind_check check (kind in ('contact','shop','gift'));
alter table public.site_settings add column if not exists studio jsonb not null default '{}'::jsonb;
alter table public.site_settings add column if not exists messages jsonb not null default '{}'::jsonb;

-- admin changes own password (called by the admin-auth edge function with service role)
create or replace function public.admin_set_password(p_admin_id uuid, p_old text, p_new text)
returns boolean language plpgsql security definer set search_path to 'public' as $$
declare ok boolean;
begin
  select (password_hash = crypt(p_old, password_hash)) into ok from public.admins where id = p_admin_id;
  if not coalesce(ok, false) then return false; end if;
  update public.admins set password_hash = crypt(p_new, gen_salt('bf', 10)) where id = p_admin_id;
  return true;
end $$;
revoke all on function public.admin_set_password(uuid, text, text) from public, anon, authenticated;

-- analytics: conversion counters for the funnel (visits → calendar views → requests)
create or replace function public.funnel_summary(p_days integer)
returns jsonb language sql stable security definer set search_path to 'public' as $$
  select jsonb_build_object(
    'visits', (select count(*) from public.analytics_sessions where first_seen > now() - make_interval(days => p_days)),
    'calendar_views', (select count(distinct sid) from public.analytics_pageviews where path like '/kalendarz%' and ts > now() - make_interval(days => p_days)),
    'bookings', (select count(*) from public.bookings where created_at > now() - make_interval(days => p_days)),
    'confirmed', (select count(*) from public.bookings where created_at > now() - make_interval(days => p_days) and status in ('confirmed','attended')),
    'leads', (select count(*) from public.leads where created_at > now() - make_interval(days => p_days)),
    'shop_list', (select count(*) from public.leads where kind = 'shop'),
    'clients', (select count(*) from public.clients),
    'new_clients', (select count(*) from public.clients where created_at > now() - make_interval(days => p_days))
  );
$$;
revoke all on function public.funnel_summary(integer) from public, anon, authenticated;
