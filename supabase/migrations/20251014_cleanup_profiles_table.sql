-- 🧹 STEP 1: Drop old trigger that references 'public.profiles'
DROP TRIGGER IF EXISTS trigger_user_signup ON public.profiles;
DROP FUNCTION IF EXISTS notify_user_signup();

-- 🧱 STEP 2: Drop the legacy 'profiles' table safely (removes FK constraint triggers)
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 🧩 STEP 3: Recreate the trigger to target 'public.user_profiles'
-- (Only if you want to keep the signup notification behavior)
CREATE OR REPLACE FUNCTION notify_user_signup()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.http_response_log (status_code, message, created_at)
  VALUES (200, CONCAT('New user signup: ', NEW.id), NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_user_signup
AFTER INSERT ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION notify_user_signup();

-- 🔁 STEP 4: Refresh schema cache so PostgREST sees new structure
NOTIFY pgrst, 'reload schema';
