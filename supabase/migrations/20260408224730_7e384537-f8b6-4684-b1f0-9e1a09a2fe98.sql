
-- 1. Add 'cleaner' to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'cleaner';

-- 2. Create team_invites table
CREATE TABLE public.team_invites (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id uuid NOT NULL,
  email text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  invite_token text NOT NULL DEFAULT encode(extensions.gen_random_bytes(16), 'hex'),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.team_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view their own invites"
  ON public.team_invites FOR SELECT
  TO authenticated
  USING (auth.uid() = admin_id);

CREATE POLICY "Admins can create invites"
  ON public.team_invites FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = admin_id);

CREATE POLICY "Admins can update their own invites"
  ON public.team_invites FOR UPDATE
  TO authenticated
  USING (auth.uid() = admin_id);

CREATE TRIGGER update_team_invites_updated_at
  BEFORE UPDATE ON public.team_invites
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Create team_members table
CREATE TABLE public.team_members (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id uuid NOT NULL,
  member_user_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (admin_id, member_user_id)
);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view their team members"
  ON public.team_members FOR SELECT
  TO authenticated
  USING (auth.uid() = admin_id);

CREATE POLICY "Members can view their own membership"
  ON public.team_members FOR SELECT
  TO authenticated
  USING (auth.uid() = member_user_id);

CREATE POLICY "Admins can insert team members"
  ON public.team_members FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = admin_id);

CREATE POLICY "Admins can delete team members"
  ON public.team_members FOR DELETE
  TO authenticated
  USING (auth.uid() = admin_id);

-- 4. Add RLS policies for cleaners on jobs table
CREATE POLICY "Cleaners can view assigned jobs"
  ON public.jobs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.member_user_id = auth.uid()
        AND tm.admin_id = jobs.user_id
    )
    AND assigned_to = auth.uid()::text
  );

CREATE POLICY "Cleaners can update assigned jobs"
  ON public.jobs FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.member_user_id = auth.uid()
        AND tm.admin_id = jobs.user_id
    )
    AND assigned_to = auth.uid()::text
  );

-- 5. Add RLS policy for cleaners on properties (read-only via assigned jobs)
CREATE POLICY "Cleaners can view properties of assigned jobs"
  ON public.properties FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs j
      JOIN public.team_members tm ON tm.admin_id = j.user_id
      WHERE tm.member_user_id = auth.uid()
        AND j.assigned_to = auth.uid()::text
        AND j.property_id = properties.id
    )
  );
