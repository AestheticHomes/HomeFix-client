-- ===========================================================
-- HomeFix India — CMS & Booking Sync Triggers 🌿
-- Project: xnubmphixlpkyqfhghup
-- Author: Jagadish Ramaswamy (Founder & System Architect)
-- Date: 2025-10-26
-- Description:
--   Auto-sync CMS (goods) updates and booking status changes
--   with Supabase Edge Functions for real-time emails + logs.
-- ===========================================================

-- ─────────────────────────────────────────────
-- 1️⃣ CMS: Trigger Edge Function on insert/update/delete
-- ─────────────────────────────────────────────

create or replace function public.trigger_notify_cms_update()
returns trigger
language plpgsql
security definer
as $$
declare
  payload jsonb;
begin
  payload := jsonb_build_object(
    'table', TG_TABLE_NAME,
    'type', TG_OP,
    'record', row_to_json(NEW),
    'old_record', row_to_json(OLD)
  );

  perform net.http_post(
    'https://xnubmphixlpkyqfhghup.functions.supabase.co/notify-cms-update',
    payload,
    jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true),
      'Content-Type', 'application/json'
    )
  );

  return NEW;
end;
$$;

drop trigger if exists trigger_notify_cms_update on public.goods;

create trigger trigger_notify_cms_update
after insert or update or delete on public.goods
for each row execute function public.trigger_notify_cms_update();


-- ─────────────────────────────────────────────
-- 2️⃣ BOOKINGS: Trigger Edge Function on status update
-- ─────────────────────────────────────────────

create or replace function public.trigger_notify_booking_status()
returns trigger
language plpgsql
security definer
as $$
declare
  payload jsonb;
begin
  payload := jsonb_build_object(
    'action', lower(TG_OP),
    'bookingId', coalesce(NEW.id, OLD.id),
    'date', NEW.preferred_date,
    'slot', NEW.preferred_time,
    'note', 'auto-trigger'
  );

  perform net.http_post(
    'https://xnubmphixlpkyqfhghup.functions.supabase.co/notify-booking-status',
    payload,
    jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true),
      'Content-Type', 'application/json'
    )
  );

  return NEW;
end;
$$;

drop trigger if exists trigger_notify_booking_status on public.bookings;

create trigger trigger_notify_booking_status
after update of status on public.bookings
for each row execute function public.trigger_notify_booking_status();


-- ✅ Optional Debug Logging
comment on function public.trigger_notify_cms_update is 'Auto-triggers Edge Function on CMS (goods) changes';
comment on function public.trigger_notify_booking_status is 'Auto-triggers Edge Function on booking status updates';
