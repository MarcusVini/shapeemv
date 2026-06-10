REVOKE ALL ON public.app_users FROM anon, authenticated;
REVOKE ALL ON public.assessments FROM anon, authenticated;
REVOKE ALL ON public.workouts FROM anon, authenticated;
GRANT ALL ON public.app_users TO service_role;
GRANT ALL ON public.assessments TO service_role;
GRANT ALL ON public.workouts TO service_role;