
-- Remove overly broad storage policies that lack ownership checks (owner-scoped policies already exist)
DROP POLICY IF EXISTS "Auth users upload cleaning photos" ON storage.objects;
DROP POLICY IF EXISTS "Auth users update cleaning photos" ON storage.objects;
DROP POLICY IF EXISTS "Auth users delete cleaning photos" ON storage.objects;
DROP POLICY IF EXISTS "Auth users upload report photos" ON storage.objects;
DROP POLICY IF EXISTS "Auth users update report photos" ON storage.objects;
DROP POLICY IF EXISTS "Auth users delete report photos" ON storage.objects;

-- Remove public SELECT on supply_requests; public access goes through get_supply_request_by_token RPC
DROP POLICY IF EXISTS "Public can view sent supply requests" ON public.supply_requests;

-- Lock down SECURITY DEFINER helper functions that should not be called directly via the API
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, public;
