
CREATE TABLE IF NOT EXISTS public.quiz_drafts (
  user_id uuid PRIMARY KEY,
  respostas_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  step_idx integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.quiz_drafts TO service_role;
-- intentionally NO grants for anon/authenticated; access goes through server fns

ALTER TABLE public.quiz_drafts ENABLE ROW LEVEL SECURITY;
-- No policies => default deny via Data API. Server uses service_role which bypasses RLS.
