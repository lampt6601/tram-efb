-- ============================================
-- Fix: Function Search Path Mutable
-- https://supabase.com/docs/guides/database/functions#security-definer
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Note on Security Definer View Alert:
-- Supabase warns about 'public_accounts' being a Security Definer view.
-- This is INTENTIONAL. The view safely exposes only public columns of 'Available' 
-- accounts, bypassing strict RLS that prevents admins from seeing each others' data.
-- Do NOT use (security_invoker = true), as it breaks the homepage for logged in admins.
-- You can safely 'Ignore' this specific alert in the Supabase Dashboard.
-- ============================================
CREATE OR REPLACE VIEW public.public_accounts AS
SELECT
  id,
  title,
  selling_price,
  images,
  primary_image_url,
  status,
  total_gp,
  total_coins_android,
  total_coins_ios,
  team_strength,
  is_priority,
  original_price,
  created_at
FROM public.accounts
WHERE status = 'Available';

GRANT SELECT ON public.public_accounts TO anon;

-- ============================================
-- Fix: Unused Index
-- Dropping the unused index on emails table
-- ============================================
DROP INDEX IF EXISTS public.idx_emails_user_id;
