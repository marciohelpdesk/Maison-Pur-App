
-- Supply requests: documents shared with clients for restocking
CREATE TABLE public.supply_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  property_id UUID,
  property_name TEXT NOT NULL DEFAULT '',
  property_address TEXT NOT NULL DEFAULT '',
  public_token TEXT NOT NULL DEFAULT encode(extensions.gen_random_bytes(16), 'hex'),
  status TEXT NOT NULL DEFAULT 'draft',
  notes TEXT NOT NULL DEFAULT '',
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX supply_requests_token_idx ON public.supply_requests(public_token);
CREATE INDEX supply_requests_user_idx ON public.supply_requests(user_id);
CREATE INDEX supply_requests_property_idx ON public.supply_requests(property_id);

ALTER TABLE public.supply_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own supply requests"
ON public.supply_requests
FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public can view sent supply requests"
ON public.supply_requests
FOR SELECT TO anon
USING (status <> 'draft');

CREATE TRIGGER update_supply_requests_updated_at
BEFORE UPDATE ON public.supply_requests
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.get_supply_request_by_token(p_token TEXT)
RETURNS SETOF public.supply_requests
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT * FROM public.supply_requests
  WHERE public_token = p_token AND status <> 'draft'
  LIMIT 1;
$$;
