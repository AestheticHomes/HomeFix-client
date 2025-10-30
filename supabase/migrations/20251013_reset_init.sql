-- ============================================================
-- HomeFix India v3.1 — Full Schema Reset (Edith Final Lock)
-- Date: 2025-10-13
-- Author: Jagadish + Edith
-- ============================================================

-- Clean start
drop schema if exists public cascade;
create schema public;
grant usage on schema public to postgres, anon, authenticated, service_role;
alter default privileges in schema public grant all on tables to postgres, anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to postgres, anon, authenticated, service_role;

-- ============================================================
-- EXTENSIONS
-- ============================================================
create extension if not exists "uuid-ossp";
create extension if not exists "pg_net";
create extension if not exists "http";

-- ============================================================
-- CORE TABLES
-- ============================================================

-- 1️⃣ Profiles (linked to auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  phone text not null,
  name text,
  address text,
  latitude double precision,
  longitude double precision,
  verified_at timestamptz,
  email_verified boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2️⃣ Services
create table public.services (
  id bigint generated always as identity primary key,
  title text not null,
  description text,
  price numeric(10,2),
  unit text,
  icon text,
  created_at timestamptz default now()
);

-- 3️⃣ Bookings
create table public.bookings (
  id bigint generated always as identity primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  services jsonb not null default '[]',
  total_price numeric(10,2) not null default 0,
  site_location jsonb,
  preferred_date date,
  preferred_slot text,
  status text default 'upcoming',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4️⃣ Goods (future eCommerce)
create table public.goods (
  id bigint generated always as identity primary key,
  sku text unique,
  title text not null,
  description text,
  category text,
  price numeric(10,2),
  stock int default 0,
  is_active boolean default true,
  images jsonb default '[]',
  metadata jsonb default '{}',
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 5️⃣ Notifications
create table public.notifications (
  id bigint generated always as identity primary key,
  kind text not null,
  to_email text,
  subject text,
  provider_id text,
  status text default 'pending',
  error text,
  payload jsonb,
  created_at timestamptz default now()
);

-- 6️⃣ HTTP Response Log
create table public.http_response_log (
  id bigint generated always as identity primary key,
  request_url text,
  request_body jsonb,
  status int,
  response_body text,
  created_at timestamptz default now()
);

-- ============================================================
-- SAFE HTTP WRAPPER FUNCTION
-- ============================================================

create or replace function public.safe_http_post(
  url text,
  headers jsonb default '{}',
  body jsonb default '{}'
)
returns jsonb as $$
declare
  res jsonb;
begin
  perform net.http_post(
    url := url,
    headers := headers,
    body := body::text
  );
  return jsonb_build_object('status', 'sent', 'url', url);
exception when others then
  insert into public.http_response_log (request_url, request_body, status, response_body)
  values (url, body, 500, sqlerrm);
  return jsonb_build_object('status', 'failed', 'error', sqlerrm);
end;
$$ language plpgsql;

-- ============================================================
-- NOTIFY FUNCTIONS (Edge triggers)
-- ============================================================

-- User signup notification
create or replace function public.notify_user_signup()
returns trigger as $$
declare
  payload jsonb;
begin
  payload := jsonb_build_object(
    'id', new.id,
    'email', new.email,
    'phone', new.phone
  );

  perform public.safe_http_post(`${fnUrl}/send-booking-email-core`,
    jsonb_build_object(
      'Authorization', 'Bearer H0m3Fix-3dg3Fn-2025@Secure!',
      'Content-Type', 'application/json'
    ),
    payload
  );
  return new;
end;
$$ language plpgsql;

-- Booking email notification
create or replace function public.notify_booking_created()
returns trigger as $$
declare
  payload jsonb;
begin
  payload := jsonb_build_object(
    'action', 'booking_created',
    'booking_id', new.id,
    'user_id', new.user_id,
    'status', new.status
  );

  perform public.safe_http_post(`${fnUrl}/send-booking-email-core`,
    jsonb_build_object(
      'Authorization', 'Bearer H0m3Fix-3dg3Fn-2025@Secure!',
      'Content-Type', 'application/json'
    ),
    payload
  );
  return new;
end;
$$ language plpgsql;

-- ============================================================
-- TRIGGERS
-- ============================================================

drop trigger if exists trigger_user_signup on public.profiles;
create trigger trigger_user_signup
after insert on public.profiles
for each row execute function public.notify_user_signup();

drop trigger if exists trigger_booking_created on public.bookings;
create trigger trigger_booking_created
after insert on public.bookings
for each row execute function public.notify_booking_created();

-- ============================================================
-- ADMIN VIEW + RPC
-- ============================================================

create or replace function public.fn_get_trigger_health()
returns table (
  trigger_name text,
  function_name text,
  table_name text,
  last_status_code int,
  last_called_at timestamptz
)
language sql as $$
  select
    t.tgname as trigger_name,
    p.proname as function_name,
    c.relname as table_name,
    h.status as last_status_code,
    h.created_at as last_called_at
  from pg_trigger t
  join pg_proc p on t.tgfoid = p.oid
  join pg_class c on t.tgrelid = c.oid
  left join http_response_log h on h.id = (
    select id from http_response_log
    where h.request_url like '%' || c.relname || '%'
    order by created_at desc limit 1
  )
  where not t.tgisinternal;
$$;

-- ============================================================
-- SECURITY POLICIES
-- ============================================================

alter table public.bookings enable row level security;
create policy "Allow user to view own bookings"
  on public.bookings
  for select
  using (auth.uid() = user_id);

create policy "Allow insert for authenticated"
  on public.bookings
  for insert
  with check (auth.uid() = user_id);

-- ============================================================
-- END OF MIGRATION
-- ============================================================
