CREATE TABLE public.estimates (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  client_name text NOT NULL,
  client_email text NOT NULL DEFAULT ''::text,
  client_address text DEFAULT ''::text,
  client_phone text DEFAULT ''::text,
  description text NOT NULL DEFAULT ''::text,
  amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'draft'::text,
  public_token text NOT NULL DEFAULT encode(extensions.gen_random_bytes(16), 'hex'::text),
  estimate_number text DEFAULT ''::text,
  line_items jsonb DEFAULT '[]'::jsonb,
  notes text DEFAULT ''::text,
  discount numeric DEFAULT 0,
  tax numeric DEFAULT 0,
  due_date text DEFAULT ''::text,
  valid_until text DEFAULT ''::text,
  service_date text DEFAULT ''::text,
  property_ids text[] DEFAULT '{}'::text[],
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT estimates_pkey PRIMARY KEY (id)
);

ALTER TABLE public.estimates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own estimates"
  ON public.estimates
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public can view estimates by token"
  ON public.estimates
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE TRIGGER update_estimates_updated_at
  BEFORE UPDATE ON public.estimates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();