CREATE TABLE public.walkthroughs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  property_id uuid REFERENCES public.properties(id) ON DELETE SET NULL,
  property_name text NOT NULL DEFAULT '',
  property_address text NOT NULL DEFAULT '',
  client_name text NOT NULL DEFAULT '',
  client_email text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft',
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  areas jsonb NOT NULL DEFAULT '[]'::jsonb,
  condition jsonb NOT NULL DEFAULT '{}'::jsonb,
  pricing jsonb NOT NULL DEFAULT '{}'::jsonb,
  notes text NOT NULL DEFAULT '',
  public_token text NOT NULL DEFAULT encode(gen_random_bytes(24), 'hex'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX walkthroughs_public_token_idx ON public.walkthroughs(public_token);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.walkthroughs TO authenticated;
GRANT ALL ON public.walkthroughs TO service_role;

ALTER TABLE public.walkthroughs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own walkthroughs"
ON public.walkthroughs FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_walkthroughs_updated_at
BEFORE UPDATE ON public.walkthroughs
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.get_walkthrough_by_token(p_token text)
RETURNS SETOF public.walkthroughs
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT * FROM public.walkthroughs
  WHERE public_token = p_token AND status <> 'draft'
  LIMIT 1;
$$;

REVOKE EXECUTE ON FUNCTION public.get_walkthrough_by_token(text) FROM public;
GRANT EXECUTE ON FUNCTION public.get_walkthrough_by_token(text) TO anon, authenticated;