
-- 1) app_users
CREATE TABLE public.app_users (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL UNIQUE,
  nome_completo text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.app_users TO anon, authenticated;
GRANT ALL ON public.app_users TO service_role;

ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY app_users_select_all ON public.app_users
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY app_users_insert_all ON public.app_users
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- 2) Remover FKs antigas para auth.users e abrir políticas em assessments/workouts
ALTER TABLE public.assessments DROP CONSTRAINT IF EXISTS assessments_user_id_fkey;
ALTER TABLE public.workouts    DROP CONSTRAINT IF EXISTS workouts_user_id_fkey;

-- Drop existing user-scoped policies
DROP POLICY IF EXISTS assessments_insert_own ON public.assessments;
DROP POLICY IF EXISTS assessments_select_own ON public.assessments;
DROP POLICY IF EXISTS assessments_update_own ON public.assessments;
DROP POLICY IF EXISTS workouts_insert_own ON public.workouts;
DROP POLICY IF EXISTS workouts_select_own ON public.workouts;
DROP POLICY IF EXISTS workouts_update_own ON public.workouts;

-- Permissive policies (login passwordless — qualquer um com o user_id pode acessar)
GRANT SELECT, INSERT, UPDATE ON public.assessments TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.workouts TO anon, authenticated;

CREATE POLICY assessments_all_select ON public.assessments
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY assessments_all_insert ON public.assessments
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY assessments_all_update ON public.assessments
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY workouts_all_select ON public.workouts
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY workouts_all_insert ON public.workouts
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY workouts_all_update ON public.workouts
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
