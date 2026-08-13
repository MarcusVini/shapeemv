-- 1) Constrain anonymous analytics inserts on funnel_events
DROP POLICY IF EXISTS funnel_events_insert_anyone ON public.funnel_events;

CREATE POLICY funnel_events_insert_constrained
ON public.funnel_events
FOR INSERT
TO anon, authenticated
WITH CHECK (
  session_id IS NOT NULL
  AND length(session_id) BETWEEN 8 AND 64
  AND event_name IS NOT NULL
  AND length(event_name) BETWEEN 1 AND 64
  AND event_name ~ '^[a-z0-9_]+$'
  AND created_at IS NOT NULL
  AND created_at BETWEEN (now() - interval '10 minutes') AND (now() + interval '10 minutes')
  AND coalesce(length(page_path), 0) <= 512
  AND coalesce(length(page_title), 0) <= 256
  AND coalesce(length(funnel_step), 0) <= 64
  AND coalesce(length(button_name), 0) <= 128
  AND coalesce(length(button_text), 0) <= 256
  AND coalesce(length(action_type), 0) <= 64
  AND coalesce(length(quiz_question), 0) <= 512
  AND coalesce(length(quiz_answer), 0) <= 512
  AND coalesce(length(checkout_url), 0) <= 512
  AND coalesce(length(product_name), 0) <= 128
  AND coalesce(length(offer_name), 0) <= 128
  AND coalesce(length(referrer), 0) <= 512
  AND coalesce(length(user_agent), 0) <= 512
  AND coalesce(length(utm_source), 0) <= 128
  AND coalesce(length(utm_medium), 0) <= 128
  AND coalesce(length(utm_campaign), 0) <= 128
  AND coalesce(length(utm_content), 0) <= 128
  AND coalesce(length(utm_term), 0) <= 128
  AND coalesce(length(fbclid), 0) <= 256
  AND coalesce(length(gclid), 0) <= 256
  AND (quiz_step IS NULL OR quiz_step BETWEEN 0 AND 200)
  AND (amount IS NULL OR (amount >= 0 AND amount <= 100000))
  AND (metadata IS NULL OR pg_column_size(metadata) <= 4096)
);

-- 2) Lock down storage objects: no anon/authenticated access to any bucket.
--    The private 'database_export_09_07_26' bucket is reachable only through
--    trusted server-side (service role) code.
DROP POLICY IF EXISTS storage_objects_service_role_only ON storage.objects;
CREATE POLICY storage_objects_service_role_only
ON storage.objects
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
