
-- 1) Backups (idempotentes)
CREATE TABLE IF NOT EXISTS public._backup_profiles_20260608 AS
  SELECT * FROM public.profiles;

CREATE TABLE IF NOT EXISTS public._backup_assessments_user_id_20260608 AS
  SELECT id AS assessment_id, user_id AS old_user_id, now() AS backed_up_at FROM public.assessments;

CREATE TABLE IF NOT EXISTS public._backup_workouts_user_id_20260608 AS
  SELECT id AS workout_id, user_id AS old_user_id, now() AS backed_up_at FROM public.workouts;

REVOKE ALL ON public._backup_profiles_20260608 FROM anon, authenticated;
REVOKE ALL ON public._backup_assessments_user_id_20260608 FROM anon, authenticated;
REVOKE ALL ON public._backup_workouts_user_id_20260608 FROM anon, authenticated;
GRANT ALL ON public._backup_profiles_20260608 TO service_role;
GRANT ALL ON public._backup_assessments_user_id_20260608 TO service_role;
GRANT ALL ON public._backup_workouts_user_id_20260608 TO service_role;
ALTER TABLE public._backup_profiles_20260608 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public._backup_assessments_user_id_20260608 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public._backup_workouts_user_id_20260608 ENABLE ROW LEVEL SECURITY;

-- 2) Normalizar e-mails existentes em app_users (lower + trim)
UPDATE public.app_users
SET email = lower(btrim(email))
WHERE email <> lower(btrim(email));

-- 3) Caso "colisão": e-mail já existe em app_users com id diferente do profiles.
-- Reaponta os user_ids dos quizzes/treinos antigos para o id da conta nova.
WITH collisions AS (
  SELECT p.id AS old_id, a.id AS new_id
  FROM public.profiles p
  JOIN public.app_users a ON lower(btrim(a.email)) = lower(btrim(p.email))
  WHERE p.email IS NOT NULL AND p.email <> ''
)
UPDATE public.assessments x
SET user_id = c.new_id
FROM collisions c
WHERE x.user_id = c.old_id;

WITH collisions AS (
  SELECT p.id AS old_id, a.id AS new_id
  FROM public.profiles p
  JOIN public.app_users a ON lower(btrim(a.email)) = lower(btrim(p.email))
  WHERE p.email IS NOT NULL AND p.email <> ''
)
UPDATE public.workouts x
SET user_id = c.new_id
FROM collisions c
WHERE x.user_id = c.old_id;

-- 4) Caso "ainda não voltou": importar profiles para app_users mantendo o mesmo id.
-- Só importa profiles cujo e-mail ainda não exista em app_users.
INSERT INTO public.app_users (id, email, nome_completo, created_at)
SELECT
  p.id,
  lower(btrim(p.email)),
  COALESCE(NULLIF(btrim(p.nome_completo), ''), ''),
  p.created_at
FROM public.profiles p
WHERE p.email IS NOT NULL
  AND p.email <> ''
  AND lower(btrim(p.email)) NOT IN (SELECT lower(btrim(email)) FROM public.app_users)
ON CONFLICT (id) DO NOTHING;

-- 5) Índice único insensível a case para impedir futuras duplicatas
CREATE UNIQUE INDEX IF NOT EXISTS app_users_email_lower_unique
  ON public.app_users (lower(btrim(email)));
