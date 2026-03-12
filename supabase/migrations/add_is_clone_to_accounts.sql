-- Add is_clone column to accounts table
-- Clone accounts: accounts with few players but some quality ones
ALTER TABLE accounts
  ADD COLUMN IF NOT EXISTS is_clone boolean NOT NULL DEFAULT false;

-- Refresh public_accounts view to expose is_clone
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
WHERE status = 'Available';

GRANT SELECT ON public.public_accounts TO anon;
GRANT SELECT ON public.public_accounts TO authenticated;
