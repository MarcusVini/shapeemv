DROP TABLE IF EXISTS public._backup_profiles_20260608;
DROP TABLE IF EXISTS public._backup_assessments_user_id_20260608;
DROP TABLE IF EXISTS public._backup_workouts_user_id_20260608;

REVOKE ALL ON public.quiz_drafts FROM anon, authenticated;
GRANT ALL ON public.quiz_drafts TO service_role;