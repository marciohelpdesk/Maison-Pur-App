-- Add status column to team_members
ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active';

-- Add unique constraint for upserts
ALTER TABLE public.team_members ADD CONSTRAINT team_members_admin_member_unique UNIQUE (admin_id, member_user_id);

-- Drop old cleaner policies on jobs
DROP POLICY IF EXISTS "Cleaners can view assigned jobs" ON public.jobs;
DROP POLICY IF EXISTS "Cleaners can update assigned jobs" ON public.jobs;

-- Recreate with active status check
CREATE POLICY "Cleaners can view assigned jobs"
ON public.jobs FOR SELECT TO authenticated
USING (
  assigned_to = (auth.uid())::text
  AND EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.member_user_id = auth.uid()
      AND tm.admin_id = jobs.user_id
      AND tm.status = 'active'
  )
);

CREATE POLICY "Cleaners can update assigned jobs"
ON public.jobs FOR UPDATE TO authenticated
USING (
  assigned_to = (auth.uid())::text
  AND EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.member_user_id = auth.uid()
      AND tm.admin_id = jobs.user_id
      AND tm.status = 'active'
  )
);

-- Drop old cleaner policy on properties
DROP POLICY IF EXISTS "Cleaners can view properties of assigned jobs" ON public.properties;

-- Recreate with active status check
CREATE POLICY "Cleaners can view properties of assigned jobs"
ON public.properties FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.jobs j
    JOIN public.team_members tm ON tm.admin_id = j.user_id
    WHERE tm.member_user_id = auth.uid()
      AND tm.status = 'active'
      AND j.assigned_to = (auth.uid())::text
      AND j.property_id = properties.id
  )
);

-- Allow cleaners to insert reports for jobs they are assigned to
CREATE POLICY "Cleaners can insert reports for assigned jobs"
ON public.cleaning_reports FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.jobs j
    JOIN public.team_members tm ON tm.admin_id = j.user_id
    WHERE tm.member_user_id = auth.uid()
      AND tm.status = 'active'
      AND j.assigned_to = (auth.uid())::text
      AND j.id = cleaning_reports.job_id
  )
);

-- Allow cleaners to view reports they created
CREATE POLICY "Cleaners can view reports for assigned jobs"
ON public.cleaning_reports FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.jobs j
    JOIN public.team_members tm ON tm.admin_id = j.user_id
    WHERE tm.member_user_id = auth.uid()
      AND tm.status = 'active'
      AND j.assigned_to = (auth.uid())::text
      AND j.id = cleaning_reports.job_id
  )
);

-- Allow cleaners to update reports for their assigned jobs
CREATE POLICY "Cleaners can update reports for assigned jobs"
ON public.cleaning_reports FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.jobs j
    JOIN public.team_members tm ON tm.admin_id = j.user_id
    WHERE tm.member_user_id = auth.uid()
      AND tm.status = 'active'
      AND j.assigned_to = (auth.uid())::text
      AND j.id = cleaning_reports.job_id
  )
);

-- Allow cleaners to manage report photos and rooms for their jobs
CREATE POLICY "Cleaners can manage report photos"
ON public.report_photos FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.cleaning_reports cr
    JOIN public.jobs j ON j.id = cr.job_id
    JOIN public.team_members tm ON tm.admin_id = j.user_id
    WHERE cr.id = report_photos.report_id
      AND tm.member_user_id = auth.uid()
      AND tm.status = 'active'
      AND j.assigned_to = (auth.uid())::text
  )
);

CREATE POLICY "Cleaners can manage report rooms"
ON public.report_rooms FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.cleaning_reports cr
    JOIN public.jobs j ON j.id = cr.job_id
    JOIN public.team_members tm ON tm.admin_id = j.user_id
    WHERE cr.id = report_rooms.report_id
      AND tm.member_user_id = auth.uid()
      AND tm.status = 'active'
      AND j.assigned_to = (auth.uid())::text
  )
);