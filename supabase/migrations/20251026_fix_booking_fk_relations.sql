-- 20251026_fix_booking_fk_relations.sql
-- HomeFix India — Fix bookings foreign keys and stale references

BEGIN;

-- 1️⃣ Clean orphaned user references
UPDATE public.bookings
SET user_id = NULL
WHERE user_id IS NOT NULL
  AND user_id NOT IN (SELECT id FROM public.user_profiles);

-- 2️⃣ Clean orphaned service references
UPDATE public.bookings
SET service_id = NULL
WHERE service_id IS NOT NULL
  AND service_id NOT IN (SELECT id FROM public.services);

-- 3️⃣ Drop any broken constraints
ALTER TABLE public.bookings
DROP CONSTRAINT IF EXISTS bookings_user_id_fkey,
DROP CONSTRAINT IF EXISTS bookings_service_id_fkey;

-- 4️⃣ Recreate proper constraints
ALTER TABLE public.bookings
ADD CONSTRAINT bookings_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES public.user_profiles (id)
  ON DELETE SET NULL
  ON UPDATE CASCADE;

ALTER TABLE public.bookings
ADD CONSTRAINT bookings_service_id_fkey
  FOREIGN KEY (service_id)
  REFERENCES public.services (id)
  ON DELETE SET NULL
  ON UPDATE CASCADE;

COMMIT;
