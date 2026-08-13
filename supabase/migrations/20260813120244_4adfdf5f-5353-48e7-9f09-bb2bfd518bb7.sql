CREATE TABLE public.terms_acceptances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NULL,
  email TEXT NULL,
  terms_version TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'security_notice',
  accepted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
GRANT ALL ON public.terms_acceptances TO service_role;
ALTER TABLE public.terms_acceptances ENABLE ROW LEVEL SECURITY;