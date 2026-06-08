
-- Drop permissive policies that allowed anon/authenticated unrestricted access
DROP POLICY IF EXISTS "app_users_select_all" ON public.app_users;
DROP POLICY IF EXISTS "app_users_insert_all" ON public.app_users;

DROP POLICY IF EXISTS "assessments_all_select" ON public.assessments;
DROP POLICY IF EXISTS "assessments_all_insert" ON public.assessments;
DROP POLICY IF EXISTS "assessments_all_update" ON public.assessments;

DROP POLICY IF EXISTS "workouts_all_select" ON public.workouts;
DROP POLICY IF EXISTS "workouts_all_insert" ON public.workouts;
DROP POLICY IF EXISTS "workouts_all_update" ON public.workouts;

-- Revoke Data API privileges from anon/authenticated. Only service_role (server-side admin client) keeps access.
REVOKE ALL ON public.app_users FROM anon, authenticated;
REVOKE ALL ON public.assessments FROM anon, authenticated;
REVOKE ALL ON public.workouts FROM anon, authenticated;

GRANT ALL ON public.app_users TO service_role;
GRANT ALL ON public.assessments TO service_role;
GRANT ALL ON public.workouts TO service_role;

-- Keep RLS enabled with no policies => default deny for anon/authenticated.
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
