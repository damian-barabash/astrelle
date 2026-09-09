-- ASTRELLE redesign 2026-09-09: CRM clients, leads, richer booking statuses,
-- site layout/templates/shop settings, archived events (history is kept for the CRM).

create extension if not exists pgcrypto;

-- normalized contact key: lowercase e-mail or digits-only phone
create or replace function public.norm_contact(p text) returns text
language sql immutable as $$
  select case when position('@' in coalesce(p,'')) > 0 then lower(trim(p))
              else regexp_replace(coalesce(p,''), '[^0-9]', '', 'g') end
$$;

-- CRM: one row per person (matched by normalized contact)
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null default '',
  contact text not null,
  contact_norm text not null unique,
  email text,
  phone text,
  notes text,
  tags text[] not null default '{}',
  source text not null default 'booking',
  lang text,
  created_at timestamptz not null default now(),
  last_seen timestamptz not null default now()
);
alter table public.clients enable row level security; -- no policies: service role only

alter table public.bookings add column if not exists client_id uuid references public.clients(id) on delete set null;
alter table public.bookings add column if not exists admin_note text;
alter table public.bookings add column if not exists lang text;
alter table public.bookings add column if not exists updated_at timestamptz not null default now();
alter table public.bookings drop constraint if exists bookings_status_check;
alter table public.bookings add constraint bookings_status_check
  check (status in ('pending','confirmed','declined','attended','no_show','cancelled'));
create index if not exists bookings_client_idx on public.bookings(client_id);
create index if not exists bookings_status_idx on public.bookings(status);
create index if not exists bookings_event_idx on public.bookings(event_id);

-- leads: contact form, shop waiting list
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  kind text not null default 'contact' check (kind in ('contact','shop')),
  name text,
  contact text not null,
  message text,
  client_id uuid references public.clients(id) on delete set null,
  status text not null default 'new' check (status in ('new','replied','closed')),
  admin_note text,
  lang text,
  page text,
  created_at timestamptz not null default now()
);
alter table public.leads enable row level security;
create index if not exists leads_status_idx on public.leads(status);

-- past events are archived (not deleted) so bookings keep their history
alter table public.events add column if not exists archived boolean not null default false;
create index if not exists events_starts_idx on public.events(starts_at);

-- site settings: section layout, event templates, shop status
alter table public.site_settings add column if not exists layout jsonb not null default '{}'::jsonb;
alter table public.site_settings add column if not exists templates jsonb not null default '[]'::jsonb;
alter table public.site_settings add column if not exists shop jsonb not null default '{}'::jsonb;

-- public calendar read: skip archived rows explicitly
create or replace function public.list_events(p_from timestamptz, p_to timestamptz)
returns table(id uuid, type text, title text, theme text, icon text, color text, starts_at timestamptz, ends_at timestamptz,
              capacity integer, price text, notes text, is_slot boolean, booked integer)
language sql stable security definer set search_path to 'public' as $$
  select e.id, e.type, e.title, e.theme, e.icon, e.color, e.starts_at, e.ends_at,
         e.capacity, e.price, e.notes, e.is_slot,
         coalesce((select sum(b.people)::int from public.bookings b
                    where b.event_id = e.id and b.status = 'confirmed'), 0) as booked
  from public.events e
  where e.published = true and e.archived = false
    and e.starts_at >= p_from and e.starts_at < p_to
    and coalesce(e.ends_at, e.starts_at + interval '2 hours') > now()
  order by e.starts_at;
$$;
