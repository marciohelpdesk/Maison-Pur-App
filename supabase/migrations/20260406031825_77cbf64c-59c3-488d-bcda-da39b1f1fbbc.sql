
-- Fix invoices public access - use a simpler approach with function
DROP POLICY IF EXISTS "Public can view invoices by token" ON public.invoices;

CREATE OR REPLACE FUNCTION public.get_invoice_by_token(p_token TEXT)
RETURNS SETOF public.invoices
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.invoices WHERE public_token = p_token LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.get_estimate_by_token(p_token TEXT)
RETURNS SETOF public.estimates
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.estimates WHERE public_token = p_token LIMIT 1;
$$;

-- Drop the overly permissive estimate policy and replace
DROP POLICY IF EXISTS "Public can view estimates by token" ON public.estimates;
CREATE POLICY "Users can view own estimates" ON public.estimates
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
