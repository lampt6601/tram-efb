-- ============================================
-- Add approval workflow for regular admin accounts
-- ============================================

-- 1. Add is_approved column (defaults to false for regular admins)
ALTER TABLE public.accounts
  ADD COLUMN IF NOT EXISTS is_approved BOOLEAN NOT NULL DEFAULT false;

-- 2. Approve all existing accounts (grandfathering — they were already visible before this migration)
-- Going forward, only NEW accounts from regular admins will require approval
UPDATE public.accounts
SET is_approved = true;

-- 3. Trigger function: auto-approve accounts created by super admin
CREATE OR REPLACE FUNCTION public.auto_approve_super_admin_accounts()
RETURNS TRIGGER
SET search_path = ''
AS $$
BEGIN
  IF NEW.user_id = '1318d567-e19d-40e6-a165-0455330a51a7' THEN
    NEW.is_approved = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_approve_super_admin ON public.accounts;
CREATE TRIGGER trigger_auto_approve_super_admin
  BEFORE INSERT ON public.accounts
  FOR EACH ROW EXECUTE FUNCTION public.auto_approve_super_admin_accounts();

-- 4. Recreate public_accounts view to only show approved accounts
-- DROP first to avoid column reorder conflict
DROP VIEW IF EXISTS public.public_accounts;
CREATE VIEW public.public_accounts AS
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
  is_clone,
  original_price,
  server_region,
  monthly_log_quota,
  created_at
FROM public.accounts
WHERE status = 'Available'
  AND is_approved = true;

-- 5. Recreate public_sold_accounts view to only show approved accounts
DROP VIEW IF EXISTS public.public_sold_accounts;
CREATE VIEW public.public_sold_accounts AS
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
WHERE status = 'Sold'
  AND is_approved = true;

-- 6. Re-grant permissions after view recreation
GRANT SELECT ON public.public_accounts TO anon;
GRANT SELECT ON public.public_accounts TO authenticated;
GRANT SELECT ON public.public_sold_accounts TO anon;
GRANT SELECT ON public.public_sold_accounts TO authenticated;
