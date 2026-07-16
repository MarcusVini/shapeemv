
CREATE TABLE IF NOT EXISTS public.funnel_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  session_id text NOT NULL,
  user_id uuid,
  lead_id uuid,
  event_name text NOT NULL,
  page_path text,
  page_title text,
  funnel_step text,
  button_name text,
  button_text text,
  action_type text,
  quiz_step integer,
  quiz_question text,
  quiz_answer text,
  checkout_url text,
  product_name text,
  offer_name text,
  amount numeric,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  fbclid text,
  gclid text,
  referrer text,
  device_type text,
  browser text,
  os text,
  user_agent text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS funnel_events_created_at_idx ON public.funnel_events (created_at DESC);
CREATE INDEX IF NOT EXISTS funnel_events_event_name_idx ON public.funnel_events (event_name);
CREATE INDEX IF NOT EXISTS funnel_events_session_id_idx ON public.funnel_events (session_id);
CREATE INDEX IF NOT EXISTS funnel_events_utm_source_idx ON public.funnel_events (utm_source);

GRANT SELECT, INSERT ON public.funnel_events TO anon;
GRANT SELECT, INSERT ON public.funnel_events TO authenticated;
GRANT ALL ON public.funnel_events TO service_role;

ALTER TABLE public.funnel_events ENABLE ROW LEVEL SECURITY;

-- Anyone can insert their own tracking events (no read from client)
CREATE POLICY "funnel_events_insert_anyone"
  ON public.funnel_events
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- No SELECT policy for anon/authenticated → reads go via service_role only (admin dashboard)
