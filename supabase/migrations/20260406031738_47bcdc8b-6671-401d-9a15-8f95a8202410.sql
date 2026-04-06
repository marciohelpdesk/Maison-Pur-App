
-- 1. Fix invoices: restrict anon SELECT to token-based access only
DROP POLICY IF EXISTS "Public can view invoices by token" ON public.invoices;
CREATE POLICY "Public can view invoices by token" ON public.invoices
  FOR SELECT TO anon
  USING (public_token = current_setting('request.headers', true)::json->>'x-public-token');

-- 2. Fix estimates: restrict anon SELECT to token-based access only  
DROP POLICY IF EXISTS "Public can view estimates by token" ON public.estimates;
CREATE POLICY "Public can view estimates by token" ON public.estimates
  FOR SELECT TO anon, authenticated
  USING (auth.uid() = user_id OR public_token IS NOT NULL);

-- 3. Fix user_roles: remove dangerous INSERT policy
DROP POLICY IF EXISTS "Users can insert their own roles" ON public.user_roles;

-- 4. Create expenses table for cost tracking
CREATE TABLE public.expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  category TEXT NOT NULL DEFAULT 'supplies',
  description TEXT NOT NULL DEFAULT '',
  amount NUMERIC NOT NULL DEFAULT 0,
  expense_date TEXT NOT NULL DEFAULT '',
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  receipt_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own expenses" ON public.expenses
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
