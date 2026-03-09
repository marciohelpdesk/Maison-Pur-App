
ALTER TABLE public.cleaning_reports ADD COLUMN IF NOT EXISTS property_photo_url text DEFAULT NULL;

-- Backfill existing reports with property photo
UPDATE public.cleaning_reports cr
SET property_photo_url = p.photo_url
FROM public.properties p
WHERE cr.property_id = p.id AND p.photo_url IS NOT NULL;
