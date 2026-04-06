
-- Add owner-scoped policies for cleaning-photos bucket
-- Users can only upload to their own folder
CREATE POLICY "Users upload own cleaning photos" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'cleaning-photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can only update their own photos
CREATE POLICY "Users update own cleaning photos" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'cleaning-photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can only delete their own photos
CREATE POLICY "Users delete own cleaning photos" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'cleaning-photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Same for report-photos bucket
CREATE POLICY "Users upload own report photos" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'report-photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users update own report photos" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'report-photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users delete own report photos" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'report-photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
