
-- 1. Fix properties RLS: replace overly permissive policies with owner-scoped
DROP POLICY IF EXISTS "All authenticated can view properties" ON public.properties;
DROP POLICY IF EXISTS "All authenticated can update properties" ON public.properties;

CREATE POLICY "Users can view own properties" ON public.properties
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own properties" ON public.properties
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- 2. Fix user_roles: remove INSERT policy that allows privilege escalation
-- (roles are assigned via handle_new_user trigger only)
DROP POLICY IF EXISTS "Users can insert their own roles" ON public.user_roles;

-- 3. Add ical_token column to profiles for secure calendar feed
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ical_token text 
  DEFAULT encode(extensions.gen_random_bytes(32), 'hex');

-- Populate existing profiles with tokens
UPDATE public.profiles SET ical_token = encode(extensions.gen_random_bytes(32), 'hex') 
  WHERE ical_token IS NULL;

-- 4. Secure has_role to only check the calling user's own roles  
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = _user_id AND role = _role
    AND _user_id = auth.uid()
  )
$$;
